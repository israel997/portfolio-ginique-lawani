<template>
  <div class="relative min-h-screen overflow-x-clip pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
    <Navbar />

    <main>
      <!-- Waiting for the live API (project may not be in the bundled snapshot) -->
      <div v-if="!project && !loaded" class="band band-projects">
        <div class="band-inner grid min-h-[50vh] place-items-center">
          <LoaderCircle class="h-6 w-6 animate-spin text-pink-400" />
        </div>
      </div>

      <div v-else-if="!project" class="band band-projects">
        <div class="band-inner flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p class="mb-6 text-slate-400">{{ $t('projectDetail.notFound') }}</p>
          <RouterLink :to="{ path: '/', hash: '#projects' }" class="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold hover:bg-white/10">
            <ArrowLeft class="h-4 w-4" /> {{ $t('projectDetail.back') }}
          </RouterLink>
        </div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="band band-projects pb-10! md:pb-14!">
          <div class="band-inner">
            <RouterLink :to="{ path: '/', hash: '#projects' }" class="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
              <ArrowLeft class="h-4 w-4" /> {{ $t('projectDetail.back') }}
            </RouterLink>

            <div class="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
              <div>
                <p class="section-eyebrow mb-3">{{ categoryLabel(project.category) }}</p>
                <h1 class="mb-4 text-4xl font-bold text-balance md:text-6xl">{{ project.name }}</h1>
                <p class="text-base leading-relaxed text-slate-300 md:text-lg text-pretty">{{ localized(project, 'description') }}</p>
              </div>
              <div class="flex flex-col gap-4 lg:items-end">
                <div v-if="project.tags?.length" class="flex flex-wrap gap-1.5 lg:justify-end">
                  <span v-for="tag in project.tags" :key="tag" class="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-slate-300">{{ tag }}</span>
                </div>
                <a
                  v-if="project.project_url"
                  :href="project.project_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 text-sm font-semibold shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5"
                >
                  <Globe class="h-4 w-4" /> {{ $t('projectDetail.visit') }} <ArrowUpRight class="h-4 w-4" />
                </a>
              </div>
            </div>

            <div :class="`mt-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br md:mt-14 md:rounded-3xl ${project.gradient_class}`">
              <img v-if="project.image_url" :src="project.image_url" :alt="project.name" class="aspect-[16/9] w-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Long-form sections + facts -->
        <div class="band band-about">
          <div class="band-inner grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
            <div class="space-y-12">
              <section v-for="block in textBlocks" :key="block.key">
                <div class="mb-4 flex items-center gap-3">
                  <span class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                    <component :is="block.icon" class="h-5 w-5 text-pink-400" />
                  </span>
                  <h2 class="text-2xl font-bold md:text-3xl">{{ $t(block.title) }}</h2>
                </div>
                <p class="whitespace-pre-line text-base leading-relaxed text-slate-300 md:text-[17px]">{{ block.text }}</p>
              </section>
            </div>

            <aside class="lg:sticky lg:top-24 lg:self-start">
              <dl class="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
                <div>
                  <dt class="mb-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">{{ $t('projectDetail.category') }}</dt>
                  <dd class="font-medium">{{ categoryLabel(project.category) }}</dd>
                </div>
                <div v-if="project.tags?.length">
                  <dt class="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">{{ $t('projectDetail.stack') }}</dt>
                  <dd class="flex flex-wrap gap-1.5">
                    <span v-for="tag in project.tags" :key="tag" class="rounded-md bg-pink-500/10 px-2 py-1 text-xs text-pink-200">{{ tag }}</span>
                  </dd>
                </div>
                <div v-if="project.project_url">
                  <dt class="mb-1 font-mono text-[11px] uppercase tracking-wider text-slate-500">{{ $t('projectDetail.link') }}</dt>
                  <dd>
                    <a :href="project.project_url" target="_blank" rel="noopener noreferrer" class="inline-flex max-w-full items-center gap-1.5 text-sky-400 hover:underline">
                      <span class="truncate">{{ hostOf(project.project_url) }}</span> <ArrowUpRight class="h-4 w-4 shrink-0" />
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>

        <!-- Gallery: image + caption, alternating sides on desktop -->
        <div v-if="gallery.length" class="band band-showcase">
          <div class="band-inner">
            <div class="mb-10 flex items-center gap-3 md:mb-14">
              <span class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                <Images class="h-5 w-5 text-pink-400" />
              </span>
              <h2 class="text-2xl font-bold md:text-3xl">{{ $t('projectDetail.gallery') }}</h2>
            </div>
            <ol class="space-y-12 md:space-y-20">
              <li v-for="(item, i) in gallery" :key="i" class="grid items-center gap-5 md:grid-cols-2 md:gap-12">
                <button
                  type="button"
                  @click="lightbox = i"
                  :class="['group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900', i % 2 ? 'md:order-2' : '']"
                  :aria-label="captionOf(item) || `${project.name} ${i + 1}`"
                >
                  <img :src="item.image_url" :alt="captionOf(item)" loading="lazy" decoding="async" class="w-full transition-transform duration-500 group-hover:scale-[1.02]" />
                  <span class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-slate-950/60 opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                    <Maximize2 class="h-4 w-4" />
                  </span>
                </button>
                <div>
                  <p class="mb-2 font-mono text-xs text-pink-400">{{ String(i + 1).padStart(2, '0') }}</p>
                  <p class="whitespace-pre-line text-base leading-relaxed text-slate-300 md:text-lg">{{ captionOf(item) }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Previous / next -->
        <nav class="band band-timeline py-10!" :aria-label="$t('nav.projects')">
          <div class="band-inner grid gap-3 sm:grid-cols-2">
            <RouterLink v-if="neighbours.prev" :to="`/projets/${neighbours.prev.id}`" class="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-pink-500/40">
              <ArrowLeft class="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:-translate-x-0.5" />
              <span class="min-w-0">
                <span class="block font-mono text-[11px] uppercase tracking-wider text-slate-500">{{ $t('projectDetail.previous') }}</span>
                <span class="block truncate font-semibold">{{ neighbours.prev.name }}</span>
              </span>
            </RouterLink>
            <span v-else class="hidden sm:block"></span>
            <RouterLink v-if="neighbours.next" :to="`/projets/${neighbours.next.id}`" class="group flex items-center justify-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right transition-colors hover:border-pink-500/40">
              <span class="min-w-0">
                <span class="block font-mono text-[11px] uppercase tracking-wider text-slate-500">{{ $t('projectDetail.next') }}</span>
                <span class="block truncate font-semibold">{{ neighbours.next.name }}</span>
              </span>
              <ArrowRight class="h-5 w-5 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
            </RouterLink>
          </div>
        </nav>
      </template>
    </main>

    <Footer />
    <MobileBottomNav />

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
        <div v-if="lightbox !== null && gallery[lightbox]" class="fixed inset-0 z-[80] flex flex-col bg-slate-950/95 backdrop-blur-md" role="dialog" aria-modal="true" @click.self="lightbox = null">
          <div class="flex items-center justify-between px-4 py-3">
            <span class="font-mono text-xs text-slate-400">{{ lightbox + 1 }} / {{ gallery.length }}</span>
            <button type="button" @click="lightbox = null" class="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" :aria-label="$t('projectDetail.close')">
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="flex min-h-0 flex-1 items-center justify-center px-4" @click.self="lightbox = null">
            <img :src="gallery[lightbox].image_url" :alt="captionOf(gallery[lightbox])" class="max-h-full max-w-full rounded-lg object-contain" />
          </div>
          <div class="flex items-center gap-3 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button type="button" @click="step(-1)" class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 hover:bg-white/10" :aria-label="$t('projectDetail.previous')">
              <ChevronLeft class="h-5 w-5" />
            </button>
            <p class="line-clamp-3 flex-1 text-center text-sm text-slate-300">{{ captionOf(gallery[lightbox]) }}</p>
            <button type="button" @click="step(1)" class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 hover:bg-white/10" :aria-label="$t('projectDetail.next')">
              <ChevronRight class="h-5 w-5" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Globe, LoaderCircle, FileText, Hammer, Workflow, Images, Maximize2, X, ChevronLeft, ChevronRight
} from 'lucide-vue-next';
import { useContent } from '../composables/useContent';
import { categoryLabel as labelFor } from '../composables/projectCategories';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import MobileBottomNav from '../components/MobileBottomNav.vue';

