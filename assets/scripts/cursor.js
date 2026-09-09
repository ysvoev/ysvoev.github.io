(function() {
    const CursorConfig = {
        htmlContent: `
        <div class="cursor-wrapper">
            <!-- Блок по умолчанию (всегда видим) -->
            <div class="cursor-block cursor-block-visible" id="?info">
                <div class="info">
                    <img data-src="assets/avatars/avatar-01.png" class="photo" alt="да, это я" loading="lazy">
                    <div class="rows">
                        <h2>юра своев</h2>
                        <h1 class="header">кинематографист и дизайнер</h1>
                        <p>сейчас ищу проекты</p>
                        <a href="https://t.me/ysvoev">(телеграм)</a>
                    </div>
                </div>
            </div>



            
            <!-- дизайн -->

            <div class="cursor-block cursor-block-hidden" id="?true">
                <div class="cursor">
                    <p>помогал ребятам запустить продукт, сделать лого и стиль</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?dw">
                <div class="cursor">
                    <p>4 дня жил и работал с ребятами в кампусе</p>
                </div>
            </div>

             <div class="cursor-block cursor-block-hidden" id="?design">
                <div class="cursor">
                    <p>сейчас ищу проекты или работу в студии</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?poster">
                <div class="cursor">
                    <p>приходите к омне за аккуратными постерами к фильмам, для мшнк режиссёров особые условия</p>
                </div>
            </div>
    



            <!-- проекты -->

            <div class="cursor-block cursor-block-hidden" id="?whtnw">
                <div class="cursor">
                    <p>проект в разработке</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?txtnw">
                <div class="cursor">
                    <p>редактор работает, только пока нет ssl сертификата</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?boosty">
                <div class="cursor">
                    <p>рассказываю о своих проектах в кино и дизайне, сходи поддержки, плис</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?channel">
                <div class="cursor">
                    <p>там концепция временных сообщений в 3 дня</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?kino">
                <div class="cursor">
                    <p>самое яркое событие, которое мне удалось оргинзовать на прошлой работе с крутыми коллегами</p>
                </div>
            </div>




            <!-- фильмы -->

            <div class="cursor-block cursor-block-hidden" id="?film">
                <div class="cursor">
                    <p>хочу снимать простое кино, чтобы оно вызывало разные — ощущения, от чувства прекрасного до чувства ужаса</p>
                </div>
            </div>

            <div class="cursor-block cursor-block-hidden" id="?clip">
                <div class="cursor">
                    <p>придумали и сняли клип для trappa la vista</p>
                </div>
            </div>




            <!-- идеи -->
    
            <div class="cursor-block cursor-block-hidden" id="?idea">
                <div class="cursor">
                    <p>если откликнулась идея — пиши мне, попробуем сделать</p>
                </div>
            </div>

        </div>
        `
    };

    function initCursorEffect() {
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '999999',
        });

        const element = document.createElement('div');
        Object.assign(element.style, {
            pointerEvents: 'auto',
            position: 'fixed',
            zIndex: '99999',
            display: 'inline-block',
            cursor: 'pointer',
            left: '0',
            top: '0',
            transform: 'translate(0, 0)'
        });
        element.innerHTML = CursorConfig.htmlContent;

        element.addEventListener('click', function(e) {
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent('cursorElementClick', { detail: { element } }));
        });

        container.appendChild(element);
        document.documentElement.appendChild(container);

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let elementWidth = 300;
        let elementHeight = 400;

        function getElementSize() {
            const rect = element.getBoundingClientRect();
            if (rect.width && rect.height) {
                elementWidth = rect.width;
                elementHeight = rect.height;
                return true;
            }
            return false;
        }

        function centerElement() {
            if (!getElementSize()) return;
            const x = (windowWidth - elementWidth) / 2;
            const y = (windowHeight - elementHeight) / 40;
            element.style.transform = `translate(${x}px, ${y}px)`;
        }

        function updatePosition(mouseX, mouseY) {
            if (!getElementSize()) return;
            const mirrorX = windowWidth - mouseX;
            const mirrorY = windowHeight - mouseY;
            const x = mirrorX - elementWidth / 2;
            const y = mirrorY - elementHeight / 2;
            element.style.transform = `translate(${x}px, ${y}px)`;
        }

        // Центрируем после рендеринга
        setTimeout(centerElement, 50);

        document.addEventListener('mousemove', function(e) {
            updatePosition(e.clientX, e.clientY);
        });

        window.addEventListener('resize', function() {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
            centerElement();
        });

        return {
            container,
            element,
            setContent: function(html) {
                element.innerHTML = html;
                setTimeout(centerElement, 50);
            }
        };
    }

    window.initCursorEffect = initCursorEffect;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.cursorInstance = initCursorEffect();
            setTimeout(() => {
                if (window.initPhotoSwitcher) window.initPhotoSwitcher();
            }, 150);
        });
    } else {
        window.cursorInstance = initCursorEffect();
        setTimeout(() => {
            if (window.initPhotoSwitcher) window.initPhotoSwitcher();
        }, 150);
    }
})();