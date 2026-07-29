// One-time seed: creates the schema (if missing) and inserts today's hardcoded
// portfolio content, so the admin back-office has something to edit and the
// public site renders identically to the current static build.
// Safe to re-run: every insert is skipped if the table already has rows.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { sql } from '@vercel/postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function runSchema() {
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
  }
}

async function seedSettings() {
  const { rows } = await sql`SELECT id FROM admin_settings WHERE id = 1`;
  if (rows.length) return;
  await sql`
    INSERT INTO admin_settings (
      id, full_name, brand_label,
      typewriter1_fr, typewriter1_en, typewriter2_fr, typewriter2_en,
      hero_intro_fr, hero_intro_en, hero_intro2_fr, hero_intro2_en,
      bio1_fr, bio1_en, bio2_fr, bio2_en,
      stat1_value, stat1_label_fr, stat1_label_en,
      stat2_value, stat2_label_fr, stat2_label_en,
      stat3_value, stat3_label_fr, stat3_label_en,
      email, phone, location, availability_fr, availability_en,
      cv_url, cv_filename, profile_photo_url, hero_badge_image_url
    ) VALUES (
      1, 'Ginique Oriadé LAWANI', 'Portfolio.Dev',
      'Fullstack Developper & Tech Lead', 'Fullstack Developer & Tech Lead',
      'Creative and Business Solutions oriented.', 'Creative and Business Solutions oriented.',
      'Développeur Fullstack, créatif, passionné par la transformation digitale',
      'Fullstack Developer, creative, passionate about digital transformation',
      'et les stratégies de croissance business',
      'and business growth strategies',
      'Développeur Fullstack créatif avec 8 ans d''expertise en gestion de projets d''entreprise.',
      'Creative Fullstack Developer with 8 years of expertise in enterprise project management.',
      'Spécialisé dans la transformation digitale et les stratégies de croissance business, je transforme des idées innovantes en solutions digitales impactantes.',
      'Specialized in digital transformation and business growth strategies, I transform innovative ideas into impactful digital solutions.',
      '8+', 'Années de gestion de projets', 'Years of project management',
      '15+', 'Projets réalisés', 'Projects completed',
      '02', 'Certifications Internationales', 'International Certifications',
      'ginique.lawani@epitech.eu', '+229 01 61 77 71 86', 'Abomey-Calavi, Bénin',
      'Disponible pour vos missions présentielles et freelance',
      'Available for your on-site and freelance missions',
      '/Ginique-Oriadé-LAWANI-FlowCV-Resume-20251120.pdf',
      'Ginique-Oriadé-LAWANI-FlowCV-Resume-20251120.pdf',
      '/profile2.jpg', '/images/nasa.jpg'
    )
  `;
}

async function seedTimeline() {
  const { rows } = await sql`SELECT id FROM timeline_items LIMIT 1`;
  if (rows.length) return;
  const items = [
    ['2025-2026', 'Certificat Coding Academy', 'Coding Academy Certificate', 'Epitech Bénin', 'Epitech Benin', 'Formation intensive en développement logiciel et technologies avancées', 'Intensive training in software development and advanced technologies'],
    ['2025', 'Certifications NASA & Postman', 'NASA & Postman Certifications', 'NASA Space App Challenge / Postman', 'NASA Space App Challenge / Postman', 'Problem Solver (NASA) • Postman API Fundamentals Student Expert', 'Problem Solver (NASA) • Postman API Fundamentals Student Expert'],
    ['2022-2025', 'Consultant en Transition Numérique', 'Digital Transformation Consultant', 'Indépendant', 'Independent', 'Spécialisé dans les industries culturelles et créatives. Accompagnement stratégique pour la transformation digitale.', 'Specialized in cultural and creative industries. Strategic support for digital transformation.'],
    ['2020-2022', 'Responsable de Projets Digitaux', 'Digital Projects Manager', 'WEEMA PRIME', 'WEEMA PRIME', 'Gestion et coordination de projets digitaux d\'envergure', 'Management and coordination of large-scale digital projects'],
    ['2017', 'Sciences Économiques', 'Economic Sciences', 'Université d\'Abomey Calavi', 'University of Abomey Calavi', 'Formation en sciences économiques et gestion', 'Training in economics and management']
  ];
  for (let i = 0; i < items.length; i++) {
    const [year, titleFr, titleEn, companyFr, companyEn, descFr, descEn] = items[i];
    await sql`
      INSERT INTO timeline_items (year_label, title_fr, title_en, company_fr, company_en, description_fr, description_en, sort_order)
      VALUES (${year}, ${titleFr}, ${titleEn}, ${companyFr}, ${companyEn}, ${descFr}, ${descEn}, ${i})
    `;
  }
}

