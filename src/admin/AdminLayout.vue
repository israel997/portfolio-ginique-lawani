<template>
  <div class="min-h-screen bg-slate-950 text-white md:flex">
    <aside class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-6">
          <div class="flex items-center gap-2.5">
            <span class="grid h-8 w-8 place-items-center rounded-lg bg-brand">
              <LayoutDashboard class="h-4 w-4" />
            </span>
            <div class="leading-tight">
              <p class="font-display font-semibold">Back-office</p>
              <p class="hidden font-mono text-[10px] uppercase tracking-wider text-slate-500 md:block">Portfolio</p>
            </div>
          </div>
          <div class="flex items-center gap-1 md:hidden">
            <button type="button" @click="translateAll" :disabled="translating" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50" aria-label="Tout traduire en anglais" title="Tout traduire en anglais">
              <LoaderCircle v-if="translating" class="h-4 w-4 animate-spin" />
              <Languages v-else class="h-4 w-4" />
            </button>
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
            active-class="bg-brand/15! text-brand-text!"
          >
            <component :is="link.icon" class="h-4 w-4" />
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="hidden border-t border-white/10 p-3 md:block">
          <button type="button" @click="translateAll" :disabled="translating" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50" title="Remplit chaque texte anglais encore vide à partir du français">
            <LoaderCircle v-if="translating" class="h-4 w-4 animate-spin" />
            <Languages v-else class="h-4 w-4" />
            {{ translating ? 'Traduction…' : 'Tout traduire en anglais' }}
          </button>
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
      <router-view :key="viewKey" />
    </main>

    <ToastHost />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { LayoutDashboard, UserRound, Route, Code2, FolderKanban, MessageSquareQuote, Share2, ExternalLink, LogOut, GalleryHorizontal, ShieldCheck, ListChecks, Heading, Languages, LoaderCircle, Compass } from 'lucide-vue-next';
import { useAdminAuth } from './composables/useAdminAuth';
import ToastHost from './components/ToastHost.vue';
import { useApi } from './composables/useApi';
import { useToast } from './composables/useToast';
import { translateEverything } from './composables/autoTranslate';

const router = useRouter();
const { logout } = useAdminAuth();

// The back-office is dark-only, whatever theme the public site uses
const { forceDark, releaseDark } = useTheme();
onMounted(forceDark);
onUnmounted(releaseDark);

const links = [
  { to: '/admin/settings', label: 'Profil & Contact', icon: UserRound },
  { to: '/admin/sections', label: 'Sections', icon: Heading },
  { to: '/admin/key-figures', label: 'Points clés', icon: ListChecks },
  { to: '/admin/projects', label: 'Projets', icon: FolderKanban },
  { to: '/admin/skills', label: 'Compétences', icon: Code2 },
  { to: '/admin/showcase', label: 'Savoir-faire', icon: GalleryHorizontal },
  { to: '/admin/discover', label: 'Découvrir', icon: Compass },
  { to: '/admin/timeline', label: 'Parcours', icon: Route },
  { to: '/admin/testimonials', label: 'Témoignages', icon: MessageSquareQuote },
  { to: '/admin/social-links', label: 'Réseaux sociaux', icon: Share2 },
  { to: '/admin/security', label: 'Sécurité', icon: ShieldCheck }
];

// "Tout traduire": English versions of every French text still untranslated,
// then the open page reloads to show them
const api = useApi();
const toast = useToast();
const translating = ref(false);
const viewKey = ref(0);

async function translateAll() {
  translating.value = true;
  try {
    const count = await translateEverything(api);
    toast.success(count ? `Version anglaise mise à jour (${count} élément${count > 1 ? 's' : ''})` : 'Tout est déjà traduit');
    viewKey.value++;
  } catch (err) {
    toast.error(err.message);
  } finally {
    translating.value = false;
  }
}

async function handleLogout() {
  await logout();
  router.push('/admin/login');
}
</script>
