// Роутер для случайного выбора страницы со стихом
// При загрузке /poems/index.html показывает ссылку "(прочесть)" по центру экрана
// При клике на ссылку перенаправляет на случайный файл из папки /poems/poem

(function () {
  // Список доступных страниц со стихами.
  // При добавлении новых файлов в `poems/poem` просто дополняй этот массив,
  // например: "03.html", "04.html" и т.д.
  var poems = [
    "01.html",
    "02.html"
  ];

  // Получаем путь и полный URL
  var pathname = window.location.pathname;
  var href = window.location.href;
  
  // Скрипт должен сработать только на странице списка стихов
  // (index в папке /poems), чтобы не зациклить переходы.
  
  // Если мы уже в папке /poem/, не делаем ничего
  if (pathname.includes('/poem/') || href.includes('/poem/')) {
    return;
  }
  
  // Проверяем, что мы на странице /poems/index.html или /poems/
  // Используем проверку по href и pathname для надежности
  var isPoemsIndex = false;
  
  if ((href.includes('/poems/index.html') || href.match(/\/poems\/?$/)) ||
      (pathname.includes('/poems/index.html') || 
       pathname.endsWith('/poems/') || 
       pathname.endsWith('/poems'))) {
    isPoemsIndex = true;
  }

  if (!isPoemsIndex || poems.length === 0) {
    return;
  }

  // Создаем экран загрузки с ссылкой "(прочесть)"
  function createLoadingScreen() {
    // Создаем контейнер для ссылки
    var container = document.createElement('div');
    container.id = 'poem-loader';
    container.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100vw',
      'height: 100vh',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'z-index: 10000',
      'background-color: var(--color-white, #f6f1e8)',
      'cursor: pointer'
    ].join('; ');

    // Создаем ссылку "(прочесть)"
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = '(прочесть)';
    link.style.cssText = [
      'font-family: "Arial", sans-serif',
      'font-weight: 400',
      'font-size: 20px',
      'line-height: 24px',
      'text-transform: lowercase',
      'color: var(--color-blue, #2E81FF)',
      'text-decoration: none',
      'cursor: pointer',
      'transition: opacity 0.3s ease'
    ].join('; ');

    // Обработчик клика на ссылку
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Выбор случайной страницы
      var randomIndex = Math.floor(Math.random() * poems.length);
      
      // Формируем путь к случайному стиху
      // Добавляем параметр для автозапуска звука
      var target = "poem/" + poems[randomIndex] + "?autoplay=true";

      // Редирект на случайный стих
      // Используем replace, чтобы не добавлять запись в историю браузера
      window.location.replace(target);
    });

    container.appendChild(link);
    document.body.appendChild(container);
  }

  // Запускаем создание экрана загрузки после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createLoadingScreen);
  } else {
    createLoadingScreen();
  }
})();

