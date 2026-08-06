class PageFlipEngine {
  constructor(viewportId) {
    this.viewport = document.getElementById(viewportId);
    this.initEvents();
  }

  initEvents() {
    window.addEventListener('scroll', () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.round((window.scrollY / totalHeight) * 100) : 0;
      const progDisplay = document.getElementById('readingProgressDisplay');
      if (progDisplay) {
        progDisplay.innerText = `প্রগ্রেস: ${progress}%`;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PageFlipEngine('bookViewport');
});