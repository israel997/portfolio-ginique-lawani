// Matches a skill's technology names ("Claude Sonnet", "TailwindCSS"…) to the
// logo library (tech_logos: { name, image_url }). Shared by the skill cards
// and the admin, so both agree on which techs have a logo.

const normalize = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Logos drawn in black: inverted in dark mode so they stay visible
const MONO_LOGOS = ['/logos/nextjs.svg', '/logos/notion.svg', '/logos/githubcopilot.svg'];

export function isMonoLogo(url) {
  return MONO_LOGOS.includes(url);
}

// Exact name first; otherwise a variant such as "Claude Sonnet" -> "Claude"
// or "Copilot" -> "GitHub Copilot". The longest logo name wins ties.
export function findLogo(tech, logos) {
  const t = normalize(tech);
  if (!t) return null;
  let best = null;
  for (const logo of logos || []) {
    const l = normalize(logo.name);
    if (!l) continue;
    if (l === t) return logo;
    // Partial matches need a few letters, so "JS" doesn't land on Next.js
    const partial = (l.length >= 4 && t.startsWith(l)) || (t.length >= 4 && l.endsWith(t));
    if (partial && (!best || l.length > normalize(best.name).length)) best = logo;
  }
  return best;
}
