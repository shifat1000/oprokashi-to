/* Animated Cyber Particle Canvas Background */
const canvas = document.getElementById('bgCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for(let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if(p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if(p.y < 0 || p.y > canvas.height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* Firebase Configuration */
const firebaseConfig = {
  apiKey: "AIzaSyAliz-F-qzpblysGFB4Yephlo4hVPz_7Z0",
  authDomain: "oprokashi-to.firebaseapp.com",
  projectId: "oprokashi-to",
  storageBucket: "oprokashi-to.firebasestorage.app",
  messagingSenderId: "739451365790",
  appId: "1:739451365790:web:1989b3da7ca6a1eab8be8f",
  measurementId: "G-B6JZ36V59E"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let allStories = [];
let activeCategory = 'সব';

document.addEventListener("DOMContentLoaded", () => {
  fetchStories();
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterAndRenderStories);
  }

  document.querySelectorAll('.cat-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.getAttribute('data-category');
      filterAndRenderStories();
    });
  });
});

function fetchStories() {
  db.collection("stories").orderBy("createdAt", "desc").get().then((querySnapshot) => {
    allStories = [];
    querySnapshot.forEach((doc) => {
      allStories.push({ id: doc.id, ...doc.data() });
    });
    filterAndRenderStories();
  }).catch(error => {
    console.error("গল্প লোড করতে সমস্যা হয়েছে:", error);
  });
}

function filterAndRenderStories() {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const grid = document.getElementById('storiesGrid');
  if (!grid) return;
  
  grid.innerHTML = '';

  const filtered = allStories.filter(story => {
    const matchesCategory = (activeCategory === 'সব') || (story.category === activeCategory);
    const matchesSearch = (story.title && story.title.toLowerCase().includes(searchQuery)) || 
                          (story.author && story.author.toLowerCase().includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:var(--text-muted);">কোনো গল্প পাওয়া যায়নি।</p>';
    return;
  }

  filtered.forEach(story => {
    const totalRating = story.totalRating || 0;
    const ratingCount = story.ratingCount || 0;
    const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0";

    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <div>
        <h3 class="story-title">${escapeHtml(story.title)}</h3>
        <div class="story-author">✍️ ${escapeHtml(story.author || 'অপ্রকাশিত')}</div>
        <div class="story-excerpt">${escapeHtml(story.content)}</div>
      </div>

      <div>
        <div class="rating-container">
          ${[1,2,3,4,5].map(star => `
            <span class="star-btn ${star <= Math.round(avgRating) ? 'active' : ''}" 
                  onclick="rateStory('${story.id}', ${star})">★</span>
          `).join('')}
          <span class="rating-score">(${avgRating} / ${ratingCount} ভোট)</span>
        </div>

        <div class="story-meta">
          <span class="category-badge">${escapeHtml(story.category || 'সাধারণ')}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function rateStory(id, star) {
  const storyRef = db.collection("stories").doc(id);
  db.runTransaction((transaction) => {
    return transaction.get(storyRef).then((doc) => {
      if (!doc.exists) return;
      const newTotal = (doc.data().totalRating || 0) + star;
      const newCount = (doc.data().ratingCount || 0) + 1;
      transaction.update(storyRef, { totalRating: newTotal, ratingCount: newCount });
    });
  }).then(() => {
    alert("আপনার রেটিং যুক্ত হয়েছে, ধন্যবাদ!");
    fetchStories();
  }).catch(error => {
    console.error("রেটিং আপডেট করা যায়নি:", error);
  });
}

function openModal(id) { 
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex'; 
}

function closeModal(id) { 
  const el = document.getElementById(id);
  if (el) el.style.display = 'none'; 
}

function escapeHtml(text) { 
  return text ? text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ''; 
}