// ============================================
// MAISON Fashion — Product Data & Logic
// ============================================

const DEFAULT_PRODUCTS = [
  {
    id: 'p1', name: 'Classic Noir Overcoat', category: 'outerwear', price: 389,
    description: 'A timeless black overcoat crafted from premium Italian wool blend. Features a refined silhouette with notched lapels and a single-breasted closure.',
    fabric: '80% Wool, 20% Cashmere', sizes: ['XS','S','M','L','XL'],
    colors: [{name:'Black',hex:'#1a1a1a'},{name:'Charcoal',hex:'#3d3d3d'},{name:'Navy',hex:'#1c2841'}],
    images: ['hero-1.png'], badge: 'Best Seller', rating: 4.8, reviews: 124,
    featured: true, bestSeller: true, newArrival: false
  },
  {
    id: 'p2', name: 'Silk Drape Midi Dress', category: 'dresses', price: 275,
    description: 'Elegant flowing midi dress in luxurious silk. Features a draped neckline and a relaxed yet refined fit.',
    fabric: '100% Mulberry Silk', sizes: ['XS','S','M','L'],
    colors: [{name:'Cream',hex:'#f5f0e8'},{name:'Blush',hex:'#e8c4b8'},{name:'Black',hex:'#1a1a1a'}],
    images: ['hero-2.png'], badge: 'New', rating: 4.9, reviews: 87,
    featured: true, bestSeller: false, newArrival: true
  },
  {
    id: 'p3', name: 'Premium Leather Jacket', category: 'outerwear', price: 495,
    description: 'Hand-stitched leather jacket made from full-grain lambskin. Buttery soft with a modern slim fit.',
    fabric: '100% Lambskin Leather', sizes: ['S','M','L','XL'],
    colors: [{name:'Black',hex:'#1a1a1a'},{name:'Brown',hex:'#5c3a21'}],
    images: ['product-jacket.png'], badge: 'Premium', rating: 4.9, reviews: 203,
    featured: true, bestSeller: true, newArrival: false
  },
  {
    id: 'p4', name: 'Merino Wool Sweater', category: 'tops', price: 165,
    description: 'Ultra-soft merino wool crew neck sweater. Lightweight warmth with a clean minimal aesthetic.',
    fabric: '100% Extra Fine Merino Wool', sizes: ['XS','S','M','L','XL'],
    colors: [{name:'Ivory',hex:'#f0ead6'},{name:'Grey',hex:'#8a8a8a'},{name:'Black',hex:'#1a1a1a'}],
    images: ['hero-1.png'], badge: '', rating: 4.7, reviews: 156,
    featured: true, bestSeller: true, newArrival: false
  },
  {
    id: 'p5', name: 'Tailored Slim Trousers', category: 'pants', price: 195,
    description: 'Perfectly tailored slim-fit trousers with a modern tapered leg. Designed for effortless sophistication.',
    fabric: '98% Cotton, 2% Elastane', sizes: ['28','30','32','34','36'],
    colors: [{name:'Black',hex:'#1a1a1a'},{name:'Charcoal',hex:'#3d3d3d'},{name:'Beige',hex:'#c8b89a'}],
    images: ['hero-2.png'], badge: '', rating: 4.6, reviews: 98,
    featured: false, bestSeller: false, newArrival: true
  },
  {
    id: 'p6', name: 'Linen Relaxed Shirt', category: 'tops', price: 145,
    description: 'Breathable linen shirt with a relaxed fit. Perfect for warm-weather layering with an effortless drape.',
    fabric: '100% French Linen', sizes: ['XS','S','M','L','XL'],
    colors: [{name:'White',hex:'#ffffff'},{name:'Sand',hex:'#c2b280'},{name:'Sage',hex:'#9caf88'}],
    images: ['product-jacket.png'], badge: 'New', rating: 4.5, reviews: 64,
    featured: false, bestSeller: false, newArrival: true
  },
  {
    id: 'p7', name: 'Cashmere Blend Scarf', category: 'accessories', price: 120,
    description: 'Luxuriously soft cashmere blend scarf. An essential accessory that elevates any ensemble.',
    fabric: '70% Cashmere, 30% Silk', sizes: ['One Size'],
    colors: [{name:'Camel',hex:'#c19a6b'},{name:'Grey',hex:'#8a8a8a'},{name:'Black',hex:'#1a1a1a'}],
    images: ['/hero-1.png'], badge: '', rating: 4.8, reviews: 73,
    featured: true, bestSeller: false, newArrival: true
  },
  {
    id: 'p8', name: 'Structured Blazer', category: 'outerwear', price: 345,
    description: 'Impeccably structured double-breasted blazer. A wardrobe cornerstone for both formal and casual styling.',
    fabric: '95% Virgin Wool, 5% Elastane', sizes: ['XS','S','M','L','XL'],
    colors: [{name:'Black',hex:'#1a1a1a'},{name:'Navy',hex:'#1c2841'}],
    images: ['hero-2.png'], badge: 'Best Seller', rating: 4.7, reviews: 189,
    featured: true, bestSeller: true, newArrival: false
  },
  {
    id: 'p9', name: 'Essential Cotton Tee', category: 'tops', price: 65,
    description: 'Premium heavyweight cotton t-shirt with a boxy fit. The foundation of minimal everyday style.',
    fabric: '100% Organic Cotton, 280gsm', sizes: ['XS','S','M','L','XL','XXL'],
    colors: [{name:'White',hex:'#ffffff'},{name:'Black',hex:'#1a1a1a'},{name:'Grey',hex:'#8a8a8a'}],
    images: ['product-jacket.png'], badge: '', rating: 4.6, reviews: 312,
    featured: false, bestSeller: true, newArrival: false
  },
  {
    id: 'p10', name: 'Wide Leg Palazzo Pants', category: 'pants', price: 225,
    description: 'Flowing wide-leg pants in a luxurious drape fabric. Statement-making silhouette with effortless elegance.',
    fabric: '70% Triacetate, 30% Polyester', sizes: ['XS','S','M','L'],
    colors: [{name:'Black',hex:'#1a1a1a'},{name:'Cream',hex:'#f5f0e8'}],
    images: ['hero-1.png'], badge: 'New', rating: 4.5, reviews: 45,
    featured: false, bestSeller: false, newArrival: true
  },
  {
    id: 'p11', name: 'Leather Belt', category: 'accessories', price: 85,
    description: 'Full-grain leather belt with a brushed silver buckle. Minimalist design, maximum impact.',
    fabric: '100% Full-Grain Leather', sizes: ['S','M','L'],
    colors: [{name:'Black',hex:'#1a1a1a'},{name:'Brown',hex:'#5c3a21'}],
    images: ['hero-2.png'], badge: '', rating: 4.7, reviews: 156,
    featured: false, bestSeller: true, newArrival: false
  },
  {
    id: 'p12', name: 'Satin Evening Gown', category: 'dresses', price: 520,
    description: 'Showstopping satin gown with a cowl neckline and open back. Designed for unforgettable evenings.',
    fabric: '100% Silk Satin', sizes: ['XS','S','M','L'],
    colors: [{name:'Champagne',hex:'#f7e7ce'},{name:'Black',hex:'#1a1a1a'}],
    images: ['product-jacket.png'], badge: 'Premium', rating: 4.9, reviews: 67,
    featured: true, bestSeller: false, newArrival: true
  }
];

