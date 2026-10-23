// Unsaved admin edits, kept in this browser's localStorage so a refresh, a
// crash, a power cut or an expired session never loses work. A draft is
// written while a form has unsaved changes and removed once it's saved or
// explicitly discarded.
const PREFIX = 'admin-draft:';

export function readDraft(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeDraft(key, values, label = '') {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ values, label, savedAt: Date.now() }));
    return true;
  } catch {
    // Storage full or unavailable: nothing more we can do client-side
    return false;
  }
}

export function removeDraft(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

// Drafts whose key starts with `scope` (e.g. "projects:"), newest first
export function listDrafts(scope) {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (!fullKey?.startsWith(PREFIX + scope)) continue;
      const draft = readDraft(fullKey.slice(PREFIX.length));
      if (draft) out.push({ key: fullKey.slice(PREFIX.length), ...draft });
    }
  } catch {
    // ignore
  }
  return out.sort((a, b) => b.savedAt - a.savedAt);
}

export function formatClock(ts = Date.now()) {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDraftTime(ts) {
  const d = new Date(ts);
  const sameDay = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return sameDay ? `aujourd'hui à ${time}` : `le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} à ${time}`;
}
