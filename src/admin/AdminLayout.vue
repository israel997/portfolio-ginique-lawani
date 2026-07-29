<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
    <aside class="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex md:flex-col justify-between gap-4">
      <div class="flex-1 min-w-0">
        <h1 class="text-lg font-bold mb-6 hidden md:block">Back-office</h1>
        <nav class="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-slate-300 hover:bg-white/5"
            active-class="bg-pink-600/20 text-pink-300"
          >{{ link.label }}</RouterLink>
        </nav>
      </div>
      <div class="flex md:flex-col gap-2">
        <a href="/" target="_blank" class="text-sm font-medium text-slate-400 hover:text-white px-3 py-2 whitespace-nowrap">Voir le site</a>
        <button @click="handleLogout" class="text-sm font-bold text-slate-400 hover:text-white px-3 py-2 whitespace-nowrap">Déconnexion</button>
      </div>
    </aside>
    <main class="flex-1 p-4 md:p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAdminAuth } from './composables/useAdminAuth';

const router = useRouter();
const { logout } = useAdminAuth();

const links = [
  { to: '/admin/settings', label: 'Profil & Contact' },
  { to: '/admin/timeline', label: 'Parcours' },
  { to: '/admin/skills', label: 'Compétences' },
  { to: '/admin/projects', label: 'Projets' },
  { to: '/admin/testimonials', label: 'Témoignages' },
  { to: '/admin/social-links', label: 'Réseaux sociaux' }
];

async function handleLogout() {
  await logout();
  router.push('/admin/login');
}
</script>
