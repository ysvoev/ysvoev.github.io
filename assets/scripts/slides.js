(function() {
    'use strict';
    
    // параметры
    const SCROLL_DURATION = 200;
    
    // получить контейнер
    function getContainer() {
      return document.querySelector('.slides');
    }
    
    // получить текущий индекс слайда
    function getCurrentSlideIndex(container) {
      const slides = container.querySelectorAll('.slide');
      const scrollTop = container.scrollTop;
      const slideHeight = window.innerHeight;
      
      let index = Math.round(scrollTop / slideHeight);
      
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      
      return index;
    }
    
    // плавный скролл для контейнера
    function smoothScrollTo(container, targetY, duration) {
      const startY = container.scrollTop;
      const diff = targetY - startY;
      let start;
  
      function step(timestamp) {
        if (!start) start = timestamp;
        const time = timestamp - start;
        const percent = Math.min(time / duration, 1);
  
        const ease = percent < 0.5
          ? 2 * percent * percent
          : 1 - Math.pow(-2 * percent + 2, 2) / 2;
  
        container.scrollTop = startY + diff * ease;
  
        if (time < duration) {
          requestAnimationFrame(step);
        }
      }
  
      requestAnimationFrame(step);
    }
    
    // переключение слайда
    function goToSlide(direction) {
      const container = getContainer();
      if (!container) return;
      
      const slides = container.querySelectorAll('.slide');
      if (slides.length === 0) return;
      
      const currentIndex = getCurrentSlideIndex(container);
      let targetIndex = currentIndex + direction;
      
      // зацикливание
      if (targetIndex < 0) targetIndex = slides.length - 1;
      if (targetIndex >= slides.length) targetIndex = 0;
      
      const targetY = targetIndex * window.innerHeight;
      
      smoothScrollTo(container, targetY, SCROLL_DURATION);
      
      // обновляем hash
      const slide = slides[targetIndex];
      if (slide && slide.id) {
        history.replaceState(null, '', '#' + slide.id);
      }
    }
    
    // ===== ОБРАБОТЧИК КЛИКОВ =====
    document.addEventListener('click', function(e) {
      // Игнорируем клики по ссылкам
      if (e.target.closest('a')) {
        return;
      }
      
      // Игнорируем клики по кнопкам
      if (e.target.closest('button')) {
        return;
      }
      
      // Проверяем, что клик внутри .slides
      const container = getContainer();
      if (!container || !container.contains(e.target)) {
        return;
      }
      
      const windowHeight = window.innerHeight;
      const clickY = e.clientY;
      
      if (clickY < windowHeight / 2) {
        goToSlide(-1);
      } else {
        goToSlide(1);
      }
    });
    
    // ===== ОБРАБОТЧИК КЛАВИШ =====
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          goToSlide(-1);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          goToSlide(1);
          break;
      }
    });
    
    // ===== ОБНОВЛЕНИЕ HASH ПРИ СКРОЛЛЕ =====
    function updateHashOnScroll() {
      const container = getContainer();
      if (!container) return;
      
      const slides = container.querySelectorAll('.slide');
      if (slides.length === 0) return;
      
      const currentIndex = getCurrentSlideIndex(container);
      const slide = slides[currentIndex];
      
      if (slide && slide.id) {
        const currentHash = window.location.hash.slice(1);
        if (currentHash !== slide.id) {
          history.replaceState(null, '', '#' + slide.id);
        }
      }
    }
    
    let scrollTimeout;
    document.addEventListener('scroll', function() {
      const container = getContainer();
      if (!container) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        updateHashOnScroll();
      }, 150);
    }, { passive: true });
    
    // ===== ЗАГРУЗКА ИЗ URL =====
    function loadFromHash() {
      const container = getContainer();
      if (!container) return;
      
      const hash = window.location.hash;
      if (hash) {
        const id = hash.slice(1);
        const targetSlide = document.getElementById(id);
        if (targetSlide) {
          const slides = container.querySelectorAll('.slide');
          const slideIndex = Array.from(slides).indexOf(targetSlide);
          if (slideIndex !== -1) {
            const targetY = slideIndex * window.innerHeight;
            container.scrollTop = targetY;
            console.log('Загружен слайд из URL:', id);
          }
        }
      }
    }
    
    // Запускаем при загрузке
    if (document.readyState === 'complete') {
      setTimeout(loadFromHash, 200);
    } else {
      window.addEventListener('load', function() {
        setTimeout(loadFromHash, 200);
      });
    }
    
    // Также при DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(loadFromHash, 300);
    });
    
  })();