// Скрипт для случайного поворота всех изображений на сайте
// Диапазон поворота: от -2 до +2 градусов

function rotateImages() {
    // Получаем все изображения на странице
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Генерируем случайный угол от -2 до +2 градусов
        const randomAngle = 4 * Math.random() - 2;
        
        // Применяем поворот к изображению
        img.style.transform = `rotate(${randomAngle}deg)`;
    });
}

// Запускаем функцию после полной загрузки DOM
document.addEventListener('DOMContentLoaded', rotateImages);

// Экспортируем функцию для возможности вызова извне
window.rotateImages = rotateImages;
