<template>
  <div class="relative min-h-screen overflow-x-clip pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
    <Navbar />

    <main>
      <!-- Waiting for the live API (project may not be in the bundled snapshot) -->
      <div v-if="!project && !loaded" class="band band-projects">
        <div class="band-inner grid min-h-[50vh] place-items-center">
          <LoaderCircle class="h-6 w-6 animate-spin text-accent" />
        </div>
      </div>

      <div v-else-if="!project" class="band band-projects">
        <div class="band-inner flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p class="mb-6 text-muted">{{ $t('projectDetail.notFound') }}</p>
          <RouterLink :to="{ path: '/', hash: '#projects' }" class="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold hover:bg-surface-hover">
            <ArrowLeft class="h-4 w-4" /> {{ $t('projectDetail.back') }}
          </RouterLink>
        </div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="band band-projects pb-10! md:pb-14!">
          <div class="band-inner">
            <RouterLink :to="{ path: '/', hash: '#projects' }" class="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
              <ArrowLeft class="h-4 w-4" /> {{ $t('projectDetail.back') }}
            </RouterLink>

            <div class="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-12">
              <div>
                <p class="section-eyebrow mb-3">{{ categoriesText }}</p>
                <h1 class="mb-4 text-4xl font-bold text-balance md:text-6xl">{{ project.name }}</h1>
                <p class="text-base leading-relaxed text-ink-2 md:text-lg text-pretty">{{ localized(project, 'description') }}</p>
              </div>
              <div class="flex flex-col gap-4 lg:items-end">
                <div v-if="project.tags?.length" class="flex flex-wrap gap-1.5 lg:justify-end">
                  <span v-for="tag in project.tags" :key="tag" class="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] uppercase tracking-wide text-ink-2">{{ tag }}</span>
                </div>
