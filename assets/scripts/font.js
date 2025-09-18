// Скрипт для случайного выбора шрифта при загрузке сайта
document.addEventListener('DOMContentLoaded', function() {
    console.log('Запускаем скрипт случайного выбора шрифта');
    
    // Массив доступных шрифтов
    const fonts = [
        {
            family: '"Arial", sans-serif',
            name: 'Arial'
        },
        {
            family: '"Times New Roman", sans-serif',
            name: 'Times New Roman'
        }
    ];
    
    // Случайный выбор шрифта
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    
    console.log(`Выбран шрифт: ${randomFont.name}`);
    
    // Функция для надежной проверки мобильной версии
    function checkMobile() {
        return window.innerWidth <= 1000 || 
               window.screen.width <= 1000 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Проверяем мобильную версию
    let isMobile = checkMobile();
    
    // Функция для применения шрифта с проверкой мобильной версии
    function applyFontStyles() {
        isMobile = checkMobile(); // Перепроверяем при каждом применении
        
        const textElements = document.querySelectorAll('h1, h2, p, a');
        textElements.forEach(element => {
            element.style.fontFamily = randomFont.family;
            
            // Коррекция стилей для Times New Roman
            if (randomFont.name === 'Times New Roman') {
                if (isMobile) {
                    element.style.fontSize = 'calc(var(--m-font-size) * 1.1)';
                    element.style.lineHeight = 'calc(var(--m-line-height) * 1.1)';
                } else {
                    element.style.fontSize = 'calc(var(--font-size) * 1.1)';
                    element.style.lineHeight = 'calc(var(--line-height) * 1.1)';
                }
            }
            // Для Arial оставляем базовые значения (ничего не меняем)
        });
        
        console.log(`Шрифт ${randomFont.name} применен к ${textElements.length} элементам (${isMobile ? 'мобильная' : 'десктоп'} версия)`);
        if (randomFont.name === 'Times New Roman') {
            console.log(`Применена коррекция размера и межстрочного интервала для Times New Roman (${isMobile ? 'мобильные переменные' : 'десктоп переменные'})`);
        }
    }
    
    // Применяем шрифт при загрузке
    applyFontStyles();
    
    // Переприменяем при изменении ориентации и размера окна
    window.addEventListener('orientationchange', () => {
        setTimeout(applyFontStyles, 200);
    });
    
    window.addEventListener('resize', () => {
        clearTimeout(window.fontResizeTimeout);
        window.fontResizeTimeout = setTimeout(applyFontStyles, 100);
    });
    
    // ===== БЛОК: ДИНАМИЧЕСКИЙ ЦВЕТ ТЕКСТА В ЗАВИСИМОСТИ ОТ ФОНА =====
    console.log('Инициализация динамического цвета текста');
    
    // Функция для вычисления яркости цвета
    function getLuminance(rgb) {
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        // Формула относительной яркости по WCAG
        return (0.299*r + 0.587*g + 0.114*b) / 255;
    }
    
    // Функция для установки контрастного цвета текста
    function setTextColor() {
        const bg = getComputedStyle(document.body).backgroundColor;
        const lum = getLuminance(bg);
        const textColor = lum > 0.5 ? "var(--color-black)" : "var(--color-white)";
        
        // Применяем цвет ко всем текстовым элементам
        const allTextElements = document.querySelectorAll('h1, h2, p, a');
        allTextElements.forEach(element => {
            const currentColor = element.style.color;
            
            // Проверяем, есть ли цветной эффект от других скриптов (scew-link.js)
            const isColorEffect = currentColor && currentColor.includes('var(--color-') && 
                !currentColor.includes('var(--color-white)') && 
                !currentColor.includes('var(--color-black)');
            
            // Если нет цветного эффекта, устанавливаем контрастный цвет
            if (!isColorEffect) {
                element.style.color = textColor;
            }
        });
        
        // Обрабатываем SVG элементы отдельно
        const svgElements = document.querySelectorAll('.svg, svg');
        svgElements.forEach(element => {
            // Для SVG используем filter: invert() в зависимости от фона
            if (lum > 0.5) {
                element.style.filter = 'invert(1)'; // Инвертируем на светлом фоне
            } else {
                element.style.filter = 'invert(0)'; // Не инвертируем на темном фоне
            }
        });
        
        // CSS с !important должен обеспечить стабильность cursor
        
        console.log(`Установлен цвет текста: ${textColor} (яркость фона: ${lum.toFixed(2)})`);
    }
    
    // Устанавливаем цвет при загрузке
    setTextColor();
    
    // Наблюдаем за изменениями стиля body (когда background.js меняет фон)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // Проверяем, что изменился именно backgroundColor, а не cursor
                const target = mutation.target;
                if (target === document.body) {
                    const oldValue = mutation.oldValue || '';
                    const newValue = target.getAttribute('style') || '';
                    
                    // Запускаем setTextColor только если изменился background-color
                    if (oldValue.includes('background-color') !== newValue.includes('background-color') ||
                        (oldValue.match(/background-color:\s*[^;]+/) || [''])[0] !== 
                        (newValue.match(/background-color:\s*[^;]+/) || [''])[0]) {
                        setTimeout(setTextColor, 10);
                    }
                }
            }
        });
    });
    
    // Начинаем наблюдение за изменениями атрибута style у body
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true
    });
    
    // Наблюдаем за добавлением новых элементов в DOM (для динамических элементов)
    const domObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Проверяем, добавились ли новые текстовые элементы
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches && node.matches('h1, h2, p, a')) {
                            setTimeout(setTextColor, 50); // Небольшая задержка для применения стилей
                        }
                    }
                });
            }
        });
    });
    
    // Начинаем наблюдение за изменениями в DOM
    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Дополнительная проверка каждые 20000ms для надежности
    setInterval(setTextColor, 20000);
    
    console.log('Динамический цвет текста активирован');
    // ===== КОНЕЦ БЛОКА: ДИНАМИЧЕСКИЙ ЦВЕТ ТЕКСТА =====
});
