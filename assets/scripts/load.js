(function() {
    // Хранилище для уже загруженных URL (в рамках сессии)
    const STORAGE_KEY = 'progressiveImagesLoaded';
    let loadedUrls = new Set();
  
    // Загружаем список из sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        arr.forEach(url => loadedUrls.add(url));
      }
    } catch (e) {}
  
    function saveLoadedUrl(url) {
      loadedUrls.add(url);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...loadedUrls]));
      } catch (e) {}
    }
  
    function isImagePreloaded(url) {
      return loadedUrls.has(url);
    }
  
    // Универсальная функция загрузки (для img и video)
    function loadMedia(el) {
      const src = el.getAttribute('data-src');
      if (!src) return;
  
      // Если уже загружено – показываем сразу
      if (isImagePreloaded(src)) {
        if (el.tagName === 'VIDEO') {
          el.src = src;
          el.load(); // необходимо для видео, чтобы начать загрузку
        } else {
          el.src = src;
        }
        el.classList.add('preloaded');
        el.removeAttribute('data-src');
        return;
      }
  
      // Добавляем класс "loading" (размытие)
      el.classList.add('loading');
  
      // Устанавливаем src
      if (el.tagName === 'VIDEO') {
        el.src = src;
        el.load(); // запускаем загрузку видео
        // Слушаем событие, когда видео достаточно загружено для воспроизведения
        const onReady = function() {
          el.classList.remove('loading');
          el.classList.add('loaded');
          el.removeAttribute('data-src');
          saveLoadedUrl(src);
          el.removeEventListener('canplay', onReady);
          el.removeEventListener('loadeddata', onReady);
          el.onerror = null;
        };
        el.addEventListener('canplay', onReady);
        el.addEventListener('loadeddata', onReady);
        el.onerror = function() {
          el.classList.remove('loading');
          el.classList.add('loaded');
          el.removeAttribute('data-src');
          saveLoadedUrl(src); // запоминаем даже при ошибке, чтобы не пытаться снова
          el.onerror = null;
        };
      } else {
        // Для img
        el.src = src;
        el.onload = function() {
          el.classList.remove('loading');
          el.classList.add('loaded');
          el.removeAttribute('data-src');
          saveLoadedUrl(src);
          el.onload = null;
          el.onerror = null;
        };
        el.onerror = function() {
          el.classList.remove('loading');
          el.classList.add('loaded');
          el.removeAttribute('data-src');
          el.onload = null;
          el.onerror = null;
        };
      }
    }
  
    // === Ленивая загрузка через Intersection Observer ===
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.getAttribute('data-src')) {
            loadMedia(el);
          }
          observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  
    // Функция инициализации
    function init() {
      // Ищем все img и video с data-src
      const elements = document.querySelectorAll('img[data-src], video[data-src]');
      elements.forEach(el => {
        const src = el.getAttribute('data-src');
        if (src && isImagePreloaded(src)) {
          loadMedia(el); // сразу показываем без размытия
        } else {
          observer.observe(el);
        }
      });
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
    // Поддержка динамически добавляемых элементов
    if (window.MutationObserver) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.matches && node.matches('img[data-src], video[data-src]')) {
              const src = node.getAttribute('data-src');
              if (src && isImagePreloaded(src)) {
                loadMedia(node);
              } else {
                observer.observe(node);
              }
            }
            if (node.nodeType === 1 && node.querySelectorAll) {
              node.querySelectorAll('img[data-src], video[data-src]').forEach(el => {
                const src = el.getAttribute('data-src');
                if (src && isImagePreloaded(src)) {
                  loadMedia(el);
                } else {
                  observer.observe(el);
                }
              });
            }
          });
        });
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  
  })();