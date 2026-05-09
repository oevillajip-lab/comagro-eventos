/**
 * auth.js — Gestión de autenticación y protección de rutas
 */

import _supabase from './supabase-client.js';

const PUBLIC_ROUTES = ['/login.html', '/registro.html'];

/**
 * Verifica si la ruta actual es pública
 */
function isPublicRoute() {
  const path = window.location.pathname;
  return PUBLIC_ROUTES.some(r => path.endsWith(r));
}

/**
 * Guard de rutas: redirige a login si no hay sesión activa.
 * Llamar al inicio de cada página privada.
 */
export async function requireAuth() {
  if (isPublicRoute()) return null;

  const { data: { session } } = await _supabase.auth.getSession();

  if (!session) {
    window.location.replace('/login.html');
    return null;
  }

  // Cargar perfil del usuario
  const { data: profile } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return { session, profile };
}

/**
 * Login con email y password
 */
export async function login(email, password) {
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Logout
 */
export async function logout() {
  await _supabase.auth.signOut();
  window.location.replace('/login.html');
}

/**
 * Recuperar contraseña (envía email)
 */
export async function resetPassword(email) {
  const { error } = await _supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login.html?reset=1'
  });
  if (error) throw error;
}

/**
 * Obtiene sesión actual (sin redirigir)
 */
export async function getSession() {
  const { data: { session } } = await _supabase.auth.getSession();
  return session;
}

/**
 * Obtiene perfil del usuario autenticado
 */
export async function getCurrentProfile() {
  const session = await getSession();
  if (!session) return null;

  const { data } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return data;
}

/**
 * Inicializa el botón de logout en páginas privadas
 */
export function initLogoutButton() {
  const btn = document.getElementById('btn-logout');
  if (btn) {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
    });
  }
}

/**
 * Renderiza nombre del usuario en el navbar
 */
export async function renderUserInfo() {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role');
  const avatarEl = document.getElementById('user-avatar');

  if (nameEl) nameEl.textContent = profile.full_name || profile.email;
  if (roleEl) roleEl.textContent = profile.role || 'staff';
  if (avatarEl) {
    const initials = (profile.full_name || profile.email || 'U')
      .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    avatarEl.textContent = initials;
  }
}