const route = useRoute();
const { t, locale } = useI18n();
const { content, loaded, localized } = useContent();

const projects = computed(() => content.value.projects || []);
const project = computed(() => projects.value.find((p) => String(p.id) === String(route.params.id)));

const categoryLabel = (category) => labelFor(t, category);

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Only sections that have content are shown; with nothing filled in yet,
// the short description stands in as the overview.
const textBlocks = computed(() => {
  const p = project.value;
  if (!p) return [];
  const blocks = [
    { key: 'details', title: 'projectDetail.overview', icon: FileText, text: localized(p, 'details') },
    { key: 'contributions', title: 'projectDetail.contributions', icon: Hammer, text: localized(p, 'contributions') },
    { key: 'methodology', title: 'projectDetail.methodology', icon: Workflow, text: localized(p, 'methodology') }
  ].filter((b) => b.text);
  if (!blocks.length) {
    return [{ key: 'details', title: 'projectDetail.overview', icon: FileText, text: localized(p, 'description') }];
  }
  return blocks;
});

const gallery = computed(() => (project.value?.gallery || []).filter((item) => item?.image_url));

function captionOf(item) {
  if (!item) return '';
  return (locale.value === 'en' && item.caption_en) || item.caption_fr || '';
}

const neighbours = computed(() => {
  const i = projects.value.findIndex((p) => p === project.value);
  if (i === -1) return {};
  return { prev: projects.value[i - 1], next: projects.value[i + 1] };
});

// --- Lightbox ---
const lightbox = ref(null);

function step(direction) {
  const n = gallery.value.length;
  lightbox.value = (lightbox.value + direction + n) % n;
}

function onKeydown(event) {
  if (lightbox.value === null) return;
  if (event.key === 'Escape') lightbox.value = null;
  else if (event.key === 'ArrowRight') step(1);
  else if (event.key === 'ArrowLeft') step(-1);
}

watch(lightbox, (value) => {
  document.body.style.overflow = value === null ? '' : 'hidden';
});

// Moving to another project via prev/next reuses this component
watch(() => route.params.id, () => {
  lightbox.value = null;
  window.scrollTo({ top: 0 });
});

watch(project, (p) => {
  if (p) document.title = `${p.name} — ${content.value.settings?.full_name || 'Portfolio'}`;
}, { immediate: true });

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>
