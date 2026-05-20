// ============================================
// PAY FOR LESS — Data Layer (Supabase)
// Real credentials baked in
// ============================================

const DataStore = {

  // ============================================
  // PRODUCTS — reads from Supabase
  // ============================================
  async getProducts(filters = {}) {
    let query = db.from('products').select('*');

    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
    if (filters.size)        query = query.contains('sizes', [filters.size]);
    if (filters.featured)    query = query.eq('is_featured', true);
    if (filters.newArrival)  query = query.eq('is_new_arrival', true);
    if (filters.bestSeller)  query = query.eq('is_best_seller', true);

    switch (filters.sort) {
      case 'price-low':  query = query.order('price', { ascending: true }); break;
      case 'price-high': query = query.order('price', { ascending: false }); break;
      case 'newest':     query = query.order('created_at', { ascending: false }); break;
      case 'rating':     query = query.order('rating', { ascending: false }); break;
      default:           query = query.order('created_at', { ascending: false }); break;
    }

    const { data, error } = await query;
    if (error) { console.error('getProducts error:', error.message); return []; }
    return (data || []).map(DataStore._map);
  },

  async getProductById(id) {
    const { data, error } = await db.from('products').select('*').eq('id', id).single();
    if (error) { console.error('getProductById error:', error.message); return null; }
    return DataStore._map(data);
  },

  // Map Supabase column names → frontend shape your existing code expects
  _map(p) {
    return {
      id:           p.id,
      name:         p.name,
      category:     p.category,
      price:        p.price,
      originalPrice: p.original_price,
      description:  p.description,
      fabric:       p.fabric || '',
      badge:        p.badge || '',
      sizes:        p.sizes || [],
      colors:       p.colors || [],
      images:       p.images || [],
      stock:        p.stock || 0,
      rating:       p.rating || 0,
      reviews:      p.review_count || 0,
      review_count: p.review_count || 0,
      featured:     p.is_featured,
      newArrival:   p.is_new_arrival,
      bestSeller:   p.is_best_seller,
      is_featured:     p.is_featured,
      is_new_arrival:  p.is_new_arrival,
      is_best_seller:  p.is_best_seller,
      createdAt:    p.created_at,
    };
  },

  // ============================================
  // CART — Supabase for logged-in, localStorage for guests
  // ============================================
  async getCart() {
    const user = await getCurrentUser();
    if (!user) return this._localCart();

    const { data, error } = await db.from('cart')
      .select('*, products(*)')
      .eq('user_id', user.id);
    if (error) { console.error('getCart error:', error.message); return []; }

    return (data || []).map(row => ({
      id:        row.id,
      productId: row.product_id,
      name:      row.products?.name || '',
      price:     row.products?.price || 0,
      image:     (row.products?.images || [])[0] || '',
      size:      row.size || '',
      color:     row.color || '',
      quantity:  row.quantity || 1,
    }));
  },

  async addToCart(item) {
    const user = await getCurrentUser();
    if (!user) {
      this._localAddToCart(item);
      await this.updateCartBadge();
      return;
    }
    const { error } = await db.from('cart').upsert({
      user_id:    user.id,
      product_id: item.productId,
      size:       item.size || '',
      color:      item.color || '',
      quantity:   item.quantity || 1,
    }, { onConflict: 'user_id,product_id,size,color' });
    if (error) console.error('addToCart error:', error.message);
    await this.updateCartBadge();
  },

  async updateCartItem(id, updates) {
    const user = await getCurrentUser();
    if (!user) {
      this._localUpdateCart(id, updates);
      await this.updateCartBadge();
      return;
    }
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      await this.removeFromCart(id); return;
    }
    await db.from('cart').update({ quantity: updates.quantity }).eq('id', id);
    await this.updateCartBadge();
  },

  async removeFromCart(id) {
    const user = await getCurrentUser();
    if (!user) {
      this._localRemoveCart(id);
      await this.updateCartBadge();
      return;
    }
    await db.from('cart').delete().eq('id', id);
    await this.updateCartBadge();
  },

  async clearCart() {
    const user = await getCurrentUser();
    if (!user) { localStorage.removeItem('pfl_cart'); await this.updateCartBadge(); return; }
    await db.from('cart').delete().eq('user_id', user.id);
    await this.updateCartBadge();
  },

  async getCartTotal() {
    const cart = await this.getCart();
    return cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  },

  async getCartCount() {
    const user = await getCurrentUser();
    if (!user) {
      const local = this._localCart();
      return local.reduce((n, i) => n + i.quantity, 0);
    }
    const { count } = await db.from('cart')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    return count || 0;
  },

  async updateCartBadge() {
    const count = await this.getCartCount();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ============================================
  // WISHLIST
  // ============================================
  async getWishlist() {
    const user = await getCurrentUser();
    if (!user) {
      try { return JSON.parse(localStorage.getItem('pfl_wishlist') || '[]'); } catch { return []; }
    }
    const { data } = await db.from('wishlist').select('product_id').eq('user_id', user.id);
    return (data || []).map(r => r.product_id);
  },

  async toggleWishlist(productId) {
    const user = await getCurrentUser();
    if (!user) {
      const list = await this.getWishlist();
      const idx  = list.indexOf(productId);
      if (idx !== -1) list.splice(idx, 1); else list.push(productId);
      localStorage.setItem('pfl_wishlist', JSON.stringify(list));
      await this.updateWishlistBadge();
      return list.includes(productId);
    }
    const wishlist = await this.getWishlist();
    const isIn = wishlist.includes(productId);
    if (isIn) {
      await db.from('wishlist').delete().match({ user_id: user.id, product_id: productId });
    } else {
      await db.from('wishlist').insert({ user_id: user.id, product_id: productId });
    }
    await this.updateWishlistBadge();
    return !isIn;
  },

  async isInWishlist(productId) {
    const list = await this.getWishlist();
    return list.includes(productId);
  },

  async updateWishlistBadge() {
    const list  = await this.getWishlist();
    const count = list.length;
    document.querySelectorAll('.wishlist-badge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  // ============================================
  // ORDERS
  // ============================================
  async getOrders() {
    const user = await getCurrentUser();
    if (!user) return [];
    const { data } = await db.from('orders')
      .select('*, order_items(*, products(name, images, price))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  },

  async addOrder(orderData) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Must be logged in to place an order');

    const cart  = await this.getCart();
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    const { data: order, error: oErr } = await db.from('orders').insert({
      user_id:          user.id,
      total,
      shipping_address: orderData.shippingAddress,
      payment_method:   orderData.paymentMethod || 'cod',
      status:           'pending',
    }).select().single();
    if (oErr) throw oErr;

    const items = cart.map(i => ({
      order_id:          order.id,
      product_id:        i.productId,
      size:              i.size,
      color:             i.color,
      quantity:          i.quantity,
      price_at_purchase: i.price,
    }));
    const { error: iErr } = await db.from('order_items').insert(items);
    if (iErr) throw iErr;

    await this.clearCart();
    return order;
  },

  // ============================================
  // NEWSLETTER & CONTACT
  // ============================================
  async subscribeNewsletter(email) {
    const { error } = await db.from('newsletter').upsert({ email }, { onConflict: 'email' });
    if (error) throw error;
  },

  async submitContact({ name, email, subject, message }) {
    const { error } = await db.from('contact_messages').insert({ name, email, subject, message });
    if (error) throw error;
  },

  // ============================================
  // LOCAL CART HELPERS (guest/not logged in)
  // ============================================
  _localCart() {
    try { return JSON.parse(localStorage.getItem('pfl_cart') || '[]'); } catch { return []; }
  },
  _localAddToCart(item) {
    const cart = this._localCart();
    const idx  = cart.findIndex(c => c.productId === item.productId && c.size === item.size && c.color === item.color);
    if (idx !== -1) { cart[idx].quantity += item.quantity || 1; }
    else { cart.push({ id: 'l_' + Date.now(), ...item }); }
    localStorage.setItem('pfl_cart', JSON.stringify(cart));
  },
  _localUpdateCart(id, updates) {
    const cart = this._localCart().map(c => c.id === id ? { ...c, ...updates } : c).filter(c => c.quantity > 0);
    localStorage.setItem('pfl_cart', JSON.stringify(cart));
  },
  _localRemoveCart(id) {
    localStorage.setItem('pfl_cart', JSON.stringify(this._localCart().filter(c => c.id !== id)));
  },
};
