const firebaseConfig = {
  apiKey: "AIzaSyAliz-F-qzpblysGFB4Yephlo4hVPz_7Z0",
  authDomain: "oprokashi-to.firebaseapp.com",
  projectId: "oprokashi-to",
  storageBucket: "oprokashi-to.firebasestorage.app",
  messagingSenderId: "739451365790",
  appId: "1:739451365790:web:1989b3da7ca6a1eab8be8f",
  measurementId: "G-B6JZ36V59E"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let libraryState = {
  stories: [],
  banners: [],
  settings: {},
  audioActive: false,
  weatherActive: false,
  forcedTimeMode: null
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchSystemSettings();
  await loadHeroBanners();
  await loadLibraryStories();
  setupTimeSystem();
  initWeatherCanvas();
});

async function fetchSystemSettings() {
  try {
    const doc = await db.collection("settings").doc("site_info").get();
    if (doc.exists) {
      libraryState.settings = doc.data();
      if (libraryState.settings.siteName) {
        const brandEl = document.getElementById('siteNameDisplay');
        if (brandEl) brandEl.innerText = libraryState.settings.siteName;
      }
    }
  } catch (e) {
    console.error("Error fetching settings:", e);
  }
}

async function loadHeroBanners() {
  try {
    const snapshot = await db.collection("banners").where("enabled", "==", true).get();
    const container = document.getElementById('heroSlider');
    if (!container) return;
    if (snapshot.empty) {
      container.style.display = 'none';
      return;
    }
    container.innerHTML = '';
    let index = 0;
    snapshot.forEach(doc => {
      const b = doc.data();
      const slide = document.createElement('div');
      slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
      slide.style.backgroundImage = `url('${b.imageUrl || 'images/background.jpg'}')`;
      slide.innerHTML = `
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">${b.title}</h1>
          <p class="hero-subtitle">${b.subtitle || ''}</p>
          <button class="btn-gold" onclick="triggerBookOpen('${b.storyId}', event)">পড়া শুরু করুন</button>
        </div>
      `;
      container.appendChild(slide);
      index++;
    });
  } catch (e) {
    console.error("Error loading banners:", e);
  }
}

async function loadLibraryStories() {
  try {
    const snapshot = await db.collection("stories").orderBy("createdAt", "desc").get();
    libraryState.stories = [];
    snapshot.forEach(doc => libraryState.stories.push({ id: doc.id, ...doc.data() }));

    const shelfContainer = document.getElementById('bookshelfShelvesContainer');
    if (!shelfContainer) return;
    shelfContainer.innerHTML = '';

    if (libraryState.stories.length === 0) {
      shelfContainer.innerHTML = '<p style="text-align:center; padding:50px; color:var(--text-secondary);">কোনো বই পাওয়া যায়নি। এডমিন প্যানেল থেকে নতুন বই যোগ করুন।</p>';
      return;
    }

    const categories = [...new Set(libraryState.stories.map(s => s.category || 'অন্যান্য'))];

    categories.forEach(cat => {
      const filtered = libraryState.stories.filter(s => (s.category || 'অন্যান্য') === cat);
      const section = document.createElement('section');
      section.className = 'shelf-container';
      section.innerHTML = `
        <div class="shelf-title">
          <span>📖 ${cat} Shelf</span>
          <small style="font-size: 0.8rem; color: var(--text-secondary);">${filtered.length} টি বই</small>
        </div>
        <div class="bookshelf">
          ${filtered.map(story => `
            <div class="book-card" onclick="triggerBookOpen('${story.id}', event)">
              <div class="book-spine"></div>
              <div class="book-cover" style="background-image: url('${story.coverUrl || 'images/background.jpg'}');"></div>
              <div class="book-pages"></div>
            </div>
          `).join('')}
        </div>
      `;
      shelfContainer.appendChild(section);
    });
  } catch (e) {
    console.error("Error loading stories:", e);
  }
}

function triggerBookOpen(storyId, event) {
  const targetX = event ? event.clientX : window.innerWidth / 2;
  if (window.librarianInstance) {
    window.librarianInstance.fetchBookForUser(targetX, () => {
      window.location.href = `story.html?id=${storyId}`;
    });
  } else {
    window.location.href = `story.html?id=${storyId}`;
  }
}

function setupTimeSystem() {
  const overlay = document.getElementById('timeOverlay');
  if (!overlay) return;
  const hour = new Date().getHours();
  overlay.className = 'time-overlay';

  const mode = libraryState.forcedTimeMode || (
    hour >= 5 && hour < 12 ? 'morning' :
    hour >= 12 && hour < 17 ? 'afternoon' :
    hour >= 17 && hour < 20 ? 'evening' : 'night'
  );

  overlay.classList.add(`time-${mode}`);
}

function cycleTimeMode() {
  const modes = ['morning', 'afternoon', 'evening', 'night'];
  let current = modes.indexOf(libraryState.forcedTimeMode) + 1;
  libraryState.forcedTimeMode = modes[current % modes.length];
  setupTimeSystem();
}

function toggleAudioEngine() {
  const audio = document.getElementById('ambientAudioLoop');
  if (!audio) return;
  if (libraryState.audioActive) {
    audio.pause();
    libraryState.audioActive = false;
  } else {
    audio.play().catch(() => {});
    libraryState.audioActive = true;
  }
}

function initWeatherCanvas() {
  const canvas = document.getElementById('weatherCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 4 + 2,
      length: Math.random() * 15 + 10
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (libraryState.weatherActive) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.length);
        ctx.stroke();
        p.y += p.speed;
        if (p.y > canvas.height) p.y = 0;
      });
    }
    requestAnimationFrame(render);
  }
  render();
}

function toggleWeatherEngine() {
  libraryState.weatherActive = !libraryState.weatherActive;
}

function handleLiveSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const cards = document.querySelectorAll('.book-card');
  libraryState.stories.forEach((story, idx) => {
    const match = story.title.toLowerCase().includes(query) || (story.author && story.author.toLowerCase().includes(query));
    if (cards[idx]) {
      cards[idx].style.display = match ? 'block' : 'none';
    }
  });
}