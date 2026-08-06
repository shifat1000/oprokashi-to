/**
 * OPROKASHI — Interactive Reading Engine (Part 02)
 * Loads chapter content from Firestore & manages reading state
 */

class StoryReaderEngine {
  constructor() {
    this.storyId = null;
    this.chapterId = null;
    this.currentFontSize = 1.15; // rem units
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    this.storyId = urlParams.get('id');

    if (!this.storyId) {
      console.error("No story ID specified in URL.");
      return;
    }

    this.bindEvents();
    this.loadStoryData();
    this.initProgressBar();
  }

  async loadStoryData() {
    try {
      const db = window.OprokashiDB.DB;
      
      // 1. Fetch Story Meta
      const storyDoc = await db.collection("stories").doc(this.storyId).get();
      if (!storyDoc.exists) {
        this.renderError("গল্পটি খুঁজে পাওয়া যায়নি।");
        return;
      }

      const story = storyDoc.data();
      document.title = `${story.title} — ${window.OPROKASHI_CONFIG.APP_NAME}`;
      document.getElementById("storyTitle").textContent = story.title;
      document.getElementById("storyMeta").textContent = `লেখক: ${story.author || 'অপ্রকাশিত'} • বিভাগ: ${story.category || 'সাধারণ'}`;

      // 2. Fetch Chapters Collection
      const chaptersSnapshot = await db.collection("stories")
        .doc(this.storyId)
        .collection("chapters")
        .orderBy("chapterNumber", "asc")
        .get();

      if (chaptersSnapshot.empty) {
        // Fallback: If story content is directly inside main document
        if (story.content) {
          this.renderContent(story.title, story.content);
        } else {
          this.renderError("এই গল্পের কোনো অধ্যায় পাওয়া যায়নি।");
        }
        return;
      }

      // Load first chapter by default
      const firstChapter = chaptersSnapshot.docs[0].data();
      this.renderContent(firstChapter.title, firstChapter.content);

    } catch (error) {
      console.error("Error loading reading content:", error);
      this.renderError("কন্টেন্ট লোড করতে সমস্যা হয়েছে।");
    }
  }

  renderContent(chapterTitle, contentText) {
    const chapterTitleEl = document.getElementById("chapterTitle");
    const contentEl = document.getElementById("readerContent");

    if (chapterTitleEl) chapterTitleEl.textContent = chapterTitle || "";
    
    // Parse line breaks into paragraphs seamlessly
    const paragraphs = contentText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
    if (contentEl) contentEl.innerHTML = paragraphs;
  }

  bindEvents() {
    // Theme Switcher Logic
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const body = document.body;
        if (body.classList.contains("theme-night")) {
          body.classList.remove("theme-night");
          body.classList.add("theme-sepia");
          themeBtn.textContent = "Sepia";
        } else if (body.classList.contains("theme-sepia")) {
          body.classList.remove("theme-sepia");
          body.classList.add("theme-light");
          themeBtn.textContent = "Light";
        } else {
          body.classList.remove("theme-light");
          body.classList.add("theme-night");
          themeBtn.textContent = "Night";
        }
      });
    }

    // Font Resizing Logic
    const fontIncBtn = document.getElementById("fontIncreaseBtn");
    const fontDecBtn = document.getElementById("fontDecreaseBtn");

    if (fontIncBtn) {
      fontIncBtn.addEventListener("click", () => {
        if (this.currentFontSize < 1.6) {
          this.currentFontSize += 0.05;
          this.updateFontSize();
        }
      });
    }

    if (fontDecBtn) {
      fontDecBtn.addEventListener("click", () => {
        if (this.currentFontSize > 0.9) {
          this.currentFontSize -= 0.05;
          this.updateFontSize();
        }
      });
    }
  }

  updateFontSize() {
    const contentEl = document.getElementById("readerContent");
    if (contentEl) {
      contentEl.style.fontSize = `${this.currentFontSize}rem`;
    }
  }

  initProgressBar() {
    const progressBar = document.getElementById("readingProgressBar");
    if (!progressBar) return;

    window.addEventListener("scroll", () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = `${scrolled}%`;
    });
  }

  renderError(msg) {
    const contentEl = document.getElementById("readerContent");
    if (contentEl) {
      contentEl.innerHTML = `<p style="color: var(--color-danger); text-align: center;">${msg}</p>`;
    }
  }
}

// Global Initialization on Reader Page Load
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("reader-body")) {
    window.ReaderEngine = new StoryReaderEngine();
    window.ReaderEngine.init();
  }
});