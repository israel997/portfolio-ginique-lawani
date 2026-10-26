import { sql } from '../_lib/db.js';
import { sendJson, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { ensureSchema } from '../_lib/migrations.js';

const COLUMNS = [
  'full_name', 'brand_label',
  'typewriter1_fr', 'typewriter1_en', 'typewriter2_fr', 'typewriter2_en',
  'hero_intro_fr', 'hero_intro_en', 'hero_intro2_fr', 'hero_intro2_en',
  'bio1_fr', 'bio1_en', 'bio2_fr', 'bio2_en',
  'stat1_value', 'stat1_label_fr', 'stat1_label_en',
  'stat2_value', 'stat2_label_fr', 'stat2_label_en',
  'stat3_value', 'stat3_label_fr', 'stat3_label_en',
  'email', 'phone', 'whatsapp', 'location', 'availability_fr', 'availability_en',
  'cv_url', 'cv_filename', 'profile_photo_url', 'hero_badge_image_url', 'sections',
  'discover_title_fr', 'discover_title_en', 'discover_intro_fr', 'discover_intro_en', 'discover_photo_url'
];

export default async function handler(req, res) {
  if (!(await requireAuth(req, res))) return;

  await withErrorHandling(res, async () => {
    await ensureSchema();
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM admin_settings WHERE id = 1`;
      return sendJson(res, 200, rows[0] || null);
    }
    if (req.method === 'PATCH') {
      const body = req.body || {};
      const fields = [...COLUMNS, 'auto_en'].filter((c) => body[c] !== undefined);
      if (!fields.length) return sendJson(res, 400, { error: 'No fields provided' });
      // auto_en (automatic English texts, see src/admin/composables/autoTranslate.js)
      // is merged: the Profile and Sections pages each send their own entries
      const setClauses = fields.map((f, i) => (f === 'auto_en' ? `auto_en = auto_en || $${i + 1}::jsonb` : `${f} = $${i + 1}`));
      setClauses.push('updated_at = now()');
      // JSONB must be sent as a JSON string
      const values = fields.map((f) => (f === 'sections' || f === 'auto_en' ? JSON.stringify(body[f] || {}) : body[f]));
      const { rows } = await sql.query(
        `UPDATE admin_settings SET ${setClauses.join(', ')} WHERE id = 1 RETURNING *`,
        values
      );
      return sendJson(res, 200, rows[0]);
    }
    return methodNotAllowed(res, ['GET', 'PATCH']);
  });
}
