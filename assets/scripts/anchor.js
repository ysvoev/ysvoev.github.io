// параметры
const OFFSET_TOP = 100;        // отступ сверху (px)
const SCROLL_DURATION = 500;  // длительность анимации (ms)

// плавный скролл
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let start;

  function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const percent = Math.min(time / duration, 1);

    // easing (easeInOut)
    const ease = percent < 0.5
      ? 2 * percent * percent
      : 1 - Math.pow(-2 * percent + 2, 2) / 2;

    window.scrollTo(0, startY + diff * ease);

    if (time < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// получить id из URL (#name после /)
function getHashId() {
  const hash = window.location.hash;
  return hash && hash.startsWith('#') ? hash.slice(1) : null;
}

// скролл к элементу
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const targetY = rect.top + window.scrollY - OFFSET_TOP;

  smoothScrollTo(targetY, SCROLL_DURATION);
}

// при загрузке страницы
window.addEventListener('load', () => {
  const id = getHashId();
  if (id) scrollToId(id);
});

// при клике на ссылки с #
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (!el) return;

  e.preventDefault();
  history.pushState(null, '', `#${id}`);
  scrollToId(id);
});

// при изменении hash (например, вручную)
window.addEventListener('hashchange', () => {
  const id = getHashId();
  if (id) scrollToId(id);
});