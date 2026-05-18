// ============================================
// PAY FOR LESS — Supabase Configuration
// ============================================
// STEP 1: Replace these two values with your own from:
//   Supabase Dashboard → Settings → API

const SUPABASE_URL = 'https://fsnboewxnvdpidezykex.supabase.co/rest/v1/'; // ← REPLACE THIS
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbmJvZXd4bnZkcGlkZXp5a2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjE3MzYsImV4cCI6MjA5NDYzNzczNn0.Y1YYE0XKmkqZSmSrJtMkCK9wvDOcWBr47W4ejuq6zZw';                 // ← REPLACE THIS

// Initialize the Supabase client (available globally as `db`)
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// Auth Helpers (used across all pages)
// ============================================

async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function signUp(email, password, fullName) {
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data;
}

async function logIn(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function logOut() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

// Listen for auth changes and update the nav
db.auth.onAuthStateChange((event, session) => {
  updateNavForAuth(session?.user || null);
  if (event === 'SIGNED_IN') {
    syncLocalCartToSupabase(); // push any guest cart items to Supabase on login
  }
});

function updateNavForAuth(user) {
  // You can add an "Account" link to your nav and control it here
  const accountLink = document.getElementById('account-link');
  if (accountLink) {
    if (user) {
      accountLink.textContent = 'Account';
      accountLink.href = 'account.html';
    } else {
      accountLink.textContent = 'Login';
      accountLink.href = 'login.html';
    }
  }
}
