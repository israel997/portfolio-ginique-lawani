// Automatic English versions of the French texts typed in the admin, done
// right before saving.
//
// Free Google Translate web endpoint: no key, nothing to configure. It runs in
// the admin's browser (Google refuses it from servers). When it fails
// (offline, rate limit) the English field is simply left as it was and the
// next save tries again.
//
// An English text is "automatic" while it is exactly what was generated:
// auto_en[<key>] = { from: <French source>, to: <English result> }.
//   - English empty                         -> translated
//   - French changed, English untouched     -> translated again
//   - English edited by hand (≠ record.to)  -> kept, no longer automatic
//   - French emptied, English automatic     -> English emptied too

const ENDPOINT = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=en&dt=t';
const MAX_CHUNK = 4000;
let failures = 0; // translations that failed since the last translateEverything()

async function translateChunk(text) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ q: text }),
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`Translate HTTP ${res.status}`);
  const data = await res.json();
  return (data?.[0] || []).map((part) => part?.[0] || '').join('');
}

// Long texts go in chunks of whole lines, so lists keep their line breaks
export async function translateText(text) {
  const chunks = [];
  let current = '';
  for (const line of text.split('\n')) {
    if (current && current.length + line.length + 1 > MAX_CHUNK) {
      chunks.push(current);
      current = '';
    }
    current = current ? `${current}\n${line}` : line;
  }
  chunks.push(current);
  const out = [];
  for (const chunk of chunks) out.push(chunk.trim() ? await translateChunk(chunk) : chunk);
  return out.join('\n');
}

// pairs: [{ key, fr, en }] where fr / en are the current values. Returns the
// new English values ({ key: en }) and the updated auto record.
export async function autoTranslate(pairs, auto = {}) {
  const record = { ...(auto || {}) };
  const updates = {};
  await Promise.all(pairs.map(async ({ key, fr, en }) => {
    const source = (fr || '').trim();
    const english = en || '';
    const done = record[key];
    const untouched = done && english === done.to;
    if (!source) {
      if (untouched) updates[key] = '';
      delete record[key];
      return;
    }
    if (done && !untouched && english.trim()) {
      delete record[key]; // written by hand
      return;
    }
    if (english.trim() && !(untouched && done.from !== source)) return;
    try {
      const result = await translateText(source);
      if (!result.trim()) return;
      updates[key] = result;
      record[key] = { from: source, to: result };
    } catch (err) {
      failures++;
      console.error('Translation failed:', err.message);
    }
  }));
  return { updates, record };
}

// Fills the English fields of a payload about to be saved, given the stored
// row (old, null on create): every `<base>_fr` sent with its `<base>_en`.
// Sets payload.auto_en.
export async function translateRow(payload, old) {
  const pairs = Object.keys(payload)
    .filter((k) => k.endsWith('_fr') && `${k.slice(0, -3)}_en` in payload)
    .map((k) => {
      const base = k.slice(0, -3);
      return { key: base, fr: payload[k], en: payload[`${base}_en`] };
    });
  if (pairs.length) {
    const { updates, record } = await autoTranslate(pairs, old?.auto_en);
    for (const [base, en] of Object.entries(updates)) payload[`${base}_en`] = en;
    payload.auto_en = record;
  }
  if (Array.isArray(payload.gallery)) payload.gallery = await translateGallery(payload.gallery);
  return payload;
}

// Gallery entries carry their own record ({ title_fr, title_en, caption_fr, caption_en, auto_en })
export async function translateGallery(gallery) {
  if (!Array.isArray(gallery)) return gallery;
  return Promise.all(gallery.map(async (entry) => {
    const pairs = ['title', 'caption'].map((base) => ({ key: base, fr: entry[`${base}_fr`], en: entry[`${base}_en`] }));
    const { updates, record } = await autoTranslate(pairs, entry.auto_en);
    const next = { ...entry, auto_en: record };
    for (const [base, en] of Object.entries(updates)) next[`${base}_en`] = en;
    return next;
  }));
}

// Renamed sections: { about: { nav_fr, nav_en, title_fr, ... } }, records kept
// in the settings row's auto_en under "sections.<id>.<field>"
export async function translateSections(sections, auto) {
  const pairs = [];
  for (const [id, fields] of Object.entries(sections || {})) {
    for (const key of Object.keys(fields || {})) {
      if (!key.endsWith('_fr')) continue;
      const base = key.slice(0, -3);
      pairs.push({ key: `sections.${id}.${base}`, id, base, fr: fields[key], en: fields[`${base}_en`] });
    }
  }
  const { updates, record } = await autoTranslate(pairs, auto);
  const next = JSON.parse(JSON.stringify(sections || {}));
  for (const p of pairs) {
    if (updates[p.key] === undefined) continue;
    if (updates[p.key]) next[p.id][`${p.base}_en`] = updates[p.key];
    else delete next[p.id][`${p.base}_en`];
  }
  return { sections: next, record };
}

// "Tout traduire": every stored item and the profile, through the same rules
// as a save. Only items that change are written back. Returns that count.
const RESOURCES = ['timeline', 'skills', 'projects', 'key-figures', 'showcase', 'testimonials'];

export async function translateEverything(api) {
  let count = 0;
  failures = 0;
  const settings = await api.get('/api/admin/settings');
  if (settings) {
    const payload = pickText(settings);
    await translateRow(payload, settings);
    const { sections, record } = await translateSections(settings.sections, payload.auto_en ?? settings.auto_en);
    payload.sections = sections;
    payload.auto_en = record;
    if (changed(settings, payload)) {
      await api.patch('/api/admin/settings', payload);
      count++;
    }
  }
  for (const resource of RESOURCES) {
    const rows = await api.get(`/api/admin/${resource}`);
    for (const row of rows) {
      const payload = await translateRow(pickText(row), row);
      if (!changed(row, payload)) continue;
      await api.patch(`/api/admin/${resource}/${row.id}`, payload);
      count++;
    }
  }
  if (failures) {
    throw new Error(`${failures} texte${failures > 1 ? 's' : ''} non traduit${failures > 1 ? 's' : ''} (service de traduction indisponible), réessayez dans quelques minutes.${count ? ` ${count} élément${count > 1 ? 's' : ''} mis à jour.` : ''}`);
  }
  return count;
}

// The bilingual fields (and the gallery) of a stored row
function pickText(row) {
  const out = {};
  for (const key of Object.keys(row)) {
    if (key.endsWith('_fr') && `${key.slice(0, -3)}_en` in row) {
      out[key] = row[key] || '';
      out[`${key.slice(0, -3)}_en`] = row[`${key.slice(0, -3)}_en`] || '';
    }
  }
  if (Array.isArray(row.gallery)) out.gallery = row.gallery;
  return out;
}

// Any English text added, changed or removed
function changed(row, payload) {
  const english = (v) => JSON.stringify(v, (k, x) => (k === 'auto_en' ? undefined : x));
  return Object.keys(payload).some((k) => (k.endsWith('_en') && k !== 'auto_en' && (row[k] || '') !== payload[k])
    || ((k === 'gallery' || k === 'sections') && english(row[k] || null) !== english(payload[k] || null)));
}
