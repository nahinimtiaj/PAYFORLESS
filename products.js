// ============================================
// PAY FOR LESS — Product Logic (Supabase version)
// ============================================

// ---- Render a single product card (async because wishlist check is async) ----
async function renderProductCard(product) {
  const isWished = await DataStore.isInWishlist(product.id);
  const firstImg = (product.images && product.images.length > 0) ? product.images[0] : 'hero-1.png';

  return `
    <div class="product-card" data-animate="fade-up">
      <a href="product.html?id=${product.id}" class="product-card-link">
        <div class="product-card-image">
          <img src="${firstImg}" alt="${product.name}" loading="lazy" onerror="this.src='hero-1.png'">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <div class="product-card-overlay">
            <button class="btn-quick-view" onclick="event.preventDefault();quickAddToCart('${product.id}')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
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
              ${(product.colors || []).slice(0, 3).map(c =>
                `<span class="color-dot" style="background:${c.hex}" title="${c.name}"></span>`
              ).join('')}
            </div>
          </div>
        </div>
      </a>
      <button class="btn-wishlist ${isWished ? 'active' : ''}"
        onclick="toggleWishlist('${product.id}', this)"
        aria-label="Add to wishlist">
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill="${isWished ? 'currentColor' : 'none'}"
          stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>
    </div>`;
}

// ---- Render a list of products into a grid element ----
// ALWAYS use this helper instead of calling .map(renderProductCard).join('')
async function renderProductGrid(products, gridEl) {
  if (!gridEl) return;
  if (!products || products.length === 0) {
    gridEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px 0;color:#888">No products found.</p>';
    return;
  }
  const cards = await Promise.all(products.map(p => renderProductCard(p)));
  gridEl.innerHTML = cards.join('');
}

// ---- Quick add to cart from product card ----
async function quickAddToCart(productId) {
  const product = await DataStore.getProductById(productId);
  if (!product) return;
  await DataStore.addToCart({
    productId: product.id,
    name:      product.name,
    price:     product.price,
    image:     (product.images || [])[0] || '',
    size:      (product.sizes || [])[0] || '',
    color:     (product.colors || [])[0]?.name || '',
    quantity:  1
  });
  Utils.showToast(`${product.name} added to cart`);
}

// ---- Toggle wishlist heart button ----
async function toggleWishlist(productId, btn) {
  const isNowWished = await DataStore.toggleWishlist(productId);
  if (btn) {
    btn.classList.toggle('active', isNowWished);
    const svg = btn.querySelector('svg');
    if (svg) svg.setAttribute('fill', isNowWished ? 'currentColor' : 'none');
  }
  Utils.showToast(isNowWished ? 'Added to wishlist' : 'Removed from wishlist');
}

// ---- Get filtered products (delegates to DataStore/Supabase) ----
async function getFilteredProducts(filters = {}) {
  return await DataStore.getProducts(filters);
}

// ---- initProducts is no longer needed (no localStorage seeding) ----
function initProducts() {}
