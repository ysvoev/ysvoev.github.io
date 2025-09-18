// Скрипт для случайного горизонтального позиционирования параграфов в .about
// Настройки: задайте максимальные смещения в процентах (без знака)
const MAX_OFFSET_MOBILE_PERCENT = 32; // мобильные устройства
const MAX_OFFSET_DESKTOP_PERCENT = 80; // десктоп
// Ждем завершения обработки scew.js перед позиционированием
document.addEventListener('scewProcessingComplete', function() {
    const about = document.querySelector('.about');
    if (!about) {
        console.log('Блок .about не найден — пропускаем позиционирование');
        return;
    }

    // Определяем мобильную версию так же, как CSS (@media (max-width: 1000px))
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 1000px)').matches;
    const maxOffset = isMobile ? MAX_OFFSET_MOBILE_PERCENT : MAX_OFFSET_DESKTOP_PERCENT; // % влево/вправо

    const paragraphs = about.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
        const sign = Math.random() < 0.5 ? -1 : 1;
        const magnitude = Math.random() * maxOffset;
        const offset = (sign * magnitude).toFixed(1);

        const originalTransform = p.style.transform || '';
        p.style.transform = `translateX(${offset}%) ${originalTransform}`;

        console.log(`about p${index + 1}: смещение ${offset}% (${isMobile ? 'моб' : 'деск'})`);
    });

    console.log(`Позиционирование .about параграфов выполнено: ${paragraphs.length}`);
});
