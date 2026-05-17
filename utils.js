// ============================================
// MAISON Fashion — Utility Functions
// ============================================

const Utils = {
  // Format price to currency string
  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  },

  // Generate unique ID
  generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Generate order number
  generateOrderNumber() {
    const prefix = 'MSN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },

  // Short date format
  formatShortDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Debounce function
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Validate email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone
  isValidPhone(phone) {
    const re = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return re.test(phone);
  },

  // Sanitize HTML
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Truncate text
  truncate(str, length = 100) {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + '...';
  },

  // Smooth scroll to element
  scrollTo(selector, offset = 80) {
    const el = document.querySelector(selector);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },

  // Get URL parameters
  getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  // Set URL parameter without reload
  setParam(name, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(name, value);
    } else {
      url.searchParams.delete(name);
    }
    window.history.pushState({}, '', url);
  },

  // Show toast notification
  showToast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Lazy load images using Intersection Observer
  initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });
      images.forEach(img => observer.observe(img));
    } else {
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  },

  // Animate elements on scroll
  initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      elements.forEach(el => observer.observe(el));
    } else {
      elements.forEach(el => el.classList.add('animated'));
    }
  },

  // Slug from string
  slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  },

  // Parse slug to readable
  unslugify(str) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
};
