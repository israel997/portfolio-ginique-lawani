import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuth } from '../admin/composables/useAdminAuth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/PublicSite.vue') },
  { path: '/projets/:id', name: 'project', component: () => import('../views/ProjectDetail.vue') },
  { path: '/decouvrir', name: 'discover', component: () => import('../views/DiscoverPage.vue') },
  { path: '/admin/login', name: 'admin-login', component: () => import('../admin/views/LoginView.vue') },
  {
    path: '/admin',
    component: () => import('../admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'admin-settings' } },
      { path: 'settings', name: 'admin-settings', component: () => import('../admin/views/SettingsView.vue') },
      { path: 'timeline', name: 'admin-timeline', component: () => import('../admin/views/TimelineView.vue') },
      { path: 'skills', name: 'admin-skills', component: () => import('../admin/views/SkillsView.vue') },
      { path: 'sections', name: 'admin-sections', component: () => import('../admin/views/SectionsView.vue') },
      { path: 'key-figures', name: 'admin-key-figures', component: () => import('../admin/views/KeyFiguresView.vue') },
      { path: 'projects', name: 'admin-projects', component: () => import('../admin/views/ProjectsView.vue') },
      { path: 'showcase', name: 'admin-showcase', component: () => import('../admin/views/ShowcaseView.vue') },
      { path: 'discover', name: 'admin-discover', component: () => import('../admin/views/DiscoverView.vue') },
      { path: 'testimonials', name: 'admin-testimonials', component: () => import('../admin/views/TestimonialsView.vue') },
      { path: 'social-links', name: 'admin-social-links', component: () => import('../admin/views/SocialLinksView.vue') },
      { path: 'security', name: 'admin-security', component: () => import('../admin/views/SecurityView.vue') }
    ]
  },
  // Short project share link: /<slug>, e.g. /ooffix (one path segment only)
  { path: '/:slug', name: 'project-short', component: () => import('../views/ProjectDetail.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve) => {
    const start = performance.now();
    const check = () => {
      if (document.querySelector(selector)) return resolve(true);
      if (performance.now() - start > timeout) return resolve(false);
      requestAnimationFrame(check);
    };
    check();
  });
}

// Images above the target can finish loading after we scrolled and push it
// down. For a short while, re-align on the target unless the visitor has
// started scrolling themselves. `delay` lets a smooth scroll finish first.
function keepAligned(selector, top, duration = 5000, delay = 120) {
  let userMoved = false;
  const stop = () => { userMoved = true; };
  const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
  const start = performance.now();
  const tick = () => {
    const el = document.querySelector(selector);
    if (userMoved || !el || performance.now() - start > duration) {
      events.forEach((e) => window.removeEventListener(e, stop));
      return;
    }
    const offset = el.getBoundingClientRect().top - top;
    if (Math.abs(offset) > 8) window.scrollTo({ top: window.scrollY + offset, behavior: 'instant' });
    setTimeout(tick, 120);
  };
  setTimeout(tick, delay);
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      // Router scrolling ignores CSS scroll-margin: offset for the sticky navbar
      const top = window.innerWidth >= 768 ? 80 : 68;
      const sameRoute = from.name === to.name;
      if (sameRoute) {
        // Same page (navbar / bottom bar links): lazy images loading during
        // the smooth scroll used to leave it short of the section, so the
        // visitor clicked again. Re-align once the scroll has settled.
        keepAligned(to.hash, top, 4000, 900);
        return { el: to.hash, top, behavior: 'smooth' };
      }
      // Coming from another page (e.g. a project page): the home sections are
      // still being built, slowly on phones. Wait until the target exists.
      return waitForElement(to.hash).then((found) => {
        if (!found) return { top: 0 };
        keepAligned(to.hash, top);
        return { el: to.hash, top };
      });
    }
    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;

  const { authenticated, checkSession } = useAdminAuth();
  if (authenticated.value === null) {
    await checkSession();
  }
  if (!authenticated.value) {
    return { path: '/admin/login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
