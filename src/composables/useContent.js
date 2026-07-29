import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import fallback from '../content/fallback.json';

// Module-level singleton: every component sharing one fetch of /api/content.
// Starts populated with the bundled fallback snapshot so the site never
// renders blank while the network request is in flight or if it fails.
const content = ref(fallback);
const loading = ref(false);
const error = ref(null);
let fetchPromise = null;

function load() {
  if (fetchPromise) return fetchPromise;
  loading.value = true;
  fetchPromise = fetch('/api/content')
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json();
    })
    .then((data) => {
      content.value = data;
      error.value = null;
    })
    .catch((err) => {
      console.warn('Falling back to bundled content snapshot:', err.message);
      error.value = err;
    })
    .finally(() => {
      loading.value = false;
    });
  return fetchPromise;
}

export function useContent() {
  const { locale } = useI18n();

  load();

  function localized(item, field) {
    if (!item) return '';
    const suffix = locale.value === 'en' ? '_en' : '_fr';
    return item[`${field}${suffix}`] || item[`${field}_fr`] || '';
  }

  return { content, loading, error, localized };
}
