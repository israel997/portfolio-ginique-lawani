import { sql } from './db.js';
import { sendJson, methodNotAllowed, parseIdParam, withErrorHandling } from './http.js';
import { requireAuth } from './auth.js';
import { ensureSchema } from './migrations.js';
import { slugify, RESERVED_SLUGS } from '../../src/composables/projectLinks.js';

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
    columns: [
      'name', 'description_fr', 'description_en', 'tags', 'gradient_class', 'category', 'categories', 'image_url', 'project_url',
      'details_fr', 'details_en', 'contributions_fr', 'contributions_en', 'methodology_fr', 'methodology_en', 'gallery', 'slug',
      'details_style', 'contributions_style', 'methodology_style',
      'details_color', 'contributions_color', 'methodology_color',
      'sort_order', 'is_visible'
    ],
    jsonColumns: ['gallery'],
    beforeSave: ensureProjectSlug
  },
  'key-figures': {
    table: 'key_figures',
    columns: ['value', 'label_fr', 'label_en', 'color', 'sort_order', 'is_visible']
  },
  showcase: {
    table: 'showcase_items',
    columns: ['image_url', 'title_fr', 'title_en', 'description_fr', 'description_en', 'sort_order', 'is_visible']
  },
  testimonials: {
    table: 'testimonials',
    columns: ['name', 'role_fr', 'role_en', 'initials', 'avatar_gradient_class', 'quote_fr', 'quote_en', 'sort_order', 'is_visible']
  },
  discover: {
    table: 'discover_sections',
    columns: ['eyebrow_fr', 'eyebrow_en', 'title_fr', 'title_en', 'intro_fr', 'intro_en', 'color', 'cards', 'sort_order', 'is_visible'],
    jsonColumns: ['cards']
  },
  'social-links': {
    table: 'social_links',
    columns: ['name', 'url', 'icon_key', 'custom_svg', 'sort_order', 'is_visible'],
    hasUpdatedAt: false
  }
};

// Every project gets a share link (/<slug>): when none is sent (older admin
// tab, empty field), build one from the name and make it unique.
async function ensureProjectSlug(body, id) {
  if (body.slug !== undefined && String(body.slug).trim()) return;
  if (body.slug === undefined && id) return; // PATCH not touching the slug
  let name = body.name;
  if (!name && id) {
    const { rows } = await sql.query('SELECT name FROM projects WHERE id = $1', [id]);
    name = rows[0]?.name;
  }
  let base = slugify(name) || 'projet';
  if (RESERVED_SLUGS.includes(base)) base = `${base}-projet`;
  const { rows } = await sql.query(
    'SELECT slug FROM projects WHERE (slug = $1 OR slug LIKE $2) AND id IS DISTINCT FROM $3::int',
    [base, `${base}-%`, id || null]
  );
  const taken = new Set(rows.map((r) => r.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  body.slug = slug;
}

// node-postgres serializes JS arrays as Postgres arrays, so JSONB values
// must be stringified explicitly.
function valuesFor(config, fields, body) {
  const json = [...(config.jsonColumns || []), 'auto_en'];
  return fields.map((f) => (json.includes(f) ? JSON.stringify(body[f]) : body[f]));
}

// Saved columns, plus the record of automatic English texts when sent
// (see src/admin/composables/autoTranslate.js)
const fieldsFor = (columns, body) => [...columns, 'auto_en'].filter((c) => body[c] !== undefined);

export async function handleListRequest(req, res) {
  if (!(await requireAuth(req, res))) return;
  const config = RESOURCES[req.query.resource];
  if (!config) return sendJson(res, 404, { error: 'Unknown resource' });
  const { table, columns, orderBy = 'sort_order' } = config;

  await withErrorHandling(res, async () => {
    await ensureSchema();
    if (req.method === 'GET') {
      const { rows } = await sql.query(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
      return sendJson(res, 200, rows);
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      if (config.beforeSave) await config.beforeSave(body, null);
      const fields = fieldsFor(columns, body);
      if (!fields.length) return sendJson(res, 400, { error: 'No fields provided' });
      const values = valuesFor(config, fields, body);
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
  if (!(await requireAuth(req, res))) return;
  const config = RESOURCES[req.query.resource];
  if (!config) return sendJson(res, 404, { error: 'Unknown resource' });
  const { table, columns, hasUpdatedAt = true } = config;
  const id = parseIdParam(req);
  if (!id) return sendJson(res, 400, { error: 'Invalid id' });

  await withErrorHandling(res, async () => {
    await ensureSchema();
    if (req.method === 'GET') {
      const { rows } = await sql.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      if (!rows.length) return sendJson(res, 404, { error: 'Not found' });
      return sendJson(res, 200, rows[0]);
    }
    if (req.method === 'PATCH') {
      const body = req.body || {};
      if (config.beforeSave) await config.beforeSave(body, id);
      const fields = fieldsFor(columns, body);
      if (!fields.length) return sendJson(res, 400, { error: 'No fields provided' });
      const setClauses = fields.map((f, i) => `${f} = $${i + 1}`);
      if (hasUpdatedAt) setClauses.push('updated_at = now()');
      const values = valuesFor(config, fields, body);
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
