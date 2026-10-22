<template>
  <div class="min-h-screen bg-slate-950 text-white md:flex">
    <aside class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-6">
          <div class="flex items-center gap-2.5">
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-indigo-500">
              <LayoutDashboard class="h-4 w-4" />
            </span>
            <div class="leading-tight">
              <p class="font-display font-semibold">Back-office</p>
              <p class="hidden font-mono text-[10px] uppercase tracking-wider text-slate-500 md:block">Portfolio</p>
            </div>
          </div>
          <div class="flex items-center gap-1 md:hidden">
            <a href="/" target="_blank" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Voir le site">
              <ExternalLink class="h-4 w-4" />
            </a>
            <button @click="handleLogout" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Déconnexion">
              <LogOut class="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav class="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] md:flex-1 md:flex-col md:overflow-visible md:px-3 md:pb-0">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            active-class="bg-pink-500/15! text-pink-200!"
          >
            <component :is="link.icon" class="h-4 w-4" />
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="hidden border-t border-white/10 p-3 md:block">
          <a href="/" target="_blank" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
            <ExternalLink class="h-4 w-4" /> Voir le site
          </a>
          <button @click="handleLogout" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
            <LogOut class="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </div>
    </aside>

    <main class="min-w-0 flex-1 px-4 py-6 pb-24 md:px-10 md:py-10">
      <router-view />
    </main>

    <ToastHost />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { LayoutDashboard, UserRound, Route, Code2, FolderKanban, MessageSquareQuote, Share2, ExternalLink, LogOut, GalleryHorizontal } from 'lucide-vue-next';
import { useAdminAuth } from './composables/useAdminAuth';
import ToastHost from './components/ToastHost.vue';

const router = useRouter();
const { logout } = useAdminAuth();

const links = [
  { to: '/admin/settings', label: 'Profil & Contact', icon: UserRound },
  { to: '/admin/projects', label: 'Projets', icon: FolderKanban },
  { to: '/admin/skills', label: 'Compétences', icon: Code2 },
  { to: '/admin/showcase', label: 'Savoir-faire', icon: GalleryHorizontal },
  { to: '/admin/timeline', label: 'Parcours', icon: Route },
  { to: '/admin/testimonials', label: 'Témoignages', icon: MessageSquareQuote },
  { to: '/admin/social-links', label: 'Réseaux sociaux', icon: Share2 }
];

async function handleLogout() {
  await logout();
  router.push('/admin/login');
}
</script>
