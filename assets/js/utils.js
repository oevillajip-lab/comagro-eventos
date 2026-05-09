/**
 * utils.js — Funciones utilitarias globales
 */

/**
 * Genera un short_id alfanumérico de N caracteres (base36)
 */
export function generateShortId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result.toUpperCase();
}

/**
 * Convierte texto a slug URL amigable
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sanitiza strings eliminando tags HTML
 */
export function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[<>"'&]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'
  })[c]);
}

/**
 * Formatea fecha DD/MM/YYYY
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Formatea fecha y hora
 */
export function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-PY', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Devuelve la clase CSS de badge según el estado
 */
export function statusBadge(status) {
  const map = {
    'borrador':    'badge-gray',
    'activo':      'badge-blue',
    'finalizado':  'badge-green',
    'preregistro': 'badge-yellow',
    'confirmado':  'badge-blue',
    'presente':    'badge-green',
    'ausente':     'badge-red',
  };
  return map[status] || 'badge-gray';
}

/**
 * Traduce estado a etiqueta legible
 */
export function statusLabel(status) {
  const map = {
    'borrador':    'Borrador',
    'activo':      'Activo',
    'finalizado':  'Finalizado',
    'preregistro': 'Preregistro',
    'confirmado':  'Confirmado',
    'presente':    'Presente',
    'ausente':     'Ausente',
    'capacitacion': 'Capacitación',
    'evento':       'Evento',
    'lanzamiento':  'Lanzamiento',
    'feria':        'Feria',
    'otro':         'Otro',
  };
  return map[status] || status;
}

/**
 * Muestra toast notification
 */
export function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast-msg">${sanitize(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('toast-show'), 10);
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/**
 * Genera archivo ICS para agregar al calendario
 */
export function generateICS({ title, date, time, location, description, uid }) {
  const dtStart = (date + (time ? 'T' + time.replace(':', '') + '00' : '')).replace(/-/g, '');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Comagro Eventos//ES',
    'BEGIN:VEVENT',
    `UID:${uid || generateShortId(12)}@comagro.com.py`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `SUMMARY:${title}`,
    `LOCATION:${location || ''}`,
    `DESCRIPTION:${description || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(title)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Rate limiter simple en localStorage (anti spam)
 * @returns {boolean} true si se puede enviar, false si debe esperar
 */
export function checkRateLimit(key, intervalMs = 30000) {
  const now = Date.now();
  const last = parseInt(localStorage.getItem(key) || '0', 10);
  if (now - last < intervalMs) return false;
  localStorage.setItem(key, now.toString());
  return true;
}

/**
 * Obtiene parámetro de la URL
 */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Formatea número con separadores de miles
 */
export function formatNumber(n) {
  return (n || 0).toLocaleString('es-PY');
}
