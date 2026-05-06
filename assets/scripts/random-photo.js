document.addEventListener("DOMContentLoaded", () => {
  const projectContainer = document.querySelector(".projects .project");

  if (!projectContainer) {
    return;
  }

  const projectImages = Array.from(projectContainer.querySelectorAll("img.project"));

  for (let i = projectImages.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [projectImages[i], projectImages[randomIndex]] = [projectImages[randomIndex], projectImages[i]];
  }

  projectImages.forEach((image) => {
    projectContainer.appendChild(image);
  });
});
