// Скрипт для случайного искажения слов на всем сайте
document.addEventListener('DOMContentLoaded', function() {
    console.log('Запускаем скрипт искажения слов для всего сайта');
    
    // Параметры искажений для разных типов элементов
    const distortionParams = {
        // Для обычных элементов (по умолчанию)
        default: {
            scaleY: { min: 1, max: 2 },
            scaleX: { min: 1, max: 1 }, // Не меняем по X
            skewX: { min: -20, max: 20 },
            distortionRate: 0.8
        },
        // Для класса .number
        number: {
            scaleY: { min: 0.7, max: 0.8 },
            scaleX: { min: 9, max: 10 },
            skewX: { min: -8, max: 8 },
            distortionRate: 1,
            applyToElement: true, // Флаг: применяем ко всему элементу
            heightCompensation: 0 // Коэффициент влияния на высоту (0 - нет влияния, 1 - полное влияние)
        },
        // Для класса .tittle (заголовки)
        tittle: {
            scaleY: { min: 8, max: 8 },
            scaleX: { min: 1, max: 1 },
            skewX: { min: -40, max: 40 },
            distortionRate: 1,
            applyToElement: true, // Флаг: применяем ко всему элементу
            heightCompensation: 0.6 // Коэффициент влияния на высоту (0 - нет влияния, 1 - полное влияние)
        },
        // Для ссылок <a>
        link: {
            scaleY: { min: 2, max: 4 },
            scaleX: { min: 1, max: 1 },
            skewX: { min: -20, max: 20 },
            distortionRate: 1
        }
    };
    
    // Функция для получения параметров искажения для элемента
    function getDistortionParams(element) {
        // Проверяем класс .number
        if (element.classList && element.classList.contains('number')) {
            return distortionParams.number;
        }
        
        // Проверяем класс .tittle
        if (element.classList && element.classList.contains('tittle')) {
            return distortionParams.tittle;
        }
        
        // Проверяем, является ли элемент ссылкой
        if (element.tagName === 'A') {
            return distortionParams.link;
        }
        
        // По умолчанию
        return distortionParams.default;
    }
    
    // Функция для генерации случайного значения в диапазоне
    function randomRange(min, max) {
        return (Math.random() * (max - min) + min);
    }
    
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
    
    // Функция для проверки, принадлежит ли узел специальному элементу
    function isNodeInSpecialElement(node) {
        let parent = node.parentElement;
        while (parent) {
            if (parent.classList && (parent.classList.contains('number') || parent.classList.contains('tittle'))) {
                return true;
            }
            // Проверяем, является ли родитель ссылкой
            if (parent.tagName === 'A') {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }
    
    // Функция для обработки специальных элементов (.number, .tittle, ссылки)
    function processSpecialElements() {
        // Обрабатываем элементы с классом .number
        document.querySelectorAll('.number').forEach(element => {
            // Отмечаем элемент как обработанный
            element.setAttribute('data-processed', 'true');
            processElementWithParams(element, 'number');
        });
        
        // Обрабатываем элементы с классом .tittle
        document.querySelectorAll('.tittle').forEach(element => {
            // Отмечаем элемент как обработанный
            element.setAttribute('data-processed', 'true');
            processElementWithParams(element, 'tittle');
        });
        
        // Обрабатываем ссылки (кроме тех, что внутри .pages)
        document.querySelectorAll('a:not(.pages a)').forEach(element => {
            // Пропускаем ссылки, которые уже обработаны как .number или .tittle
            if (element.classList.contains('number') || element.classList.contains('tittle')) {
                return;
            }
            // Отмечаем ссылку как обработанную
            element.setAttribute('data-processed', 'true');
            processElementWithParams(element, 'link');
        });
    }
    
    // Функция для обработки обычного текста
    function processRegularText() {
        // Получаем все текстовые элементы, исключая специальные и уже обработанные
        const textElements = document.querySelectorAll('h1:not([data-processed]), h2:not([data-processed]), p:not([data-processed])');
        
        textElements.forEach(element => {
            // Пропускаем элементы, которые содержат специальные классы
            if (element.closest('.number') || element.closest('.tittle')) {
                return;
            }
            
            // Пропускаем параграфы внутри .pages
            if (element.closest('.pages')) {
                return;
            }
            
            // Проверяем, нет ли внутри элемента специальных элементов
            const hasSpecialChildren = element.querySelector('.number, .tittle, a');
            if (hasSpecialChildren) {
                // Если есть специальные дети, обрабатываем только текстовые узлы,
                // которые не являются частью специальных элементов
                const textNodes = getTextNodes(element);
                const params = distortionParams.default;
                
                textNodes.forEach(textNode => {
                    // Проверяем, не принадлежит ли текстовый узел специальному элементу
                    if (!isNodeInSpecialElement(textNode)) {
                        processWordDistortion(textNode, element, params);
                    }
                });
                return;
            }
            
            // Получаем параметры по умолчанию
            const params = distortionParams.default;
            
            // Обрабатываем текстовые узлы
            const textNodes = getTextNodes(element);
            textNodes.forEach(textNode => {
                processWordDistortion(textNode, element, params);
            });
        });
    }
    
    // Функция для обработки элемента с определенными параметрами
    function processElementWithParams(element, type) {
        const params = distortionParams[type];
        if (!params) return;
        
        // Проверяем, нужно ли применять трансформацию ко всему элементу
        if (params.applyToElement) {
            processElementAsWhole(element, params, type);
        } else {
            // Обычная обработка по словам
            const textNodes = getTextNodes(element);
            textNodes.forEach(textNode => {
                processWordDistortion(textNode, element, params);
            });
        }
    }
    
    // Новая функция: обработка элемента как единого целого (для .number и .tittle)
    function processElementAsWhole(element, params, type) {
        // Получаем текущий font-size
        const computedStyle = getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize) || 16;
        const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;
        
        // Генерируем ОДИН набор параметров для всего элемента
        const scaleY = randomRange(params.scaleY.min, params.scaleY.max).toFixed(2);
        const scaleX = randomRange(params.scaleX.min, params.scaleX.max).toFixed(2);
        const skewX = randomRange(params.skewX.min, params.skewX.max).toFixed(0);
        
        // Получаем коэффициент компенсации высоты (по умолчанию 1)
        const heightCompensation = params.heightCompensation !== undefined ? params.heightCompensation : 1;
        
        // Вычисляем новую высоту блока с учетом scaleY и коэффициента компенсации
        const originalHeight = lineHeight;
        const scaleYValue = parseFloat(scaleY);
        // Применяем коэффициент к изменению высоты
        const heightChange = (originalHeight * scaleYValue - originalHeight) * heightCompensation;
        const newHeight = originalHeight + heightChange;
        const heightDiff = newHeight - originalHeight;
        
        // Добавляем отступы для компенсации изменения высоты
        const paddingTop = Math.abs(heightDiff) / 2;
        const paddingBottom = Math.abs(heightDiff) / 2;
        
        console.log(`[${type.toUpperCase()}] Элемент целиком | scaleY: ${scaleY} | scaleX: ${scaleX} | skewX: ${skewX}deg`);
        console.log(`[${type.toUpperCase()}] heightCompensation: ${heightCompensation}`);
        console.log(`[${type.toUpperCase()}] Высота: ${originalHeight}px -> ${newHeight}px (${heightDiff > 0 ? '+' : ''}${heightDiff}px)`);
        console.log(`[${type.toUpperCase()}] Отступы: top=${paddingTop}px, bottom=${paddingBottom}px`);
        
        // Применяем трансформацию ко всему элементу
        element.style.transform = `scaleY(${scaleY}) scaleX(${scaleX}) skewX(${skewX}deg)`;
        element.style.transformOrigin = 'center';
        element.style.transition = 'transform 0.3s ease';
        
        // Устанавливаем display: inline-block для корректного применения трансформации
        element.style.display = 'inline-block';
        
        // Добавляем отступы для сохранения места в потоке документа
        if (heightDiff > 0) {
            // Если элемент увеличился, добавляем отступы сверху и снизу
            element.style.paddingTop = paddingTop + 'px';
            element.style.paddingBottom = paddingBottom + 'px';
        } else if (heightDiff < 0) {
            // Если элемент уменьшился, добавляем отрицательные отступы или margin
            element.style.marginTop = paddingTop + 'px';
            element.style.marginBottom = paddingBottom + 'px';
        }
        
        // Добавляем небольшие боковые отступы для читаемости
        element.style.paddingLeft = '4px';
        element.style.paddingRight = '4px';
        element.style.boxSizing = 'border-box';
        
        // Обрабатываем текстовые узлы внутри элемента (без дополнительных трансформаций)
        const textNodes = getTextNodes(element);
        textNodes.forEach(textNode => {
            processTextNodeWithoutTransform(textNode, element);
        });
    }
    
    // Функция для обработки текстового узла без трансформации слов
    function processTextNodeWithoutTransform(textNode, element) {
        const text = textNode.textContent;
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length === 0) return;
        
        const originalText = textNode.textContent;
        let newHTML = '';
        let currentPos = 0;
        
        words.forEach((word, index) => {
            let wordStart = originalText.indexOf(word, currentPos);
            if (wordStart === -1) {
                wordStart = currentPos;
            }
            
            if (wordStart > currentPos) {
                newHTML += originalText.substring(currentPos, wordStart);
            }
            
            // Просто оборачиваем слова в span без трансформаций
            newHTML += `<span style="display: inline-block;">${word}</span>`;
            
            currentPos = wordStart + word.length;
        });
        
        if (currentPos < originalText.length) {
            newHTML += originalText.substring(currentPos);
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHTML;
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        textNode.parentNode.replaceChild(fragment, textNode);
    }
    
    // Основная функция обработки слов с искажением (для обычного текста и ссылок)
    function processWordDistortion(textNode, element, params) {
        const text = textNode.textContent;
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length === 0) return;
        
        // Вычисляем количество слов для искажения
        const wordsToDistort = Math.max(1, Math.floor(words.length * params.distortionRate));
        
        // Случайно выбираем слова
        const selectedIndices = [];
        for (let i = 0; i < wordsToDistort; i++) {
            let randomIndex;
            let attempts = 0;
            do {
                randomIndex = Math.floor(Math.random() * words.length);
                attempts++;
            } while (selectedIndices.includes(randomIndex) && attempts < 100);
            if (!selectedIndices.includes(randomIndex)) {
                selectedIndices.push(randomIndex);
            }
        }
        
        // Создаем новый HTML, сохраняя исходные пробелы
        const originalText = textNode.textContent;
        let newHTML = '';
        let currentPos = 0;
        
        words.forEach((word, index) => {
            // Находим позицию слова в исходном тексте
            let wordStart = originalText.indexOf(word, currentPos);
            // Если слово не найдено, используем текущую позицию
            if (wordStart === -1) {
                wordStart = currentPos;
            }
            
            // Добавляем пробелы/символы перед словом
            if (wordStart > currentPos) {
                newHTML += originalText.substring(currentPos, wordStart);
            }
            
            // Добавляем само слово (с искажением или без)
            if (selectedIndices.includes(index)) {
                // Генерируем случайные параметры в заданных диапазонах
                const scaleY = randomRange(params.scaleY.min, params.scaleY.max).toFixed(2);
                const scaleX = randomRange(params.scaleX.min, params.scaleX.max).toFixed(2);
                const skewX = randomRange(params.skewX.min, params.skewX.max).toFixed(0);
                
                // Определяем тип элемента для логирования
                let elementType = 'DEFAULT';
                if (element.classList && element.classList.contains('number')) {
                    elementType = 'NUMBER';
                } else if (element.classList && element.classList.contains('tittle')) {
                    elementType = 'TITTLE';
                } else if (element.tagName === 'A') {
                    elementType = 'LINK';
                }
                
                console.log(`[${elementType}] Word: "${word}" | scaleY: ${scaleY} | scaleX: ${scaleX} | skewX: ${skewX}deg`);
                
                newHTML += `<span style="transform: scaleY(${scaleY}) scaleX(${scaleX}) skewX(${skewX}deg); display: inline-block; transform-origin: center;">${word}</span>`;
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
    }
    
    // Запускаем обработку в requestAnimationFrame для стабилизации layout
    requestAnimationFrame(() => {
        // Сначала обрабатываем специальные элементы
        processSpecialElements();
        
        // Затем обрабатываем обычный текст (не затрагивая специальные элементы)
        processRegularText();
        
        // Стабилизируем sticky элементы после изменения DOM
        requestAnimationFrame(() => {
            // Принудительно пересчитываем layout для sticky элементов
            const stickyElements = document.querySelectorAll('.links, .navigation, .info, .about p:not(:last-child)');
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