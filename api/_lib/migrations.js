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
  },
  {
    version: 3,
    statements: [
      // More logos for the skill cards (files in public/logos, from Simple Icons, CC0).
      // Skipped when a logo with the same name already exists.
      `INSERT INTO tech_logos (name, image_url, sort_order)
       SELECT v.name, v.url, 100 + v.ord
       FROM (VALUES
         ('Vue.js', '/logos/vuejs.svg', 1),
         ('Flask', '/logos/flask.svg', 2),
         ('Trello', '/logos/trello.svg', 3),
         ('Notion', '/logos/notion.svg', 4),
         ('Git', '/logos/git.svg', 5),
         ('ClickUp', '/logos/clickup.svg', 6),
         ('Claude', '/logos/claude.svg', 7),
         ('GitHub Copilot', '/logos/githubcopilot.svg', 8),
         ('Google Gemini', '/logos/googlegemini.svg', 9)
       ) AS v(name, url, ord)
       WHERE NOT EXISTS (SELECT 1 FROM tech_logos t WHERE lower(t.name) = lower(v.name))`
    ]
  },
  {
    version: 4,
    statements: [
      // Admin password set from the back-office (overrides the hash in auth.js)
      `CREATE TABLE IF NOT EXISTS admin_auth (
         id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
         password_hash TEXT NOT NULL,
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
      // Failed logins per IP, for the brute-force lockout
      `CREATE TABLE IF NOT EXISTS login_attempts (
         id SERIAL PRIMARY KEY,
         ip TEXT NOT NULL,
         attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
      `CREATE INDEX IF NOT EXISTS login_attempts_ip_time ON login_attempts (ip, attempted_at)`
    ]
  },
  {
    version: 5,
    statements: [
      // About section key points: a list (add/remove from the admin) instead
      // of the three fixed stat1..3 fields, which seed it once
      `CREATE TABLE IF NOT EXISTS key_figures (
         id SERIAL PRIMARY KEY,
         value TEXT NOT NULL DEFAULT '',
         label_fr TEXT NOT NULL DEFAULT '', label_en TEXT,
         sort_order INTEGER NOT NULL DEFAULT 0,
         is_visible BOOLEAN NOT NULL DEFAULT true,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
      `INSERT INTO key_figures (value, label_fr, label_en, sort_order)
       SELECT x.v, COALESCE(x.lf, ''), x.le, x.o
       FROM admin_settings s,
       LATERAL (VALUES
         (s.stat1_value, s.stat1_label_fr, s.stat1_label_en, 0),
         (s.stat2_value, s.stat2_label_fr, s.stat2_label_en, 1),
         (s.stat3_value, s.stat3_label_fr, s.stat3_label_en, 2)
       ) AS x(v, lf, le, o)
       WHERE s.id = 1 AND COALESCE(x.v, '') <> ''
         AND NOT EXISTS (SELECT 1 FROM key_figures)`
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
