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
  },
  {
    version: 6,
    statements: [
      // Highlight color per key point (a preset name, see src/composables/figureColors.js)
      `ALTER TABLE key_figures ADD COLUMN IF NOT EXISTS color TEXT`,
      `UPDATE key_figures SET color = (ARRAY['purple', 'magenta', 'orange'])[(sort_order % 3) + 1]
       WHERE color IS NULL AND sort_order >= 0`
    ]
  },
  {
    version: 7,
    statements: [
      // A project can belong to several categories (e.g. Fullstack + AI oriented).
      // `category` stays, kept equal to the first one, for anything still reading it.
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}'`,
      `UPDATE projects SET categories = ARRAY[category] WHERE cardinality(categories) = 0 AND category IS NOT NULL`,
      `ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_categories_check`,
      `ALTER TABLE projects ADD CONSTRAINT projects_categories_check
         CHECK (categories <@ ARRAY['Fullstack', 'Frontend', 'Backend', 'Mobile', 'AI oriented']::TEXT[])`
    ]
  },
  {
    version: 8,
    statements: [
      // Custom section names / titles set in Admin > Sections:
      // { <section>: { nav_fr, nav_en, title_fr, title_en, subtitle_fr, subtitle_en } }
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '{}'::jsonb`
    ]
  },
  {
    version: 9,
    statements: [
      // Short share link per project: /<slug> (e.g. /ooffix), from the name
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT`,
      `UPDATE projects
       SET slug = trim(both '-' from regexp_replace(lower(translate(replace(replace(lower(name), 'œ', 'oe'), 'æ', 'ae'),
         'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ',
         'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUYY')), '[^a-z0-9]+', '-', 'g'))
       WHERE slug IS NULL OR slug = ''`,
      `UPDATE projects SET slug = 'projet-' || id WHERE slug = ''`,
      // Words the site already uses as paths (see RESERVED_SLUGS)
      `UPDATE projects SET slug = slug || '-projet'
       WHERE slug IN ('admin', 'projets', 'api', 'assets', 'images', 'logos', 'index', 'robots', 'sitemap', 'favicon')`,
      // Two projects with the same name: suffix the later one with its id
      `UPDATE projects p SET slug = p.slug || '-' || p.id
       WHERE EXISTS (SELECT 1 FROM projects q WHERE q.slug = p.slug AND q.id < p.id)`,
      `CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON projects (slug)`
    ]
  },
  {
    version: 10,
    statements: [
      // Projects created from an admin tab older than the share-link field
      // have no slug: generate it like v9 did. (The API now always sets one.)
      `UPDATE projects
       SET slug = trim(both '-' from regexp_replace(lower(translate(replace(replace(lower(name), 'œ', 'oe'), 'æ', 'ae'),
         'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ',
         'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUYY')), '[^a-z0-9]+', '-', 'g'))
       WHERE slug IS NULL OR slug = ''`,
      `UPDATE projects SET slug = 'projet-' || id WHERE slug = ''`,
      // Words the site already uses as paths (see RESERVED_SLUGS)
      `UPDATE projects SET slug = slug || '-projet'
       WHERE slug IN ('admin', 'projets', 'api', 'assets', 'images', 'logos', 'index', 'robots', 'sitemap', 'favicon')`,
      // Two projects with the same name: suffix the later one with its id
      `UPDATE projects p SET slug = p.slug || '-' || p.id
       WHERE EXISTS (SELECT 1 FROM projects q WHERE q.slug = p.slug AND q.id < p.id)`,
      // Display format of the long project texts: 'text' (paragraphs),
      // 'numbered' (01, 02…) or 'bullets'. One item per line when a list.
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS details_style TEXT NOT NULL DEFAULT 'text'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS contributions_style TEXT NOT NULL DEFAULT 'numbered'`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS methodology_style TEXT NOT NULL DEFAULT 'text'`
    ]
  },
  {
    version: 11,
    statements: [
      // Color of the numbers / dashes of a list block: '' (accent),
      // a figure color name (purple, magenta…) or 'mixed' (one per point)
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS details_color TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS contributions_color TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS methodology_color TEXT NOT NULL DEFAULT ''`
    ]
  },
  {
    version: 12,
    statements: [
      // English texts generated from the French (see api/_lib/translate.js):
      // { <field>: { from, to } }, so a hand-written English is never overwritten
      ...['timeline_items', 'skills', 'projects', 'key_figures', 'showcase_items', 'testimonials', 'admin_settings'].map(
        (table) => `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS auto_en JSONB NOT NULL DEFAULT '{}'::jsonb`
      )
    ]
  },
  {
    version: 13,
    statements: [
      // The English placeholders seeded in v2 looked hand-written to the
      // automatic translation, which then never replaced them: empty them
      `UPDATE showcase_items SET title_en = '' WHERE title_en LIKE 'Title coming soon %'`,
      `UPDATE showcase_items SET description_en = '' WHERE description_en LIKE 'Placeholder description:%'`
    ]
  },
  {
    version: 14,
    statements: [
      // "Découvrir" page (/decouvrir): sections shown one after the other,
      // each with a carousel of cards [{ title_fr, title_en, text_fr, text_en, image_url, auto_en }]
      `CREATE TABLE IF NOT EXISTS discover_sections (
         id SERIAL PRIMARY KEY,
         title_fr TEXT NOT NULL DEFAULT '', title_en TEXT,
         intro_fr TEXT NOT NULL DEFAULT '', intro_en TEXT,
         cards JSONB NOT NULL DEFAULT '[]'::jsonb,
         sort_order INTEGER NOT NULL DEFAULT 0,
         is_visible BOOLEAN NOT NULL DEFAULT true,
         auto_en JSONB NOT NULL DEFAULT '{}'::jsonb,
         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
      // First content (sent on 26/10/2026), to edit from Admin > Découvrir.
      // A section without cards isn't shown on the site.
      `INSERT INTO discover_sections (title_fr, intro_fr, cards, sort_order)
       SELECT v.t, v.i, v.c, v.o
       FROM (VALUES
         ($seed$Compétences techniques$seed$, $seed$$seed$, $seed$[{"title_fr": "Analyse fonctionnelle et gestion de produit", "title_en": "", "text_fr": "Rédaction de cahiers des fonctionnalités, règles de gestion, workflows par profil d’utilisateur, architecture de l’information, préparation et pilotage de la recette client.", "text_en": "", "image_url": ""}, {"title_fr": "Développement et déploiement", "title_en": "", "text_fr": "Applications web (Next.js, NestJS, Laravel, Vue) et mobiles (Flutter), publication sur Google Play et l’App Store, intégration de paiements en ligne, hébergement et mise en production.", "text_en": "", "image_url": ""}, {"title_fr": "Qualité logicielle (QA)", "title_en": "", "text_fr": "Tests automatisés de bout en bout (Playwright), audits de sécurité, de performance, de SEO et d’accessibilité mobile, analyse de fiabilité et réduction des faux positifs.", "text_en": "", "image_url": ""}, {"title_fr": "Business et finance", "title_en": "", "text_fr": "Études de faisabilité et de marché, modèles économiques, calcul de rentabilité (coût unitaire, marge, CAC, LTV), tarification, devis et échéanciers.", "text_en": "", "image_url": ""}, {"title_fr": "Marketing et croissance", "title_en": "", "text_fr": "Stratégie go-to-market, personas, positionnement, prospection par email et LinkedIn, publicité Meta, stratégie de contenu, animation de communauté.", "text_en": "", "image_url": ""}, {"title_fr": "Contenu et formation", "title_en": "", "text_fr": "Copywriting, rédaction de contenus longs, conception et animation d’ateliers et de masterclass.", "text_en": "", "image_url": ""}, {"title_fr": "Création assistée par IA", "title_en": "", "text_fr": "Rédaction de prompts, production de visuels et de vidéos avec des outils d’IA générative, processus de production documentés.", "text_en": "", "image_url": ""}, {"title_fr": "Langues", "title_en": "", "text_fr": "Français et anglais professionnels.", "text_en": "", "image_url": ""}]$seed$::jsonb, 0),
         ($seed$Compétences humaines$seed$, $seed$$seed$, $seed$[{"title_fr": "Clarté et sens de l’essentiel", "title_en": "", "text_fr": "Je vais droit au but. Un livrable doit être compris vite et utilisable tout de suite.", "text_en": "", "image_url": ""}, {"title_fr": "Intégrité", "title_en": "", "text_fr": "Je ne présente jamais comme terminé ce qui ne l’est pas. Je préfère signaler un risque tôt plutôt que le découvrir trop tard.", "text_en": "", "image_url": ""}, {"title_fr": "Persévérance", "title_en": "", "text_fr": "Face à un blocage technique ou administratif, je cherche la cause, je teste et j’avance jusqu’à la solution.", "text_en": "", "image_url": ""}, {"title_fr": "Orientation client", "title_en": "", "text_fr": "Je fais valider chaque étape et je mets le client en situation réelle pour qu’il décide en connaissance de cause.", "text_en": "", "image_url": ""}, {"title_fr": "Aisance relationnelle", "title_en": "", "text_fr": "Je construis la relation avant de proposer quoi que ce soit, avec des partenaires, des prospects ou des collaborateurs.", "text_en": "", "image_url": ""}, {"title_fr": "Esprit critique", "title_en": "", "text_fr": "Je vérifie mes propres affirmations et je challenge les hypothèses avant de m’appuyer dessus.", "text_en": "", "image_url": ""}, {"title_fr": "Leadership et transmission", "title_en": "", "text_fr": "Je fédère une communauté, j’anime des formations et j’aime faire monter les autres en compétence.", "text_en": "", "image_url": ""}, {"title_fr": "Autonomie", "title_en": "", "text_fr": "Je sais mener plusieurs sujets de front et organiser mon travail sans supervision rapprochée.", "text_en": "", "image_url": ""}]$seed$::jsonb, 1),
         ($seed$Ma méthode de travail$seed$, $seed$Ce qui me distingue, c’est moins un outil qu’une façon de travailler, que j’applique sur chaque mission.$seed$, $seed$[{"title_fr": "Je pars du problème, pas de la solution", "title_en": "", "text_fr": "Avant de construire, je cherche le besoin réel et la personne qui en souffre. La technique et la communication viennent ensuite.", "text_en": "", "image_url": ""}, {"title_fr": "J’avance par étapes validées", "title_en": "", "text_fr": "Je découpe le travail en parties courtes et je fais valider chacune avant de passer à la suivante. Les erreurs restent petites et faciles à corriger.", "text_en": "", "image_url": ""}, {"title_fr": "Je documente tout", "title_en": "", "text_fr": "Notes de passation, rapports internes, guides mis à jour après chaque projet : n’importe qui peut reprendre mon travail là où je l’ai laissé.", "text_en": "", "image_url": ""}, {"title_fr": "Je transforme ce qui marche en système", "title_en": "", "text_fr": "Une méthode qui a fait ses preuves devient une checklist, un modèle ou un processus réutilisable par l’équipe.", "text_en": "", "image_url": ""}, {"title_fr": "Je raisonne en chiffres", "title_en": "", "text_fr": "Coûts, marges, taille du marché : je chiffre mes décisions et je sépare clairement les données confirmées des hypothèses.", "text_en": "", "image_url": ""}, {"title_fr": "Je pilote l’IA, je ne la subis pas", "title_en": "", "text_fr": "Je fixe un cadre précis, je contrôle chaque résultat et je garde la décision. L’IA me fait gagner du temps sans dégrader la qualité.", "text_en": "", "image_url": ""}, {"title_fr": "Je pense local et global", "title_en": "", "text_fr": "Je sais adapter une offre aux réalités d’un marché africain comme la présenter à un public international.", "text_en": "", "image_url": ""}]$seed$::jsonb, 2),
         ($seed$Ce que j’apporte à une équipe$seed$, $seed$Une personne capable de faire le lien entre le client, l’équipe technique et la direction. Je traduis un besoin métier en spécifications claires, je m’assure que ce qui est livré fonctionne vraiment, et je sais expliquer la valeur du produit à ceux qui vont l’acheter ou l’utiliser.
Je suis particulièrement à l’aise dans les rôles suivants.$seed$, $seed$[{"title_fr": "Chef de produit", "title_en": "", "text_fr": "Product Manager ou Product Owner.", "text_en": "", "image_url": ""}, {"title_fr": "Analyste fonctionnel", "title_en": "", "text_fr": "", "text_en": "", "image_url": ""}, {"title_fr": "Responsable croissance d’un produit digital", "title_en": "", "text_fr": "", "text_en": "", "image_url": ""}, {"title_fr": "Consultant en transformation digitale et IA", "title_en": "", "text_fr": "", "text_en": "", "image_url": ""}]$seed$::jsonb, 3)
       ) AS v(t, i, c, o)
       WHERE NOT EXISTS (SELECT 1 FROM discover_sections)`,
      // Page title and introduction
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS discover_title_fr TEXT`,
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS discover_title_en TEXT`,
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS discover_intro_fr TEXT`,
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS discover_intro_en TEXT`,
      `UPDATE admin_settings SET discover_title_fr = 'Qui je suis', discover_intro_fr = $seed$Je conçois, structure et lance des produits digitaux, de l’idée jusqu’aux premiers utilisateurs.

Mon rôle se situe à la croisée du produit, de la technique, du business et de la communication. Je sais prendre un besoin flou, celui d’un client ou d’un marché, et le transformer en solution claire, chiffrée et prête à être déployée.

J’ai mené des projets pour des clients locaux comme pour des marchés internationaux, en français et en anglais. Je travaille au quotidien avec l’intelligence artificielle, que j’utilise comme un levier de productivité maîtrisé.$seed$
       WHERE id = 1 AND discover_title_fr IS NULL AND discover_intro_fr IS NULL`,
      // The page's path is now reserved (see RESERVED_SLUGS)
      `UPDATE projects SET slug = slug || '-projet' WHERE slug = 'decouvrir'`
    ]
  },
  {
    version: 15,
    statements: [
      // Découvrir, second pass (26/10/2026): a small label and a color per
      // section, the header photo, and the content revised with the user
      // (shorter cards, concrete examples). English emptied so the automatic
      // translation redoes it. Rows already renamed in the admin are left alone.
      `ALTER TABLE discover_sections ADD COLUMN IF NOT EXISTS eyebrow_fr TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE discover_sections ADD COLUMN IF NOT EXISTS eyebrow_en TEXT`,
      `ALTER TABLE discover_sections ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS discover_photo_url TEXT`,
      `UPDATE admin_settings SET discover_photo_url = '/images/discover/ginique-lawani.jpg' WHERE id = 1 AND discover_photo_url IS NULL`,
      `UPDATE discover_sections SET eyebrow_fr = $seed$Hard skills$seed$, title_fr = $seed$Compétences techniques$seed$, intro_fr = $seed$$seed$, color = 'blue', eyebrow_en = NULL, title_en = NULL, intro_en = NULL, auto_en = '{}'::jsonb, updated_at = now(), cards = $seed$[{"title_fr": "Analyse fonctionnelle et gestion de produit", "title_en": "", "text_fr": "Cahiers des fonctionnalités, règles de gestion, workflows par profil d’utilisateur, pilotage de la recette client.", "text_en": "", "image_url": ""}, {"title_fr": "Développement / Conception web et déploiement", "title_en": "", "text_fr": "Applications web (Next.js, NestJS, Laravel, Vue) et mobiles (Flutter), paiements en ligne, publication sur les stores et mise en production.", "text_en": "", "image_url": ""}, {"title_fr": "Quality Assurance (QA)", "title_en": "", "text_fr": "Tests automatisés de bout en bout (Playwright), audits de sécurité, de performance, de SEO et d’accessibilité mobile.", "text_en": "", "image_url": ""}, {"title_fr": "Business et finance", "title_en": "", "text_fr": "Études de faisabilité et de marché, modèles économiques, rentabilité (coût unitaire, marge, CAC, LTV), tarification et devis.", "text_en": "", "image_url": ""}, {"title_fr": "Marketing et croissance", "title_en": "", "text_fr": "Stratégie go-to-market, personas, positionnement, prospection par email et LinkedIn, publicité Meta, animation de communauté.", "text_en": "", "image_url": ""}, {"title_fr": "Contenu et formation", "title_en": "", "text_fr": "Copywriting, rédaction de contenus longs, conception et animation d’ateliers et de masterclass.", "text_en": "", "image_url": ""}, {"title_fr": "Création assistée par IA", "title_en": "", "text_fr": "Rédaction de prompts, production de visuels et de vidéos avec des outils d’IA générative, processus de production documentés.", "text_en": "", "image_url": ""}]$seed$::jsonb
       WHERE title_fr = $seed$Compétences techniques$seed$`,
      `UPDATE discover_sections SET eyebrow_fr = $seed$Soft skills$seed$, title_fr = $seed$Compétences humaines$seed$, intro_fr = $seed$$seed$, color = 'magenta', eyebrow_en = NULL, title_en = NULL, intro_en = NULL, auto_en = '{}'::jsonb, updated_at = now()
       WHERE title_fr = $seed$Compétences humaines$seed$`,
      `UPDATE discover_sections SET eyebrow_fr = $seed$Méthodologie$seed$, title_fr = $seed$Ma méthode de travail$seed$, intro_fr = $seed$Ce qui me distingue, c’est moins un outil qu’une façon de travailler, que j’applique sur chaque mission.$seed$, color = 'orange', eyebrow_en = NULL, title_en = NULL, intro_en = NULL, auto_en = '{}'::jsonb, updated_at = now(), cards = $seed$[{"title_fr": "Je pars du problème, pas de la solution", "title_en": "", "text_fr": "Avant de construire, je cherche le besoin réel. Chez Ethos, l’école gérait à la main candidatures, bourses et paiements : la plateforme est partie de ce constat, la technique est venue ensuite.", "text_en": "", "image_url": ""}, {"title_fr": "J’avance par étapes validées", "title_en": "", "text_fr": "Je découpe le travail en parties courtes, validées une à une. Sur VibenGo, chaque fonctionnalité avait sa branche, vérifiée (build, tests) avant d’être fusionnée avec l’accord de la CTO.", "text_en": "", "image_url": ""}, {"title_fr": "Je documente tout", "title_en": "", "text_fr": "Sur chaque projet, je tiens un fichier work.md. Une documentation classique décrit le code, pas les choix : celui-ci garde aussi les préférences et les décisions, même émotionnelles, avec leur justification, pour les comprendre et les réutiliser ailleurs.", "text_en": "", "image_url": ""}, {"title_fr": "Je transforme ce qui marche en système", "title_en": "", "text_fr": "Une méthode qui a fait ses preuves devient un modèle réutilisable. Exemple : chaque projet de ce portfolio est rédigé à partir d’une même fiche type.", "text_en": "", "image_url": ""}, {"title_fr": "Je raisonne en chiffres", "title_en": "", "text_fr": "Coûts, marges, taille du marché : je chiffre mes décisions et je sépare clairement les données confirmées des hypothèses.", "text_en": "", "image_url": ""}, {"title_fr": "Je pilote l’IA", "title_en": "", "text_fr": "Je fixe un cadre précis, je contrôle chaque résultat et je garde la décision. Ce portfolio a été construit avec une IA, sous mes consignes, étape par étape.", "text_en": "", "image_url": ""}, {"title_fr": "Je pense local et global", "title_en": "", "text_fr": "Je sais adapter une offre à chaque marché. Sur VibenGo, j’ai travaillé le déploiement business sur les marchés américain, français et africain anglophone.", "text_en": "", "image_url": ""}]$seed$::jsonb
       WHERE title_fr = $seed$Ma méthode de travail$seed$`,
      `UPDATE discover_sections SET eyebrow_fr = $seed$Valeur ajoutée$seed$, title_fr = $seed$Ce que j’apporte concrètement à une équipe$seed$, intro_fr = $seed$$seed$, color = 'teal', eyebrow_en = NULL, title_en = NULL, intro_en = NULL, auto_en = '{}'::jsonb, updated_at = now(), cards = $seed$[{"title_fr": "Développement technique", "title_en": "", "text_fr": "Je conçois et je développe des applications web et mobiles complètes, du back-end à la mise en production.", "text_en": "", "image_url": ""}, {"title_fr": "Product management", "title_en": "", "text_fr": "Je pilote aussi le volet business des solutions, pas seulement la technique : besoins, priorités et valeur pour l’utilisateur.", "text_en": "", "image_url": ""}, {"title_fr": "Analyse fonctionnelle", "title_en": "", "text_fr": "À l’aise avec les chiffres, je documente et je traduis un besoin métier en spécifications claires.", "text_en": "", "image_url": ""}, {"title_fr": "Croissance d’un produit digital", "title_en": "", "text_fr": "Positionnement, acquisition et contenu pour faire connaître un produit et faire grandir sa base d’utilisateurs.", "text_en": "", "image_url": ""}, {"title_fr": "Transformation digitale et IA", "title_en": "", "text_fr": "J’accompagne les équipes pour digitaliser leurs processus et intégrer l’IA de façon maîtrisée.", "text_en": "", "image_url": ""}]$seed$::jsonb
       WHERE title_fr = $seed$Ce que j’apporte à une équipe$seed$`,
      `UPDATE admin_settings
       SET discover_title_fr = 'Mieux me connaître', discover_title_en = NULL,
           discover_intro_fr = $seed$Mon rôle se situe à la croisée du produit, de la technique, du business et de la communication. Je sais prendre un besoin flou, celui d’un client ou d’un marché, et le transformer en solution claire, chiffrée et prête à être déployée.

J’ai mené des projets pour des clients locaux comme pour des marchés internationaux, en français et en anglais. Je travaille au quotidien avec l’intelligence artificielle, que j’utilise comme un levier de productivité maîtrisé.$seed$, discover_intro_en = NULL,
           auto_en = auto_en - 'discover_title' - 'discover_intro'
       WHERE id = 1 AND discover_title_fr = 'Qui je suis'`
    ]
  },
  {
    version: 16,
    statements: [
      // Découvrir, card "Je pilote l’IA": new text asked by the user (no more
      // "ce portfolio a été construit avec une IA"). Only if the card still has
      // the v15 text; its English is emptied so it gets translated again.
      `UPDATE discover_sections
       SET cards = (
         SELECT jsonb_agg(
           CASE WHEN c->>'title_fr' = 'Je pilote l’IA' AND c->>'text_fr' LIKE '%construit avec une IA%'
             THEN (c - 'auto_en') || jsonb_build_object('text_fr', $seed$Passionné d’intelligence artificielle, je fais beaucoup de recherches sur les outils IA pour les combiner avec mes compétences. Je fixe le cadre, je contrôle chaque résultat et je garde la décision.$seed$, 'title_en', '', 'text_en', '')
             ELSE c END
           ORDER BY ord)
         FROM jsonb_array_elements(cards) WITH ORDINALITY AS t(c, ord)
       ),
       updated_at = now()
       WHERE cards @> '[{"title_fr": "Je pilote l’IA"}]'::jsonb`
    ]
  },
  {
    version: 17,
    statements: [
      // Découvrir introduction: passages underlined in yellow (==…==, see
      // highlightParts in src/composables/richText.js), chosen by the user.
      // Skipped if the text already has markers; English emptied to be retranslated.
      `UPDATE admin_settings
       SET discover_intro_fr = replace(replace(replace(replace(replace(discover_intro_fr, 'prendre un besoin flou', '==prendre un besoin flou=='), 'transformer en solution claire', '==transformer en solution claire=='), 'marchés internationaux', '==marchés internationaux=='), 'l’intelligence artificielle', '==l’intelligence artificielle=='), 'productivité maîtrisé', '==productivité maîtrisé=='),
           discover_intro_en = NULL,
           auto_en = auto_en - 'discover_intro'
       WHERE id = 1 AND discover_intro_fr IS NOT NULL AND discover_intro_fr NOT LIKE '%==%'`,
      // Hard skills, development card: no Laravel / Flutter, "intégration de paiements"
      `UPDATE discover_sections
       SET cards = (
         SELECT jsonb_agg(
           CASE WHEN c->>'title_fr' = 'Développement / Conception web et déploiement' AND c->>'text_fr' LIKE '%Laravel%'
             THEN (c - 'auto_en') || jsonb_build_object('text_fr', $seed$Applications web (Next.js, NestJS, Vue) et mobiles, intégration de paiements en ligne, publication sur les stores et mise en production.$seed$, 'title_en', '', 'text_en', '')
             ELSE c END
           ORDER BY ord)
         FROM jsonb_array_elements(cards) WITH ORDINALITY AS t(c, ord)
       ),
       updated_at = now()
       WHERE cards @> '[{"title_fr": "Développement / Conception web et déploiement"}]'::jsonb`
    ]
  },
  {
    version: 18,
    statements: [
      // Fewer underlined passages (user's choice): only "transformer en
      // solution claire" and "l’intelligence artificielle" stay marked
      `UPDATE admin_settings
       SET discover_intro_fr = replace(replace(replace(discover_intro_fr,
             '==prendre un besoin flou==', 'prendre un besoin flou'),
             '==marchés internationaux==', 'marchés internationaux'),
             '==productivité maîtrisé==', 'productivité maîtrisé'),
           discover_intro_en = NULL,
           auto_en = auto_en - 'discover_intro'
       WHERE id = 1 AND discover_intro_fr LIKE '%==prendre un besoin flou==%'`
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
