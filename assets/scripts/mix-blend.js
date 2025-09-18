// Скрипт для применения mix-blend-mode: difference ко всем текстовым элементам
document.addEventListener('DOMContentLoaded', function() {
    console.log('Применяем mix-blend-mode: difference ко всем текстам');
    
    // Находим все текстовые элементы
    const textElements = document.querySelectorAll('h1, h2, p, a');
    
    textElements.forEach(element => {
        element.style.mixBlendMode = 'difference';
        element.style.position = 'relative';
        element.style.background = 'transparent';
    });
    
    console.log(`mix-blend-mode применен к ${textElements.length} элементам`);
});
