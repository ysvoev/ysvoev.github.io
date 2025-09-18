// Скрипт для эффекта искажения ссылок при наведении
document.addEventListener('DOMContentLoaded', function() {
    const colors = [
        'var(--color-green)',
        'var(--color-yellow)', 
        'var(--color-blue)',
        'var(--color-violet)',
        'var(--color-pink)',
        'var(--color-red)',
        'var(--color-orange)'
    ];
    
    // Функция для инициализации эффектов ссылок
    function initLinkEffects() {
        const links = document.querySelectorAll('a');
        
        links.forEach(link => {
            // Обрабатываем ссылки .pages особым образом
            if (link.classList.contains('pages')) {
                // Удаляем старые обработчики
                link.removeEventListener('mouseenter', link._mouseenterHandler);
                link.removeEventListener('mouseleave', link._mouseleaveHandler);
                
                link._mouseenterHandler = function() {
                    // Применяем эффект scew-link к параграфам при наведении на блок
                    const paragraphs = this.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        const scaleY = (Math.random() * 3 + 1).toFixed(2);
                        const skewX = (Math.random() * 40 - 20).toFixed(0);
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        
                        p.style.setProperty('transform', `scaleY(${scaleY}) skewX(${skewX}deg)`, 'important');
                        p.style.setProperty('color', randomColor, 'important');
                        p.style.setProperty('transition', 'transform 0.2s ease, color 0.2s ease', 'important');
                        p.style.setProperty('display', 'inline-block', 'important');
                        p.style.setProperty('transform-origin', 'center', 'important');
                    });
                };
                
                link._mouseleaveHandler = function() {
                    // Плавно убираем эффект с параграфов
                    const paragraphs = this.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        // Восстанавливаем правильный цвет текста
                        const bg = getComputedStyle(document.body).backgroundColor;
                        const [r, g, b] = bg.match(/\d+/g).map(Number);
                        const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
                        const textColor = lum > 0.5 ? "var(--color-black)" : "var(--color-white)";
                        
                        // Устанавливаем плавный переход для восстановления
                        p.style.setProperty('transition', 'transform var(--animation-duration) var(--animation-cubic), color var(--animation-duration) var(--animation-cubic)', 'important');
                        p.style.color = textColor;
                        p.style.setProperty('transform', 'scaleY(1) skewX(0deg)', 'important');
                        
                        // Через время анимации убираем все стили
                        setTimeout(() => {
                            p.style.removeProperty('transform');
                            p.style.removeProperty('transition');
                            p.style.removeProperty('display');
                            p.style.removeProperty('transform-origin');
                        }, 400); // Длительность анимации из CSS переменной
                    });
                };
                
                link.addEventListener('mouseenter', link._mouseenterHandler);
                link.addEventListener('mouseleave', link._mouseleaveHandler);
                return;
            }
            
            // Удаляем старые обработчики, если они есть
            link.removeEventListener('mouseenter', link._mouseenterHandler);
            link.removeEventListener('mouseleave', link._mouseleaveHandler);
            
            // Создаем новые обработчики
            link._mouseenterHandler = function() {
                // Сохраняем исходное состояние ДО первого наведения (только один раз)
                if (!this.hasAttribute('data-original-saved')) {
                    const spans = this.querySelectorAll('span[style*="transform"]');
                    spans.forEach((span, index) => {
                        // Сохраняем трансформацию от scew.js
                        span.setAttribute('data-scew-original', span.style.transform || '');
                    });
                    this.setAttribute('data-original-saved', 'true');
                }
                
                // Генерируем случайные значения трансформации
                const scaleY = (Math.random() * 3 + 1).toFixed(2);
                const skewX = (Math.random() * 40 - 20).toFixed(0);
                
                // Выбираем случайный цвет
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Применяем цвет и переход
                this.style.setProperty('color', randomColor, 'important');
                this.style.setProperty('transition', 'transform var(--animation-duration) var(--animation-cubic), color var(--animation-duration) var(--animation-cubic)', 'important');
                
                // Применяем новую трансформацию к сохраненному исходному состоянию
                const spans = this.querySelectorAll('span[data-scew-original]');
                if (spans.length > 0) {
                    // Для ссылок со span элементами - применяем только к самой ссылке
                    this.style.setProperty('transform', `scaleY(${scaleY}) skewX(${skewX}deg)`, 'important');
                    this.style.setProperty('display', 'inline-block', 'important');
                } else {
                    // Для обычных ссылок
                    this.style.setProperty('display', 'inline-block', 'important');
                    this.style.setProperty('transform', `scaleY(${scaleY}) skewX(${skewX}deg)`, 'important');
                }
                
                this.style.setProperty('transform-origin', 'center', 'important');
                
                // Добавляем класс для отладки
                this.classList.add('scew-active');
            };
            
            link._mouseleaveHandler = function() {
                // НЕ возвращаем исходные трансформации - оставляем текущие
                // Восстанавливаем правильный цвет текста
                const bg = getComputedStyle(document.body).backgroundColor;
                const [r, g, b] = bg.match(/\d+/g).map(Number);
                const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
                const textColor = lum > 0.5 ? "var(--color-black)" : "var(--color-white)";
                this.style.color = textColor;
                
                this.style.removeProperty('transition');
                
                // Убираем класс отладки
                this.classList.remove('scew-active');
                
                // Трансформация остается! Это создает эффект накопления
            };
            
            // Добавляем обработчики
            link.addEventListener('mouseenter', link._mouseenterHandler);
            link.addEventListener('mouseleave', link._mouseleaveHandler);
        });
    }
    
    // Инициализируем эффекты после загрузки
    initLinkEffects();
    
    // Переинициализируем эффекты после завершения работы scew.js
    document.addEventListener('scewProcessingComplete', function() {
        initLinkEffects();
    });
});

