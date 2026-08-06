import { fetchStories } from './supabase.js';

const storiesGrid = document.getElementById('storiesGrid');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const storyModal = document.getElementById('storyModal');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-btn');

let allStories = [];
let currentCategory = 'সব';

document.addEventListener('DOMContentLoaded', () => {
  loadMainStories();
  setupEvents();
});

async function loadMainStories() {
  try {
    allStories = await fetchStories();
    renderStories(allStories);
  } catch (err) {
    console.error('Error loading stories:', err);
    storiesGrid.innerHTML = `<p style="color: var(--accent); text-align: center; grid-column: 1/-1;">গল্পসমূহ লোড করা সম্ভব হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।</p>`;
  }
}

function renderStories(stories) {
  if (!stories || stories.length === 0) {
    storiesGrid.innerHTML = `<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">কোনো গল্প পাওয়া যায়নি।</p>`;
    return;
  }

  storiesGrid.innerHTML = stories.map(story => {
    const formattedDate = story.created_at
      ? new Date(story.created_at).toLocaleDateString('bn-BD')
      : '';
    const defaultCover = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=800&auto=format&fit=crop';
    const coverUrl = story.image_url || defaultCover;
    const shortContent = story.content ? story.content.substring(0, 120) + '...' : '';

    return `
      <div class="story-card" onclick="openStoryModal('${story.id}')">
        <div class="story-cover-wrapper">
          <img src="${coverUrl}" alt="${escapeHtml(story.title)}" class="story-cover" onerror="this.src='${defaultCover}'">
          <span class="story-badge">${escapeHtml(story.category || 'অন্যান্য')}</span>
        </div>
        <div class="story-details">
          <h3 class="story-title">${escapeHtml(story.title || 'শিরোনামহীন')}</h3>
          <div class="story-meta">
            ✍️ ${escapeHtml(story.author || 'অপ্রকাশিত')} | 📅 ${formattedDate}
          </div>
          <p class="story-excerpt">${escapeHtml(shortContent)}</p>
          <button class="read-more-btn">পড়ুন →</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterAndSearch() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = allStories.filter(story => {
    const matchesCategory = (currentCategory === 'সব') || (story.category === currentCategory);
    const matchesQuery = (
      (story.title && story.title.toLowerCase().includes(query)) ||
      (story.author && story.author.toLowerCase().includes(query)) ||
      (story.content && story.content.toLowerCase().includes(query))
    );
    return matchesCategory && matchesQuery;
  });

  renderStories(filtered);
}

window.openStoryModal = function(id) {
  const story = allStories.find(s => s.id === id);
  if (!story) return;

  const formattedDate = story.created_at
    ? new Date(story.created_at).toLocaleDateString('bn-BD')
    : '';

  modalBody.innerHTML = `
    ${story.image_url ? `<img src="${story.image_url}" style="width: 100%; max-height: 350px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem;">` : ''}
    <span class="story-badge" style="position: relative; top: 0; left: 0; display: inline-block; margin-bottom: 0.5rem;">${escapeHtml(story.category || 'অন্যান্য')}</span>
    <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${escapeHtml(story.title)}</h2>
    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">✍️ ${escapeHtml(story.author)} &nbsp;|&nbsp; 📅 ${formattedDate}</p>
    <hr style="border: 0; border-top: 1px solid var(--border-color); margin-bottom: 1.5rem;">
    <div style="font-size: 1.1rem; line-height: 1.8; white-space: pre-wrap; color: #e2e8f0;">${escapeHtml(story.content)}</div>
  `;

  storyModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
};

function setupEvents() {
  searchInput.addEventListener('input', filterAndSearch);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      filterAndSearch();
    });
  });

  closeBtn.addEventListener('click', () => {
    storyModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });

  window.addEventListener('click', (e) => {
    if (e.target === storyModal) {
      storyModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}