async function seedSkills() {
  const { rows } = await sql`SELECT id FROM skills LIMIT 1`;
  if (rows.length) return;
  const items = [
    ['frontend', 'Frontend Development', 'Frontend Development', "Création d'interfaces modernes et réactives avec les dernières technologies web.", 'Creation of modern and responsive interfaces with the latest web technologies.', 'bg-gradient-to-br from-pink-500/20 to-rose-500/20', ['React', 'Next.js', 'Vue.js', 'TailwindCSS']],
    ['backend', 'Backend Development', 'Backend Development', 'Architecture backend robuste et scalable pour des applications performantes.', 'Robust and scalable backend architecture for high-performance applications.', 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', ['Node.js', 'Nest.js', 'Laravel', 'Flask']],
    ['database', 'Database & DevOps', 'Database & DevOps', "Gestion de bases de données et déploiement d'applications avec les meilleures pratiques.", 'Database management and application deployment with best practices.', 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20', ['MongoDB', 'PostgreSQL', 'Docker', 'Postman']],
    ['methodologies', 'Méthodologies', 'Methodologies', 'Application des méthodes agiles pour une gestion de projet efficace et collaborative.', 'Application of agile methods for efficient and collaborative project management.', 'bg-gradient-to-br from-rose-500/20 to-orange-500/20', ['Agile', 'Scrum', 'Transformation Digitale']],
    ['tools', 'Outils de Gestion', 'Management Tools', 'Maîtrise des outils modernes de gestion de projet et de collaboration.', 'Mastery of modern project management and collaboration tools.', 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20', ['Trello', 'Notion', 'Git', 'ClickUp', 'Teams']],
    ['ai', 'Intelligence Artificielle', 'Artificial Intelligence', "Utilisation d'outils IA de pointe pour optimiser le développement et la productivité.", 'Use of cutting-edge AI tools to optimize development and productivity.', 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20', ['Claude Sonnet', 'Copilot', 'Grok', 'Antigravity', 'Gemini', 'Raptor']]
  ];
  for (let i = 0; i < items.length; i++) {
    const [iconKey, titleFr, titleEn, descFr, descEn, iconBg, techs] = items[i];
    await sql`
      INSERT INTO skills (icon_key, title_fr, title_en, description_fr, description_en, icon_bg_class, techs, sort_order)
      VALUES (${iconKey}, ${titleFr}, ${titleEn}, ${descFr}, ${descEn}, ${iconBg}, ${techs}, ${i})
    `;
  }
}

async function seedLogos() {
  const { rows } = await sql`SELECT id FROM tech_logos LIMIT 1`;
  if (rows.length) return;
  const items = [
    ['React', '/logos/react.svg'],
    ['Next.js', '/logos/nextjs.svg'],
    ['Node.js', '/logos/nodejs.svg'],
    ['Nest.js', '/logos/nestjs.svg'],
    ['TypeScript', '/logos/typescript.svg'],
    ['JavaScript', '/logos/javascript.svg'],
    ['HTML5', '/logos/html5.svg'],
    ['CSS3', '/logos/css3.svg'],
    ['Tailwind CSS', '/logos/tailwindcss.svg'],
    ['Laravel', '/logos/laravel.svg'],
    ['Python', '/logos/python.svg'],
    ['FastAPI', '/logos/fastapi.svg'],
    ['Flutter', '/logos/flutter.svg'],
    ['MongoDB', '/logos/mongodb.svg'],
    ['PostgreSQL', '/logos/postgresql.svg'],
    ['MySQL', '/logos/mysql.svg'],
    ['SQLite', '/logos/sqlite.svg'],
    ['Docker', '/logos/docker.svg'],
    ['Postman', '/logos/postman.svg'],
    ['VS Code', '/logos/vscode.svg']
  ];
  for (let i = 0; i < items.length; i++) {
    const [name, url] = items[i];
    await sql`INSERT INTO tech_logos (name, image_url, sort_order) VALUES (${name}, ${url}, ${i})`;
  }
}

async function seedProjects() {
  const { rows } = await sql`SELECT id FROM projects LIMIT 1`;
  if (rows.length) return;
  const items = [
    ['Sanaa', 'Réseau social de niche dédié aux Industries Culturelles et Créatives avec option de Crowdfunding intégrée', 'Niche social network dedicated to Cultural and Creative Industries with integrated Crowdfunding option', ['Next.js', 'TailwindCSS'], 'from-pink-500 to-rose-600', 'Fullstack', '/images/sanaa.jpg', 'https://saana-for-creators.vercel.app/'],
    ['Cinémania', 'Plateforme complète de streaming en ligne avec intégration MovieDB', 'Complete online streaming platform with MovieDB integration', ['Next.js', 'API MovieDB'], 'from-blue-500 to-cyan-600', 'Frontend', '/images/cinemania.jpg', 'https://deep-sigma.vercel.app/'],
    ['WeTrust', 'Site web et communauté en ligne pour commenter tout contenu sur internet', 'Website and online community to comment on any internet content', ['Vue.js', 'Laravel', 'MySQL', 'API'], 'from-violet-500 to-purple-600', 'Fullstack', '/images/wetrust.jpg', 'https://wetrust-yowl.netlify.app/'],
    ['MyShowTime', "Site web de réservation de tickets d'événements avec gestion complète", 'Event ticket booking website with complete management', ['Nest.js', 'MongoDB'], 'from-orange-500 to-red-600', 'Backend', 'https://placehold.co/800x600/ea580c/ffffff?text=MyShowTime', null],
    ['TrellTech', "App mobile qui consomme l'API de Trello pour la gestion de projets. Développé avec React Native et Expo.", 'Mobile app that consumes Trello API for project management. Built with React Native and Expo.', ['React Native', 'Expo'], 'from-teal-500 to-emerald-600', 'Frontend', 'https://placehold.co/800x600/14b8a6/ffffff?text=TrellTech', null]
  ];
  for (let i = 0; i < items.length; i++) {
    const [name, descFr, descEn, tags, gradient, category, image, url] = items[i];
    await sql`
      INSERT INTO projects (name, description_fr, description_en, tags, gradient_class, category, image_url, project_url, sort_order)
      VALUES (${name}, ${descFr}, ${descEn}, ${tags}, ${gradient}, ${category}, ${image}, ${url}, ${i})
    `;
  }
}

async function seedTestimonials() {
  const { rows } = await sql`SELECT id FROM testimonials LIMIT 1`;
  if (rows.length) return;
  const items = [
    ['Idelphonse MOUGNANOU', 'Responsable Career Center Epitech Benin', 'IM', 'from-pink-500 to-rose-500', 'Ginique a transformé notre vision en une application web performante. Son expertise technique et sa créativité ont dépassé nos attentes.'],
    ['Focas TCHANHOUN', 'APE Epitech Benin', 'FT', 'from-purple-500 to-indigo-500', 'Un développeur exceptionnel qui comprend les enjeux business. Sa capacité à gérer des projets complexes est remarquable.'],
    ['Fatima YARO', 'APE Epitech Benin', 'FY', 'from-indigo-500 to-blue-500', 'Collaboration fluide et résultats impressionnants. Ginique apporte une vraie valeur ajoutée à chaque projet.'],
    ['Yemalin AGBANGLA', 'APE Epitech Benin', 'YA', 'from-cyan-500 to-teal-500', 'Un professionnel rigoureux et passionné. Son approche méthodique et sa créativité font la différence sur chaque projet.']
  ];
  for (let i = 0; i < items.length; i++) {
    const [name, role, initials, gradient, quote] = items[i];
    await sql`
      INSERT INTO testimonials (name, role_fr, initials, avatar_gradient_class, quote_fr, sort_order)
      VALUES (${name}, ${role}, ${initials}, ${gradient}, ${quote}, ${i})
    `;
  }
}

async function seedSocialLinks() {
  const { rows } = await sql`SELECT id FROM social_links LIMIT 1`;
  if (rows.length) return;
  const items = [
    ['LinkedIn', 'https://linkedin.com/in/israël-oriadé', 'linkedin'],
    ['GitHub', 'https://github.com/israel997', 'github'],
    ['WhatsApp', 'https://kloo.me/whatsapp-israel-oriade', 'whatsapp'],
    ['Email', 'mailto:ginique.lawani@epitech.eu', 'email']
  ];
  for (let i = 0; i < items.length; i++) {
    const [name, url, iconKey] = items[i];
    await sql`INSERT INTO social_links (name, url, icon_key, sort_order) VALUES (${name}, ${url}, ${iconKey}, ${i})`;
  }
}

async function writeFallbackSnapshot() {
  const [settings, timeline, skills, logos, projects, testimonials, socialLinks] = await Promise.all([
    sql`SELECT * FROM admin_settings WHERE id = 1`,
    sql`SELECT * FROM timeline_items WHERE is_visible = true ORDER BY sort_order`,
    sql`SELECT * FROM skills WHERE is_visible = true ORDER BY sort_order`,
    sql`SELECT * FROM tech_logos WHERE is_visible = true ORDER BY sort_order`,
    sql`SELECT * FROM projects WHERE is_visible = true ORDER BY sort_order`,
    sql`SELECT * FROM testimonials WHERE is_visible = true ORDER BY sort_order`,
    sql`SELECT * FROM social_links WHERE is_visible = true ORDER BY sort_order`
  ]);

  const snapshot = {
    settings: settings.rows[0] || null,
    timeline: timeline.rows,
    skills: skills.rows,
    logos: logos.rows,
    projects: projects.rows,
    testimonials: testimonials.rows,
    socialLinks: socialLinks.rows
  };

  const outDir = path.join(root, 'src', 'content');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, 'fallback.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Wrote src/content/fallback.json');
}

async function main() {
  console.log('Applying schema...');
  await runSchema();
  console.log('Seeding content (skipped per-table if already populated)...');
  await seedSettings();
  await seedTimeline();
  await seedSkills();
  await seedLogos();
  await seedProjects();
  await seedTestimonials();
  await seedSocialLinks();
  await writeFallbackSnapshot();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
