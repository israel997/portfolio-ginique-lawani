import { sql } from './db.js';
import { sendJson, methodNotAllowed, parseIdParam, withErrorHandling } from './http.js';
import { requireAuth } from './auth.js';

// Generic CRUD handlers for the admin list resources (timeline, skills, logos,
// projects, testimonials, social links). `columns` is a fixed whitelist defined
// by each resource file, not derived from the request, so building SQL text
// with column names from it is safe even though values stay parameterized.

export function makeListHandler({ table, columns, orderBy = 'sort_order' }) {
  return async function handler(req, res) {
    if (!requireAuth(req, res)) return;

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
  };
}

export function makeItemHandler({ table, columns, hasUpdatedAt = true }) {
  return async function handler(req, res) {
    if (!requireAuth(req, res)) return;
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
  };
}
