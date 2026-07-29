import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuth } from '../admin/composables/useAdminAuth';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/PublicSite.vue') },
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
    if (to.hash) return { el: to.hash };
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
