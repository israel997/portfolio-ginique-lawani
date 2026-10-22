import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuth } from '../admin/composables/useAdminAuth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/PublicSite.vue') },
  { path: '/projets/:id', name: 'project', component: () => import('../views/ProjectDetail.vue') },
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
      { path: 'projects', name: 'admin-projects', component: () => import('../admin/views/ProjectsView.vue') },
      { path: 'showcase', name: 'admin-showcase', component: () => import('../admin/views/ShowcaseView.vue') },
      { path: 'testimonials', name: 'admin-testimonials', component: () => import('../admin/views/TestimonialsView.vue') },
      { path: 'social-links', name: 'admin-social-links', component: () => import('../admin/views/SocialLinksView.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    // Coming back from a project page, the home sections need a frame to render
    if (to.hash) {
      // Router scrolling ignores CSS scroll-margin: offset for the sticky navbar
      const top = window.innerWidth >= 768 ? 80 : 68;
      const sameRoute = from.name === to.name;
      return new Promise((resolve) => {
        setTimeout(() => resolve({ el: to.hash, top, behavior: sameRoute ? 'smooth' : 'auto' }), sameRoute ? 0 : 60);
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
