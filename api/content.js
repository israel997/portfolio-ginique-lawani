import { sql } from './_lib/db.js';
import { sendJson, methodNotAllowed, withErrorHandling } from './_lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  await withErrorHandling(res, async () => {
    const [settings, timeline, skills, logos, projects, testimonials, socialLinks] = await Promise.all([
      sql`SELECT * FROM admin_settings WHERE id = 1`,
      sql`SELECT * FROM timeline_items WHERE is_visible = true ORDER BY sort_order`,
      sql`SELECT * FROM skills WHERE is_visible = true ORDER BY sort_order`,
      sql`SELECT * FROM tech_logos WHERE is_visible = true ORDER BY sort_order`,
      sql`SELECT * FROM projects WHERE is_visible = true ORDER BY sort_order`,
      sql`SELECT * FROM testimonials WHERE is_visible = true ORDER BY sort_order`,
      sql`SELECT * FROM social_links WHERE is_visible = true ORDER BY sort_order`
    ]);

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    sendJson(res, 200, {
      settings: settings.rows[0] || null,
      timeline: timeline.rows,
      skills: skills.rows,
      logos: logos.rows,
      projects: projects.rows,
      testimonials: testimonials.rows,
      socialLinks: socialLinks.rows
    });
  });
}
