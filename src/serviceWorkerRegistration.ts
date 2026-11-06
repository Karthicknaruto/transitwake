export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // Service worker active for subterranean tile caching
        })
        .catch(() => {
          // Fallback gracefully on local dev origins
        });
    });
  }
}
