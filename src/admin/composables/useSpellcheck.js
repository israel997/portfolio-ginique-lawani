import { ref, reactive, computed, watch, onMounted, onUnmounted, unref, getCurrentInstance } from 'vue';

// French / English proofreading for admin text fields, backed by the
// LanguageTool public API (spelling, accents, agreement, grammar, French
// typography). No account or key: the public endpoint allows browser calls.
// Free tier limits: ~20 requests/minute and 20 KB per request, hence the
// debouncing, the result cache and batching all fields into one call on save.
const ENDPOINT = 'https://api.languagetool.org/v2/check';
const DEBOUNCE_MS = 900;
const LANGS = { fr: 'fr', en: 'en-US' };

// Style remarks ("write 8 in letters"…) are noise for portfolio copy
const IGNORED_ISSUE_TYPES = new Set(['style']);

// Technical vocabulary accepted as-is, on top of the user's own dictionary
const BUILTIN_WORDS = [
  'fullstack', 'frontend', 'backend', 'devops', 'api', 'apis', 'saas', 'ui', 'ux', 'mvp', 'sprint', 'sprints',
  'scrum', 'agile', 'kanban', 'crowdfunding', 'freelance', 'dashboard', 'responsive', 'deployment', 'websocket',
  'websockets', 'webhook', 'webhooks', 'backoffice', 'back-office', 'startup', 'startups', 'framework', 'frameworks',
  'react', 'vue', 'vuejs', 'nextjs', 'nestjs', 'nodejs', 'laravel', 'tailwind', 'tailwindcss', 'typescript',
  'javascript', 'postgresql', 'mongodb', 'mysql', 'docker', 'postman', 'git', 'github', 'gitlab', 'notion', 'trello',
  'clickup', 'flask', 'fastapi', 'python', 'flutter', 'redis', 'prisma', 'vercel', 'railway', 'figma', 'gemini',
  'claude', 'copilot', 'openai', 'chatgpt', 'epitech', 'oofix', 'ooffix', 'lawani', 'ginique', 'oriadé', 'bénin',
  'cotonou', 'abomey', 'calavi'
];

// --- Dictionary (per browser) --------------------------------------------------

const DICT_KEY = 'spellcheck-dictionary';

function loadDictionary() {
  try {
    return JSON.parse(localStorage.getItem(DICT_KEY) || '[]');
  } catch {
    return [];
  }
}

const userWords = ref(loadDictionary());
const extraWords = ref([]); // e.g. tech names, provided by the app at runtime
const dictionary = computed(() => new Set([...BUILTIN_WORDS, ...userWords.value, ...extraWords.value].map(normalizeWord)));