// Initialize products in storage if not present
function initProducts() {
  const stored = DataStore.getProducts();
  if (!stored || stored.length === 0) {
    DataStore.saveProducts(DEFAULT_PRODUCTS);
  }
}

// Get filtered and sorted products
function getFilteredProducts(filters = {}) {
  let products = DataStore.getProducts();
  if (filters.category && filters.category !== 'all') {
    products = products.filter(p => p.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (filters.minPrice !== undefined) {
    products = products.filter(p => p.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter(p => p.price <= filters.maxPrice);
  }
  if (filters.color) {
    products = products.filter(p => p.colors.some(c => c.name.toLowerCase() === filters.color.toLowerCase()));
  }
  if (filters.size) {
    products = products.filter(p => p.sizes.includes(filters.size));
  }
  // Sort
  switch (filters.sort) {
    case 'price-low': products.sort((a, b) => a.price - b.price); break;
    case 'price-high': products.sort((a, b) => b.price - a.price); break;
    case 'newest': products.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)); break;
    case 'rating': products.sort((a, b) => b.rating - a.rating); break;
    default: products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return products;
}

// Render a product card
function renderProductCard(product) {
  const isWished = DataStore.isInWishlist(product.id);
  return `
    <div class="product-card" data-animate="fade-up">
      <a href="product.html?id=${product.id}" class="product-card-link">
        <div class="product-card-image">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <div class="product-card-overlay">
            <button class="btn-quick-view" onclick="event.preventDefault();quickAddToCart('${product.id}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Add to Cart
            </button>
          </div>
        </div>
        <div class="product-card-info">
          <p class="product-card-category">${product.category}</p>
          <h3 class="product-card-name">${product.name}</h3>
          <div class="product-card-bottom">
            <span class="product-card-price">${Utils.formatPrice(product.price)}</span>
            <div class="product-card-colors">
              ${product.colors.slice(0, 3).map(c => `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`).join('')}
            </div>
          </div>
        </div>
      </a>
      <button class="btn-wishlist ${isWished ? 'active' : ''}" onclick="toggleWishlist('${product.id}', this)" aria-label="Add to wishlist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      </button>
    </div>`;
}

function quickAddToCart(productId) {
  const product = DataStore.getProductById(productId);
  if (product) {
    DataStore.addToCart({
      productId: product.id, name: product.name, price: product.price,
      image: product.images[0], size: product.sizes[0], color: product.colors[0].name, quantity: 1
    });
    Utils.showToast(`${product.name} added to cart`);
  }
}

function toggleWishlist(productId, btn) {
  const isNowWished = DataStore.toggleWishlist(productId);
  if (btn) {
    btn.classList.toggle('active', isNowWished);
    const svg = btn.querySelector('svg');
    svg.setAttribute('fill', isNowWished ? 'currentColor' : 'none');
  }
  Utils.showToast(isNowWished ? 'Added to wishlist' : 'Removed from wishlist');
}
