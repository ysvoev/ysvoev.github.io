(function () {
  var PACK = {
    rotateOnLoadDeg: 0,
    rotateOnHoverImageDeg: 2,
    rotateOnHoverPackDeg: 0,
    shiftOnHoverPx: 24,
    scaleOnHover: 1.04,
    zIndexDelay: 400,
    zIndexInterval: 400,
    // НОВЫЕ ПАРАМЕТРЫ – интервалы автоматической смены (мс)
    autoRotateMinInterval: 300,
    autoRotateMaxInterval: 500
  };

  var COLS_PER_ROW = 3;

  function randPlusMinus(abs) {
    return (Math.random() * (2 * abs) - abs).toFixed(2);
  }

  function shuffleInPlace(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  // ------------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ АВТОМАТИЧЕСКОЙ СМЕНЫ
  // ------------------------------------------------------------------

  // Получить все элементы внутри pack (img, video, .idea, .services)
  function getPackElements(pack) {
    var elements = [];
    var imgs = pack.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) elements.push(imgs[i]);
    var videos = pack.querySelectorAll('video');
    for (var j = 0; j < videos.length; j++) elements.push(videos[j]);
    var extraClasses = ['idea', 'services'];
    for (var k = 0; k < extraClasses.length; k++) {
      var extraElements = pack.querySelectorAll('.' + extraClasses[k]);
      for (var l = 0; l < extraElements.length; l++) {
        if (elements.indexOf(extraElements[l]) === -1) elements.push(extraElements[l]);
      }
    }
    return elements;
  }

  // Планирование следующей смены со случайной задержкой
  function scheduleNextRotation(pack) {
    var elements = getPackElements(pack);
    if (elements.length <= 1) return;

    var min = PACK.autoRotateMinInterval || 2000;
    var max = PACK.autoRotateMaxInterval || 5000;
    var interval = Math.floor(Math.random() * (max - min + 1)) + min;

    pack._autoTimer = setTimeout(function() {
      rotateZIndex(elements);
      scheduleNextRotation(pack);
    }, interval);
  }

  // Запуск автоматической смены (очищает предыдущий таймер)
  function startAutoRotation(pack) {
    stopAutoRotation(pack);
    scheduleNextRotation(pack);
  }

  // Остановка автоматической смены
  function stopAutoRotation(pack) {
    if (pack._autoTimer) {
      clearTimeout(pack._autoTimer);
      pack._autoTimer = null;
    }
  }

  // ------------------------------------------------------------------
  // ОСТАЛЬНЫЕ ФУНКЦИИ (НЕ ИЗМЕНЕНЫ, КРОМЕ initPack И bindCardHover)
  // ------------------------------------------------------------------

  function assignRowAlignments(rowPages) {
    var count = rowPages.length;
    if (count === 0) return;

    var allOptions = [
      { justify: 'center', align: 'center' },
      { justify: 'flex-start', align: 'flex-start' },
      { justify: 'flex-end', align: 'flex-start' },
      { justify: 'flex-end', align: 'flex-end' },
      { justify: 'flex-start', align: 'flex-end' },
      { justify: 'flex-start', align: 'center' },
      { justify: 'flex-end', align: 'center' },
      { justify: 'center', align: 'flex-start' },
      { justify: 'center', align: 'flex-end' }
    ];

    var perPageOptions = [];
    for (var i = 0; i < count; i++) {
      var isFirst = (i === 0);
      var isLast = (i === count - 1);
      var filtered = allOptions.filter(function (opt) {
        if (isFirst && opt.justify === 'flex-end') return false;
        if (isLast && opt.justify === 'flex-start') return false;
        return true;
      });
      if (filtered.length === 0) filtered = [{ justify: 'center', align: 'center' }];
      shuffleInPlace(filtered);
      perPageOptions.push(filtered);
    }

    var used = [];
    var assigned = [];

    for (var i = 0; i < count; i++) {
      var options = perPageOptions[i];
      var chosen = null;
      for (var j = 0; j < options.length; j++) {
        var candidate = options[j];
        var isUsed = used.some(function (u) {
          return u.justify === candidate.justify && u.align === candidate.align;
        });
        if (!isUsed) {
          chosen = candidate;
          break;
        }
      }
      if (!chosen) {
        chosen = options[0];
      }
      used.push(chosen);
      assigned.push(chosen);
    }

    for (var i = 0; i < count; i++) {
      var page = rowPages[i];
      var style = assigned[i];
      page.style.display = 'flex';
      page.style.justifyContent = style.justify;
      page.style.alignItems = style.align;
    }
  }

  function resetImgVars(el) {
    var br = el.dataset.rotateBase || '0';
    el.style.setProperty('--img-rotate', br + 'deg');
    el.style.setProperty('--img-tx', '0px');
    el.style.setProperty('--img-ty', '0px');
    el.style.setProperty('--img-scale', '1');
  }

  // ИНИЦИАЛИЗАЦИЯ PACK – теперь запускает автоматическую смену
  function initPack(pack) {
    var elements = getPackElements(pack);
    if (!elements.length) return;

    pack.dataset.packTiltBase = '0';
    var single = elements.length === 1;

    for (var m = 0; m < elements.length; m++) {
      elements[m].style.position = 'relative';
      var deg = single ? '0' : randPlusMinus(PACK.rotateOnLoadDeg);
      elements[m].dataset.rotateBase = deg;
      elements[m].style.setProperty('--img-rotate', deg + 'deg');
      elements[m].style.setProperty('--img-tx', '0px');
      elements[m].style.setProperty('--img-ty', '0px');
      elements[m].style.setProperty('--img-scale', '1');
    }

    var order = [];
    for (var n = 0; n < elements.length; n++) order.push(n);
    shuffleInPlace(order);
    for (var z = 0; z < order.length; z++) {
      elements[order[z]].style.zIndex = String(z + 1);
      elements[order[z]].dataset.baseZIndex = String(z + 1);
    }
    pack.dataset.elementsCount = elements.length;

    // ЗАПУСКАЕМ АВТОМАТИЧЕСКУЮ СМЕНУ
    startAutoRotation(pack);
  }

  function rotateZIndex(elements) {
    var total = elements.length;
    if (total <= 1) return;
    var maxZ = -1;
    for (var i = 0; i < total; i++) {
      var zVal = parseInt(elements[i].style.zIndex, 10) || 0;
      if (zVal > maxZ) maxZ = zVal;
    }
    for (var j = 0; j < total; j++) {
      var el = elements[j];
      var currentZ = parseInt(el.style.zIndex, 10) || 0;
      if (currentZ < maxZ) {
        el.style.zIndex = String(currentZ + 1);
        el.dataset.baseZIndex = String(currentZ + 1);
      } else if (currentZ === maxZ) {
        el.style.zIndex = '1';
        el.dataset.baseZIndex = '1';
      }
    }
  }

  // ПРИВЯЗКА ХОВЕРА – теперь только управляет паузой и эффектами
  function bindCardHover(card) {
    var page = card.closest('.page');
    if (!page) return;

    var pack = page.querySelector('.pack');
    var elements = pack ? getPackElements(pack) : [];

    card.addEventListener('mouseenter', function () {
      // ОСТАНАВЛИВАЕМ АВТОМАТИЧЕСКУЮ СМЕНУ
      if (pack) {
        stopAutoRotation(pack);
      }

      // Поднимаем z-index страницы
      var allPages = document.querySelectorAll('.page');
      for (var p = 0; p < allPages.length; p++) {
        var pg = allPages[p];
        if (!pg.dataset.originalZIndex) {
          var currentZ = pg.style.zIndex || '';
          pg.dataset.originalZIndex = currentZ || 'auto';
        }
      }
      for (var p = 0; p < allPages.length; p++) {
        var pg = allPages[p];
        if (pg === page) continue;
        var orig = pg.dataset.originalZIndex || '';
        if (orig === 'auto' || orig === '') {
          pg.style.zIndex = '';
        } else {
          pg.style.zIndex = orig;
        }
      }
      page.style.zIndex = '9999';

      // Применяем эффекты наведения (поворот, сдвиг, масштаб)
      if (elements.length > 0 && pack) {
        var basePack = parseFloat(pack.dataset.packTiltBase || '0', 10) || 0;
        var single = elements.length === 1;

        if (single) {
          pack.style.setProperty('--pack-tilt', basePack.toFixed(2) + 'deg');
        } else {
          var tiltExtra = parseFloat(randPlusMinus(PACK.rotateOnHoverPackDeg), 10);
          pack.style.setProperty('--pack-tilt', (basePack + tiltExtra).toFixed(2) + 'deg');
        }

        for (var m = 0; m < elements.length; m++) {
          if (single) {
            elements[m].style.setProperty('--img-tx', '0px');
            elements[m].style.setProperty('--img-ty', '0px');
          } else {
            elements[m].style.setProperty('--img-tx', randPlusMinus(PACK.shiftOnHoverPx) + 'px');
            elements[m].style.setProperty('--img-ty', randPlusMinus(PACK.shiftOnHoverPx) + 'px');
          }
          elements[m].style.setProperty('--img-scale', String(PACK.scaleOnHover));

          if (single) {
            elements[m].style.setProperty('--img-rotate', '0deg');
          } else {
            var base = parseFloat(elements[m].dataset.rotateBase || '0', 10) || 0;
            var extra = parseFloat(randPlusMinus(PACK.rotateOnHoverImageDeg), 10);
            elements[m].style.setProperty('--img-rotate', (base + extra).toFixed(2) + 'deg');
          }
        }
      }
    });

    card.addEventListener('mouseleave', function () {
      // Сбрасываем эффекты
      if (elements.length > 0 && pack) {
        var basePack = parseFloat(pack.dataset.packTiltBase || '0', 10) || 0;
        pack.style.setProperty('--pack-tilt', basePack.toFixed(2) + 'deg');

        for (var n = 0; n < elements.length; n++) resetImgVars(elements[n]);

        // ВОЗОБНОВЛЯЕМ АВТОМАТИЧЕСКУЮ СМЕНУ
        startAutoRotation(pack);
      }
    });
  }

  // Коррекция горизонтального переполнения (без изменений)
  function correctCardHorizontalOverflow() {
    var portfolio = document.querySelector('.portfolio');
    if (!portfolio) return;

    var portfolioRect = portfolio.getBoundingClientRect();
    var portfolioStyle = getComputedStyle(portfolio);
    var paddingLeft = parseFloat(portfolioStyle.paddingLeft) || 0;
    var paddingRight = parseFloat(portfolioStyle.paddingRight) || 0;

    var leftBound = portfolioRect.left + paddingLeft;
    var rightBound = portfolioRect.right - paddingRight;
    var availableWidth = rightBound - leftBound;

    var isMobile = window.innerWidth < 1000;

    var pages = portfolio.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];
      var card = page.querySelector('.card');
      if (!card) continue;

      card.style.transform = '';
      var pack = page.querySelector('.pack');
      if (pack) {
        pack.style.transform = '';
        pack.style.transformOrigin = 'center center';
      }

      var rect = card.getBoundingClientRect();
      var cardLeft = rect.left;
      var cardRight = rect.right;
      var cardWidth = rect.width;

      var dx = 0;
      if (cardLeft < leftBound) {
        dx = leftBound - cardLeft;
      } else if (cardRight > rightBound) {
        dx = rightBound - cardRight;
      }

      var scale = 1;
      if (isMobile && cardWidth > availableWidth) {
        scale = availableWidth / cardWidth;
        if (scale < 0.3) scale = 0.3;
      }

      if (dx !== 0) {
        card.style.transform = 'translateX(' + dx + 'px)';
      }

      if (pack && scale !== 1) {
        var tiltDeg = parseFloat(pack.style.getPropertyValue('--pack-tilt')) || 0;
        pack.style.transform = 'rotate(' + tiltDeg + 'deg) scale(' + scale + ')';
        pack.style.transformOrigin = 'center center';
      }
    }
  }

  // applyVisuals (без изменений, кроме того что initPack теперь запускает авто-смену)
  window.applyVisuals = function () {
    var pages = document.querySelectorAll('.page');
    var totalPages = pages.length;
    if (totalPages === 0) return;

    for (var i = 0; i < totalPages; i++) {
      var page = pages[i];
      if (!page.style.position || page.style.position === 'static') {
        page.style.position = 'relative';
      }
      if (!page.dataset.originalZIndex) {
        var currentZ = page.style.zIndex || '';
        page.dataset.originalZIndex = currentZ || 'auto';
      }
    }

    var rows = [];
    var currentRow = null;
    var threshold = 10;

    for (var i = 0; i < totalPages; i++) {
      var page = pages[i];
      var top = page.offsetTop;
      if (currentRow === null || Math.abs(top - currentRow.top) > threshold) {
        currentRow = { top: top, pages: [] };
        rows.push(currentRow);
      }
      currentRow.pages.push(page);
    }

    for (var r = 0; r < rows.length; r++) {
      var rowPages = rows[r].pages;
      assignRowAlignments(rowPages);
    }

    document.querySelectorAll('.pack').forEach(function (pack) {
      if (!pack.dataset.elementsCount) initPack(pack);
    });

    document.querySelectorAll('.card').forEach(function (card) {
      if (!card._visualsApplied) {
        bindCardHover(card);
        card._visualsApplied = true;
      }
    });

    correctCardHorizontalOverflow();
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.applyVisuals();
  });

  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      correctCardHorizontalOverflow();
    }, 200);
  });

})();