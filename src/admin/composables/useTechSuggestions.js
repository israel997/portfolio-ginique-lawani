import { ref, computed } from 'vue';
import { useApi } from './useApi';
import { findLogo } from '../../composables/techLogos';

// Autocomplete options for technology fields: every logo in the library plus
// every tech already used in projects and skills, deduplicated, each with its
// logo when one matches. Loaded once per admin session.
const logos = ref([]);
const used = ref([]);
let loading = null;

function load() {
  if (loading) return loading;
  const api = useApi();
  loading = Promise.all([
    api.get('/api/admin/logos').catch(() => []),
    api.get('/api/admin/projects').catch(() => []),
    api.get('/api/admin/skills').catch(() => [])
  ]).then(([logoRows, projects, skills]) => {
    logos.value = logoRows;
    used.value = [...projects.flatMap((p) => p.tags || []), ...skills.flatMap((s) => s.techs || [])];
  });
  return loading;
}

const normalize = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const suggestions = computed(() => {
  const byKey = new Map();
  // Logo names first, so their spelling wins ("Next.js" over a typed "nextjs")
  for (const name of [...logos.value.map((l) => l.name), ...used.value]) {
    const key = normalize(name);
    if (key && !byKey.has(key)) byKey.set(key, { name, logo: findLogo(name, logos.value)?.image_url || null });
  }
  return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
});

export function useTechSuggestions() {
  load();
  return { suggestions };
}
