// ===========================
// THEME TOGGLE
// ===========================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('uninest-theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('uninest-theme', next);
});

// ===========================
// HAMBURGER MENU
// ===========================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

// ===========================
// FILTER BUTTONS
// ===========================
const filterBtns = document.querySelectorAll('.filter-btn');
const listingCards = document.querySelectorAll('.listing-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    listingCards.forEach((card, i) => {
      const type = card.dataset.type;
      const show = filter === 'all' || type === filter;
      card.classList.toggle('hidden', !show);
      if (show) {
        card.style.animationDelay = `${i * 0.07}s`;
        card.style.animation = 'none';
        setTimeout(() => { card.style.animation = ''; }, 10);
      }
    });
  });
});

// ===========================
// QUICK FILTER PILLS
// ===========================
const qfPills = document.querySelectorAll('.qf-pill');
qfPills.forEach(pill => {
  pill.addEventListener('click', () => {
    qfPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const searchInput = document.getElementById('searchInput');
    searchInput.value = pill.textContent;
    searchInput.focus();
  });
});

// ===========================
// WISHLIST TOGGLE
// ===========================
const wishBtns = document.querySelectorAll('.card-wish');
wishBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = btn.classList.toggle('active');
    btn.textContent = isActive ? '♥' : '♡';
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
});

// ===========================
// MODAL
// ===========================
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

const viewBtns = document.querySelectorAll('.card-btn');
viewBtns.forEach((btn, i) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(i);
  });
});

listingCards.forEach((card, i) => {
  card.addEventListener('click', () => openModal(i));
});

function openModal(index) {
  const card = listingCards[index];
  if (!card) return;

  const title = card.querySelector('.card-title').textContent;
  const location = card.querySelector('.card-location').textContent;
  const price = card.querySelector('.card-price').innerHTML;
  const distance = card.querySelector('.card-distance').textContent;
  const imgBg = card.querySelector('.card-img-placeholder').style.background;
  const imgEmoji = card.querySelector('.card-img-placeholder span').textContent;

  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-location').textContent = `${location} — ${distance}`;
  document.querySelector('.modal-price').innerHTML = price;
  document.querySelector('.modal-img-placeholder').style.background = imgBg;
  document.querySelector('.modal-img-placeholder span').textContent = imgEmoji;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
  } else {
    navbar.style.boxShadow = '';
  }
});

// ===========================
// SMOOTH ACTIVE NAV LINK
// ===========================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => observer.observe(section));

// ===========================
// SEARCH BUTTON
// ===========================
document.querySelector('.search-btn').addEventListener('click', () => {
  const query = document.getElementById('searchInput').value.toLowerCase();
  if (!query) return;

  document.querySelector('#listings').scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    filterBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="all"]').classList.add('active');
    listingCards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.classList.toggle('hidden', !text.includes(query));
    });
  }, 600);
});

document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.querySelector('.search-btn').click();
});

// ===========================
// SCROLL REVEAL ANIMATION
// ===========================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step-card, .testimonial-card, .map-mock').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});

// ===========================
// LOAD MORE (MOCK)
// ===========================
document.querySelector('.load-more-wrap .btn').addEventListener('click', function () {
  this.textContent = 'Loading...';
  this.disabled = true;
  setTimeout(() => {
    this.textContent = 'No more listings';
    this.style.opacity = '0.5';
  }, 1200);
});