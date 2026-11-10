// Shared light/dark theme handling.
// The initial theme is applied by a tiny inline script in each HTML <head>
// (before CSS paints) so there is no flash; this module keeps it in sync.
export const THEME_KEY = 'growvita-theme';
export const THEME_EVENT = 'growvita-theme-change';

const THEME_COLORS = { dark: '#100a25', light: '#f7f4fc' };

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

// Send the current theme to every embedded frame (the legacy growth page).
// postMessage works for both http:// and file:// origins.
export function syncFrames(theme = getTheme()) {
  document.querySelectorAll('iframe').forEach((f) => {
    try { f.contentWindow && f.contentWindow.postMessage({ type: 'GROWVITA_THEME', theme }, '*'); } catch (_) {}
  });
}

export function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  const root = document.documentElement;
  root.dataset.theme = t;
  root.style.colorScheme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[t]);
  try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
  syncFrames(t);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: t }));
  return t;
}
