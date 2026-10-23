import { sql } from './_lib/db.js';
import { ensureSchema } from './_lib/migrations.js';

// Link previews (WhatsApp, Facebook, LinkedIn, X, Telegram, Slack, Discord,
// Google…). Crawlers don't run JavaScript, so they only see the meta tags of
// the HTML file. vercel.json routes crawler requests for "/", "/<slug>" and
// "/projets/<id>" here: we take the app's HTML (app.html) and rewrite its
// title / description / image tags with live data: the current profile
// photo for the home page, the project's image and text for a project.
// Humans are served app.html directly and never hit this function.

const escape = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

function absolute(url, origin) {
  if (!url) return '';
  return /^https?:\/\//.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

function setMeta(html, attr, key, value) {
  const tag = `<meta ${attr}="${key}" content="${escape(value)}" />`;
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'i');
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function applyMeta(html, { title, description, image, url }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escape(title)}</title>`);
  out = out.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escape(url)}" />`);
  // Fixed 1200x630 dimensions would be wrong for a portrait photo or a screenshot
  out = out.replace(/\s*<meta\s+property="og:image:(width|height)"[^>]*>/gi, '');
  out = setMeta(out, 'name', 'description', description);
  out = setMeta(out, 'property', 'og:title', title);
  out = setMeta(out, 'property', 'og:description', description);
  out = setMeta(out, 'property', 'og:url', url);
  out = setMeta(out, 'property', 'og:image', image);
  out = setMeta(out, 'property', 'og:image:secure_url', image);
  out = setMeta(out, 'property', 'og:image:alt', title);
  out = out.replace(/\s*<meta\s+property="og:image:type"[^>]*>/i, '');
  out = setMeta(out, 'name', 'twitter:title', title);
  out = setMeta(out, 'name', 'twitter:description', description);
  out = setMeta(out, 'name', 'twitter:url', url);
  out = setMeta(out, 'name', 'twitter:image', image);
  out = setMeta(out, 'name', 'twitter:image:alt', title);
  return out;
}

async function previewFor(path, origin) {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM admin_settings WHERE id = 1`;
  const settings = rows[0] || {};
  const name = settings.full_name || 'Portfolio';
  const role = settings.typewriter1_fr || 'Développeur Fullstack';

  // "/<slug>" or "/projets/<id>"
  const match = path.match(/^\/(?:projets\/)?([^/?#]+)\/?$/);
  if (match) {
    const key = decodeURIComponent(match[1]);
    const byId = /^\d+$/.test(key) && path.startsWith('/projets/');
    const { rows: projects } = byId
      ? await sql`SELECT * FROM projects WHERE id = ${Number(key)} AND is_visible = true`
      : await sql`SELECT * FROM projects WHERE slug = ${key} AND is_visible = true`;
    const project = projects[0];
    if (project) {
      return {
        title: `${project.name} | ${name}`,
        description: project.description_fr || project.description_en || `${project.name}, projet de ${name}.`,
        image: absolute(project.image_url || settings.profile_photo_url, origin),
        url: `${origin}/${project.slug || `projets/${project.id}`}`
      };
    }
  }

  const intro = [settings.hero_intro_fr, settings.hero_intro2_fr].filter(Boolean).join(', ');
  return {
    title: `${name} | ${role}`,
    description: intro || `Portfolio de ${name}, ${role}.`,
    image: absolute(settings.profile_photo_url, origin),
    url: `${origin}/`
  };
}

export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `https://${host}`;
  const path = typeof req.query?.path === 'string' && req.query.path.startsWith('/') ? req.query.path : '/';

  let html;
  try {
    const page = await fetch(`${origin}/app.html`);
    if (!page.ok) throw new Error(`app.html ${page.status}`);
    html = await page.text();
  } catch (err) {
    console.error(err);
    res.status(502).setHeader('Content-Type', 'text/plain; charset=utf-8').send('Page indisponible');
    return;
  }

  try {
    html = applyMeta(html, await previewFor(path, origin));
  } catch (err) {
    // Never break the page for a preview problem: serve the default tags
    console.error(err);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Short cache: a new profile photo or project image shows up in previews quickly
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  res.status(200).send(html);
}
