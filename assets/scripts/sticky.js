// Скрипт для анимации элементов при sticky позиционировании
document.addEventListener('DOMContentLoaded', function() {
    const portfolio = document.querySelector('.portfolio');
    const info = document.querySelector('.info');
    const cases = document.querySelectorAll('.case');
    const photo = document.querySelector('.photo');
    
    if (!portfolio || !info || !cases.length || !photo) {
        console.log('Элементы для sticky анимации не найдены');
        return;
    }
    
    console.log('Элементы найдены, запускаем sticky анимацию');
    
    // Получаем CSS переменную --portfolio-width
    const portfolioWidth = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--portfolio-width').trim());
    
    // Исходные значения из CSS
    const originalCaseHeight = portfolioWidth; // 80px
    const originalPhotoHeight = 80;
    
    // Целевые значения
    const targetCaseHeight = portfolioWidth / 2; // 40px
    const targetPhotoHeight = portfolioWidth / 2; // 40px
    
    // Сохраняем начальные позиции элементов
    let portfolioInitialTop = null;
    let infoInitialTop = null;
    
    // Переменные для отслеживания sticky состояний
    let portfolioStickyStartScroll = null;
    let infoStickyStartScroll = null;
    
    // Переменные для оптимизации логирования
    let lastLogTime = 0;
    const LOG_INTERVAL = 1000; // Логировать не чаще чем раз в 1000ms
    
    function updateElements() {
        const scrollY = window.scrollY;
        
        // АНИМАЦИЯ ДЛЯ PORTFOLIO - независимая логика
        const portfolioRect = portfolio.getBoundingClientRect();
        const portfolioIsSticky = portfolioRect.top <= 32; // sticky позиция
        
        if (portfolioIsSticky) {
            // Запоминаем момент когда portfolio стал sticky
            if (portfolioStickyStartScroll === null) {
                portfolioStickyStartScroll = scrollY;
            }
            
            // Вычисляем прогресс с момента когда элемент стал sticky (с 0px)
            const scrollFromSticky = scrollY - portfolioStickyStartScroll;
            const portfolioProgress = Math.min(scrollFromSticky / 200, 1);
            const currentCaseHeight = originalCaseHeight - (originalCaseHeight - targetCaseHeight) * portfolioProgress;
            
            cases.forEach(caseEl => {
                caseEl.style.maxHeight = `${currentCaseHeight}px`;
                caseEl.style.minHeight = `${currentCaseHeight}px`;
                caseEl.style.transition = 'max-height 0.1s ease-out, min-height 0.1s ease-out';
            });
            
            // Логируем только если прошло достаточно времени
            const now = Date.now();
            if (now - lastLogTime > LOG_INTERVAL) {
                console.log(`Portfolio sticky: true, scrollFromSticky: ${scrollFromSticky}, progress: ${portfolioProgress.toFixed(2)}, height: ${currentCaseHeight.toFixed(0)}px`);
                lastLogTime = now;
            }
        } else {
            // Сбрасываем sticky состояние
            portfolioStickyStartScroll = null;
            
            // Возвращаем исходные значения
            cases.forEach(caseEl => {
                caseEl.style.maxHeight = '';
                caseEl.style.minHeight = '';
                caseEl.style.transition = '';
            });
        }
        
        // АНИМАЦИЯ ДЛЯ INFO - независимая логика
        const infoRect = info.getBoundingClientRect();
        const infoIsSticky = infoRect.top <= 88; // sticky позиция
        
        if (infoIsSticky) {
            // Запоминаем момент когда info стал sticky
            if (infoStickyStartScroll === null) {
                infoStickyStartScroll = scrollY;
            }
            
            // Вычисляем прогресс с момента когда элемент стал sticky (с 0px)
            const scrollFromSticky = scrollY - infoStickyStartScroll;
            const infoProgress = Math.min(scrollFromSticky / 40, 1);
            const currentPhotoHeight = originalPhotoHeight - (originalPhotoHeight - targetPhotoHeight) * infoProgress;
            
            photo.style.maxHeight = `${currentPhotoHeight}px`;
            photo.style.minHeight = `${currentPhotoHeight}px`;
            photo.style.transition = 'max-height 0.1s ease-out, min-height 0.1s ease-out';
            
            // Логируем только если прошло достаточно времени (используем ту же переменную lastLogTime)
            const now = Date.now();
            if (now - lastLogTime > LOG_INTERVAL) {
                console.log(`Info sticky: true, scrollFromSticky: ${scrollFromSticky}, progress: ${infoProgress.toFixed(2)}, height: ${currentPhotoHeight.toFixed(0)}px`);
                lastLogTime = now;
            }
        } else {
            // Сбрасываем sticky состояние
            infoStickyStartScroll = null;
            
            // Возвращаем исходные значения
            photo.style.maxHeight = '';
            photo.style.minHeight = '';
            photo.style.transition = '';
        }
    }
    
    // Слушаем скролл с throttling для производительности
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateElements);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', function() {
        requestTick();
        ticking = false;
    });
    
    // Запускаем при загрузке с задержкой
    setTimeout(updateElements, 100);
    
    console.log('Sticky анимация инициализирована');
});
