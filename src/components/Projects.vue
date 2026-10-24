<template>
  <section id="projects" itemscope itemtype="https://schema.org/CreativeWork">
    <SectionHeading :index="index" :eyebrow="st('projects', 'nav')" :title="st('projects', 'title')" />

    <!-- Layout switch, on its own line above the category filters -->
    <div class="mb-5 flex justify-center md:mb-6">
      <div class="flex rounded-lg border border-line bg-surface p-0.5 shadow-card" role="group" :aria-label="$t('projects.viewLabel')">
        <button
          v-for="opt in VIEWS"
          :key="opt.value"
          type="button"
          @click="setView(opt.value)"
          :aria-pressed="view === opt.value"
          :aria-label="$t(opt.label)"
          :title="$t(opt.label)"
          :class="['grid h-8 w-9 place-items-center rounded-md transition-colors', view === opt.value ? 'bg-ink text-page' : 'text-muted hover:text-ink']"
        >
          <component :is="opt.icon" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div v-if="categories.length > 1" class="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] md:mb-10">
      <div class="mx-auto flex w-max gap-2" role="tablist">
        <button
          v-for="filter in filters"
          :key="filter.key"
          type="button"
          role="tab"
          :aria-selected="activeFilter === filter.key"
          @click="activeFilter = filter.key"
          :class="[
            'h-10 rounded-full px-4 text-sm font-medium transition-colors',
            activeFilter === filter.key
              ? 'bg-brand text-white'
              : 'border border-line bg-surface text-ink-2 hover:bg-surface-hover'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    <div v-else class="mb-5"></div>

    <!-- Carousel: full cards, 1 per view on phones, 2 on tablets, 3 on desktop -->
    <div v-if="view === 'carousel'">
      <ul
        ref="track"
        class="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onTrackScroll"
      >
        <li
          v-for="project in filteredProjects"
          :key="project.id"
          class="w-[86%] shrink-0 snap-center md:w-[calc(50%-0.75rem)] md:snap-start lg:w-[calc((100%-3rem)/3)]"
        >
          <ProjectCard :project="project" />
        </li>
      </ul>
      <div v-if="filteredProjects.length > 1 && !(atStart && atEnd)" class="mt-6 flex items-center justify-center gap-4 md:justify-between">
        <div class="flex flex-wrap justify-center gap-1.5">
          <button
            v-for="(project, i) in filteredProjects"
            :key="project.id"
            type="button"
            @click="goTo(i)"
            :aria-label="project.name"
            :aria-current="active === i ? 'true' : undefined"
            class="grid h-6 place-items-center px-0.5"
          >
            <span :class="['block h-1.5 rounded-full transition-all duration-300', active === i ? 'w-6 bg-brand-text' : 'w-1.5 bg-line-strong']"></span>
          </button>
        </div>
        <div class="hidden gap-2 md:flex">
          <button type="button" @click="step(-1)" :disabled="atStart" class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-card transition-colors hover:bg-surface-hover disabled:opacity-30" :aria-label="$t('projectDetail.previous')">
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button type="button" @click="step(1)" :disabled="atEnd" class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-card transition-colors hover:bg-surface-hover disabled:opacity-30" :aria-label="$t('projectDetail.next')">
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Grid: compact tiles (2 columns on phones, 3 from tablets up), then "show all" -->
    <div v-else>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        <ProjectTile v-for="project in gridProjects" :key="project.id" :project="project" />
      </div>
      <div v-if="filteredProjects.length > gridLimit && !showAll" class="mt-6 flex justify-center">
        <button type="button" @click="showAll = true" class="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold shadow-card hover:border-accent/50">
          <LayoutGrid class="h-4 w-4" /> {{ $t('projects.showAll', { n: filteredProjects.length }) }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { GalleryHorizontal, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import ProjectCard from './ProjectCard.vue';
import ProjectTile from './ProjectTile.vue';
import { PROJECT_CATEGORIES, projectCategories, categoryLabel as labelFor } from '../composables/projectCategories';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';
import { useSectionText } from '../composables/sectionTexts';

const { sectionText: st } = useSectionText();

defineProps({ index: { type: String, default: '' } });

const { t } = useI18n();
const { content } = useContent();

// Filters are keyed by the DB category (not by translated label), so switching
// language never desyncs the active filter. Only categories that actually have
// projects get a button.
const activeFilter = ref('all');

const projectsData = computed(() => content.value.projects || []);

const categories = computed(() =>
  PROJECT_CATEGORIES.filter((c) => projectsData.value.some((p) => projectCategories(p).includes(c)))
);

const categoryLabel = (category) => labelFor(t, category);

const filters = computed(() => [
  { key: 'all', label: t('projects.filters.all') },
  ...categories.value.map((c) => ({ key: c, label: categoryLabel(c) }))
]);

const filteredProjects = computed(() =>
  activeFilter.value === 'all'
    ? projectsData.value
    : projectsData.value.filter((p) => projectCategories(p).includes(activeFilter.value))
);

// --- Layouts: carousel (default) or grid of compact tiles, remembered ---
const VIEWS = [
  { value: 'carousel', label: 'projects.viewCarousel', icon: GalleryHorizontal },
  { value: 'grid', label: 'projects.viewGrid', icon: LayoutGrid }
];
const VIEW_KEY = 'projects-view';
// Tiles shown before "show all": 2 x 4 on phones, 3 x 2 from tablets up
const wide = ref(typeof window !== 'undefined' && window.innerWidth >= 768);
const gridLimit = computed(() => (wide.value ? 6 : 8));

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'carousel';
  } catch {
    return 'carousel';
  }
}

