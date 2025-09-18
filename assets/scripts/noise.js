// Скрипт для добавления единого шума-оверлея в конец <body>
// Добавляет один элемент с id "site-noise-overlay" и классом "noise"

document.addEventListener('DOMContentLoaded', function() {
    // Если уже добавлен — выходим
    if (document.getElementById('site-noise-overlay')) {
        return;
    }

    // Определяем путь к gif относительно файла скрипта
    // Ищем именно этот скрипт по src
    const scriptEl = document.currentScript || Array.from(document.scripts).find(s => s.src && s.src.includes('/assets/scripts/noise.js'));
    const scriptBase = scriptEl && scriptEl.src ? new URL('.', scriptEl.src).href : window.location.href;
    // noise.gif лежит в ../effects/noise.gif относительно каталога скрипта
    const noiseUrl = new URL('../effects/noise.gif', scriptBase).href;

    // Создаем оверлей
    const noiseDiv = document.createElement('div');
    noiseDiv.id = 'site-noise-overlay';
    noiseDiv.className = 'noise';

    // Стили оверлея (аналогично тому, что было в разметке)
    noiseDiv.style.backgroundImage = `url(${noiseUrl})`;
    noiseDiv.style.backgroundSize = '80px';
    noiseDiv.style.opacity = '0.2';
    noiseDiv.style.height = '100%';
    noiseDiv.style.width = '100%';
    noiseDiv.style.position = 'fixed';
    noiseDiv.style.top = '0';
    noiseDiv.style.left = '0';
    noiseDiv.style.zIndex = '999';
    noiseDiv.style.pointerEvents = 'none';
    noiseDiv.style.mixBlendMode = 'darken';

    // Добавляем в конец body
    document.body.appendChild(noiseDiv);
});


