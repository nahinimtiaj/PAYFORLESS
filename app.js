// ============================================
// PAY FOR LESS — Core App Logic (Supabase version)
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  await DataStore.updateCartBadge();
  await DataStore.updateWishlistBadge();
  initNavigation();
  Utils.initScrollAnimations();
  Utils.initLazyLoad();
  initSearch();
  initTestimonialSlider();
  initHeroSlider();
  initNewsletterForm();
  initContactForm();
  await loadHomepageProducts();
});

// ============================================
// Homepage Product Sections — FIXED: uses Promise.all
// ============================================
async function loadHomepageProducts() {
  const featuredGrid = document.getElementById('featured-products');
  const newGrid      = document.getElementById('new-products');
  const bestGrid     = document.getElementById('bestseller-products');

  if (!featuredGrid && !newGrid && !bestGrid) return;

  [featuredGrid, newGrid, bestGrid].forEach(g => {
    if (g) g.innerHTML = '<div class="loading-products" style="padding:40px;text-align:center;color:#aaa">Loading...</div>';
  });

  const [featured, newArrivals, bestSellers] = await Promise.all([
    DataStore.getProducts({ featured: true }),
    DataStore.getProducts({ newArrival: true }),
    DataStore.getProducts({ bestSeller: true }),
  ]);

  if (featuredGrid) {
    if (featured.length) {
      // ✅ FIXED: await Promise.all so cards render as HTML not [object Promise]
      const cards = await Promise.all(featured.map(p => renderProductCard(p)));
      featuredGrid.innerHTML = cards.join('');
    } else {
      featuredGrid.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa">No featured products yet. Add some from the admin panel.</p>';
    }
  }

  if (newGrid) {
    if (newArrivals.length) {
      const cards = await Promise.all(newArrivals.map(p => renderProductCard(p)));
      newGrid.innerHTML = cards.join('');
    } else {
      newGrid.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa">No new arrivals yet.</p>';
    }
  }

  if (bestGrid) {
    if (bestSellers.length) {
      const cards = await Promise.all(bestSellers.map(p => renderProductCard(p)));
      bestGrid.innerHTML = cards.join('');
    } else {
      bestGrid.innerHTML = '<p style="padding:40px;text-align:center;color:#aaa">No best sellers yet.</p>';
    }
  }

  Utils.initScrollAnimations();
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
  const nav        = document.querySelector('.navbar');
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body       = document.body;

  if (nav) {
    window.addEventListener('scroll', Utils.throttle(() => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, 100));
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

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

  const cartToggle    = document.querySelector('.nav-cart-btn');
  const miniCartPanel = document.querySelector('.mini-cart-panel');
  if (cartToggle && miniCartPanel) {
    cartToggle.addEventListener('click', async (e) => {
      e.preventDefault();
      miniCartPanel.classList.toggle('active');
      await renderMiniCart();
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mini-cart-panel') && !e.target.closest('.nav-cart-btn')) {
        miniCartPanel.classList.remove('active');
      }
    });
  }
}

// ============================================
// Search
// ============================================
function initSearch() {
  const searchToggle  = document.querySelector('.nav-search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const searchInput   = document.querySelector('.search-input');
  const searchClose   = document.querySelector('.search-close');

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

// ============================================
// Hero Slider
// ============================================
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const slides = slider.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current = 0, interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = index % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }
  function next() { goTo(current + 1); }
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetInterval(); }));
  function resetInterval() { clearInterval(interval); interval = setInterval(next, 5000); }
  if (slides.length > 1) resetInterval();
}

// ============================================
// Testimonial Slider
// ============================================
function initTestimonialSlider() {
  const slider  = document.querySelector('.testimonial-track');
  if (!slider) return;
  const cards   = slider.querySelectorAll('.testimonial-card');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  let index = 0;

  function update() {
    const cardWidth = cards[0].offsetWidth + 24;
    slider.style.transform = `translateX(-${index * cardWidth}px)`;
  }
  if (nextBtn) nextBtn.addEventListener('click', () => { if (index < cards.length - 1) { index++; update(); } });
  if (prevBtn) prevBtn.addEventListener('click', () => { if (index > 0) { index--; update(); } });
}

// ============================================
// Newsletter Form
// ============================================
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value.trim();
    if (!Utils.isValidEmail(email)) { Utils.showToast('Please enter a valid email', 'error'); return; }
    try {
      await DataStore.subscribeNewsletter(email);
      Utils.showToast('Thank you for subscribing!');
      form.reset();
    } catch (err) {
      Utils.showToast('Something went wrong. Please try again.', 'error');
    }
  });
}

// ============================================
// Contact Form
// ============================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = form.querySelector('[name="name"]')?.value.trim() || '';
    const email   = form.querySelector('[name="email"]')?.value.trim() || '';
    const subject = form.querySelector('[name="subject"]')?.value.trim() || '';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';
    try {
      await DataStore.submitContact({ name, email, subject, message });
      Utils.showToast("Message sent! We'll get back to you soon.");
      form.reset();
    } catch (err) {
      Utils.showToast('Failed to send message. Please try again.', 'error');
    }
  });
}

// ============================================
// WhatsApp
// ============================================
function openWhatsApp() {
  window.open('https://wa.me/971562918675?text=Hello! I have a question about PAY FOR LESS products.', '_blank');
}
