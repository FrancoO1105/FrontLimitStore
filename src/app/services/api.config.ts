// Se configura en public/config.js, sin recompilar la aplicación.
declare global {
  interface Window { LIMITSTORE_CONFIG?: { apiUrl?: string }; }
}
export const API_URL = (window.LIMITSTORE_CONFIG?.apiUrl || '/api').replace(/\/+$/, '');
