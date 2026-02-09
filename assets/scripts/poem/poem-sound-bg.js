// Фоновый звук для страниц стихотворений
// Автоматически определяет номер стиха из URL и запускает соответствующий звук

document.addEventListener('DOMContentLoaded', () => {
  // Получаем путь к текущей странице
  const pathname = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const autoplay = urlParams.get('autoplay') === 'true';
  
  // Извлекаем номер стиха из пути (например, /poems/poem/01.html -> 01)
  const match = pathname.match(/poem\/(\d+)\.html/);
  
  if (!match) {
    return;
  }
  
  const poemNumber = match[1];
  
  // Формируем путь к звуковому файлу
  // Относительно src/poems/poem/ путь будет ../../assets/sounds/01/01.mp3
  const soundPath = `../../assets/sounds/${poemNumber}/${poemNumber}.mp3`;
  
  // Создаем аудио элемент
  const audio = new Audio(soundPath);
  
  // Включаем повторение по кругу
  audio.loop = true;
  
  // Функция для запуска звука при взаимодействии пользователя
  const startAudio = () => {
    audio.play().catch(() => {
      // Игнорируем ошибки
    });
  };
  
  // Если есть параметр autoplay, пытаемся запустить звук сразу
  // (пользователь уже взаимодействовал со страницей, кликнув на "(прочесть)")
  if (autoplay) {
    // Небольшая задержка для гарантии загрузки страницы
    setTimeout(() => {
      audio.play().catch((error) => {
        // Если не удалось запустить автоматически, ждем взаимодействия пользователя
        setupUserInteractionHandlers();
      });
    }, 100);
  } else {
    // Запускаем воспроизведение при загрузке страницы
    audio.play().catch((error) => {
      // Игнорируем ошибки автовоспроизведения (браузеры требуют взаимодействия пользователя)
      // Звук запустится при первом взаимодействии пользователя со страницей
    });
  }
  
  // Всегда настраиваем обработчики взаимодействия пользователя
  function setupUserInteractionHandlers() {
    // Слушаем события взаимодействия пользователя
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
  }
  
  setupUserInteractionHandlers();
});
