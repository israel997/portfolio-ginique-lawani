-- Back-office schema for the portfolio. Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS admin_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name TEXT NOT NULL DEFAULT 'Ginique Oriadé LAWANI',
  brand_label TEXT NOT NULL DEFAULT 'Portfolio.Dev',

  typewriter1_fr TEXT, typewriter1_en TEXT,
  typewriter2_fr TEXT, typewriter2_en TEXT,
  hero_intro_fr TEXT, hero_intro_en TEXT,
  hero_intro2_fr TEXT, hero_intro2_en TEXT,

  bio1_fr TEXT, bio1_en TEXT,
  bio2_fr TEXT, bio2_en TEXT,

  stat1_value TEXT DEFAULT '8+', stat1_label_fr TEXT, stat1_label_en TEXT,
  stat2_value TEXT DEFAULT '15+', stat2_label_fr TEXT, stat2_label_en TEXT,
  stat3_value TEXT DEFAULT '02', stat3_label_fr TEXT, stat3_label_en TEXT,

  email TEXT,
  phone TEXT,
  location TEXT,
  availability_fr TEXT, availability_en TEXT,

  cv_url TEXT,
  cv_filename TEXT,
  profile_photo_url TEXT,
  hero_badge_image_url TEXT,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline_items (
  id SERIAL PRIMARY KEY,
  year_label TEXT NOT NULL,
  title_fr TEXT NOT NULL, title_en TEXT NOT NULL,
  company_fr TEXT NOT NULL, company_en TEXT NOT NULL,
  description_fr TEXT NOT NULL, description_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  title_fr TEXT NOT NULL, title_en TEXT NOT NULL,
  description_fr TEXT NOT NULL, description_en TEXT NOT NULL,
  icon_key TEXT NOT NULL DEFAULT 'frontend',
  icon_bg_class TEXT NOT NULL DEFAULT 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
  techs TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tech_logos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description_fr TEXT NOT NULL, description_en TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  gradient_class TEXT NOT NULL DEFAULT 'from-pink-500 to-rose-600',
  category TEXT NOT NULL DEFAULT 'Fullstack'
    CHECK (category IN ('Fullstack', 'Frontend', 'Backend', 'Mobile')),
  image_url TEXT,
  project_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role_fr TEXT NOT NULL, role_en TEXT,
  initials TEXT NOT NULL,
  avatar_gradient_class TEXT NOT NULL DEFAULT 'from-pink-500 to-rose-500',
  quote_fr TEXT NOT NULL, quote_en TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  custom_svg TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
