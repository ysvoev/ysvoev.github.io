(function () {
  /**
   * Настройки эффектов .pack — меняйте числа здесь.
   */
  var PACK = {
    /** ± градусов: случайный поворот картинки при загрузке (только если в pack больше одной картинки). */
    rotateOnLoadDeg: 16,

    /** ± градусов: дополнительный поворот картинки при наведении (к базовому углу с загрузки). */
    rotateOnHoverImageDeg: 4,

    /** ± градусов: дополнительный поворот всего блока .pack при наведении (только если картинок больше одной). */
    rotateOnHoverPackDeg: 4,

    /** ± пикселей: случайный сдвиг по X и Y при наведении (только если картинок больше одной). */
    shiftOnHoverPx: 8,

    /** масштаб картинок при наведении. */
    scaleOnHover: 1.1
  };

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

  function resetImgVars(img) {
    var br = img.dataset.rotateBase || '0';
    img.style.setProperty('--img-rotate', br + 'deg');
    img.style.setProperty('--img-tx', '0px');
    img.style.setProperty('--img-ty', '0px');
    img.style.setProperty('--img-scale', '1');
  }

  function initPack(pack) {
    var imgs = pack.querySelectorAll('img');
    if (!imgs.length) return;

    pack.dataset.packTiltBase = '0';
    var single = imgs.length === 1;

    for (var i = 0; i < imgs.length; i++) {
      var deg = single ? '0' : randPlusMinus(PACK.rotateOnLoadDeg);
      imgs[i].dataset.rotateBase = deg;
      imgs[i].style.setProperty('--img-rotate', deg + 'deg');
      imgs[i].style.setProperty('--img-tx', '0px');
      imgs[i].style.setProperty('--img-ty', '0px');
      imgs[i].style.setProperty('--img-scale', '1');
    }

    var order = [];
    for (var k = 0; k < imgs.length; k++) order.push(k);
    shuffleInPlace(order);
    for (var z = 0; z < order.length; z++) {
      imgs[order[z]].style.zIndex = String(z + 1);
    }
  }

  function bindPageHover(page) {
    var pack = page.querySelector('.pack');
    if (!pack) return;
    var imgs = pack.querySelectorAll('img');

    page.addEventListener('mouseenter', function () {
      var basePack = parseFloat(pack.dataset.packTiltBase || '0', 10) || 0;
      var single = imgs.length === 1;

      if (single) {
        pack.style.setProperty('--pack-tilt', basePack.toFixed(2) + 'deg');
      } else {
        var tiltExtra = parseFloat(randPlusMinus(PACK.rotateOnHoverPackDeg), 10);
        pack.style.setProperty('--pack-tilt', (basePack + tiltExtra).toFixed(2) + 'deg');
      }

      for (var i = 0; i < imgs.length; i++) {
        if (single) {
          imgs[i].style.setProperty('--img-tx', '0px');
          imgs[i].style.setProperty('--img-ty', '0px');
        } else {
          imgs[i].style.setProperty('--img-tx', randPlusMinus(PACK.shiftOnHoverPx) + 'px');
          imgs[i].style.setProperty('--img-ty', randPlusMinus(PACK.shiftOnHoverPx) + 'px');
        }
        imgs[i].style.setProperty('--img-scale', String(PACK.scaleOnHover));

        if (single) {
          imgs[i].style.setProperty('--img-rotate', '0deg');
        } else {
          var base = parseFloat(imgs[i].dataset.rotateBase || '0', 10) || 0;
          var extra = parseFloat(randPlusMinus(PACK.rotateOnHoverImageDeg), 10);
          imgs[i].style.setProperty('--img-rotate', (base + extra).toFixed(2) + 'deg');
        }
      }
    });
    page.addEventListener('mouseleave', function () {
      var basePack = parseFloat(pack.dataset.packTiltBase || '0', 10) || 0;
      pack.style.setProperty('--pack-tilt', basePack.toFixed(2) + 'deg');

      for (var j = 0; j < imgs.length; j++) {
        resetImgVars(imgs[j]);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.pack').forEach(function (pack) {
      initPack(pack);
    });
    document.querySelectorAll('.page').forEach(function (page) {
      bindPageHover(page);
    });
  });
})();
