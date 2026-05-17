// ============================================
// Pay For Less — Admin Panel Logic
// ============================================

function initAdmin() {
  if (!DataStore.isAdminLoggedIn()) {
    showAdminLogin();
  } else {
    showAdminDashboard();
  }
}

function showAdminLogin() {
  const app = document.getElementById('admin-app');
  app.innerHTML = `
    <div class="admin-login">
      <div class="admin-login-card">
        <h1 class="admin-logo">PAY FOR LESS</h1>
        <p class="admin-subtitle">Admin Panel</p>
        <form onsubmit="handleAdminLogin(event)">
          <div class="form-group">
            <label for="admin-user">Username</label>
            <input type="text" id="admin-user" required autocomplete="username">
          </div>
          <div class="form-group">
            <label for="admin-pass">Password</label>
            <input type="password" id="admin-pass" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary btn-full">Sign In</button>
          <p class="admin-hint">Default: admin / admin123</p>
        </form>
      </div>
    </div>`;
}

function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('admin-user').value;
  const p = document.getElementById('admin-pass').value;
  if (DataStore.adminLogin(u, p)) {
    showAdminDashboard();
  } else {
    Utils.showToast('Invalid credentials', 'error');
  }
}

function showAdminDashboard() {
  const app = document.getElementById('admin-app');
  const stats = DataStore.getStats();
  app.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h1 class="admin-logo">PAY FOR LESS</h1>
        <nav class="admin-nav">
          <button class="admin-nav-btn active" onclick="switchAdminTab('dashboard', this)">📊 Dashboard</button>
          <button class="admin-nav-btn" onclick="switchAdminTab('products', this)">👕 Products</button>
          <button class="admin-nav-btn" onclick="switchAdminTab('orders', this)">📦 Orders</button>
          <a href="index.html" class="admin-nav-btn">🌐 View Store</a>
          <button class="admin-nav-btn admin-logout" onclick="adminLogout()">↩ Logout</button>
        </nav>
      </aside>
      <main class="admin-main">
        <div id="admin-content"></div>
      </main>
    </div>`;
  switchAdminTab('dashboard');
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const content = document.getElementById('admin-content');
  switch (tab) {
    case 'dashboard': renderAdminDashboard(content); break;
    case 'products': renderAdminProducts(content); break;
    case 'orders': renderAdminOrders(content); break;
  }
}

function renderAdminDashboard(el) {
  const stats = DataStore.getStats();
  el.innerHTML = `
    <h2 class="admin-title">Dashboard</h2>
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-number">${stats.totalProducts}</span><span class="stat-label">Products</span></div>
      <div class="stat-card"><span class="stat-number">${stats.totalOrders}</span><span class="stat-label">Orders</span></div>
      <div class="stat-card"><span class="stat-number">${stats.pendingOrders}</span><span class="stat-label">Pending</span></div>
      <div class="stat-card"><span class="stat-number">${Utils.formatPrice(stats.totalRevenue)}</span><span class="stat-label">Revenue</span></div>
    </div>
    <h3 class="admin-subtitle-section">Recent Orders</h3>
    ${stats.recentOrders.length ? `<div class="admin-table-wrap"><table class="admin-table">
      <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>${stats.recentOrders.map(o => `<tr>
        <td>${o.orderNumber}</td><td>${o.customer.name}</td>
        <td>${Utils.formatPrice(o.total)}</td>
        <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
        <td>${Utils.formatShortDate(o.createdAt)}</td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<p class="admin-empty">No orders yet</p>'}`;
}

function renderAdminProducts(el) {
  const products = DataStore.getProducts();
  el.innerHTML = `
    <div class="admin-header"><h2 class="admin-title">Products</h2>
    <button class="btn btn-primary" onclick="showProductForm()">+ Add Product</button></div>
    <div id="product-form-area"></div>
    <div class="admin-table-wrap"><table class="admin-table">
      <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
      <tbody>${products.map(p => `<tr>
        <td><img src="${p.images[0]}" class="admin-thumb" alt="${p.name}"></td>
        <td>${p.name}</td><td>${p.category}</td><td>${Utils.formatPrice(p.price)}</td>
        <td class="admin-actions">
          <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit">✏️</button>
          <button class="btn-icon btn-danger" onclick="deleteProduct('${p.id}')" title="Delete">🗑️</button>
        </td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function showProductForm(product = null) {
  const area = document.getElementById('product-form-area');
  const isEdit = !!product;
  area.innerHTML = `
    <div class="admin-form-card">
      <h3>${isEdit ? 'Edit' : 'Add New'} Product</h3>
      <form onsubmit="saveProduct(event, '${isEdit ? product.id : ''}')">
        <div class="form-row">
          <div class="form-group"><label>Name</label><input name="name" value="${isEdit ? product.name : ''}" required></div>
          <div class="form-group"><label>Category</label>
            <select name="category" required>
              <option value="tops" ${isEdit && product.category === 'tops' ? 'selected' : ''}>Tops</option>
              <option value="outerwear" ${isEdit && product.category === 'outerwear' ? 'selected' : ''}>Outerwear</option>
              <option value="dresses" ${isEdit && product.category === 'dresses' ? 'selected' : ''}>Dresses</option>
              <option value="pants" ${isEdit && product.category === 'pants' ? 'selected' : ''}>Pants</option>
              <option value="accessories" ${isEdit && product.category === 'accessories' ? 'selected' : ''}>Accessories</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Price ($)</label><input name="price" type="number" step="0.01" value="${isEdit ? product.price : ''}" required></div>
          <div class="form-group"><label>Image URL</label><input name="image" value="${isEdit ? product.images[0] : 'assets/images/hero-1.png'}" required></div>
        </div>
        <div class="form-group"><label>Description</label><textarea name="description" rows="3">${isEdit ? product.description : ''}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label>Fabric</label><input name="fabric" value="${isEdit ? product.fabric : ''}"></div>
          <div class="form-group"><label>Sizes (comma separated)</label><input name="sizes" value="${isEdit ? product.sizes.join(',') : 'XS,S,M,L,XL'}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Badge</label><input name="badge" value="${isEdit ? (product.badge || '') : ''}" placeholder="e.g. New, Best Seller"></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Product</button>
          <button type="button" class="btn btn-outline" onclick="document.getElementById('product-form-area').innerHTML=''">Cancel</button>
        </div>
      </form>
    </div>`;
}

function saveProduct(e, id) {
  e.preventDefault();
  const f = e.target;
  const data = {
    name: f.name.value, category: f.category.value, price: parseFloat(f.price.value),
    images: [f.image.value], description: f.description.value, fabric: f.fabric.value,
    sizes: f.sizes.value.split(',').map(s => s.trim()), badge: f.badge.value,
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#ffffff' }],
    rating: 4.5, reviews: 0, featured: false, bestSeller: false, newArrival: true
  };
  if (id) { DataStore.updateProduct(id, data); Utils.showToast('Product updated'); }
  else { DataStore.addProduct(data); Utils.showToast('Product added'); }
  switchAdminTab('products');
}

function editProduct(id) {
  const product = DataStore.getProductById(id);
  if (product) showProductForm(product);
}

function deleteProduct(id) {
  if (confirm('Delete this product?')) {
    DataStore.deleteProduct(id);
    switchAdminTab('products');
    Utils.showToast('Product deleted');
  }
}

function renderAdminOrders(el) {
  const orders = DataStore.getOrders();
  el.innerHTML = `
    <h2 class="admin-title">Orders</h2>
    ${orders.length ? `<div class="admin-table-wrap"><table class="admin-table">
      <thead><tr><th>Order #</th><th>Customer</th><th>Email</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${orders.map(o => `<tr>
        <td>${o.orderNumber}</td><td>${o.customer.name}</td><td>${o.customer.email}</td>
        <td>${o.items.length} items</td><td>${Utils.formatPrice(o.total)}</td>
        <td><select onchange="updateOrderStatus('${o.id}', this.value)" class="status-select">
          ${['Pending', 'Processing', 'Shipped', 'Delivered'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></td>
        <td>${Utils.formatShortDate(o.createdAt)}</td>
        <td><button class="btn-icon" onclick="viewOrderDetails('${o.id}')" title="View Details">👁️</button></td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<p class="admin-empty">No orders yet</p>'}
    <div id="order-detail-area"></div>`;
}

function updateOrderStatus(id, status) {
  DataStore.updateOrderStatus(id, status);
  Utils.showToast(`Order updated to ${status}`);
}

function viewOrderDetails(id) {
  const order = DataStore.getOrderById(id);
  if (!order) return;
  const area = document.getElementById('order-detail-area');
  area.innerHTML = `
    <div class="admin-form-card">
      <h3>Order ${order.orderNumber}</h3>
      <div class="order-detail-grid">
        <div><h4>Customer</h4><p>${order.customer.name}<br>${order.customer.email}<br>${order.customer.phone}</p></div>
        <div><h4>Shipping</h4><p>${order.shipping.address}<br>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zip}<br>${order.shipping.country}</p></div>
      </div>
      <h4>Items</h4>
      ${order.items.map(i => `<p>• ${i.name} (${i.size}/${i.color}) × ${i.quantity} — ${Utils.formatPrice(i.price * i.quantity)}</p>`).join('')}
      ${order.notes ? `<h4>Notes</h4><p>${order.notes}</p>` : ''}
      <p class="order-total-detail"><strong>Total: ${Utils.formatPrice(order.total)}</strong></p>
      <button class="btn btn-outline" onclick="this.parentElement.parentElement.innerHTML=''">Close</button>
    </div>`;
}

function adminLogout() {
  DataStore.adminLogout();
  showAdminLogin();
  Utils.showToast('Logged out');
}
