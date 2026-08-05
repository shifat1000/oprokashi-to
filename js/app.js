/* ==========================================================================
   অপ্রকাশিত V2 — Application Main Logic (Homepage & Filters)
   ========================================================================== */

import { fetchStories, fetchTrendingStories } from './supabase.js';

// DOM Elements
const storiesGrid = document.getElementById('storiesGrid');
const trendingGrid = document.getElementById('trendingGrid');
const trendingSection = document.getElementById('trendingSection');
const searchInput = document.getElementById('searchInput');
const categoryContainer = document.getElementById('categoryContainer');
const storiesTitle = document.getElementById('storiesTitle');

// State Management
let currentCategory = 'সব';
let searchQuery = '';
let searchDebounceTimer = null;

/* ==========================================================================
   1. Initial Load
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadStories();
  loadTrending();
  setupEventListeners();
});

/* ==========================================================================
   2. Fetch and Render All Stories
   ========================================================================== */
async function loadStories() {
  showLoading();

  try {
    const stories = await fetchStories({
      search: searchQuery,
      category: currentCategory
    });

    renderStories(stories);
  } catch (error) {
    console.error('Error loading stories:', error);
    storiesGrid.innerHTML = `
      <p style="color: var(--accent); grid-column: 1/-1; text-align: center;">
        গল্প লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।
      </p>
    `;
  }
}

/* ==========================================================================
   3. Fetch and Render Trending Stories
   ========================================================================== */
async function loadTrending() {
  if (!trendingGrid) return;

  try {
    const trending = await fetchTrendingStories(3);
    
    if (trending && trending.length > 0) {
      trendingSection.style.display = 'block';
      trendingGrid.innerHTML = trending.map(story => createStoryCardHtml(story)).join('');
    } else {
      trendingSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading trending stories:', error);
    trendingSection.style.display = 'none';
  }
}

/* ==========================================================================
   4. UI Render Helpers
   ========================================================================== */
function renderStories(stories) {
  if (!stories || stories.length === 0) {
    storiesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
        <p style="color: var(--text-muted); font-size: 1.1rem;">কোনো গল্প পাওয়া যায়নি।</p>
      </div>
    `;
    return;
  }

  storiesGrid.innerHTML = stories.map(story => createStoryCardHtml(story)).join('');
}

function createStoryCardHtml(story) {
  // তারিখ ফর্ম্যাট
  const formattedDate = story.created_at
    ? new Date(story.created_at).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // কভার ইমেজ বা ডিফল্ট প্লেসহোল্ডার
  const coverImg = story.image_url 
    ? story.image_url 
    : 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80';

  // এক্সারপ্ট / সংক্ষিপ্ত অংশ
  const excerpt = story.content
    ? story.content.substring(0, 120) + (story.content.length > 120 ? '...' : '')
    : '';

  return `
    <a href="story.html?id=${story.id}" class="story-card">
      <div class="card-image-wrapper">
        <img src="${escapeHtml(coverImg)}" alt="${escapeHtml(story.title || 'গল্প')}" loading="lazy">
      </div>
      <div class="card-body">
        <span class="card-badge">${escapeHtml(story.category || 'অন্যান্য')}</span>
        <h3 class="card-title">${escapeHtml(story.title || 'শিরোনামহীন গল্প')}</h3>
        <p class="card-excerpt">${escapeHtml(excerpt)}</p>
        <div class="card-footer">
          <span>✍️ ${escapeHtml(story.author || 'অপ্রকাশিত লেখক')}</span>
          <span>📅 ${formattedDate}</span>
        </div>
      </div>
    </a>
  `;
}

function showLoading() {
  storiesGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
      <p style="color: var(--text-muted);">গল্প লোড করা হচ্ছে...</p>
    </div>
  `;
}

// XSS Prevention Utility
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   5. Event Listeners (Search & Category Filters)
   ========================================================================== */
function setupEventListeners() {
  // Category Pills Click Event
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;

      // Active state toggle
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.getAttribute('data-category') || 'সব';
      
      // Update Title
      if (storiesTitle) {
        storiesTitle.innerText = currentCategory === 'সব' 
          ? 'সর্বশেষ গল্পসমূহ' 
          : `${currentCategory} গল্পসমূহ`;
      }

      loadStories();
    });
  }

  // Real-time Search Input Event (with 400ms Debounce)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchQuery = e.target.value.trim();

      searchDebounceTimer = setTimeout(() => {
        loadStories();
      }, 400);
    });
  }
}