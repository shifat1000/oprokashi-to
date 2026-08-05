import { 
  fetchStories, 
  createStory, 
  updateStory, 
  deleteStory, 
  uploadCoverImage 
} from './supabase.js';

const storyForm = document.getElementById('storyForm');
const storyIdInput = document.getElementById('storyId');
const storyTitleInput = document.getElementById('storyTitle');
const storyAuthorInput = document.getElementById('storyAuthor');
const storyCategorySelect = document.getElementById('storyCategory');
const storyCoverInput = document.getElementById('storyCover');
const storyContentInput = document.getElementById('storyContent');

const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formTitle = document.getElementById('formTitle');

const adminStoriesList = document.getElementById('adminStoriesList');
const adminSearchInput = document.getElementById('adminSearchInput');

let storiesCache = [];
let isEditing = false;
let currentExistingImageUrl = '';

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStories();
  setupEventListeners();
});

async function loadAdminStories() {
  try {
    storiesCache = await fetchStories();
    renderAdminStories(storiesCache);
  } catch (err) {
    console.error('Error loading stories:', err);
    adminStoriesList.innerHTML = `<p style="color: var(--accent); text-align: center;">ডাটা লোড করা যায়নি। Supabase RLS Policy চেক করুন।</p>`;
  }
}

function renderAdminStories(stories) {
  if (!stories || stories.length === 0) {
    adminStoriesList.innerHTML = `<p style="color: var(--text-muted); text-align: center;">কোনো গল্প প্রকাশ করা হয়নি।</p>`;
    return;
  }

  adminStoriesList.innerHTML = stories.map(story => {
    const formattedDate = story.created_at
      ? new Date(story.created_at).toLocaleDateString('bn-BD')
      : '';

    return `
      <div style="background: rgba(15, 23, 42, 0.6); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${escapeHtml(story.title || 'শিরোনামহীন')}</h4>
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            ✍️ ${escapeHtml(story.author || 'অপ্রকাশিত')} | 📁 ${escapeHtml(story.category || 'অন্যান্য')} | 📅 ${formattedDate}
          </span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="handleEdit('${story.id}')">Edit</button>
          <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="handleDelete('${story.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

storyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = storyTitleInput.value.trim();
  const author = storyAuthorInput.value.trim();
  const category = storyCategorySelect.value;
  const content = storyContentInput.value.trim();
  const coverFile = storyCoverInput.files[0];

  submitBtn.innerText = 'সেভ হচ্ছে...';
  submitBtn.disabled = true;

  try {
    let imageUrl = currentExistingImageUrl;

    if (coverFile) {
      imageUrl = await uploadCoverImage(coverFile);
    }

    const payload = { title, author, category, content, image_url: imageUrl };

    if (isEditing) {
      await updateStory(storyIdInput.value, payload);
      alert('গল্প আপডেট হয়েছে!');
    } else {
      await createStory(payload);
      alert('নতুন গল্প পোস্ট হয়েছে!');
    }

    resetForm();
    loadAdminStories();

  } catch (err) {
    console.error('Save Error:', err);
    alert('সেভ করা সম্ভব হয়নি: ' + (err.message || 'ত্রুটি'));
  } finally {
    submitBtn.innerText = isEditing ? 'আপডেট করুন' : 'গল্প পাবলিশ করুন';
    submitBtn.disabled = false;
  }
});

window.handleEdit = function(id) {
  const story = storiesCache.find(s => s.id === id);
  if (!story) return;

  isEditing = true;
  currentExistingImageUrl = story.image_url || '';

  storyIdInput.value = story.id;
  storyTitleInput.value = story.title || '';
  storyAuthorInput.value = story.author || '';
  storyCategorySelect.value = story.category || 'অন্যান্য';
  storyContentInput.value = story.content || '';

  formTitle.innerText = 'গল্প সম্পাদনা করুন';
  submitBtn.innerText = 'আপডেট করুন';
  cancelEditBtn.style.display = 'inline-block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.handleDelete = async function(id) {
  if (!confirm('আপনি কি নিশ্চিত মুছে ফেলতে চান?')) return;

  try {
    await deleteStory(id);
    alert('গল্প মুছে ফেলা হয়েছে!');
    loadAdminStories();
  } catch (err) {
    console.error('Delete Error:', err);
    alert('মুছে ফেলা সম্ভব হয়নি!');
  }
};

function resetForm() {
  isEditing = false;
  currentExistingImageUrl = '';
  storyIdInput.value = '';
  storyForm.reset();

  formTitle.innerText = 'নতুন গল্প প্রকাশ করুন';
  submitBtn.innerText = 'গল্প পাবলিশ করুন';
  cancelEditBtn.style.display = 'none';
}

function setupEventListeners() {
  cancelEditBtn.addEventListener('click', resetForm);

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const filtered = storiesCache.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.author && s.author.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
      renderAdminStories(filtered);
    });
  }
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