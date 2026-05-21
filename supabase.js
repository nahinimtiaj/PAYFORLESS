// ============================================
// PAY FOR LESS — Supabase Config
// THIS FILE MUST LOAD FIRST
// ============================================
const SUPABASE_URL = 'https://fsnboewxnvdpidezykex.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbmJvZXd4bnZkcGlkZXp5a2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjE3MzYsImV4cCI6MjA5NDYzNzczNn0.Y1YYE0XKmkqZSmSrJtMkCK9wvDOcWBr47W4ejuq6zZw';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}
async function logOut() {
  await db.auth.signOut();
  window.location.reload();
}
db.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    const user = session.user;
    const local = JSON.parse(localStorage.getItem('pfl_cart') || '[]');
    if (!local.length) return;
    for (const item of local) {
      await db.from('cart').upsert({
        user_id: user.id, product_id: item.productId,
        size: item.size || '', color: item.color || '', quantity: item.quantity || 1
      }, { onConflict: 'user_id,product_id,size,color' });
    }
    localStorage.removeItem('pfl_cart');
  }
});
