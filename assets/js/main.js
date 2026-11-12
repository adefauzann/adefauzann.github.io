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
