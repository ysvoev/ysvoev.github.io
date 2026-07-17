// Скрипт для рисования зеркального следа от курсора
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация скрипта зеркального рисования');
    
    // Создаем SVG элемент для рисования
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100vw';
    svg.style.height = '100vh';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '-10';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'var(--color-white)');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('fill', 'none');
    path.setAttribute('d', '');
    
    svg.appendChild(path);
    document.body.appendChild(svg);
    
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
    
    updateSVGHeight();
    
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let pathPoints = [];
    let maxLineLength = 3333;
    let isFirstPoint = true;
    
    function updateWindowSize() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        svg.style.width = windowWidth + 'px';
        updateSVGHeight();
    }
    
    window.addEventListener('resize', updateWindowSize);
    
    const resizeObserver = new ResizeObserver(() => {
        updateSVGHeight();
    });
    resizeObserver.observe(document.body);
    
    function addPointToPath(mouseX, mouseY) {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const mirrorX = windowWidth - mouseX;
        const mirrorY = windowHeight - mouseY;
        const finalMirrorX = mirrorX;
        const finalMirrorY = mirrorY + scrollY;
        const newPoint = { x: finalMirrorX, y: finalMirrorY };
        
        if (pathPoints.length > 0) {
            const lastPoint = pathPoints[pathPoints.length - 1];
            const distance = Math.sqrt(Math.pow(finalMirrorX - lastPoint.x, 2) + Math.pow(finalMirrorY - lastPoint.y, 2));
            if (distance < 2) return;
        }
        
        pathPoints.push(newPoint);
        trimLineToMaxLength();
        updatePath();
    }
    
    function trimLineToMaxLength() {
        if (pathPoints.length < 2) return;
        let totalLength = 0;
        let keepPoints = [];
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
                if (totalLength > maxLineLength) break;
            }
        }
        pathPoints = keepPoints;
    }
    
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
    
    function clearPath() {
        pathPoints = [];
        isFirstPoint = true;
        path.setAttribute('d', '');
    }
    
    let updateTextPosition = null;
    
    document.addEventListener('mousemove', function(e) {
        addPointToPath(e.clientX, e.clientY);
        if (updateTextPosition) {
            updateTextPosition(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('click', function() {
        clearPath();
    });
    
    console.log('Скрипт зеркального рисования активирован');
    console.log('Клик для очистки, движение мыши для рисования');
    
    // ===== СОЗДАЕМ КОНТЕЙНЕР ДЛЯ ССЫЛКИ ВНЕ BODY =====
    // Создаем отдельный контейнер поверх всего
    const overlayContainer = document.createElement('div');
    overlayContainer.style.position = 'fixed';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.pointerEvents = 'none'; // Пропускаем клики через контейнер
    overlayContainer.style.zIndex = '1000';
    overlayContainer.style.isolation = 'isolate'; // Изолируем от прозрачности body
    
    // Создаем ссылку внутри контейнера
    const workText = document.createElement('a');
    workText.href = 'notes/form';
    workText.style.pointerEvents = 'auto'; // Ссылка кликабельна
    workText.style.position = 'fixed';
    workText.style.zIndex = '1001';
    workText.style.fontSize = 'var(--font-size)';
    workText.style.fontFamily = '"Arial", sans-serif';
    workText.style.textDecoration = 'none';
    workText.style.textTransform = 'lowercase';
    workText.style.display = 'inline-block';
    workText.style.transition = 'transform 0.2s ease, color 0.2s ease';
    
    // Применяем эффект из scew.js к тексту
    const originalText = '{найду форму творческой единице}';
    const words = originalText.split(/\s+/).filter(word => word.length > 0);
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
    
    workText.innerHTML = textHTML;
    
    // Добавляем ссылку в контейнер
    overlayContainer.appendChild(workText);
    
    // Добавляем контейнер в DOM (НЕ в body!)
    document.documentElement.appendChild(overlayContainer);
    
    // Массив цветов
    const colors = [
        'var(--color-green)',
        'var(--color-yellow)', 
        'var(--color-blue)',
        'var(--color-violet)',
        'var(--color-pink)',
        'var(--color-red)',
        'var(--color-orange)'
    ];
    
    // ===== ЗАТУХАНИЕ BODY =====
    const animationDuration = 400;
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
    
    // Эффекты при наведении на ссылку
    workText.addEventListener('mouseenter', function() {
        const scaleY = (Math.random() * 3 + 3).toFixed(2);
        const skewX = (Math.random() * 40 - 20).toFixed(0);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        this.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
        this.style.color = randomColor;
        
        // Затемняем только body, ссылка остается видимой
        setBodyOpacity(0, true);
    });
    
    workText.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.color = '';
        
        // Возвращаем прозрачность body
        setBodyOpacity(1, true);
    });
    
    // Получаем размеры текста
    let textWidth, textHeight;
    setTimeout(() => {
        const textRect = workText.getBoundingClientRect();
        textWidth = textRect.width;
        textHeight = textRect.height;
    }, 0);
    
    function updateWorkTextPosition(mouseX, mouseY) {
        const mirrorX = windowWidth - mouseX;
        const mirrorY = windowHeight - mouseY;
        
        if (textWidth && textHeight) {
            workText.style.left = (mirrorX - textWidth / 2) + 'px';
            workText.style.top = (mirrorY - textHeight - 4) + 'px';
        } else {
            workText.style.left = mirrorX + 'px';
            workText.style.top = mirrorY + 'px';
        }
    }
    
    const isMobileOrTablet = window.innerWidth <= 1024;
    
    if (isMobileOrTablet) {
        let dvdX = Math.random() * (windowWidth - 150);
        let dvdY = Math.random() * (windowHeight - 50);
        let dvdSpeedX = 1.4;
        let dvdSpeedY = 1.4;
        
        workText.style.position = 'fixed';
        workText.style.fontSize = 'calc(var(--font-size) * 2)';
        workText.style.lineHeight = 'calc(var(--line-height) * 2)';
        
        function animateDVD() {
            if (!textWidth || !textHeight) {
                setTimeout(animateDVD, 16);
                return;
            }
            
            dvdX += dvdSpeedX;
            dvdY += dvdSpeedY;
            
            if (dvdX <= 0 || dvdX >= windowWidth - textWidth) {
                dvdSpeedX = -dvdSpeedX;
                dvdX = Math.max(0, Math.min(dvdX, windowWidth - textWidth));
                const scaleY = (Math.random() * 3 + 3).toFixed(2);
                const skewX = (Math.random() * 40 - 20).toFixed(0);
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                workText.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
                workText.style.color = randomColor;
            }
            
            if (dvdY <= 0 || dvdY >= windowHeight - textHeight) {
                dvdSpeedY = -dvdSpeedY;
                dvdY = Math.max(0, Math.min(dvdY, windowHeight - textHeight));
                const scaleY = (Math.random() * 3 + 3).toFixed(2);
                const skewX = (Math.random() * 40 - 20).toFixed(0);
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                workText.style.transform = `scaleY(${scaleY}) skewX(${skewX}deg)`;
                workText.style.color = randomColor;
            }
            
            workText.style.left = dvdX + 'px';
            workText.style.top = dvdY + 'px';
            requestAnimationFrame(animateDVD);
        }
        
        setTimeout(animateDVD, 100);
        
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                windowWidth = window.innerWidth;
                windowHeight = window.innerHeight;
            }, 100);
        });
    } else {
        updateTextPosition = updateWorkTextPosition;
        updateWorkTextPosition(windowWidth / 2, windowHeight / 2);
    }
});