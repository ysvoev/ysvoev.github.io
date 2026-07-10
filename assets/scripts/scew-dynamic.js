// Скрипт для искажения слов на всем сайте + динамический режим для #theme
document.addEventListener('DOMContentLoaded', function() {
    
    // === НАСТРОЙКИ РЕЖИМА ПРОСТОЯ ===
    const IDLE_CONFIG = {
        enabled: true,
        delayBeforeStart: 10000, 
        stepDuration: 40000,        
        steps: {
            scaleMultiplier: [7, 1, 4, 1, 13, 2, 4, 1, 5, 1],
            skewAmplitude: [15, 0, 20, 0, 25, 0, 18, 0, 22, 0],
        },
        transitionDuration: 2000,
        fadeInDuration: 20000,
    };
    
    // === СОСТОЯНИЕ ===
    let idleState = {
        isIdle: false,
        isFadingIn: false,
        isTransitioning: false,
        lastMouseMove: Date.now(),
        themeElementsData: [],
        animationId: null,
        checkInterval: null,
        stepIndex: 0,
        currentScaleMultiplier: 1,
        currentSkewAmplitude: 0,
        stepStartTime: 0,
        isThemeProcessed: false,
    };
    
    // === ОРИГИНАЛЬНАЯ ФУНКЦИЯ ===
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
    
    // === ОРИГИНАЛЬНАЯ ОБРАБОТКА ВСЕГО САЙТА ===
    function processTextElements() {
        const textElements = document.querySelectorAll('h1, h2, p, a');
        
        textElements.forEach(element => {
            if (element.tagName === 'P' && element.closest('.pages')) {
            } else if (element.tagName === 'A' && element.closest('.pages')) {
                return;
            } else if (element.tagName === 'A' && element.closest('p')) {
            }
            
            const textNodes = getTextNodes(element);
            
            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                const words = text.split(/\s+/).filter(word => word.length > 0);
                
                if (words.length === 0) return;
                
                let distortionRate = 0.5;
                if (element.closest('.about') || element.closest('.projects')) {
                    distortionRate = 0.5;
                }
                
                const wordsToDistort = Math.max(1, Math.floor(words.length * distortionRate));
                const selectedIndices = [];
                for (let i = 0; i < wordsToDistort; i++) {
                    let randomIndex;
                    do {
                        randomIndex = Math.floor(Math.random() * words.length);
                    } while (selectedIndices.includes(randomIndex));
                    selectedIndices.push(randomIndex);
                }
                
                const originalText = textNode.textContent;
                let newHTML = '';
                let currentPos = 0;
                
                words.forEach((word, index) => {
                    const wordStart = originalText.indexOf(word, currentPos);
                    
                    if (wordStart > currentPos) {
                        newHTML += originalText.substring(currentPos, wordStart);
                    }
                    
                    if (selectedIndices.includes(index)) {
                        const scaleY = (Math.random() * 1 + 1).toFixed(2);
                        const skewX = (Math.random() * 40 - 20).toFixed(0);
                        newHTML += `<span class="site-distorted" style="transform: scaleY(${scaleY}) skewX(${skewX}deg); display: inline-block;">${word}</span>`;
                    } else {
                        newHTML += word;
                    }
                    
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
            });
        });
    }
    
    // === ОБРАБОТКА ВСЕХ #theme ===
    function processThemeElements() {
        const themeElements = document.querySelectorAll('#theme');
        
        if (themeElements.length === 0) {
            return;
        }
        
        idleState.themeElementsData = [];
        
        themeElements.forEach((themeElement, index) => {
            // Сохраняем HTML структуру каждого #theme
            const originalHTML = themeElement.innerHTML;
            
            // Находим все текстовые узлы внутри #theme
            const textNodes = getTextNodes(themeElement);
            const wordsData = [];
            
            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                const words = text.split(/\s+/).filter(word => word.length > 0);
                
                if (words.length === 0) return;
                
                const distortionRate = 0.5;
                const wordsToDistort = Math.max(1, Math.floor(words.length * distortionRate));
                const selectedIndices = [];
                for (let i = 0; i < wordsToDistort; i++) {
                    let randomIndex;
                    do {
                        randomIndex = Math.floor(Math.random() * words.length);
                    } while (selectedIndices.includes(randomIndex));
                    selectedIndices.push(randomIndex);
                }
                
                const originalText = textNode.textContent;
                let wordPositions = [];
                let currentPos = 0;
                
                words.forEach((word, wordIndex) => {
                    const wordStart = originalText.indexOf(word, currentPos);
                    const scaleY = (Math.random() * 1 + 1);
                    const skewX = (Math.random() * 40 - 20);
                    
                    wordPositions.push({
                        word: word,
                        start: wordStart,
                        end: wordStart + word.length,
                        isDistorted: selectedIndices.includes(wordIndex),
                        baseScale: scaleY,
                        baseSkew: skewX,
                    });
                    currentPos = wordStart + word.length;
                });
                
                wordsData.push({
                    textNode: textNode,
                    originalText: originalText,
                    wordPositions: wordPositions,
                });
            });
            
            idleState.themeElementsData.push({
                element: themeElement,
                wordsData: wordsData,
                originalHTML: originalHTML,
                index: index,
            });
        });
        
        renderThemeWords(1, 0);
        idleState.isThemeProcessed = true;
    }
    
    // === РЕНДЕРИНГ ВСЕХ #theme (сохраняя структуру) ===
    function renderThemeWords(scaleMultiplier, skewAmplitude) {
        idleState.themeElementsData.forEach(item => {
            const { element, wordsData, originalHTML } = item;
            
            // Создаем временный DOM для парсинга структуры
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = originalHTML;
            
            // Проходим по всем текстовым узлам и заменяем их
            const allTextNodes = [];
            const walker = document.createTreeWalker(
                tempContainer,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        if (node.textContent.trim()) {
                            return NodeFilter.FILTER_ACCEPT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }
                }
            );
            
            let node;
            while (node = walker.nextNode()) {
                allTextNodes.push(node);
            }
            
            // Для каждого текстового узла находим соответствующие данные
            allTextNodes.forEach((textNode, idx) => {
                const text = textNode.textContent;
                const words = text.split(/\s+/).filter(word => word.length > 0);
                
                if (words.length === 0) return;
                
                // Находим соответствующие wordPositions
                let wordPositions = null;
                for (let data of wordsData) {
                    if (data.originalText === text) {
                        wordPositions = data.wordPositions;
                        break;
                    }
                }
                
                if (!wordPositions) return;
                
                let newHTML = '';
                let currentPos = 0;
                
                wordPositions.forEach((wordData) => {
                    if (wordData.start > currentPos) {
                        newHTML += text.substring(currentPos, wordData.start);
                    }
                    
                    const currentScale = Math.max(1, wordData.baseScale * scaleMultiplier);
                    const clampedScale = Math.min(50, currentScale);
                    
                    const skewOffset = (wordData.baseSkew / 20) * skewAmplitude;
                    const clampedSkew = Math.max(-180, Math.min(180, skewOffset));
                    
                    newHTML += `<span class="theme-word" data-scale="${wordData.baseScale}" data-skew="${wordData.baseSkew}" data-distorted="${wordData.isDistorted}" style="transform: scaleY(${wordData.isDistorted ? clampedScale : 1}) skewX(${wordData.isDistorted ? clampedSkew : 0}deg); display: inline-block; transition: transform 0.05s linear;">${wordData.word}</span>`;
                    
                    currentPos = wordData.end;
                });
                
                if (currentPos < text.length) {
                    newHTML += text.substring(currentPos);
                }
                
                // Заменяем текстовый узел на новый HTML
                const replacement = document.createElement('span');
                replacement.innerHTML = newHTML;
                while (replacement.firstChild) {
                    textNode.parentNode.insertBefore(replacement.firstChild, textNode);
                }
                textNode.parentNode.removeChild(textNode);
            });
            
            // Заменяем содержимое элемента
            element.innerHTML = tempContainer.innerHTML;
        });
    }
    
    // === БЫСТРОЕ ОБНОВЛЕНИЕ ВСЕХ #theme ===
    function updateThemeFast(scaleMultiplier, skewAmplitude) {
        const spans = document.querySelectorAll('#theme .theme-word');
        if (spans.length === 0) return;
        
        spans.forEach(span => {
            const baseScale = parseFloat(span.dataset.scale) || 1;
            const baseSkew = parseFloat(span.dataset.skew) || 0;
            const isDistorted = span.dataset.distorted === 'true';
            
            if (isDistorted) {
                const currentScale = Math.max(1, baseScale * scaleMultiplier);
                const clampedScale = Math.min(50, currentScale);
                
                const skewOffset = (baseSkew / 20) * skewAmplitude;
                const clampedSkew = Math.max(-180, Math.min(180, skewOffset));
                
                span.style.transform = `scaleY(${clampedScale}) skewX(${clampedSkew}deg)`;
            } else {
                const currentScale = Math.max(1, baseScale * (1 + (scaleMultiplier - 1) * 0.3));
                const clampedScale = Math.min(50, currentScale);
                
                const skewOffset = (baseSkew / 20) * skewAmplitude * 0.3;
                const clampedSkew = Math.max(-180, Math.min(180, skewOffset));
                
                span.style.transform = `scaleY(${clampedScale}) skewX(${clampedSkew}deg)`;
            }
        });
    }
    
    // === УПРАВЛЕНИЕ РЕЖИМОМ ===
    
    function getNextStep() {
        const steps = IDLE_CONFIG.steps;
        const index = idleState.stepIndex % steps.scaleMultiplier.length;
        return {
            scaleMultiplier: steps.scaleMultiplier[index],
            skewAmplitude: steps.skewAmplitude[index],
        };
    }
    
    function startIdleMode() {
        if (idleState.animationId) {
            cancelAnimationFrame(idleState.animationId);
            idleState.animationId = null;
        }
        
        if (!idleState.isThemeProcessed || idleState.themeElementsData.length === 0) {
            return;
        }
        
        idleState.isFadingIn = true;
        idleState.stepIndex = 0;
        idleState.stepStartTime = performance.now();
        
        function animateIdle(time) {
            const elapsed = time - idleState.stepStartTime;
            
            let fadeProgress = 1;
            if (idleState.isFadingIn) {
                const fadeDuration = IDLE_CONFIG.fadeInDuration;
                fadeProgress = Math.min(elapsed / fadeDuration, 1);
                fadeProgress = 1 - Math.pow(1 - fadeProgress, 3);
                
                if (fadeProgress >= 1) {
                    idleState.isFadingIn = false;
                }
            }
            
            const stepDuration = IDLE_CONFIG.stepDuration;
            const stepProgress = (elapsed % stepDuration) / stepDuration;
            const currentStepIndex = Math.floor(elapsed / stepDuration);
            
            if (currentStepIndex !== idleState.stepIndex) {
                idleState.stepIndex = currentStepIndex;
            }
            
            const currentStep = getNextStep();
            const nextStepIndex = (idleState.stepIndex + 1) % IDLE_CONFIG.steps.scaleMultiplier.length;
            const nextStep = {
                scaleMultiplier: IDLE_CONFIG.steps.scaleMultiplier[nextStepIndex],
                skewAmplitude: IDLE_CONFIG.steps.skewAmplitude[nextStepIndex],
            };
            
            const eased = stepProgress < 0.5 ? 
                2 * stepProgress * stepProgress : 
                1 - Math.pow(-2 * stepProgress + 2, 2) / 2;
            
            const currentScaleMultiplier = currentStep.scaleMultiplier + 
                (nextStep.scaleMultiplier - currentStep.scaleMultiplier) * eased;
            const currentSkewAmplitude = currentStep.skewAmplitude + 
                (nextStep.skewAmplitude - currentStep.skewAmplitude) * eased;
            
            const finalScale = 1 + (currentScaleMultiplier - 1) * fadeProgress;
            const finalSkew = currentSkewAmplitude * fadeProgress;
            
            idleState.currentScaleMultiplier = finalScale;
            idleState.currentSkewAmplitude = finalSkew;
            
            updateThemeFast(finalScale, finalSkew);
            
            idleState.animationId = requestAnimationFrame(animateIdle);
        }
        
        idleState.animationId = requestAnimationFrame(animateIdle);
    }
    
    function returnToActiveMode() {
        if (idleState.animationId) {
            cancelAnimationFrame(idleState.animationId);
            idleState.animationId = null;
        }
        
        const startScale = idleState.currentScaleMultiplier;
        const startSkew = idleState.currentSkewAmplitude;
        const endScale = 1;
        const endSkew = 0;
        const duration = IDLE_CONFIG.transitionDuration;
        const startTime = performance.now();
        idleState.isTransitioning = true;
        idleState.isFadingIn = false;
        
        function animateReturn(time) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            const currentScale = startScale + (endScale - startScale) * eased;
            const currentSkew = startSkew + (endSkew - startSkew) * eased;
            
            idleState.currentScaleMultiplier = currentScale;
            idleState.currentSkewAmplitude = currentSkew;
            
            updateThemeFast(currentScale, currentSkew);
            
            if (progress < 1) {
                idleState.animationId = requestAnimationFrame(animateReturn);
            } else {
                idleState.currentScaleMultiplier = endScale;
                idleState.currentSkewAmplitude = endSkew;
                updateThemeFast(endScale, endSkew);
                idleState.isTransitioning = false;
                idleState.animationId = null;
                idleState.stepIndex = 0;
            }
        }
        
        idleState.animationId = requestAnimationFrame(animateReturn);
    }
    
    function checkIdleState() {
        if (idleState.isTransitioning || !idleState.isThemeProcessed) return;
        
        const now = Date.now();
        const timeSinceLastMove = now - idleState.lastMouseMove;
        
        if (timeSinceLastMove >= IDLE_CONFIG.delayBeforeStart && !idleState.isIdle && !idleState.animationId) {
            idleState.isIdle = true;
            startIdleMode();
        } else if (timeSinceLastMove < IDLE_CONFIG.delayBeforeStart && idleState.isIdle) {
            idleState.isIdle = false;
            returnToActiveMode();
        }
    }
    
    // === ОБРАБОТЧИКИ ===
    
    function onUserActivity() {
        idleState.lastMouseMove = Date.now();
        
        if (idleState.isIdle && !idleState.isTransitioning) {
            idleState.isIdle = false;
            returnToActiveMode();
        }
    }
    
    function startIdleChecker() {
        if (idleState.checkInterval) {
            clearInterval(idleState.checkInterval);
        }
        
        idleState.checkInterval = setInterval(checkIdleState, 500);
    }
    
    function stopAllAnimations() {
        if (idleState.animationId) {
            cancelAnimationFrame(idleState.animationId);
            idleState.animationId = null;
        }
        idleState.isTransitioning = false;
        idleState.isIdle = false;
        idleState.isFadingIn = false;
        idleState.currentScaleMultiplier = 1;
        idleState.currentSkewAmplitude = 0;
        updateThemeFast(1, 0);
    }
    
    // === ИНИЦИАЛИЗАЦИЯ ===
    
    requestAnimationFrame(() => {
        processTextElements();
        processThemeElements();
        
        requestAnimationFrame(() => {
            const stickyElements = document.querySelectorAll('.links, .navigation, .info, .about p:not(:last-child)');
            stickyElements.forEach(el => {
                el.style.transform = 'translateZ(0)';
                el.style.willChange = 'transform';
                const rect = el.getBoundingClientRect();
                el.style.transform = '';
                el.style.willChange = '';
            });
            
            if (idleState.isThemeProcessed && idleState.themeElementsData.length > 0) {
                document.addEventListener('mousemove', onUserActivity);
                document.addEventListener('scroll', onUserActivity);
                document.addEventListener('click', onUserActivity);
                document.addEventListener('keydown', onUserActivity);
                document.addEventListener('touchstart', onUserActivity);
                document.addEventListener('touchmove', onUserActivity);
                
                startIdleChecker();
                idleState.lastMouseMove = Date.now();
            }
            
            document.dispatchEvent(new CustomEvent('scewProcessingComplete'));
        });
    });
    
    window.stopIdleAnimation = stopAllAnimations;
    window.IDLE_CONFIG = IDLE_CONFIG;
});