// Скрипт для случайного искажения слов на всем сайте
document.addEventListener('DOMContentLoaded', function() {
    console.log('Запускаем скрипт искажения слов для всего сайта');
    
    // Функция для получения всех текстовых узлов
    function getTextNodes(node) {
        let textNodes = [];
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            textNodes.push(node);
        } else {
            for (let child of node.childNodes) {
                textNodes = textNodes.concat(getTextNodes(child));
            }
        }
        return textNodes;
    }
    
    // Функция для обработки текстовых элементов
    function processTextElements() {
        // Получаем все текстовые элементы на странице
        const textElements = document.querySelectorAll('h1, h2, p, a');
        
        textElements.forEach(element => {
            // Обрабатываем параграфы внутри ссылок .pages
            if (element.tagName === 'P' && element.closest('.pages')) {
                // Специальная обработка для параграфов внутри .pages
            } else if (element.tagName === 'A' && element.closest('.pages')) {
                // Исключаем основные ссылки .pages
                return;
            } else if (element.tagName === 'A' && element.closest('p')) {
                // Обрабатываем ссылки внутри параграфов
            }
            
            // Получаем все текстовые узлы внутри элемента
            const textNodes = getTextNodes(element);
            
            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                const words = text.split(/\s+/).filter(word => word.length > 0);
                
                if (words.length === 0) return;
                
                // Вычисляем количество слов для искажения
                let distortionRate = 0.3; // 30% по умолчанию
                
                // Для блоков .about и .projects увеличиваем до 30%
                if (element.closest('.about') || element.closest('.projects')) {
                    distortionRate = 0.3;
                }
                
                const wordsToDistort = Math.max(1, Math.floor(words.length * distortionRate));
                
                // Случайно выбираем слова
                const selectedIndices = [];
                for (let i = 0; i < wordsToDistort; i++) {
                    let randomIndex;
                    do {
                        randomIndex = Math.floor(Math.random() * words.length);
                    } while (selectedIndices.includes(randomIndex));
                    selectedIndices.push(randomIndex);
                }
                
                // Создаем новый HTML, сохраняя исходные пробелы
                const originalText = textNode.textContent;
                let newHTML = '';
                let currentPos = 0;
                
                words.forEach((word, index) => {
                    // Находим позицию слова в исходном тексте
                    const wordStart = originalText.indexOf(word, currentPos);
                    
                    // Добавляем пробелы/символы перед словом
                    if (wordStart > currentPos) {
                        newHTML += originalText.substring(currentPos, wordStart);
                    }
                    
                    // Добавляем само слово (с искажением или без)
                    if (selectedIndices.includes(index)) {
                        const scaleY = (Math.random() * 1 + 1).toFixed(2);
                        const skewX = (Math.random() * 40 - 20).toFixed(0);
                        newHTML += `<span style="transform: scaleY(${scaleY}) skewX(${skewX}deg); display: inline-block;">${word}</span>`;
                    } else {
                        newHTML += word;
                    }
                    
                    currentPos = wordStart + word.length;
                });
                
                // Добавляем оставшиеся символы после последнего слова
                if (currentPos < originalText.length) {
                    newHTML += originalText.substring(currentPos);
                }
                
                // Заменяем текстовый узел на HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHTML;
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                textNode.parentNode.replaceChild(fragment, textNode);
            });
        });
    }
    
    // Запускаем обработку в requestAnimationFrame для стабилизации layout
    requestAnimationFrame(() => {
        processTextElements();
        
        // Стабилизируем sticky элементы после изменения DOM
        requestAnimationFrame(() => {
            // Принудительно пересчитываем layout для sticky элементов
            const stickyElements = document.querySelectorAll('.links, .portfolio, .info, .about p:not(:last-child)');
            stickyElements.forEach(el => {
                // Форсируем GPU слой для стабильного позиционирования
                el.style.transform = 'translateZ(0)';
                el.style.willChange = 'transform';
                
                // Принудительно перерасчитываем позицию
                const rect = el.getBoundingClientRect();
                el.style.transform = '';
                el.style.willChange = '';
            });
            
            // Уведомляем другие скрипты о завершении обработки
            document.dispatchEvent(new CustomEvent('scewProcessingComplete'));
            
            console.log('Скрипт искажения слов выполнен для всего сайта с стабилизацией sticky элементов');
        });
    });
});
