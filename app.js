// ============================================
// MAISON Fashion — Core App Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initProducts();
  DataStore.updateCartBadge();
  DataStore.updateWishlistBadge();
  initNavigation();
  Utils.initScrollAnimations();
  Utils.initLazyLoad();
  initSearch();
  initTestimonialSlider();
  initHeroSlider();
  initNewsletterForm();
});

// ---- Navigation ----
function initNavigation() {
  const nav = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  // Scroll effect
  if (nav) {
    window.addEventListener('scroll', Utils.throttle(() => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, 100));
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  // Hamburger
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      body.classList.toggle('menu-open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        body.classList.remove('menu-open');
      });
    });
  }

  // Mini cart toggle
  const cartToggle = document.querySelector('.nav-cart-btn');
  const miniCartPanel = document.querySelector('.mini-cart-panel');
  if (cartToggle && miniCartPanel) {
    cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      miniCartPanel.classList.toggle('active');
      renderMiniCart();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mini-cart-panel') && !e.target.closest('.nav-cart-btn')) {
        miniCartPanel.classList.remove('active');
      }
    });
  }
}

// ---- Search ----
function initSearch() {
  const searchToggle = document.querySelector('.nav-search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput = document.querySelector('.search-input');
  const searchClose = document.querySelector('.search-close');

  if (searchToggle && searchOverlay) {
    searchToggle.addEventListener('click', (e) => {
      e.preventDefault();
      searchOverlay.classList.add('active');
      if (searchInput) searchInput.focus();
    });
  }
  if (searchClose && searchOverlay) {
    searchClose.addEventListener('click', () => searchOverlay.classList.remove('active'));
  }
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) searchOverlay.classList.remove('active');
    });
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
      if (e.key === 'Escape') searchOverlay.classList.remove('active');
    });
  }
}

// ---- Hero Slider ----
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const slides = slider.querySelectorAll('.hero-slide');
  const dots = slider.querySelectorAll('.hero-dot');
  let current = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = index % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetInterval(); });
  });

  function resetInterval() {
    clearInterval(interval);
    interval = setInterval(next, 5000);
  }

  if (slides.length > 1) resetInterval();
}

// ---- Testimonial Slider ----
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-track');
  if (!slider) return;
  const cards = slider.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  let index = 0;

  function update() {
    const cardWidth = cards[0].offsetWidth + 24;
    slider.style.transform = `translateX(-${index * cardWidth}px)`;
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (index < cards.length - 1) { index++; update(); }
  });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (index > 0) { index--; update(); }
  });
}

// ---- Newsletter ----
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (Utils.isValidEmail(email)) {
        Utils.showToast('Thank you for subscribing!');
        form.reset();
      } else {
        Utils.showToast('Please enter a valid email', 'error');
      }
    });
  }
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      Utils.showToast('Message sent! We\'ll get back to you soon.');
      form.reset();
    });
  }
}

// ---- WhatsApp Button ----
function openWhatsApp() {
  window.open('https://wa.me/1234567890?text=Hello! I have a question about MAISON products.', '_blank');
}
