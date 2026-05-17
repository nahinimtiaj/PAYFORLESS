// ============================================
// PAY FOR LESS  — Data Persistence Layer
// ============================================
// This module abstracts data storage. Currently uses localStorage.
// To switch to Firebase, replace the method implementations with Firestore calls.

const DataStore = {
  // Keys
  KEYS: {
    PRODUCTS: 'maison_products',
    CART: 'maison_cart',
    WISHLIST: 'maison_wishlist',
    ORDERS: 'maison_orders',
    ADMIN: 'maison_admin',
    ADMIN_SESSION: 'maison_admin_session',
    SETTINGS: 'maison_settings'
  },

  // ---- Generic Storage Methods ----
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('DataStore.get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('DataStore.set error:', e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // ---- Products ----
  getProducts() {
    return this.get(this.KEYS.PRODUCTS) || [];
  },

  saveProducts(products) {
    this.set(this.KEYS.PRODUCTS, products);
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  addProduct(product) {
    const products = this.getProducts();
    product.id = product.id || Utils.generateId();
    product.createdAt = product.createdAt || new Date().toISOString();
    products.push(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  },

  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  // ---- Cart ----
  getCart() {
    return this.get(this.KEYS.CART) || [];
  },

  saveCart(cart) {
    this.set(this.KEYS.CART, cart);
    this.updateCartBadge();
  },

  addToCart(item) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(
      c => c.productId === item.productId && c.size === item.size && c.color === item.color
    );
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += item.quantity || 1;
    } else {
      cart.push({
        id: Utils.generateId(),
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity || 1
      });
    }
    this.saveCart(cart);
    return cart;
  },

  updateCartItem(id, updates) {
    const cart = this.getCart();
    const index = cart.findIndex(c => c.id === id);
    if (index !== -1) {
      cart[index] = { ...cart[index], ...updates };
      if (cart[index].quantity <= 0) cart.splice(index, 1);
      this.saveCart(cart);
    }
    return cart;
  },

  removeFromCart(id) {
    const cart = this.getCart().filter(c => c.id !== id);
    this.saveCart(cart);
    return cart;
  },

  clearCart() {
    this.saveCart([]);
  },

  getCartTotal() {
    return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartCount() {
    return this.getCart().reduce((count, item) => count + item.quantity, 0);
  },

  updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCartCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ---- Wishlist ----
  getWishlist() {
    return this.get(this.KEYS.WISHLIST) || [];
  },

  saveWishlist(wishlist) {
    this.set(this.KEYS.WISHLIST, wishlist);
    this.updateWishlistBadge();
  },

  toggleWishlist(productId) {
    const wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    if (index !== -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
    }
    this.saveWishlist(wishlist);
    return wishlist.includes(productId);
  },

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  },

  updateWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-badge');
    const count = this.getWishlist().length;
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ---- Orders ----
  getOrders() {
    return this.get(this.KEYS.ORDERS) || [];
  },

  saveOrders(orders) {
    this.set(this.KEYS.ORDERS, orders);
  },

  addOrder(order) {
    const orders = this.getOrders();
    order.id = Utils.generateId();
    order.orderNumber = Utils.generateOrderNumber();
    order.status = 'Pending';
    order.createdAt = new Date().toISOString();
    orders.unshift(order);
    this.saveOrders(orders);
    return order;
  },

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      this.saveOrders(orders);
      return orders[index];
    }
    return null;
  },

  getOrderById(id) {
    return this.getOrders().find(o => o.id === id) || null;
  },

  // ---- Admin Auth ----
  getAdminCredentials() {
    return this.get(this.KEYS.ADMIN) || { username: 'admin', password: 'admin123' };
  },

  setAdminCredentials(username, password) {
    this.set(this.KEYS.ADMIN, { username, password });
  },

  isAdminLoggedIn() {
    return this.get(this.KEYS.ADMIN_SESSION) === true;
  },

  adminLogin(username, password) {
    const creds = this.getAdminCredentials();
    if (username === creds.username && password === creds.password) {
      this.set(this.KEYS.ADMIN_SESSION, true);
      return true;
    }
    return false;
  },

  adminLogout() {
    this.remove(this.KEYS.ADMIN_SESSION);
  },

  // ---- Data Export/Import (for backup) ----
  exportData() {
    return {
      products: this.getProducts(),
      orders: this.getOrders(),
      settings: this.get(this.KEYS.SETTINGS),
      exportedAt: new Date().toISOString()
    };
  },

  importData(data) {
    if (data.products) this.saveProducts(data.products);
    if (data.orders) this.saveOrders(data.orders);
    if (data.settings) this.set(this.KEYS.SETTINGS, data.settings);
  },

  // ---- Stats ----
  getStats() {
    const orders = this.getOrders();
    const products = this.getProducts();
    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'Pending').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      recentOrders: orders.slice(0, 5)
    };
  }
};
