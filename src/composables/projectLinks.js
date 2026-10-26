// Project URLs. Every project has a short share link at the site root,
// /<slug> (e.g. /ooffix); /projets/<id> keeps working for older links.

// First path segments the site already uses: never valid as a slug
export const RESERVED_SLUGS = ['admin', 'projets', 'api', 'assets', 'images', 'logos', 'index', 'robots', 'sitemap', 'favicon', 'decouvrir'];

export function slugify(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/[œ]/g, 'oe')
    .replace(/[æ]/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') && !RESERVED_SLUGS.includes(slug);
}

export function projectPath(project) {
  return project?.slug ? `/${project.slug}` : `/projets/${project?.id}`;
}

export function projectShareUrl(project) {
  return `${window.location.origin}${projectPath(project)}`;
}

// The project matching a route param: its slug, or its numeric id
export function findProject(projects, param) {
  const key = String(param ?? '');
  return (projects || []).find((p) => p.slug === key) || (projects || []).find((p) => String(p.id) === key);
}