function normalizeWord(word) {
  return (word || '').trim().toLowerCase().replace(/[’']/g, "'");
}

export function addToDictionary(word) {
  const w = normalizeWord(word);
  if (!w || userWords.value.includes(w)) return;
  userWords.value = [...userWords.value, w];
  try {
    localStorage.setItem(DICT_KEY, JSON.stringify(userWords.value));
  } catch {
    // Storage unavailable: the word stays accepted for this session only
  }
}

export function setExtraWords(words) {
  extraWords.value = words.flatMap((w) => [w, ...String(w).split(/[\s./-]+/)]).filter(Boolean);
}

// --- API + cache ----------------------------------------------------------------

const cache = new Map(); // `${lang}|${text}` -> Promise<match[]>

function cacheKey(lang, text) {
  return `${lang}|${text}`;
}

async function request(text, lang) {
  const body = new URLSearchParams({ text, language: LANGS[lang] || lang });
  const res = await fetch(ENDPOINT, { method: 'POST', body });
  if (!res.ok) throw new Error(res.status === 429 ? 'Correcteur momentanément saturé, réessayez dans une minute.' : 'Correcteur indisponible.');
  const data = await res.json();
  return data.matches.map((m) => ({
    offset: m.offset,
    length: m.length,
    message: m.message,
    replacements: m.replacements.slice(0, 4).map((r) => r.value),
    type: m.rule.issueType,
    ruleId: m.rule.id
  }));
}

function check(text, lang) {
  const key = cacheKey(lang, text);
  if (!cache.has(key)) {
    const p = request(text, lang).catch((err) => {
      cache.delete(key); // don't cache failures
      throw err;
    });
    cache.set(key, p);
  }
  return cache.get(key);
}

// Several texts of one language in a single request: joined with a blank
// line, matches split back by offset.
async function checkBatch(texts, lang) {
  const todo = texts.filter((t) => !cache.has(cacheKey(lang, t)));
  if (todo.length > 1) {
    const SEP = '\n\n';
    const joined = todo.join(SEP);
    const starts = [];
    let pos = 0;
    for (const t of todo) {
      starts.push(pos);
      pos += t.length + SEP.length;
    }
    const all = request(joined, lang);
    todo.forEach((t, i) => {
      const start = starts[i];
      const end = start + t.length;
      const p = all.then((matches) => matches
        .filter((m) => m.offset >= start && m.offset + m.length <= end)
        .map((m) => ({ ...m, offset: m.offset - start })));
      p.catch(() => cache.delete(cacheKey(lang, t)));
      cache.set(cacheKey(lang, t), p);
    });
  }
  return Promise.all(texts.map((t) => check(t, lang)));
}

// --- Registry: every checked field on screen, for the "check before save" step

const registry = reactive(new Map()); // id -> { count, text(), lang(), el() }

export function spellIssueCount() {
  let total = 0;
  registry.forEach((entry) => { total += entry.count; });
  return total;
}

// Check every registered field now (one request per language), then return
// the number of remaining issues.
export async function checkAllFields() {
  const byLang = new Map();
  registry.forEach((entry) => {
    const text = entry.text();
    if (!text?.trim()) return;
    const lang = entry.lang();
    if (!byLang.has(lang)) byLang.set(lang, []);
    byLang.get(lang).push(text);
  });
  await Promise.all([...byLang].map(([lang, texts]) => checkBatch([...new Set(texts)], lang)));
  // Let each field pick up its now-cached result
  await Promise.all([...registry.values()].map((entry) => entry.refresh()));
  return spellIssueCount();
}

export function firstFieldWithIssues() {
  for (const entry of registry.values()) {
    if (entry.count > 0) return entry.el?.();
  }
  return null;
}

// --- Per-field composable -------------------------------------------------------

// text: ref/getter of the field text; lang: ref/getter ('fr' | 'en');
// el: optional getter of the field element (to scroll to it)
export function useSpellcheck(text, lang, { el } = {}) {
  const read = (v) => (typeof v === 'function' ? v() : unref(v));
  const raw = ref([]);
  const ignored = ref(new Set()); // `${offset}:${ruleId}` dismissed for this text
  const checking = ref(false);
  const error = ref('');
  let timer = null;
  let checkedText = null;

  const issues = computed(() => {
    const t = read(text) || '';
    return raw.value.filter((m) => {
      if (IGNORED_ISSUE_TYPES.has(m.type)) return false;
      if (ignored.value.has(`${m.offset}:${m.ruleId}`)) return false;
      const word = t.slice(m.offset, m.offset + m.length);
      if (m.type === 'misspelling' && dictionary.value.has(normalizeWord(word))) return false;
      return true;
    });
  });

  async function refresh() {
    const t = read(text) || '';
    const l = read(lang) || 'fr';
    clearTimeout(timer);
    if (!t.trim()) {
      raw.value = [];
      checkedText = t;
      return;
    }
    checking.value = true;
    error.value = '';
    try {
      const matches = await check(t, l);
      // Ignore late answers for text that has since changed
      if ((read(text) || '') === t) {
        raw.value = matches;
        checkedText = t;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      checking.value = false;
    }
  }

  watch(() => [read(text), read(lang)], ([t], [prev]) => {
    if (t === checkedText) return;
    ignored.value = new Set();
    clearTimeout(timer);
    // Text changed: hide stale underlines whose position no longer holds
    if (prev !== undefined && t !== prev) raw.value = [];
    timer = setTimeout(refresh, DEBOUNCE_MS);
  });

  // Apply a replacement and shift the other issues so they stay aligned
  // until the next check comes back
  function apply(issue, replacement, update) {
    const t = read(text) || '';
    const next = t.slice(0, issue.offset) + replacement + t.slice(issue.offset + issue.length);
    const delta = replacement.length - issue.length;
    raw.value = raw.value
      .filter((m) => m !== issue)
      .map((m) => (m.offset > issue.offset ? { ...m, offset: m.offset + delta } : m));
    checkedText = next; // keep the shifted list, re-check after the debounce
    update(next);
    clearTimeout(timer);
    timer = setTimeout(refresh, DEBOUNCE_MS);
  }

  // Every issue with a suggestion, first suggestion each, in one update
  // (last first, so earlier offsets stay valid)
  function applyAll(update) {
    let next = read(text) || '';
    const fixable = issues.value.filter((m) => m.replacements.length).sort((a, b) => b.offset - a.offset);
    let lastStart = Infinity;
    for (const m of fixable) {
      if (m.offset + m.length > lastStart) continue; // overlaps a fix already applied
      next = next.slice(0, m.offset) + m.replacements[0] + next.slice(m.offset + m.length);
      lastStart = m.offset;
    }
    raw.value = [];
    update(next);
    clearTimeout(timer);
    timer = setTimeout(refresh, DEBOUNCE_MS);
  }

  function ignore(issue) {
    const t = read(text) || '';
    if (issue.type === 'misspelling') addToDictionary(t.slice(issue.offset, issue.offset + issue.length));
    else ignored.value = new Set([...ignored.value, `${issue.offset}:${issue.ruleId}`]);
  }

  // Register for the save-time check
  const id = Symbol('spell');
  const entry = reactive({
    count: 0,
    text: () => read(text) || '',
    lang: () => read(lang) || 'fr',
    el: () => (el ? el() : null),
    refresh
  });
  watch(() => issues.value.length, (n) => { entry.count = n; }, { immediate: true });

  if (getCurrentInstance()) {
    onMounted(() => registry.set(id, entry));
    onUnmounted(() => {
      clearTimeout(timer);
      registry.delete(id);
    });
  }

  return { issues, checking, error, refresh, apply, applyAll, ignore };
}

// --- "There are still mistakes" check before saving ---------------------------

export function useSpellGuard() {
  const open = ref(false);
  const count = ref(0);
  const checking = ref(false);
  let proceed = null;

  async function guard(action) {
    checking.value = true;
    let remaining;
    try {
      remaining = await checkAllFields();
    } catch {
      // Proofreading service unreachable: never block saving because of it
      remaining = spellIssueCount();
    } finally {
      checking.value = false;
    }
    if (!remaining) return action();
    count.value = remaining;
    proceed = action;
    open.value = true;
  }

  function saveAnyway() {
    open.value = false;
    proceed?.();
  }

  function review() {
    open.value = false;
    firstFieldWithIssues()?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return { open, count, checking, guard, saveAnyway, review };
}
