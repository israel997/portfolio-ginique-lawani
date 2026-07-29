import { sql } from '../_lib/db.js';
import { sendJson, methodNotAllowed, withErrorHandling } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';

const COLUMNS = [
  'full_name', 'brand_label',
  'typewriter1_fr', 'typewriter1_en', 'typewriter2_fr', 'typewriter2_en',
  'hero_intro_fr', 'hero_intro_en', 'hero_intro2_fr', 'hero_intro2_en',
  'bio1_fr', 'bio1_en', 'bio2_fr', 'bio2_en',
  'stat1_value', 'stat1_label_fr', 'stat1_label_en',
  'stat2_value', 'stat2_label_fr', 'stat2_label_en',
  'stat3_value', 'stat3_label_fr', 'stat3_label_en',
  'email', 'phone', 'location', 'availability_fr', 'availability_en',
  'cv_url', 'cv_filename', 'profile_photo_url', 'hero_badge_image_url'
];

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  await withErrorHandling(res, async () => {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM admin_settings WHERE id = 1`;
      return sendJson(res, 200, rows[0] || null);
    }
    if (req.method === 'PATCH') {
      const body = req.body || {};
      const fields = COLUMNS.filter((c) => body[c] !== undefined);
      if (!fields.length) return sendJson(res, 400, { error: 'No fields provided' });
      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
      setClauses.push('updated_at = now()');
      const values = fields.map((f) => body[f]);
      const { rows } = await sql.query(
        `UPDATE admin_settings SET ${setClauses.join(', ')} WHERE id = 1 RETURNING *`,
        values
      );
      return sendJson(res, 200, rows[0]);
    }
    return methodNotAllowed(res, ['GET', 'PATCH']);
  });
}
