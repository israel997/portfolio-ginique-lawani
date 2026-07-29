import { sql } from './db.js';
import { sendJson, methodNotAllowed, parseIdParam, withErrorHandling } from './http.js';
import { requireAuth } from './auth.js';

// Registry-based CRUD for the admin list resources, dispatched by the
// `resource` dynamic path segment (api/admin/[resource]/index.js and [id].js)
// so all six resources share two serverless functions instead of one pair
// each — Vercel's Hobby plan caps a deployment at 12 functions total.

export const RESOURCES = {
  timeline: {
    table: 'timeline_items',
    columns: ['year_label', 'title_fr', 'title_en', 'company_fr', 'company_en', 'description_fr', 'description_en', 'sort_order', 'is_visible']
  },
  skills: {
    table: 'skills',
    columns: ['title_fr', 'title_en', 'description_fr', 'description_en', 'icon_key', 'icon_bg_class', 'techs', 'sort_order', 'is_visible']
  },
  logos: {
    table: 'tech_logos',
    columns: ['name', 'image_url', 'sort_order', 'is_visible'],
    hasUpdatedAt: false
  },
  projects: {
    table: 'projects',
    columns: ['name', 'description_fr', 'description_en', 'tags', 'gradient_class', 'category', 'image_url', 'project_url', 'sort_order', 'is_visible']
  },
  testimonials: {
    table: 'testimonials',
    columns: ['name', 'role_fr', 'role_en', 'initials', 'avatar_gradient_class', 'quote_fr', 'quote_en', 'sort_order', 'is_visible']
  },
  'social-links': {
    table: 'social_links',
    columns: ['name', 'url', 'icon_key', 'custom_svg', 'sort_order', 'is_visible'],
    hasUpdatedAt: false
  }
};

export async function handleListRequest(req, res) {
  if (!requireAuth(req, res)) return;
  const config = RESOURCES[req.query.resource];
  if (!config) return sendJson(res, 404, { error: 'Unknown resource' });
  const { table, columns, orderBy = 'sort_order' } = config;

  await withErrorHandling(res, async () => {
    if (req.method === 'GET') {
      const { rows } = await sql.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
      return sendJson(res, 200, rows);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const fields = columns.filter((c) => body[c] !== undefined);
      if (!fields.length) return sendJson(res, 400, { error: 'No fields provided' });
      const values = fields.map((f) => body[f]);
      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await sql.query(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return sendJson(res, 201, rows[0]);
    }
    return methodNotAllowed(res, ['GET', 'POST']);
  });
}

export async function handleItemRequest(req, res) {
  if (!requireAuth(req, res)) return;
  const config = RESOURCES[req.query.resource];
  if (!config) return sendJson(res, 404, { error: 'Unknown resource' });
  const { table, columns, hasUpdatedAt = true } = config;
  const id = parseIdParam(req);
  if (!id) return sendJson(res, 400, { error: 'Invalid id' });

  await withErrorHandling(res, async () => {
    if (req.method === 'GET') {
      const { rows } = await sql.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      if (!rows.length) return sendJson(res, 404, { error: 'Not found' });
      return sendJson(res, 200, rows[0]);
    }
    if (req.method === 'PATCH') {
      const body = req.body || {};
      const fields = columns.filter((c) => body[c] !== undefined);
      if (!fields.length) return sendJson(res, 400, { error: 'No fields provided' });
      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
      if (hasUpdatedAt) setClauses.push('updated_at = now()');
      const values = fields.map((f) => body[f]);
      values.push(id);
      const { rows } = await sql.query(
        `UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      if (!rows.length) return sendJson(res, 404, { error: 'Not found' });
      return sendJson(res, 200, rows[0]);
    }
    if (req.method === 'DELETE') {
      const { rowCount } = await sql.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
      if (!rowCount) return sendJson(res, 404, { error: 'Not found' });
      res.status(204).end();
      return;
    }
    return methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
  });
}
