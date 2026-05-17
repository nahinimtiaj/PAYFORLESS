// ============================================
// MAISON Fashion — Cart Management
// ============================================

function renderCartPage() {
  const cart = DataStore.getCart();
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  const emptyState = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  if (!container) return;

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }
  if (cartContent) cartContent.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-variant">${item.size} / ${item.color}</p>
        <p class="cart-item-price">${Utils.formatPrice(item.price)}</p>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button onclick="updateCartQty('${item.id}', -1)" aria-label="Decrease">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQty('${item.id}', 1)" aria-label="Increase">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeCartItem('${item.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            Remove
          </button>
        </div>
      </div>
      <div class="cart-item-total">
        ${Utils.formatPrice(item.price * item.quantity)}
      </div>
    </div>
  `).join('');

  const subtotal = DataStore.getCartTotal();
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  if (summary) {
    summary.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>${Utils.formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : Utils.formatPrice(shipping)}</span></div>
      <div class="summary-row summary-total"><span>Total</span><span>${Utils.formatPrice(total)}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-full">Proceed to Checkout</a>
      <a href="shop.html" class="btn btn-outline btn-full">Continue Shopping</a>
      <p class="shipping-note">Free shipping on orders over $200</p>
    `;
  }
}

function updateCartQty(id, delta) {
  const cart = DataStore.getCart();
  const item = cart.find(c => c.id === id);
  if (item) {
    DataStore.updateCartItem(id, { quantity: Math.max(0, item.quantity + delta) });
    renderCartPage();
  }
}

function removeCartItem(id) {
  DataStore.removeFromCart(id);
  renderCartPage();
  Utils.showToast('Item removed from cart');
}

// Mini cart for nav
function renderMiniCart() {
  const cart = DataStore.getCart();
  const miniCart = document.getElementById('mini-cart-items');
  if (!miniCart) return;

  if (cart.length === 0) {
    miniCart.innerHTML = '<p class="mini-cart-empty">Your cart is empty</p>';
    return;
  }
  const total = DataStore.getCartTotal();
  miniCart.innerHTML = cart.slice(0, 3).map(item => `
    <div class="mini-cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <p class="mini-cart-name">${Utils.truncate(item.name, 25)}</p>
        <p class="mini-cart-meta">${item.quantity} × ${Utils.formatPrice(item.price)}</p>
      </div>
    </div>
  `).join('') + `
    ${cart.length > 3 ? `<p class="mini-cart-more">+${cart.length - 3} more items</p>` : ''}
    <div class="mini-cart-total"><span>Total:</span><span>${Utils.formatPrice(total)}</span></div>
    <a href="cart.html" class="btn btn-primary btn-full btn-sm">View Cart</a>
  `;
}
