(function() {
    window.PhotoSwitcherConfig = window.PhotoSwitcherConfig || {
        selector: '.photo',
        images: [
            'assets/avatars/avatar-1.png',
            'assets/avatars/avatar-2.jpg',
            'assets/avatars/avatar-3.png',
            'assets/avatars/avatar-4.jpg',
            'assets/avatars/avatar-5.jpg',
            'assets/avatars/avatar-6.png',
            'assets/avatars/avatar-7.png',
            'assets/avatars/avatar-8.png'

        ],
        speed: 400
    };

    function activatePhotoSwitcher() {
        const config = window.PhotoSwitcherConfig;
        const elements = document.querySelectorAll(config.selector);
        if (elements.length === 0) return false;

        elements.forEach((imgElement) => {
            if (imgElement.tagName !== 'IMG') return;

            let intervalId = null;
            let currentIndex = 0;

            function getRandomImage() {
                return config.images[Math.floor(Math.random() * config.images.length)];
            }

            function stopSlideshow() {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }

            function startSlideshow() {
                if (intervalId) return;

                const currentSrc = imgElement.src;
                const currentFileName = currentSrc.substring(currentSrc.lastIndexOf('/') + 1);
                let foundIndex = config.images.findIndex(imgPath => {
                    const fileName = imgPath.substring(imgPath.lastIndexOf('/') + 1);
                    return fileName === currentFileName;
                });
                currentIndex = foundIndex !== -1 ? foundIndex : 0;

                intervalId = setInterval(() => {
                    currentIndex = (currentIndex + 1) % config.images.length;
                    const newSrc = config.images[currentIndex];
                    imgElement.src = newSrc;
                    imgElement.removeAttribute('data-src');
                }, config.speed);
            }

            const randomImg = getRandomImage();
            imgElement.src = randomImg;
            imgElement.removeAttribute('data-src');

            imgElement.addEventListener('mouseenter', startSlideshow);
            imgElement.addEventListener('mouseleave', function() {
                stopSlideshow();
                const newRandom = getRandomImage();
                imgElement.src = newRandom;
                imgElement.removeAttribute('data-src');
            });
        });

        return true;
    }

    window.initPhotoSwitcher = function(config) {
        if (config) {
            window.PhotoSwitcherConfig = {
                ...window.PhotoSwitcherConfig,
                ...config
            };
        }
        return activatePhotoSwitcher();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(activatePhotoSwitcher, 50);
        });
    } else {
        setTimeout(activatePhotoSwitcher, 50);
    }
})();