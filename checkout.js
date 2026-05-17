// ============================================
// MAISON Fashion — Checkout & Order Processing
// ============================================

function initCheckout() {
  const cart = DataStore.getCart();
  if (cart.length === 0 && !document.getElementById('order-success')) {
    window.location.href = 'cart.html';
    return;
  }
  renderOrderSummary();
  setupFormValidation();
}

function renderOrderSummary() {
  const cart = DataStore.getCart();
  const container = document.getElementById('checkout-items');
  if (!container) return;

  const subtotal = DataStore.getCartTotal();
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

  container.innerHTML = `
    ${cart.map(item => `
      <div class="checkout-item">
        <div class="checkout-item-img"><img src="${item.image}" alt="${item.name}"><span class="checkout-qty">${item.quantity}</span></div>
        <div class="checkout-item-info">
          <p class="checkout-item-name">${item.name}</p>
          <p class="checkout-item-variant">${item.size} / ${item.color}</p>
        </div>
        <p class="checkout-item-price">${Utils.formatPrice(item.price * item.quantity)}</p>
      </div>
    `).join('')}
    <div class="checkout-totals">
      <div class="summary-row"><span>Subtotal</span><span>${Utils.formatPrice(subtotal)}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : Utils.formatPrice(shipping)}</span></div>
      <div class="summary-row summary-total"><span>Total</span><span>${Utils.formatPrice(total)}</span></div>
    </div>
  `;
}

function setupFormValidation() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input[required], textarea[required]');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', handleCheckoutSubmit);
}

function validateField(input) {
  const value = input.value.trim();
  let valid = true;
  let msg = '';

  if (!value) { valid = false; msg = 'This field is required'; }
  else if (input.type === 'email' && !Utils.isValidEmail(value)) { valid = false; msg = 'Please enter a valid email'; }
  else if (input.name === 'phone' && !Utils.isValidPhone(value)) { valid = false; msg = 'Please enter a valid phone number'; }

  const errorEl = input.parentElement.querySelector('.field-error');
  if (!valid) {
    input.classList.add('error');
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
  } else {
    input.classList.remove('error');
    if (errorEl) { errorEl.style.display = 'none'; }
  }
  return valid;
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('input[required]');
  let allValid = true;

  inputs.forEach(input => { if (!validateField(input)) allValid = false; });
  if (!allValid) { Utils.showToast('Please fill in all required fields correctly', 'error'); return; }

  const cart = DataStore.getCart();
  const subtotal = DataStore.getCartTotal();
  const shipping = subtotal > 200 ? 0 : 15;

  const order = {
    customer: {
      name: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
    },
    shipping: {
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value.trim(),
      zip: form.zip.value.trim(),
      country: form.country.value.trim()
    },
    items: cart,
    notes: form.notes ? form.notes.value.trim() : '',
    subtotal, shipping, total: subtotal + shipping
  };

  // Save order
  const savedOrder = DataStore.addOrder(order);
  DataStore.clearCart();

  // Show success
  showOrderSuccess(savedOrder);

  // Try sending email (EmailJS - configure with your keys)
  sendOrderEmail(savedOrder);
}

function showOrderSuccess(order) {
  const main = document.querySelector('.checkout-section');
  if (main) {
    main.innerHTML = `
      <div class="order-success" id="order-success">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2>Order Confirmed</h2>
        <p class="order-number">Order #${order.orderNumber}</p>
        <p>Thank you for your purchase, ${order.customer.name}. A confirmation email has been sent to ${order.customer.email}.</p>
        <div class="success-actions">
          <a href="index.html" class="btn btn-primary">Continue Shopping</a>
          <a href="shop.html" class="btn btn-outline">Browse Collection</a>
        </div>
      </div>
    `;
  }
}

function sendOrderEmail(order) {
  // EmailJS Integration (placeholder - replace with your EmailJS credentials)
  // 1. Sign up at https://www.emailjs.com
  // 2. Create an email service and template
  // 3. Replace the IDs below
  /*
  if (typeof emailjs !== 'undefined') {
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      to_email: order.customer.email,
      customer_name: order.customer.name,
      order_number: order.orderNumber,
      order_total: Utils.formatPrice(order.total),
      order_items: order.items.map(i => `${i.name} (${i.size}/${i.color}) x${i.quantity}`).join(', ')
    }, 'YOUR_PUBLIC_KEY');
  }
  */
  console.log('Order email would be sent to:', order.customer.email);
}
