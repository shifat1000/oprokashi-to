/**
 * OPROKASHI — Virtual Bookshelf Manager (Part 03)
 * Fetches stories from Firestore & renders dynamic 3D bookshelves
 */

class BookshelfManager {
  constructor() {
    this.container = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Bookshelf container #${containerId} not found.`);
      return;
    }
    this.loadLibraryContent();
  }

  async loadLibraryContent() {
    try {
      this.renderLoadingState();
      
      const db = window.OprokashiDB.DB;
      const snapshot = await db.collection("stories")
        .where("status", "==", "published")
        .orderBy("createdAt", "desc")
        .get();

      if (snapshot.empty) {
        this.renderEmptyState();
        return;
      }

      const stories = [];
      snapshot.forEach(doc => stories.push({ id: doc.id, ...doc.data() }));

      // Group Stories by Category / Bookshelf
      const categoriesMap = stories.reduce((acc, story) => {
        const cat = story.category || "সাধারণ সেলফ";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(story);
        return acc;
      }, {});

      this.renderShelves(categoriesMap);
    } catch (error) {
      console.error("Error rendering 3D bookshelf:", error);
      this.renderErrorState(error.message);
    }
  }

  renderShelves(categoriesMap) {
    this.container.innerHTML = "";

    Object.keys(categoriesMap).forEach(categoryName => {
      const storyList = categoriesMap[categoryName];

      const shelfRow = document.createElement("section");
      shelfRow.className = "bookshelf-row";

      shelfRow.innerHTML = `
        <div class="shelf-header">
          <div class="shelf-title-group">
            <span class="shelf-icon">📖</span>
            <h2 class="shelf-title">${categoryName}</h2>
          </div>
          <span class="shelf-badge">${storyList.length} টি বই</span>
        </div>

        <div class="books-scroll-grid">
          ${storyList.map(story => this.createBook3DCard(story)).join("")}
        </div>

        <div class="bookshelf-plank"></div>
      `;

      this.container.appendChild(shelfRow);
    });
  }

  createBook3DCard(story) {
    const coverImage = story.coverUrl || 'assets/images/default-cover.jpg';
    
    return `
      <div class="book-3d" onclick="BookshelfManager.openBook('${story.id}')" title="${story.title}">
        <div class="book-spine-3d"></div>
        <div class="book-pages-3d"></div>
        <div class="book-cover-front" style="background-image: url('${coverImage}');">
          <div class="book-cover-overlay">
            <h3 class="book-title">${story.title}</h3>
            <span class="book-author">${story.author || 'অপ্রকাশিত লেখক'}</span>
          </div>
        </div>
      </div>
    `;
  }

  static openBook(storyId) {
    // Navigate smoothly to the interactive story reader
    window.location.href = `story.html?id=${storyId}`;
  }

  renderLoadingState() {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <p style="font-family: var(--font-bengali); font-size: 1.2rem;">লাইব্রেরির বইগুলো সাজানো হচ্ছে...</p>
      </div>
    `;
  }

  renderEmptyState() {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; background: rgba(30,41,59,0.3); border-radius: 20px; border: 1px solid var(--border-glass);">
        <h2 style="color: var(--color-primary); font-family: var(--font-bengali); margin-bottom: 10px;">লাইব্রেরিতে বর্তমানে কোনো বই নেই</h2>
        <p style="color: var(--text-secondary); font-family: var(--font-bengali);">অ্যাডমিন প্যানেল থেকে নতুন গল্প বা বই যুক্ত করুন।</p>
      </div>
    `;
  }

  renderErrorState(errMsg) {
    this.container.innerHTML = `
      <div style="text-align: center; padding: 50px; color: var(--color-danger);">
        <p>বুকশেলফ লোড করতে সমস্যা হয়েছে: ${errMsg}</p>
      </div>
    `;
  }
}

window.BookshelfEngine = new BookshelfManager();