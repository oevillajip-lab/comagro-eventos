/**
 * supabase-client.js
 * Singleton del cliente Supabase para toda la aplicación.
 * Cambiar las variables SUPABASE_URL y SUPABASE_ANON_KEY por las del proyecto.
 */

const SUPABASE_URL = 'https://itylpvuzflqlmmqvdhbz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7ZT8qNtk0oNRs2_8fmhyzA_gLzdVDNc';

// Inicializar cliente usando el CDN global de Supabase
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

export default _supabase;
