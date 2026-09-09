(function() {
    function initTips() {
        if (!window.cursorInstance || !window.cursorInstance.element) {
            setTimeout(initTips, 100);
            return;
        }
        const cursorElement = window.cursorInstance.element;
        const blocks = cursorElement.querySelectorAll('.cursor-block[id^="?"]');
        if (blocks.length === 0) return;

        // Удаляем старый стиль, если он был создан ранее (чтобы не мешал анимации)
        const oldStyle = document.getElementById('cursor-hide-style');
        if (oldStyle) oldStyle.remove();

        // Сброс к блоку по умолчанию (?info)
        function resetToDefault() {
            blocks.forEach(block => {
                if (block.id === '?info') {
                    block.classList.remove('cursor-block-hidden');
                    block.classList.add('cursor-block-visible');
                } else {
                    block.classList.remove('cursor-block-visible');
                    block.classList.add('cursor-block-hidden');
                }
            });
        }

        // Инициализация – показываем только ?info
        resetToDefault();

        // Находим триггеры (элементы с id^="?" вне курсора)
        const triggers = Array.from(document.querySelectorAll('[id^="?"]'))
            .filter(el => !cursorElement.contains(el));

        triggers.forEach(trigger => {
            const targetId = trigger.id;
            const targetBlock = cursorElement.querySelector(`.cursor-block[id="${targetId}"]`);
            if (!targetBlock) return;

            let isActive = false;

            trigger.addEventListener('mouseenter', function() {
                // Если уже активен этот блок – ничего не делаем
                if (targetBlock.classList.contains('cursor-block-visible')) return;

                // Скрываем все блоки
                blocks.forEach(block => {
                    block.classList.remove('cursor-block-visible');
                    block.classList.add('cursor-block-hidden');
                });

                // Показываем целевой блок
                targetBlock.classList.remove('cursor-block-hidden');
                targetBlock.classList.add('cursor-block-visible');
                isActive = true;
            });

            trigger.addEventListener('mouseleave', function() {
                if (!isActive) return;
                resetToDefault();
                isActive = false;
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTips);
    } else {
        initTips();
    }
})();