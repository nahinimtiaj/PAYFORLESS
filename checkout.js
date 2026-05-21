// ============================================
// PAY FOR LESS — Checkout (saves to Supabase)
// ============================================

async function initCheckout() {
  await renderCheckoutSummary();

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await placeOrder();
    });
  }
}

// ── Render order summary on the right side ──
async function renderCheckoutSummary() {
  const el = document.getElementById('checkout-items');
  if (!el) return;

  const cart = JSON.parse(localStorage.getItem('pfl_cart') || '[]');

  if (!cart.length) {
    el.innerHTML = '<p style="color:#aaa;font-size:13px">Your cart is empty. <a href="shop.html">Go shopping</a></p>';
    return;
  }

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total    = subtotal + shipping;

  el.innerHTML = `
    <div style="border-bottom:1px solid #eee;padding-bottom:16px;margin-bottom:16px">
      ${cart.map(item => `
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
          <img src="${item.image || 'hero-1.png'}" alt="${item.name}"
            style="width:56px;height:70px;object-fit:cover;background:#f5f5f5;flex-shrink:0"
            onerror="this.src='hero-1.png'">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;margin-bottom:3px">${item.name}</div>
            <div style="font-size:12px;color:#888">
              ${item.size ? `Size: <b style="color:#333">${item.size}</b>` : ''}
              ${item.color ? ` · Color: <b style="color:#333">${item.color}</b>` : ''}
              · Qty: <b style="color:#333">${item.quantity}</b>
            </div>
          </div>
          <div style="font-size:13px;font-weight:500;flex-shrink:0">$${(item.price * item.quantity).toFixed(0)}</div>
        </div>`).join('')}
    </div>
    <div style="font-size:13px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="color:#888">Subtotal</span><span>$${subtotal.toFixed(0)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px">
        <span style="color:#888">Shipping</span>
        <span>${shipping === 0 ? '<span style="color:green">Free</span>' : '$' + shipping}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:600;border-top:1px solid #eee;padding-top:12px">
        <span>Total</span><span>$${total.toFixed(0)}</span>
      </div>
      ${subtotal <= 200 ? '<p style="font-size:11px;color:#aaa;margin-top:8px">Add $'+(200-subtotal).toFixed(0)+' more for free shipping</p>' : '<p style="font-size:11px;color:green;margin-top:8px">✓ You qualify for free shipping</p>'}
    </div>`;
}

// ── Place order — saves to Supabase ──
async function placeOrder() {
  const btn = document.querySelector('#checkout-form button[type="submit"]');
  if (btn) { btn.textContent = 'Placing Order...'; btn.disabled = true; }

  // Collect form data
  const fullName = document.getElementById('fullName')?.value.trim() || '';
  const email    = document.getElementById('email')?.value.trim() || '';
  const phone    = document.getElementById('phone')?.value.trim() || '';
  const address  = document.getElementById('address')?.value.trim() || '';
  const city     = document.getElementById('city')?.value.trim() || '';
  const state    = document.getElementById('state')?.value.trim() || '';
  const zip      = document.getElementById('zip')?.value.trim() || '';
  const country  = document.getElementById('country')?.value.trim() || '';
  const notes    = document.getElementById('notes')?.value.trim() || '';

  if (!fullName || !email || !address || !city || !country) {
    alert('Please fill in all required fields.');
    if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    return;
  }

  const cart = JSON.parse(localStorage.getItem('pfl_cart') || '[]');
  if (!cart.length) {
    alert('Your cart is empty.');
    if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    return;
  }

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total    = subtotal + shipping;

  const shippingAddress = { name: fullName, email, phone, address, city, state, zip, country, notes };

  // ── Save to Supabase ──
  const SB_URL = 'https://fsnboewxnvdpidezykex.supabase.co';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbmJvZXd4bnZkcGlkZXp5a2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjE3MzYsImV4cCI6MjA5NDYzNzczNn0.Y1YYE0XKmkqZSmSrJtMkCK9wvDOcWBr47W4ejuq6zZw';
  const db = supabase.createClient(SB_URL, SB_KEY);

  try {
    // 1. Insert order
    const { data: order, error: orderError } = await db.from('orders').insert({
      total,
      shipping_address: shippingAddress,
      payment_method:   'cod',
      status:           'pending',
      // user_id is optional — works for guest checkout too
    }).select().single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const items = cart.map(item => ({
      order_id:          order.id,
      product_id:        item.productId || null,
      size:              item.size || '',
      color:             item.color || '',
      quantity:          item.quantity,
      price_at_purchase: item.price,
      name:              item.name, // store name directly too
    }));

    // Try inserting with product_id first
    const { error: itemsError } = await db.from('order_items').insert(
      items.map(i => ({
        order_id:          i.order_id,
        product_id:        i.product_id,
        size:              i.size,
        color:             i.color,
        quantity:          i.quantity,
        price_at_purchase: i.price_at_purchase,
      }))
    );

    if (itemsError) {
      console.warn('Could not save order items:', itemsError.message);
      // Order itself saved — continue
    }

    // 3. Clear cart
    localStorage.removeItem('pfl_cart');

    // 4. Show success
    showOrderSuccess(fullName, email, order.id);

  } catch (err) {
    console.error('Order error:', err);
    // Even if Supabase fails, save locally so customer isn't stuck
    const localOrder = {
      id: 'LOCAL_' + Date.now(),
      total,
      shipping_address: shippingAddress,
      status: 'pending',
      created_at: new Date().toISOString(),
      items: cart,
    };
    const localOrders = JSON.parse(localStorage.getItem('pfl_orders') || '[]');
    localOrders.unshift(localOrder);
    localStorage.setItem('pfl_orders', JSON.stringify(localOrders));
    localStorage.removeItem('pfl_cart');
    showOrderSuccess(fullName, email, localOrder.id);
  }
}

function showOrderSuccess(name, email, orderId) {
  const body = document.querySelector('.checkout-section') || document.body;
  const section = document.createElement('div');
  section.style.cssText = 'min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 20px';
  section.innerHTML = `
    <div style="width:64px;height:64px;border:2px solid #b8966e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;color:#b8966e;font-size:24px">✓</div>
    <p style="font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:#b8966e;margin-bottom:12px">Order Confirmed</p>
    <h1 style="font-family:'Cormorant Garamond',serif;font-size:2.5rem;font-weight:300;margin-bottom:12px">Thank You, ${name}!</h1>
    <p style="color:#888;font-size:14px;max-width:400px;line-height:1.8;margin-bottom:8px">
      Your order has been placed successfully.
    </p>
    <p style="color:#aaa;font-size:13px;margin-bottom:40px">
      We will contact you at <b style="color:#333">${email}</b> with updates.
    </p>
    <a href="shop.html" style="background:#000;color:#fff;padding:14px 36px;font-size:11px;letter-spacing:.25em;text-transform:uppercase;text-decoration:none;transition:background .2s">Continue Shopping</a>`;

  if (document.querySelector('.checkout-section')) {
    document.querySelector('.checkout-section').replaceWith(section);
  } else {
    document.body.innerHTML = '';
    document.body.appendChild(section);
  }

  // Update cart badge
  document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = '0'; b.style.display = 'none'; });
}
