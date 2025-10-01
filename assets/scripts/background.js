// Скрипт для изменения цвета фона в зависимости от времени (МСК +3)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Запускаем скрипт динамического фона');
    
    // Фиксированные фоны для отдельных страниц
    const pathname = (window.location && window.location.pathname || '').toLowerCase();
    const is404Page = pathname.includes('404');
    const isFilmPage = pathname.includes('/film');

    if (is404Page) {
        // Для 404 — всегда синий из переменной
        document.body.style.setProperty('background-color', 'var(--color-blue)');
        console.log('Фон зафиксирован для 404: var(--color-blue)');
        return; // Отключаем динамику времени
    }

    if (isFilmPage) {
        // Для фильм — всегда чёрный из переменной
        document.body.style.setProperty('background-color', 'var(--color-black)');
        console.log('Фон зафиксирован для film: var(--color-black)');
        return; // Отключаем динамику времени
    }

    // Таблица (усреднённо по месяцам для Москвы, локальное МСК время)
    // Формат: минуты от полуночи для восхода (sr) и заката (ss)
    const SUN_TABLE = [
        // Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
        { sr: 9 * 60 + 0,  ss: 16 * 60 + 0  },  // Январь: ~09:00–16:00
        { sr: 8 * 60 + 30, ss: 17 * 60 + 30 },  // Февраль: ~08:30–17:30
        { sr: 7 * 60 + 0,  ss: 18 * 60 + 30 },  // Март: ~07:00–18:30
        { sr: 5 * 60 + 45, ss: 19 * 60 + 45 },  // Апрель: ~05:45–19:45
        { sr: 4 * 60 + 30, ss: 20 * 60 + 45 },  // Май: ~04:30–20:45
        { sr: 3 * 60 + 45, ss: 21 * 60 + 15 },  // Июнь: ~03:45–21:15
        { sr: 4 * 60 + 30, ss: 21 * 60 + 0  },  // Июль: ~04:30–21:00
        { sr: 5 * 60 + 30, ss: 20 * 60 + 0  },  // Август: ~05:30–20:00
        { sr: 6 * 60 + 30, ss: 19 * 60 + 0  },  // Сентябрь: ~06:30–19:00
        { sr: 7 * 60 + 30, ss: 18 * 60 + 0  },  // Октябрь: ~07:30–18:00
        { sr: 8 * 60 + 30, ss: 16 * 60 + 30 },  // Ноябрь: ~08:30–16:30
        { sr: 9 * 60 + 0,  ss: 16 * 60 + 0  }   // Декабрь: ~09:00–16:00
    ];

    function getMoscowDate() {
        // Приводим текущее локальное время к МСК (+3) независимо от таймзоны пользователя
        const nowLocal = new Date();
        const nowUtcMs = nowLocal.getTime() + nowLocal.getTimezoneOffset() * 60000;
        const moscowMs = nowUtcMs + 3 * 60 * 60 * 1000;
        return new Date(moscowMs);
    }

    function getSunTimesForToday() {
        const msk = getMoscowDate();
        const month = msk.getMonth(); // 0-11
        const { sr, ss } = SUN_TABLE[month];
        return { sunriseMin: sr, sunsetMin: ss };
    }

    function getMinutesSinceMidnight(dateObj) {
        return dateObj.getHours() * 60 + dateObj.getMinutes();
    }

    function parseCssHexToRgb(hex) {
        if (!hex) return { r: 0, g: 0, b: 0 };
        const value = hex.toString().trim();
        const normalized = value.startsWith('#') ? value.slice(1) : value;
        const full = normalized.length === 3
            ? normalized.split('').map(ch => ch + ch).join('')
            : normalized;
        const r = parseInt(full.slice(0, 2), 16);
        const g = parseInt(full.slice(2, 4), 16);
        const b = parseInt(full.slice(4, 6), 16);
        return { r, g, b };
    }

    function rgbToHex({ r, g, b }) {
        const rr = Math.max(0, Math.min(255, r)).toString(16).padStart(2, '0');
        const gg = Math.max(0, Math.min(255, g)).toString(16).padStart(2, '0');
        const bb = Math.max(0, Math.min(255, b)).toString(16).padStart(2, '0');
        return `#${rr}${gg}${bb}`;
    }

    function mixRgb(a, b, t) {
        const k = Math.max(0, Math.min(1, t));
        return {
            r: Math.round(a.r + (b.r - a.r) * k),
            g: Math.round(a.g + (b.g - a.g) * k),
            b: Math.round(a.b + (b.b - a.b) * k)
        };
    }

    function readThemeColors() {
        const styles = window.getComputedStyle(document.documentElement);
        const blackVar = styles.getPropertyValue('--color-black').trim();
        const whiteVar = styles.getPropertyValue('--color-white').trim();
        const black = parseCssHexToRgb(blackVar);
        const white = parseCssHexToRgb(whiteVar);
        return { black, white, blackVar, whiteVar };
    }
    
    function updateBackground() {
        // Цвета из CSS-переменных
        const { black, white, blackVar, whiteVar } = readThemeColors();

        // Время МСК и минуты от полуночи
        const mskNow = getMoscowDate();
        const nowMin = getMinutesSinceMidnight(mskNow);
        const { sunriseMin, sunsetMin } = getSunTimesForToday();

        // Переходы по 60 минут
        const sunriseFadeEnd = Math.min(sunriseMin + 60, sunsetMin);
        const sunsetFadeStart = Math.max(sunriseMin, sunsetMin - 60);

        // Логи
        const hh = String(mskNow.getHours()).padStart(2, '0');
        const mm = String(mskNow.getMinutes()).padStart(2, '0');
        console.log(`МСК сейчас: ${hh}:${mm}. Восход: ${Math.floor(sunriseMin/60).toString().padStart(2,'0')}:${String(sunriseMin%60).padStart(2,'0')}, Закат: ${Math.floor(sunsetMin/60).toString().padStart(2,'0')}:${String(sunsetMin%60).padStart(2,'0')}`);

        let colorHex;

        if (nowMin < sunriseMin || nowMin >= sunsetMin) {
            // Ночь — полностью тёмный
            colorHex = blackVar || rgbToHex(black);
        } else if (nowMin <= sunriseFadeEnd) {
            // Рассвет — плавный переход 60 мин
            const progress = Math.max(0, Math.min(1, (nowMin - sunriseMin) / Math.max(1, sunriseFadeEnd - sunriseMin)));
            const mixed = mixRgb(black, white, progress);
            colorHex = rgbToHex(mixed);
        } else if (nowMin < sunsetFadeStart) {
            // День — фиксированно светлый
            colorHex = whiteVar || rgbToHex(white);
        } else {
            // Закат — плавный переход 60 мин
            const progress = Math.max(0, Math.min(1, (sunsetMin - nowMin) / Math.max(1, sunsetMin - sunsetFadeStart)));
            const mixed = mixRgb(white, black, 1 - progress);
            colorHex = rgbToHex(mixed);
        }

        document.body.style.backgroundColor = colorHex;
        console.log(`Установлен цвет фона: ${colorHex}`);
    }
    
    // Обновляем фон сразу при загрузке
    updateBackground();
    
    // Обновляем фон каждую минуту
    setInterval(updateBackground, 60000);
    
    console.log('Скрипт динамического фона активирован');
});
