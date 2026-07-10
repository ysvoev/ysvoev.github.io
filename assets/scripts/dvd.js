// Скрипт для DVD-режима с изменением текста
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация DVD режима');
    
    // ===== НАСТРОЙКИ =====
    const CONFIG = {
        speed: 0.4,        // Базовая скорость движения (можно менять)
        minSpeed: 0.5,     // Минимальная скорость
        maxSpeed: 1.0,     // Максимальная скорость
        effectDuration: 300, // Длительность эффектов в мс
        symbolChance: 0.7   // Вероятность добавления символа (0-1)
    };
    
    // Переменные для хранения размеров окна
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    
    // Массив случайных текстов
    const texts = [
        '{@ysvoev}',
        '{@ysvoevnow}',
        '{ysvoev.ru}',
        '{???}',
        '{эээ}',
        '{.!.}',
        '{попизделки}',
        '{режопер}',
        '{дизайнерский}',
        '{оперпост}',
        '{ づ￣ ³￣ )づ}',
        '{ っ´ω｀c}'
    ];
    
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
    
    // Массив символов для дополнительного эффекта
    const symbols = ['©', '!!11!', ':3', '??', '✴︎', '⊹', '⭠', '⭢'];
    
    // Функция для генерации случайного текста
    function getRandomText() {
        return texts[Math.floor(Math.random() * texts.length)];
    }
    
    // Функция для получения случайного символа
    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Функция для искажения текста (как в scew.js)
    function distortText(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordsToDistort = Math.max(1, Math.floor(words.length * 0.3));
        
        const selectedIndices = [];
        for (let i = 0; i < wordsToDistort; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * words.length);
            } while (selectedIndices.includes(randomIndex));
            selectedIndices.push(randomIndex);
        }
        
        let textHTML = '';
        words.forEach((word, index) => {
            if (selectedIndices.includes(index)) {
                const scaleY = (Math.random() * 1 + 1).toFixed(2);
                const skewX = (Math.random() * 40 - 20).toFixed(0);
                textHTML += `<span style="transform: scaleY(${scaleY}) skewX(${skewX}deg); display: inline-block;">${word}</span>`;
            } else {
                textHTML += word;
            }
            
            if (index < words.length - 1) {
                textHTML += ' ';
            }
        });
        
        return textHTML;
    }
    
    // Создаем основной текстовый элемент
    const dvdText = document.createElement('a');
    dvdText.href = 'https://ysvoev.ru';
    dvdText.innerHTML = distortText(getRandomText());
    dvdText.style.position = 'fixed';
    dvdText.style.pointerEvents = 'auto';
    dvdText.style.zIndex = '110';
    dvdText.style.fontSize = 'calc(var(--font-size) * 2)';
    dvdText.style.fontFamily = '"Arial", sans-serif';
    dvdText.style.textDecoration = 'none';
    dvdText.style.textTransform = 'lowercase';
    dvdText.style.transition = `transform ${CONFIG.effectDuration}ms ease, color ${CONFIG.effectDuration}ms ease`;
    dvdText.style.display = 'inline-block';
    
    // Устанавливаем начальный случайный цвет
    const initialColor = colors[Math.floor(Math.random() * colors.length)];
    dvdText.style.color = initialColor;
    
    // Сохраняем текущий цвет и трансформацию
    let currentColor = initialColor;
    let currentTransform = '';
    let isAnimating = false;
    
    // Добавляем эффект при наведении
    dvdText.addEventListener('mouseenter', function() {
        if (isAnimating) return;
        
        const scaleY = (Math.random() * 3 + 3).toFixed(2);
        const skewX = (Math.random() * 40 - 20).toFixed(0);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        currentTransform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
        currentColor = randomColor;
        
        this.style.transform = currentTransform;
        this.style.color = currentColor;
    });
    
    dvdText.addEventListener('mouseleave', function() {
        if (isAnimating) return;
        // Оставляем текущие эффекты, не сбрасываем
    });
    
    document.body.appendChild(dvdText);
    
    // Получаем размеры текста
    let textWidth, textHeight;
    setTimeout(() => {
        const textRect = dvdText.getBoundingClientRect();
        textWidth = textRect.width;
        textHeight = textRect.height;
    }, 50);
    
    // Функция для изменения текста с эффектами
    function changeTextWithEffects() {
        if (isAnimating) return;
        isAnimating = true;
        
        // Случайно меняем текст
        let newText = getRandomText();
        
        // Добавляем случайный символ с вероятностью
        if (Math.random() < CONFIG.symbolChance) {
            const symbol = getRandomSymbol();
            const position = Math.random() > 0.5 ? 'start' : 'end';
            
            if (position === 'start') {
                newText = symbol + ' ' + newText;
            } else {
                newText = newText + ' ' + symbol;
            }
        }
        
        // Применяем искажение и обновляем HTML
        dvdText.innerHTML = distortText(newText);
        
        // Генерируем случайные эффекты
        const scaleY = (Math.random() * 3 + 3).toFixed(2);
        const skewX = (Math.random() * 40 - 20).toFixed(0);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        currentTransform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
        currentColor = randomColor;
        
        // Применяем эффекты
        dvdText.style.transform = currentTransform;
        dvdText.style.color = currentColor;
        dvdText.style.transition = `transform ${CONFIG.effectDuration}ms ease, color ${CONFIG.effectDuration}ms ease`;
        
        // Обновляем размеры текста после изменения
        setTimeout(() => {
            const textRect = dvdText.getBoundingClientRect();
            textWidth = textRect.width;
            textHeight = textRect.height;
            
            // Корректируем позицию, чтобы текст не выходил за границы
            if (dvdX + textWidth > windowWidth) {
                dvdX = windowWidth - textWidth - 10;
            }
            if (dvdY + textHeight > windowHeight) {
                dvdY = windowHeight - textHeight - 10;
            }
            if (dvdX < 0) dvdX = 10;
            if (dvdY < 0) dvdY = 10;
        }, 50);
        
        // Снимаем блокировку анимации
        setTimeout(() => {
            isAnimating = false;
        }, CONFIG.effectDuration + 100);
    }
    
    // DVD анимация
    let dvdX = Math.random() * (windowWidth - 200);
    let dvdY = Math.random() * (windowHeight - 60);
    let dvdSpeedX = CONFIG.speed;
    let dvdSpeedY = CONFIG.speed;
    let lastHitTime = 0;
    const hitCooldown = 500; // Задержка между сменами текста в мс
    
    // Функция обновления размеров окна
    function updateWindowSize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        
        // Корректируем позицию если текст вышел за границы
        if (dvdX + textWidth > windowWidth) {
            dvdX = windowWidth - textWidth - 10;
        }
        if (dvdY + textHeight > windowHeight) {
            dvdY = windowHeight - textHeight - 10;
        }
        if (dvdX < 0) dvdX = 10;
        if (dvdY < 0) dvdY = 10;
    }
    
    window.addEventListener('resize', updateWindowSize);
    
    // Анимационный цикл
    function animateDVD() {
        // Получаем актуальные размеры текста
        if (!textWidth || !textHeight) {
            requestAnimationFrame(animateDVD);
            return;
        }
        
        // Обновляем позицию
        dvdX += dvdSpeedX;
        dvdY += dvdSpeedY;
        
        // Проверяем столкновения со стенками
        let hitWall = false;
        const currentTime = Date.now();
        
        if (dvdX <= 0 || dvdX >= windowWidth - textWidth) {
            dvdSpeedX = -dvdSpeedX;
            dvdX = Math.max(0, Math.min(dvdX, windowWidth - textWidth));
            hitWall = true;
        }
        
        if (dvdY <= 0 || dvdY >= windowHeight - textHeight) {
            dvdSpeedY = -dvdSpeedY;
            dvdY = Math.max(0, Math.min(dvdY, windowHeight - textHeight));
            hitWall = true;
        }
        
        // Если было столкновение и прошло достаточно времени, меняем текст
        if (hitWall && (currentTime - lastHitTime) > hitCooldown) {
            lastHitTime = currentTime;
            changeTextWithEffects();
        }
        
        // Применяем позицию
        dvdText.style.left = dvdX + 'px';
        dvdText.style.top = dvdY + 'px';
        
        // Продолжаем анимацию
        requestAnimationFrame(animateDVD);
    }
    
    // Запускаем DVD анимацию
    setTimeout(animateDVD, 100);
    
    // Обновляем размеры при изменении ориентации
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            updateWindowSize();
        }, 100);
    });
    
    // Функция для ручного обновления размеров текста
    function updateTextSize() {
        setTimeout(() => {
            const textRect = dvdText.getBoundingClientRect();
            textWidth = textRect.width;
            textHeight = textRect.height;
        }, 50);
    }
    
    window.addEventListener('resize', updateTextSize);
    
    // ===== ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ СКОРОСТЬЮ =====
    // Можно вызывать из консоли или других скриптов
    
    // Установка скорости
    window.setDVDSpeed = function(speed) {
        const newSpeed = Math.max(CONFIG.minSpeed, Math.min(CONFIG.maxSpeed, speed));
        const currentSpeed = Math.sqrt(dvdSpeedX * dvdSpeedX + dvdSpeedY * dvdSpeedY);
        const ratio = newSpeed / currentSpeed;
        
        dvdSpeedX *= ratio;
        dvdSpeedY *= ratio;
        
        CONFIG.speed = newSpeed;
        console.log(`Скорость DVD установлена на: ${newSpeed.toFixed(2)}`);
        return newSpeed;
    };
    
    // Получение текущей скорости
    window.getDVDSpeed = function() {
        return Math.sqrt(dvdSpeedX * dvdSpeedX + dvdSpeedY * dvdSpeedY);
    };
    
    // Увеличение скорости
    window.increaseDVDSpeed = function(amount = 0.2) {
        return window.setDVDSpeed(CONFIG.speed + amount);
    };
    
    // Уменьшение скорости
    window.decreaseDVDSpeed = function(amount = 0.2) {
        return window.setDVDSpeed(CONFIG.speed - amount);
    };
    
    console.log('DVD режим успешно запущен');
    console.log(`Текущая скорость: ${window.getDVDSpeed().toFixed(2)}`);
    console.log('Для изменения скорости используйте: setDVDSpeed(значение)');
    console.log('Пример: setDVDSpeed(2.5)');
});