import { ref } from 'vue';

// Light / dark theme for the public site.
// - First visit follows the device setting (prefers-color-scheme)
// - An explicit choice from the toggle is remembered in localStorage
// - The back-office forces dark while it's open (forceDark / releaseDark)
// The initial value is applied by an inline script in index.html before the
// first paint, so the page never flashes in the wrong theme.
const STORAGE_KEY = 'theme';
const THEME_COLORS = { dark: '#0f172a', light: '#f6f8fe' };

const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: light)') : null;

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

const theme = ref(readStored() || (media?.matches ? 'light' : 'dark'));
let forced = false;

function apply() {
  const effective = forced ? 'dark' : theme.value;
  document.documentElement.dataset.theme = effective;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[effective]);
}

// Follow device changes until the visitor picks a theme themselves
media?.addEventListener('change', (event) => {
  if (readStored()) return;
  theme.value = event.matches ? 'light' : 'dark';
  apply();
});

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, theme.value);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this visit only
  }
  apply();
}

function forceDark() {
  forced = true;
  apply();
}

function releaseDark() {
  forced = false;
  apply();
}

export function useTheme() {
  return { theme, toggle, forceDark, releaseDark };
}
