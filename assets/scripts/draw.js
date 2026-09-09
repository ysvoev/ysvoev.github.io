// ===== Рисование с адаптивными координатами (в процентах) =====
(function() {
    'use strict';

    // ----- Настройки -----
    const COLOR_VAR = 'var(--color-white)';
    const LINE_WIDTH = 1;
    const MAX_LINE_LENGTH = 3333;          // в пикселях
    const STORAGE_KEY = 'drawing_data';
    const EXPIRATION_HOURS = 24;
    const DRAG_THRESHOLD = 5;              // пикселей

    // ----- Состояние -----
    let points = [];                       // массив {x: число%, y: число%}
    let isDrawing = false;
    let pathElement = null;
    let svgElement = null;

    let startX = 0, startY = 0;
    let wasDragging = false;
    let updateTimeout = null;

    // ----- Вспомогательные функции -----
    function getDocumentHeight() {
        return Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
    }

    // Преобразование процентов в абсолютные пиксели
    function toAbsX(percentX) {
        return percentX * window.innerWidth / 100;
    }
    function toAbsY(percentY) {
        return percentY * getDocumentHeight() / 100;
    }

    // ----- SVG -----
    function createSvg() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '999999';
        svg.style.width = '100vw';
        svg.style.height = '0px';
        svg.style.overflow = 'hidden';
        document.body.appendChild(svg);
        return svg;
    }

    function updateSvgSize(svg) {
        svg.style.height = '0px';
        svg.style.width = window.innerWidth + 'px';
        const height = getDocumentHeight();
        svg.style.height = height + 'px';
        svg.setAttribute('width', window.innerWidth);
        svg.setAttribute('height', height);
        if (points.length > 0) {
            updatePath();
        }
    }

    function createPath() {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke', COLOR_VAR);
        path.setAttribute('stroke-width', LINE_WIDTH);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        return path;
    }

    // Отрисовка пути с пересчётом процентов в пиксели
    function updatePath() {
        if (!pathElement) return;
        if (points.length === 0) {
            pathElement.setAttribute('d', '');
            return;
        }
        const w = window.innerWidth;
        const h = getDocumentHeight();
        let d = `M ${points[0].x * w / 100} ${points[0].y * h / 100}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x * w / 100} ${points[i].y * h / 100}`;
        }
        pathElement.setAttribute('d', d);
    }

    // Обрезка линии до MAX_LINE_LENGTH пикселей (считаем от конца)
    function trimLine() {
        if (points.length < 2) return;
        const w = window.innerWidth;
        const h = getDocumentHeight();
        let total = 0;
        let keep = [];
        for (let i = points.length - 1; i >= 0; i--) {
            keep.unshift(points[i]);
            if (i > 0) {
                const dx = (points[i].x - points[i-1].x) * w / 100;
                const dy = (points[i].y - points[i-1].y) * h / 100;
                total += Math.sqrt(dx*dx + dy*dy);
                if (total > MAX_LINE_LENGTH) {
                    keep.shift();
                    break;
                }
            }
        }
        points = keep;
    }

    // Добавление точки (координаты в пикселях, сохраняем в процентах)
    function addPoint(clientX, clientY) {
        const w = window.innerWidth;
        const h = getDocumentHeight();
        const absX = clientX;
        const absY = clientY + window.pageYOffset;
        if (absY > h) return;   // за пределами документа

        const xPercent = Math.min(100, Math.max(0, (absX / w) * 100));
        const yPercent = Math.min(100, Math.max(0, (absY / h) * 100));

        // Минимальное расстояние между точками (4 пикселя)
        if (points.length > 0) {
            const last = points[points.length - 1];
            const dx = (xPercent - last.x) * w / 100;
            const dy = (yPercent - last.y) * h / 100;
            if (dx*dx + dy*dy < 4) return;
        }

        points.push({ x: xPercent, y: yPercent });
        trimLine();
        updatePath();
        saveDrawing();
    }

    // ----- Очистка, сохранение, восстановление -----
    function clearDrawing() {
        points = [];
        updatePath();
        localStorage.removeItem(STORAGE_KEY);
    }

    function saveDrawing() {
        const data = {
            points: points,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function restoreDrawing() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            return false;
        }
        if (!data.points || !data.timestamp) return false;
        const age = Date.now() - data.timestamp;
        if (age > EXPIRATION_HOURS * 60 * 60 * 1000) {
            localStorage.removeItem(STORAGE_KEY);
            return false;
        }
        points = data.points;
        updatePath();
        return true;
    }

    // ----- Обработчики рисования -----
    function startDrawing(e) {
        const target = e.target;
        if (target && target.closest && target.closest('.filter a')) return;
        if (target && target.tagName === 'A') return;
        e.preventDefault();
        const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
        const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
        startX = clientX;
        startY = clientY;
        wasDragging = false;
        clearDrawing();
        isDrawing = true;
        addPoint(clientX, clientY);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
        const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
        const dx = clientX - startX;
        const dy = clientY - startY;
        if (dx*dx + dy*dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
            wasDragging = true;
        }
        addPoint(clientX, clientY);
    }

    function stopDrawing(e) {
        if (isDrawing) {
            const clientX = e?.clientX || 0;
            const clientY = e?.clientY || 0;
            const dx = clientX - startX;
            const dy = clientY - startY;
            if (dx*dx + dy*dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
                wasDragging = true;
            }
            isDrawing = false;
        }
    }

    function cancelClick(e) {
        if (wasDragging) {
            e.preventDefault();
            e.stopPropagation();
            wasDragging = false;
        }
    }

    // ----- Инициализация -----
    function init() {
        svgElement = createSvg();
        pathElement = createPath();
        svgElement.appendChild(pathElement);

        restoreDrawing();

        setTimeout(() => {
            updateSvgSize(svgElement);
        }, 100);

        window.addEventListener('resize', function() {
            updateSvgSize(svgElement);
        });

        const observer = new MutationObserver(function() {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(function() {
                updateSvgSize(svgElement);
            }, 300);
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: true
        });

        const portfolio = document.querySelector('.portfolio');
        if (portfolio) {
            const portfolioObserver = new MutationObserver(function() {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(function() {
                    updateSvgSize(svgElement);
                }, 300);
            });
            portfolioObserver.observe(portfolio, {
                attributes: true,
                attributeFilter: ['class'],
                childList: true,
                subtree: true
            });
        }

        document.addEventListener('click', function(e) {
            const filterLink = e.target.closest('.filter a');
            if (filterLink) {
                clearTimeout(updateTimeout);
                updateTimeout = setTimeout(function() {
                    updateSvgSize(svgElement);
                }, 350);
            }
        });

        document.addEventListener('mousedown', startDrawing);
        document.addEventListener('mousemove', draw);
        document.addEventListener('mouseup', stopDrawing);
        document.addEventListener('mouseleave', stopDrawing);

        document.addEventListener('touchstart', startDrawing, { passive: false });
        document.addEventListener('touchmove', draw, { passive: false });
        document.addEventListener('touchend', stopDrawing);
        document.addEventListener('touchcancel', stopDrawing);

        document.addEventListener('click', cancelClick, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();