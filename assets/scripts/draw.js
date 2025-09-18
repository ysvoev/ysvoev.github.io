// Скрипт для рисования зеркального следа от курсора
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация скрипта зеркального рисования');
    
    // Создаем SVG элемент для рисования
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100vw';
    svg.style.height = '100vh'; // Временная высота, будет обновлена
    svg.style.pointerEvents = 'none';
    // Убираем любые манипуляции с cursor из JS
    svg.style.zIndex = '-10';
    
    // Создаем путь для рисования
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'var(--color-white)');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('fill', 'none');
    path.setAttribute('d', '');
    
    svg.appendChild(path);
    
    // Добавляем SVG в body для полной видимости
    document.body.appendChild(svg);
    
    // Устанавливаем высоту SVG равной полной высоте документа
    function updateSVGHeight() {
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        svg.style.height = documentHeight + 'px';
    }
    
    // Устанавливаем высоту при загрузке
    updateSVGHeight();
    
    // Переменные для хранения размеров окна и пути
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let pathPoints = []; // Массив всех точек
    let maxLineLength = 3333; // Максимальная длина линии в пикселях
    let isFirstPoint = true;
    
    // Обновляем размеры при изменении окна
    function updateWindowSize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        svg.style.width = windowWidth + 'px';
        updateSVGHeight(); // Обновляем высоту SVG
    }
    
    window.addEventListener('resize', updateWindowSize);
    
    // Также обновляем высоту при изменении контента
    const resizeObserver = new ResizeObserver(() => {
        updateSVGHeight();
    });
    resizeObserver.observe(document.body);
    
    // Функция для добавления точки к пути
    function addPointToPath(mouseX, mouseY) {
        // Учитываем скролл страницы
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Вычисляем зеркальную точку относительно видимой области (viewport)
        const mirrorX = windowWidth - mouseX;
        const mirrorY = windowHeight - mouseY;
        
        // Добавляем скролл к Y-координате для рисования на странице
        const finalMirrorX = mirrorX;
        const finalMirrorY = mirrorY + scrollY;
        
        // Добавляем новую точку с учетом скролла
        const newPoint = { x: finalMirrorX, y: finalMirrorY };
        
        // Проверяем расстояние от последней точки (оптимизация)
        if (pathPoints.length > 0) {
            const lastPoint = pathPoints[pathPoints.length - 1];
            const distance = Math.sqrt(Math.pow(finalMirrorX - lastPoint.x, 2) + Math.pow(finalMirrorY - lastPoint.y, 2));
            if (distance < 2) return; // Игнорируем слишком близкие точки
        }
        
        pathPoints.push(newPoint);
        
        // Обрезаем линию до максимальной длины
        trimLineToMaxLength();
        
        // Обновляем путь
        updatePath();
    }
    
    // Функция для обрезания линии до максимальной длины
    function trimLineToMaxLength() {
        if (pathPoints.length < 2) return;
        
        let totalLength = 0;
        let keepPoints = [];
        
        // Идем с конца, чтобы сохранить самые новые точки
        for (let i = pathPoints.length - 1; i >= 0; i--) {
            keepPoints.unshift(pathPoints[i]);
            
            if (i > 0) {
                const current = pathPoints[i];
                const previous = pathPoints[i - 1];
                const segmentLength = Math.sqrt(
                    Math.pow(current.x - previous.x, 2) + 
                    Math.pow(current.y - previous.y, 2)
                );
                totalLength += segmentLength;
                
                if (totalLength > maxLineLength) {
                    break;
                }
            }
        }
        
        pathPoints = keepPoints;
    }
    
    // Функция для обновления SVG пути
    function updatePath() {
        if (pathPoints.length === 0) {
            path.setAttribute('d', '');
            return;
        }
        
        let pathData = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
        for (let i = 1; i < pathPoints.length; i++) {
            pathData += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
        }
        
        path.setAttribute('d', pathData);
    }
    
    // Функция для очистки пути
    function clearPath() {
        pathPoints = [];
        isFirstPoint = true;
        path.setAttribute('d', '');
    }
    
    // Единый обработчик движения мыши для всех функций
    let updateTextPosition = null; // Будет установлен позже для десктопа
    
    document.addEventListener('mousemove', function(e) {
        // Рисуем путь
        addPointToPath(e.clientX, e.clientY);
        
        // Обновляем позицию текста если это десктоп
        if (updateTextPosition) {
            updateTextPosition(e.clientX, e.clientY);
        }
    });
    
    // Очищаем путь при клике
    document.addEventListener('click', function() {
        clearPath();
    });
    
    // Убрал автоочистку при уходе курсора - линия остается
    
    console.log('Скрипт зеркального рисования активирован');
    console.log('Клик для очистки, движение мыши для рисования');
    console.log('Курсор управляется исключительно через CSS переменные');
    
    // ===== ВРЕМЕННЫЙ БЛОК: Текст "ищу работу" в начале зеркальной линии =====
    // Этот блок можно удалить в любой момент
    
    // Создаем текстовый элемент
    const workText = document.createElement('a');
    workText.href = 'cv';
    
    // Применяем эффект из scew.js к тексту
    const originalText = '{ищу дизайн-команду или проект}';
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
    workText.style.position = 'fixed';
    workText.style.pointerEvents = 'auto';
    workText.style.zIndex = '110';
    workText.style.fontSize = 'var(--font-size)';
    workText.style.fontFamily = '"Arial", sans-serif';
    // Цвет будет установлен динамически через font.js
    workText.style.textDecoration = 'none';
    workText.style.textTransform = 'lowercase';
    workText.style.transition = 'color 0.2s ease';
    // Курсор pointer будет установлен через CSS
    workText.style.display = 'inline-block';
    // mix-blend-mode будет применен через CSS или другие скрипты
    
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
    
    // Стили при наведении как в scew-link.js
    workText.addEventListener('mouseenter', function() {
        // Генерируем случайные значения трансформации
        const scaleY = (Math.random() * 3 + 3).toFixed(2);
        const skewX = (Math.random() * 40 - 20).toFixed(0);
        
        // Выбираем случайный цвет
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Применяем эффект
        this.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
        this.style.color = randomColor;
        this.style.transition = 'transform 0.2s ease, color 0.2s ease';
    });
    
    workText.addEventListener('mouseleave', function() {
        // Убираем эффект
        this.style.transform = '';
        this.style.color = ''; // Сбрасываем цвет, чтобы font.js установил динамический
        this.style.transition = 'transform 0.2s ease, color 0.2s ease';
    });
    
    document.body.appendChild(workText);
    
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
