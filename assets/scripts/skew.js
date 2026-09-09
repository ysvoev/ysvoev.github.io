// ============================================================
// ОБЪЕДИНЁННЫЙ СКРИПТ ИСКАЖЕНИЙ
// ============================================================

(function() {
  // ===== НАСТРАИВАЕМЫЕ ПАРАМЕТРЫ =====
  const CONFIG = {
    // Статические искажения обычного текста (не внутри ссылок)
    text: {
      scaleY: { min: 1, max: 1.6 },
      scaleX: { min: 1, max: 1 },
      skewX: { min: -10, max: 10 },
      distortionRate: 0.4
    },
    // Начальные искажения для ссылок и внутренних элементов (при загрузке)
    linkInitial: {
      scaleY: { min: 1.4, max: 2 },
      scaleX: { min: 1, max: 1 },
      skewX: { min: -10, max: 10 },
      distortionRate: 1     // коэффициент для искажения слов внутри ссылок
    },
    // Динамические эффекты для ссылок и внутренних элементов (при наведении)
    linkHover: {
      scaleY: { min: 2, max: 2.4 },
      scaleX: { min: 1, max: 1 },
      skewX: { min: -20, max: 20 },
      colors: [
        'var(--color-green)',
        'var(--color-yellow)',
        'var(--color-blue)',
        'var(--color-violet)',
        'var(--color-pink)',
        'var(--color-red)',
        'var(--color-orange)'
      ]
    },
    // Ссылки с этими классами НЕ искажаются сами,
    // но внутри них ищутся элементы для искажения
    excludeLinkClasses: ['card', 'portfolio'],
    // Селекторы элементов внутри исключённых ссылок, которые должны искажаться
    innerDistortSelectors: ['.case-name'],
    // Мобильная ширина для скрытия элементов
    mobileBreakpoint: 1000
  };

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getTextNodes(node) {
    let nodes = [];
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      nodes.push(node);
    } else {
      for (let child of node.childNodes) {
        nodes = nodes.concat(getTextNodes(child));
      }
    }
    return nodes;
  }

  function isInsideLink(node) {
    let parent = node.parentElement;
    while (parent) {
      if (parent.tagName === 'A') return true;
      parent = parent.parentElement;
    }
    return false;
  }

  // Проверка, является ли элемент скрытым на мобилке
  function isHiddenOnMobile(element) {
    if (window.innerWidth > CONFIG.mobileBreakpoint) return false;
    return element.classList.contains('none');
  }

  // ===== СТАТИЧЕСКИЕ ИСКАЖЕНИЯ ТЕКСТА (исключая ссылки) =====
  function distortRegularText() {
    const selectors = 'h1, h2, p';
    document.querySelectorAll(selectors).forEach(el => {
      if (el.closest('.pages')) return;
      if (el.closest('a')) return;
      const textNodes = getTextNodes(el);
      textNodes.forEach(node => {
        if (isInsideLink(node)) return;
        processWordDistortion(node, CONFIG.text);
      });
    });
  }

  function processWordDistortion(textNode, params) {
    const text = textNode.textContent;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (!words.length) return;

    const total = words.length;
    const count = Math.max(1, Math.floor(total * params.distortionRate));
    const indices = [];
    for (let i = 0; i < count; i++) {
      let idx;
      let attempts = 0;
      do {
        idx = Math.floor(Math.random() * total);
        attempts++;
      } while (indices.includes(idx) && attempts < 100);
      if (!indices.includes(idx)) indices.push(idx);
    }

    const original = textNode.textContent;
    let html = '';
    let pos = 0;
    words.forEach((word, i) => {
      const start = original.indexOf(word, pos);
      if (start === -1) {
        html += word;
        pos += word.length;
        return;
      }
      if (start > pos) html += original.substring(pos, start);

      if (indices.includes(i)) {
        const scaleY = randomRange(params.scaleY.min, params.scaleY.max).toFixed(2);
        const scaleX = randomRange(params.scaleX.min, params.scaleX.max).toFixed(2);
        const skewX = randomRange(params.skewX.min, params.skewX.max).toFixed(0);
        html += `<span style="transform: scaleY(${scaleY}) scaleX(${scaleX}) skewX(${skewX}deg); display: inline-block; transform-origin: center;">${word}</span>`;
      } else {
        html += word;
      }
      pos = start + word.length;
    });
    if (pos < original.length) html += original.substring(pos);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // ===== НОВАЯ ФУНКЦИЯ: ИСКАЖЕНИЕ СЛОВ ВНУТРИ ССЫЛОК =====
  function distortTextNodeWords(textNode, params) {
    // Аналогична processWordDistortion, но без проверки isInsideLink
    const text = textNode.textContent;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (!words.length) return;

    const total = words.length;
    const count = Math.max(1, Math.floor(total * params.distortionRate));
    const indices = [];
    for (let i = 0; i < count; i++) {
      let idx;
      let attempts = 0;
      do {
        idx = Math.floor(Math.random() * total);
        attempts++;
      } while (indices.includes(idx) && attempts < 100);
      if (!indices.includes(idx)) indices.push(idx);
    }

    const original = textNode.textContent;
    let html = '';
    let pos = 0;
    words.forEach((word, i) => {
      const start = original.indexOf(word, pos);
      if (start === -1) {
        html += word;
        pos += word.length;
        return;
      }
      if (start > pos) html += original.substring(pos, start);

      if (indices.includes(i)) {
        const scaleY = randomRange(params.scaleY.min, params.scaleY.max).toFixed(2);
        const scaleX = randomRange(params.scaleX.min, params.scaleX.max).toFixed(2);
        const skewX = randomRange(params.skewX.min, params.skewX.max).toFixed(0);
        html += `<span style="transform: scaleY(${scaleY}) scaleX(${scaleX}) skewX(${skewX}deg); display: inline-block; transform-origin: center;">${word}</span>`;
      } else {
        html += word;
      }
      pos = start + word.length;
    });
    if (pos < original.length) html += original.substring(pos);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // ===== НАЧАЛЬНЫЕ ИСКАЖЕНИЯ ДЛЯ ССЫЛОК (ТОЛЬКО СЛОВА, БЕЗ ОБЩЕЙ ТРАНСФОРМАЦИИ) =====
  function applyInitialLinkDistortions() {
    const { linkInitial } = CONFIG;
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
      if (isHiddenOnMobile(link)) return;
      
      // Искажаем отдельные слова внутри всех ссылок (включая исключённые)
      const textNodes = getTextNodes(link);
      textNodes.forEach(node => {
        distortTextNodeWords(node, {
          scaleY: linkInitial.scaleY,
          scaleX: linkInitial.scaleX,
          skewX: linkInitial.skewX,
          distortionRate: linkInitial.distortionRate
        });
      });
    });
  }

  // ===== ДИНАМИЧЕСКИЕ ЭФФЕКТЫ ДЛЯ ССЫЛОК (при наведении) =====
  function initLinkEffects() {
    const allLinks = document.querySelectorAll('a');
    const { linkHover, excludeLinkClasses, innerDistortSelectors } = CONFIG;

    allLinks.forEach(link => {
      // Пропускаем ссылки, скрытые на мобилке
      if (isHiddenOnMobile(link)) return;
      
      const isExcluded = excludeLinkClasses.some(cls => link.classList.contains(cls));

      // Удаляем старые обработчики (если есть)
      link.removeEventListener('mouseenter', link._enter);
      link.removeEventListener('mouseleave', link._leave);

      link._enter = function(e) {
        if (isExcluded) {
          // Исключённая ссылка – искажаем внутренние элементы
          const targets = this.querySelectorAll(innerDistortSelectors.join(','));
          targets.forEach(target => {
            if (isHiddenOnMobile(target) || isHiddenOnMobile(this)) return;
            
            const scaleY = randomRange(linkHover.scaleY.min, linkHover.scaleY.max).toFixed(2);
            const scaleX = randomRange(linkHover.scaleX.min, linkHover.scaleX.max).toFixed(2);
            const skewX = randomRange(linkHover.skewX.min, linkHover.skewX.max).toFixed(0);
            const color = linkHover.colors[Math.floor(Math.random() * linkHover.colors.length)];

            target.style.setProperty('color', color, 'important');
            target.style.setProperty('transition', `transform var(--animation-duration, 0.3s) var(--animation-cubic, ease), color var(--animation-duration, 0.3s) var(--animation-cubic, ease)`, 'important');
            target.style.setProperty('transform', `scaleY(${scaleY}) scaleX(${scaleX}) skewX(${skewX}deg)`, 'important');
            target.style.setProperty('display', 'inline-block', 'important');
            target.style.setProperty('transform-origin', 'center', 'important');
            target.classList.add('scew-active');
          });
          return;
        }

        // Обычная ссылка
        const scaleY = randomRange(linkHover.scaleY.min, linkHover.scaleY.max).toFixed(2);
        const scaleX = randomRange(linkHover.scaleX.min, linkHover.scaleX.max).toFixed(2);
        const skewX = randomRange(linkHover.skewX.min, linkHover.skewX.max).toFixed(0);
        const color = linkHover.colors[Math.floor(Math.random() * linkHover.colors.length)];

        this.style.setProperty('color', color, 'important');
        this.style.setProperty('transition', `transform var(--animation-duration, 0.3s) var(--animation-cubic, ease), color var(--animation-duration, 0.3s) var(--animation-cubic, ease)`, 'important');
        this.style.setProperty('transform', `scaleY(${scaleY}) scaleX(${scaleX}) skewX(${skewX}deg)`, 'important');
        this.style.setProperty('display', 'inline-block', 'important');
        this.style.setProperty('transform-origin', 'center', 'important');
        this.classList.add('scew-active');
      };

      link._leave = function(e) {
        // Восстанавливаем цвет (для обычных ссылок и для внутренних элементов)
        const bg = getComputedStyle(document.body).backgroundColor;
        const [r, g, b] = bg.match(/\d+/g).map(Number);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const textColor = lum > 0.5 ? 'var(--color-black)' : 'var(--color-white)';

        if (isExcluded) {
          const targets = this.querySelectorAll(innerDistortSelectors.join(','));
          targets.forEach(target => {
            if (isHiddenOnMobile(target) || isHiddenOnMobile(this)) return;
            
            target.style.color = textColor;
            target.style.removeProperty('transition');
            target.classList.remove('scew-active');
            // Трансформация остаётся
          });
          return;
        }

        // Обычная ссылка
        this.style.color = textColor;
        this.style.removeProperty('transition');
        this.classList.remove('scew-active');
        // Трансформация остаётся
      };

      link.addEventListener('mouseenter', link._enter);
      link.addEventListener('mouseleave', link._leave);
    });
  }

  // ===== ЗАПУСК =====
  document.addEventListener('DOMContentLoaded', function() {
    requestAnimationFrame(() => {
      // 1. Статические искажения текста
      distortRegularText();

      requestAnimationFrame(() => {
        // 2. Стабилизация sticky элементов
        document.querySelectorAll('.links, .navigation, .info, .about p:not(:last-child)').forEach(el => {
          el.style.transform = 'translateZ(0)';
          el.style.willChange = 'transform';
          const rect = el.getBoundingClientRect();
          el.style.transform = '';
          el.style.willChange = '';
        });

        // 3. Сигнал о завершении статической обработки
        document.dispatchEvent(new CustomEvent('scewProcessingComplete'));
      });
    });

    // 4. После завершения статики – инициализируем динамические эффекты
    document.addEventListener('scewProcessingComplete', function() {
      // Сначала применяем начальные искажения для ссылок (только слова)
      applyInitialLinkDistortions();
      // Затем навешиваем обработчики наведения
      initLinkEffects();
    });

    // Если событие уже произошло (на случай, если DOMContentLoaded уже сработал)
    if (document.readyState === 'complete') {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('scewProcessingComplete'));
      }, 100);
    }
  });
})();