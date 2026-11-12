// Mobile menu
const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});
menu.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  }
});

// Lightbox: click a photo to open it, then slide through its group
const box = document.querySelector('.lightbox');
const boxImg = box.querySelector('img');
const boxCap = box.querySelector('.lightbox-cap');
const prevBtn = box.querySelector('.lightbox-prev');
const nextBtn = box.querySelector('.lightbox-next');
let group = [];
let index = 0;

const show = (i) => {
  index = (i + group.length) % group.length;
  const img = group[index];
  boxImg.src = img.currentSrc || img.src;
  boxImg.alt = img.alt;
  boxCap.textContent = group.length > 1 ? `${index + 1} / ${group.length} · ${img.alt}` : img.alt;
  const many = group.length > 1;
  prevBtn.hidden = !many;
  nextBtn.hidden = !many;
};
const openBox = (img) => {
  const scope = img.closest('[data-gallery]');
  group = scope ? [...scope.querySelectorAll('img[data-zoom]')] : [img];
  show(group.indexOf(img));
  box.hidden = false;
  document.body.style.overflow = 'hidden';
  nextBtn.focus({ preventScroll: true });
};
const closeBox = () => { box.hidden = true; document.body.style.overflow = ''; };

document.querySelectorAll('img[data-zoom]').forEach((img) => {
  img.tabIndex = 0;
  img.addEventListener('click', () => openBox(img));
  img.addEventListener('keydown', (e) => { if (e.key === 'Enter') openBox(img); });
});
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lightbox-close')) closeBox(); });
document.addEventListener('keydown', (e) => {
  if (box.hidden) return;
  if (e.key === 'Escape') closeBox();
  if (e.key === 'ArrowLeft') show(index - 1);
  if (e.key === 'ArrowRight') show(index + 1);
});

// Swipe inside the lightbox
let startX = null;
box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
box.addEventListener('touchend', (e) => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 40 && group.length > 1) show(index + (dx < 0 ? 1 : -1));
  startX = null;
});

// Horizontal sliders (arrow buttons scroll one card at a time)
document.querySelectorAll('.slider').forEach((slider) => {
  const track = slider.querySelector('.slider-track');
  slider.querySelectorAll('.slider-btn').forEach((b) => {
    b.addEventListener('click', () => {
      const card = track.querySelector('.slide');
      const step = card ? card.getBoundingClientRect().width + 14 : track.clientWidth * 0.8;
      track.scrollBy({ left: step * Number(b.dataset.dir), behavior: 'smooth' });
    });
  });
});

// Reveal on scroll
if ('IntersectionObserver' in window) {
  const items = document.querySelectorAll('.job, .feature, .card, .panel-accent, .cred li, .stats li, .assign');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  items.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// Background music: 40% volume, tries to autoplay, else starts on the first click, tap or key press
// (browsers block sound before any interaction). The mute choice is remembered.
const bgm = document.getElementById('bgm');
const musicBtn = document.querySelector('.music-btn');
if (bgm && musicBtn) {
  bgm.volume = 0.4;
  let muted = false;
  try { muted = localStorage.getItem('bgm-muted') === '1'; } catch (e) {}
  const setUi = (playing) => {
    musicBtn.classList.toggle('playing', playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicBtn.setAttribute('aria-label', playing ? 'Mute background music' : 'Play background music');
  };
  const play = () => bgm.play().then(() => setUi(true)).catch(() => setUi(false));
  const startOnce = (e) => {
    if (e.target.closest && e.target.closest('.music-btn')) return;
    removeStart();
    if (!muted && bgm.paused) play();
  };
  const removeStart = () => ['pointerup', 'keydown', 'touchend', 'click'].forEach((t) => window.removeEventListener(t, startOnce, true));
  ['pointerup', 'keydown', 'touchend', 'click'].forEach((t) => window.addEventListener(t, startOnce, true));
  musicBtn.addEventListener('click', () => {
    removeStart();
    if (bgm.paused) {
      muted = false;
      try { localStorage.setItem('bgm-muted', '0'); } catch (e) {}
      play();
    } else {
      bgm.pause();
      muted = true;
      try { localStorage.setItem('bgm-muted', '1'); } catch (e) {}
      setUi(false);
    }
  });
  setUi(false);

  // Try to start right away when the page opens. Browsers that allow autoplay
  // (for example Chrome for returning visitors, or when the site is allowed sound)
  // play immediately; the rest fall back to the first click, tap or key press above.
  if (!muted) {
    bgm.preload = 'auto';
    bgm.play().then(() => { setUi(true); removeStart(); }).catch(() => {});
  }
}