<div class="flex flex-wrap gap-2 lg:justify-end">
                  <a
                    v-if="project.project_url"
                    :href="project.project_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-white px-6 text-sm font-semibold transition-colors hover:bg-brand-hover"
                  >
                    <Globe class="h-4 w-4" /> {{ $t('projectDetail.visit') }} <ArrowUpRight class="h-4 w-4" />
                  </a>
                  <ShareButton :project="project" variant="button" />
                </div>
              </div>
            </div>

            <div class="mt-10 overflow-hidden rounded-2xl border border-line bg-panel shadow-card md:mt-14 md:rounded-3xl">
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
                  <span class="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface">
                    <component :is="block.icon" class="h-5 w-5 text-accent" />
                  </span>
                  <h2 class="text-2xl font-bold md:text-3xl">{{ $t(block.title) }}</h2>
                </div>
                <p class="whitespace-pre-line text-base leading-relaxed text-ink-2 md:text-[17px]">{{ block.text }}</p>
              </section>
            </div>

            <aside class="lg:sticky lg:top-24 lg:self-start">
              <dl class="space-y-5 rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6">
                <div>
                  <dt class="mb-1 font-mono text-[11px] uppercase tracking-wider text-subtle">{{ $t('projectDetail.category') }}</dt>
                  <dd class="font-medium">{{ categoriesText }}</dd>
                </div>
                <div v-if="project.tags?.length">
                  <dt class="mb-2 font-mono text-[11px] uppercase tracking-wider text-subtle">{{ $t('projectDetail.stack') }}</dt>
                  <dd class="flex flex-wrap gap-1.5">
                    <span v-for="tag in project.tags" :key="tag" class="rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">{{ tag }}</span>
                  </dd>
                </div>
                <div v-if="project.project_url">
                  <dt class="mb-1 font-mono text-[11px] uppercase tracking-wider text-subtle">{{ $t('projectDetail.link') }}</dt>
                  <dd>
                    <a :href="project.project_url" target="_blank" rel="noopener noreferrer" class="inline-flex max-w-full items-center gap-1.5 text-link hover:underline">
                      <span class="truncate">{{ hostOf(project.project_url) }}</span> <ArrowUpRight class="h-4 w-4 shrink-0" />
                    </a>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>

        <!-- Gallery: swipeable carousel, click an image to view it full screen -->
        <div v-if="gallery.length" class="band band-showcase">
          <div class="band-inner">
            <div class="mb-8 flex items-center gap-3 md:mb-10">
              <span class="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface">
                <Images class="h-5 w-5 text-accent" />
              </span>
              <h2 class="text-2xl font-bold md:text-3xl">{{ $t('projectDetail.gallery') }}</h2>
            </div>
            <ImageCarousel :items="gallerySlides" :label="`${$t('projectDetail.gallery')} : ${project.name}`" :autoplay="false" zoomable @open="lightbox = $event" />
          </div>
        </div>

        <!-- Previous / next -->
        <nav class="band band-timeline py-10!" :aria-label="$t('nav.projects')">
          <div class="band-inner grid gap-3 sm:grid-cols-2">
            <RouterLink v-if="neighbours.prev" :to="projectPath(neighbours.prev)" class="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-accent/40">
              <ArrowLeft class="h-5 w-5 shrink-0 text-subtle transition-transform group-hover:-translate-x-0.5" />
              <span class="min-w-0">
                <span class="block font-mono text-[11px] uppercase tracking-wider text-subtle">{{ $t('projectDetail.previous') }}</span>
                <span class="block truncate font-semibold">{{ neighbours.prev.name }}</span>
              </span>
            </RouterLink>
            <span v-else class="hidden sm:block"></span>
            <RouterLink v-if="neighbours.next" :to="projectPath(neighbours.next)" class="group flex items-center justify-end gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card text-right transition-colors hover:border-accent/40">
              <span class="min-w-0">
                <span class="block font-mono text-[11px] uppercase tracking-wider text-subtle">{{ $t('projectDetail.next') }}</span>
                <span class="block truncate font-semibold">{{ neighbours.next.name }}</span>
              </span>
              <ArrowRight class="h-5 w-5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
            </RouterLink>
            <!-- Last thing on the page: the way into the whole portfolio -->
            <div class="flex justify-center pt-5 sm:col-span-2">
              <RouterLink to="/" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover sm:w-auto">
                <LayoutGrid class="h-4 w-4" /> {{ $t('projectDetail.viewPortfolio') }}
              </RouterLink>
            </div>
          </div>
        </nav>
      </template>
    </main>

    <Footer />
    <MobileBottomNav />

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
        <div v-if="lightbox !== null && gallery[lightbox]" class="fixed inset-0 z-[80] flex flex-col bg-slate-950/95 text-white backdrop-blur-md" role="dialog" aria-modal="true" @click.self="lightbox = null">
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
            <p class="line-clamp-3 flex-1 text-center text-sm text-slate-300">
              <span v-if="titleOf(gallery[lightbox])" class="block font-semibold text-white">{{ titleOf(gallery[lightbox]) }}</span>
              {{ captionOf(gallery[lightbox]) }}
            </p>
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
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Globe, LayoutGrid, LoaderCircle, FileText, Hammer, Workflow, Images, X, ChevronLeft, ChevronRight
} from 'lucide-vue-next';
import { useContent } from '../composables/useContent';
import { projectCategories, categoryLabel as labelFor } from '../composables/projectCategories';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import MobileBottomNav from '../components/MobileBottomNav.vue';
import ImageCarousel from '../components/ImageCarousel.vue';
import ShareButton from '../components/ShareButton.vue';
import { findProject, projectPath } from '../composables/projectLinks';

const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const { content, loaded, localized } = useContent();

const projects = computed(() => content.value.projects || []);
// Reached by short link (/ooffix) or by id (/projets/6)
const project = computed(() => findProject(projects.value, route.params.slug ?? route.params.id));

const categoriesText = computed(() => projectCategories(project.value).map((c) => labelFor(t, c)).join(' · '));

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

function titleOf(item) {
  if (!item) return '';
  return (locale.value === 'en' && item.title_en) || item.title_fr || '';
}

const gallerySlides = computed(() => gallery.value.map((item, i) => ({
  key: `${i}-${item.image_url}`,
  src: item.image_url,
  title: titleOf(item),
  text: captionOf(item)
})));

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
watch(() => route.params.slug ?? route.params.id, () => {
  lightbox.value = null;
  window.scrollTo({ top: 0 });
});

// A mistyped short link (/xyz) isn't a project: go to the home page
watch([loaded, project], ([isLoaded, p]) => {
  if (isLoaded && !p && route.name === 'project-short') router.replace('/');
});

watch(project, (p) => {
  if (p) document.title = `${p.name} | ${content.value.settings?.full_name || 'Portfolio'}`;
}, { immediate: true });

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>
