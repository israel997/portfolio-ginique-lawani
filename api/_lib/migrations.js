import { sql } from './db.js';

// Versioned, forward-only schema migrations applied lazily by the API itself,
// so schema changes ship with a normal deploy — no manual SQL step.
// Every statement is idempotent: two cold starts racing on the same version
// can both run it without harm; the version row is only a fast-path skip.
export const MIGRATIONS = [
  {
    version: 1,
    statements: [
      // Contact: WhatsApp number shown separately from the call number.
      // The existing number becomes the WhatsApp one.
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS whatsapp TEXT`,
      `UPDATE admin_settings SET whatsapp = phone WHERE whatsapp IS NULL`,
      `UPDATE admin_settings SET location = 'Cotonou, Bénin' WHERE location ILIKE 'Abomey%'`,

      // Project detail page: long-form sections + image/caption gallery
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS details_fr TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS details_en TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS contributions_fr TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS contributions_en TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS methodology_fr TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS methodology_en TEXT`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb`,
      `ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check`,
      `ALTER TABLE projects ADD CONSTRAINT projects_category_check
         CHECK (category IN ('Fullstack', 'Frontend', 'Backend', 'Mobile', 'AI oriented'))`,

      // "Ce que je sais faire" carousel
      `CREATE TABLE IF NOT EXISTS showcase_items (
         id SERIAL PRIMARY KEY,
         image_url TEXT NOT NULL,
         title_fr TEXT NOT NULL DEFAULT '', title_en TEXT,
         description_fr TEXT NOT NULL DEFAULT '', description_en TEXT,
         sort_order INTEGER NOT NULL DEFAULT 0,
         is_visible BOOLEAN NOT NULL DEFAULT true,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    ]
  },
  {
    version: 2,
    statements: [
      // Call number (distinct from the WhatsApp one set in v1)
      `UPDATE admin_settings SET phone = '+229 01 61 77 71 86' WHERE phone IS NOT DISTINCT FROM whatsapp`,

      // Placeholder carousel from the photos in public/images/showcase,
      // only if nothing was added from the admin yet. Texts are meant to be
      // replaced in Admin → Savoir-faire.
      `INSERT INTO showcase_items (image_url, title_fr, title_en, description_fr, description_en, sort_order)
       SELECT '/images/showcase/' || n || '.jpg',
              'Titre à venir ' || lpad(n::text, 2, '0'),
              'Title coming soon ' || lpad(n::text, 2, '0'),
              'Description provisoire : expliquez ici ce que montre cette image et le savoir-faire qu''elle illustre.',
              'Placeholder description: explain what this image shows and the expertise it illustrates.',
              n - 1
       FROM generate_series(1, 9) AS n
       WHERE NOT EXISTS (SELECT 1 FROM showcase_items)`
    ]
  }
];

const LATEST = MIGRATIONS[MIGRATIONS.length - 1].version;
let ready = null;

async function migrate() {
  await sql.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  const { rows } = await sql.query('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations');
  const current = Number(rows[0].v);
  if (current >= LATEST) return;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    for (const statement of migration.statements) {
      await sql.query(statement);
    }
    await sql.query(
      'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
      [migration.version]
    );
  }
}

// Memoized per serverless instance; a failure is not cached so the next
// request retries instead of the instance staying broken.
export function ensureSchema() {
  if (!ready) {
    ready = migrate().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}
