document.addEventListener('DOMContentLoaded', function() {
    const fonts = ['Arial, sans-serif', '"Times New Roman", serif'];
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    const elements = document.querySelectorAll('h1, h2, p, a');
    elements.forEach(el => {
      if (el.classList.contains('number') || el.classList.contains('tittle')) {
        el.style.fontFamily = '"Times New Roman", serif';
      } else {
        el.style.fontFamily = randomFont;
      }
    });
  });