// Скрипт для зеркального текста от курсора
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация скрипта зеркального текста');
    
    // Переменные для хранения размеров окна
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    
    // Обновляем размеры при изменении окна
    function updateWindowSize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
    }
    
    window.addEventListener('resize', updateWindowSize);
    
    // Единый обработчик движения мыши для всех функций
    let updateTextPosition = null; // Будет установлен позже для десктопа
    
    document.addEventListener('mousemove', function(e) {
        // Обновляем позицию текста если это десктоп
        if (updateTextPosition) {
            updateTextPosition(e.clientX, e.clientY);
        }
    });
    
    // ===== ВРЕМЕННЫЙ БЛОК: Текст "ищу работу" в начале зеркальной линии =====
    // Этот блок можно удалить в любой момент
    
    // СОЗДАЕМ КОНТЕЙНЕР ВНЕ BODY ДЛЯ ССЫЛКИ
    const overlayContainer = document.createElement('div');
    overlayContainer.style.position = 'fixed';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.pointerEvents = 'none'; // Пропускаем клики
    overlayContainer.style.zIndex = '110';
    overlayContainer.style.isolation = 'isolate'; // Изолируем от прозрачности body
    
    // Создаем текстовый элемент внутри контейнера
    const workText = document.createElement('a');
    workText.href = 'https://t.me/ysvoev';
    workText.style.pointerEvents = 'auto'; // Ссылка кликабельна
    workText.style.position = 'fixed';
    workText.style.zIndex = '111';
    workText.style.fontSize = 'var(--font-size)';
    workText.style.fontFamily = '"Arial", sans-serif';
    workText.style.textDecoration = 'none';
    workText.style.textTransform = 'lowercase';
    workText.style.display = 'inline-block';
    workText.style.transition = 'transform 0.2s ease, color 0.2s ease';
    
    // Применяем эффект из scew.js к тексту
    const originalText = '{снять фильм или клип}';
    const words = originalText.split(/\s+/).filter(word => word.length > 0);
    const wordsToDistort = Math.max(1, Math.floor(words.length * 0.3)); // 30% как в about блоке
    
    // Случайно выбираем слова для искажения
    const selectedIndices = [];
    for (let i = 0; i < wordsToDistort; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * words.length);
        } while (selectedIndices.includes(randomIndex));
        selectedIndices.push(randomIndex);
    }
    
    // Создаем HTML с искаженными словами
    let textHTML = '';
    words.forEach((word, index) => {
        if (selectedIndices.includes(index)) {
            // Генерируем случайные значения как в scew.js
            const scaleY = (Math.random() * 1 + 1).toFixed(2);
            const skewX = (Math.random() * 40 - 20).toFixed(0);
            
            textHTML += `<span style="transform: scaleY(${scaleY}) skewX(${skewX}deg); display: inline-block;">${word}</span>`;
        } else {
            textHTML += word;
        }
        
        // Добавляем пробел, если это не последнее слово
        if (index < words.length - 1) {
            textHTML += ' ';
        }
    });
    
    workText.innerHTML = textHTML;
    
    // Добавляем ссылку в контейнер
    overlayContainer.appendChild(workText);
    
    // Добавляем контейнер в корневой элемент (НЕ в body!)
    document.documentElement.appendChild(overlayContainer);
    
    // Массив цветов как в scew-link.js
    const colors = [
        'var(--color-green)',
        'var(--color-yellow)', 
        'var(--color-blue)',
        'var(--color-violet)',
        'var(--color-pink)',
        'var(--color-red)',
        'var(--color-orange)'
    ];
    
    // ===== ЗАТУХАНИЕ BODY ПРИ НАВЕДЕНИИ =====
    const animationDuration = 400; // ms
    const animationCubic = 'cubic-bezier(0.8, 0, 0.2, 1)';
    let bodyFadeTimeout = null;
    
    function setBodyOpacity(opacity, animate = true) {
        if (animate) {
            document.body.style.transition = `opacity ${animationDuration}ms ${animationCubic}`;
        } else {
            document.body.style.transition = 'none';
        }
        document.body.style.opacity = opacity;
        
        if (animate) {
            clearTimeout(bodyFadeTimeout);
            bodyFadeTimeout = setTimeout(() => {
                document.body.style.transition = '';
            }, animationDuration + 50);
        }
    }
    
    // Стили при наведении как в scew-link.js + затухание body
    workText.addEventListener('mouseenter', function() {
        // Генерируем случайные значения трансформации
        const scaleY = (Math.random() * 3 + 3).toFixed(2);
        const skewX = (Math.random() * 40 - 20).toFixed(0);
        
        // Выбираем случайный цвет
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Применяем эффект к ссылке
        this.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
        this.style.color = randomColor;
        
        // Затемняем body (ссылка остается видимой, т.к. она вне body)
        setBodyOpacity(0, true);
    });
    
    workText.addEventListener('mouseleave', function() {
        // Убираем эффект со ссылки
        this.style.transform = '';
        this.style.color = ''; // Сбрасываем цвет, чтобы font.js установил динамический
        
        // Возвращаем прозрачность body
        setBodyOpacity(1, true);
    });
    
    // Получаем размеры текста один раз после добавления в DOM
    let textWidth, textHeight;
    setTimeout(() => {
        const textRect = workText.getBoundingClientRect();
        textWidth = textRect.width;
        textHeight = textRect.height;
    }, 0);
    
    // Функция для обновления позиции текста
    function updateWorkTextPosition(mouseX, mouseY) {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const mirrorX = windowWidth - mouseX;
        const mirrorY = windowHeight - mouseY;
        
        // Используем заранее вычисленные размеры для стабильности
        if (textWidth && textHeight) {
            // Позиционируем текст: центр по X, выше точки на 4px по Y
            // Для fixed позиционирования не добавляем scrollY
            workText.style.left = (mirrorX - textWidth / 2) + 'px';
            workText.style.top = (mirrorY - textHeight - 4) + 'px';
        } else {
            // Fallback на случай если размеры еще не получены
            workText.style.left = mirrorX + 'px';
            workText.style.top = mirrorY + 'px';
        }
    }
    
    // Проверяем устройство (планшет/мобильный)
    const isMobileOrTablet = window.innerWidth <= 1024;
    
    if (isMobileOrTablet) {
        // ===== DVD ЗАСТАВКА ДЛЯ МОБИЛЬНЫХ/ПЛАНШЕТОВ =====
        
        // Переменные для DVD анимации
        let dvdX = Math.random() * (windowWidth - 150); // Случайная начальная позиция X
        let dvdY = Math.random() * (windowHeight - 50); // Случайная начальная позиция Y
        let dvdSpeedX = 1.4; // Скорость по X (медленно)
        let dvdSpeedY = 1.4; // Скорость по Y (медленно)
        
        // Устанавливаем фиксированное позиционирование для DVD режима
        workText.style.position = 'fixed';
        
        // Увеличиваем шрифт в 2 раза для мобильной версии
        workText.style.fontSize = 'calc(var(--font-size) * 2)';
        workText.style.lineHeight = 'calc(var(--line-height) * 2)';
        
        // Функция DVD анимации
        function animateDVD() {
            // Получаем актуальные размеры текста
            if (!textWidth || !textHeight) {
                setTimeout(animateDVD, 16);
                return;
            }
            
            // Обновляем позицию
            dvdX += dvdSpeedX;
            dvdY += dvdSpeedY;
            
            // Проверяем столкновения со стенками и отскакиваем
            if (dvdX <= 0 || dvdX >= windowWidth - textWidth) {
                dvdSpeedX = -dvdSpeedX;
                dvdX = Math.max(0, Math.min(dvdX, windowWidth - textWidth));
                
                // Применяем полные эффекты из scew-link.js при касании стенки
                const scaleY = (Math.random() * 3 + 3).toFixed(2); // Как в текущей версии
                const skewX = (Math.random() * 40 - 20).toFixed(0);
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                workText.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
                workText.style.color = randomColor;
                workText.style.transition = 'transform 0.2s ease, color 0.2s ease';
            }
            
            if (dvdY <= 0 || dvdY >= windowHeight - textHeight) {
                dvdSpeedY = -dvdSpeedY;
                dvdY = Math.max(0, Math.min(dvdY, windowHeight - textHeight));
                
                // Применяем полные эффекты из scew-link.js при касании стенки
                const scaleY = (Math.random() * 3 + 3).toFixed(2); // Как в текущей версии
                const skewX = (Math.random() * 40 - 20).toFixed(0);
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                workText.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
                workText.style.color = randomColor;
                workText.style.transition = 'transform 0.2s ease, color 0.2s ease';
            }
            
            // Применяем позицию
            workText.style.left = dvdX + 'px';
            workText.style.top = dvdY + 'px';
            
            // Продолжаем анимацию
            requestAnimationFrame(animateDVD);
        }
        
        // Запускаем DVD анимацию
        setTimeout(animateDVD, 100);
        
        // Обновляем размеры при изменении ориентации
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                windowWidth = window.innerWidth;
                windowHeight = window.innerHeight;
            }, 100);
        });
        
    } else {
        // ===== ДЕСКТОП ВЕРСИЯ (КАК БЫЛО) =====
        
        // Устанавливаем функцию обновления позиции для единого обработчика
        updateTextPosition = updateWorkTextPosition;
        
        // Инициализируем позицию в центре
        updateWorkTextPosition(windowWidth / 2, windowHeight / 2);
    }
    
    // ===== КОНЕЦ ВРЕМЕННОГО БЛОКА =====
});