const view = ref(readView());
const showAll = ref(false);

function setView(value) {
  view.value = value;
  try {
    localStorage.setItem(VIEW_KEY, value);
  } catch {
    // Storage unavailable: the choice lasts for this visit
  }
}

const gridProjects = computed(() => (showAll.value ? filteredProjects.value : filteredProjects.value.slice(0, gridLimit.value)));



// Carousel position (dots, arrows). Phones snap cards to the center,
// larger screens to the start (several cards visible).
const track = ref(null);
const active = ref(0);
const atStart = ref(true);
const atEnd = ref(false);
const centered = () => window.innerWidth < 768;

function onTrackScroll() {
  const el = track.value;
  if (!el?.children.length) return;
  atStart.value = el.scrollLeft <= 4;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
  if (atEnd.value) {
    active.value = el.children.length - 1;
    return;
  }
  const anchor = centered() ? el.scrollLeft + el.clientWidth / 2 : el.scrollLeft;
  let best = 0;
  let bestDistance = Infinity;
  [...el.children].forEach((child, i) => {
    const point = centered() ? child.offsetLeft + child.clientWidth / 2 : child.offsetLeft;
    const distance = Math.abs(point - anchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  active.value = best;
}

function goTo(i) {
  const child = track.value?.children[i];
  if (!child) return;
  const left = centered() ? child.offsetLeft - (track.value.clientWidth - child.clientWidth) / 2 : child.offsetLeft;
  track.value.scrollTo({ left });
}

// Arrows: one card width from the current position
function step(direction) {
  const el = track.value;
  if (!el?.children.length) return;
  const [first, second] = el.children;
  const gap = second ? second.offsetLeft - first.offsetLeft - first.clientWidth : 0;
  el.scrollBy({ left: direction * (first.clientWidth + gap) });
}

const onResize = () => { wide.value = window.innerWidth >= 768; };
onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true });
  nextTick(onTrackScroll);
});
onUnmounted(() => window.removeEventListener('resize', onResize));
// Back to the carousel from the grid, or projects loaded / filtered:
// recompute dots and arrows (hidden when every card already fits)
watch([view, filteredProjects], () => nextTick(onTrackScroll));

// A new filter starts the carousel / grid from the beginning
watch(activeFilter, () => {
  showAll.value = false;
  active.value = 0;
  nextTick(() => {
    track.value?.scrollTo({ left: 0 });
    onTrackScroll();
  });
});
</script>
