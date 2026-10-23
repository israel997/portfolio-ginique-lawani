<template>
  <section id="projects" itemscope itemtype="https://schema.org/CreativeWork">
    <SectionHeading :index="index" :eyebrow="st('projects', 'nav')" :title="st('projects', 'title')" />

    <div class="mb-8 flex items-center gap-3 md:mb-10">
      <div v-if="categories.length > 1" class="-ml-4 min-w-0 flex-1 overflow-x-auto pl-4 [scrollbar-width:none] md:mx-0 md:px-0">
        <div class="flex w-max gap-2 md:mx-auto" role="tablist">
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
      <div v-else class="flex-1"></div>

      <!-- Phones only: carousel or 2-column grid -->
      <div v-if="isMobile" class="flex shrink-0 rounded-full border border-line bg-surface p-0.5" role="group" :aria-label="$t('projects.viewLabel')">
        <button
          v-for="opt in VIEWS"
          :key="opt.value"
          type="button"
          @click="setView(opt.value)"
          :aria-pressed="view === opt.value"
          :aria-label="$t(opt.label)"
          :title="$t(opt.label)"
          :class="['grid h-9 w-9 place-items-center rounded-full transition-colors', view === opt.value ? 'bg-ink text-page' : 'text-muted hover:text-ink']"
        >
          <component :is="opt.icon" class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Phone, carousel: one full card at a time, swipe -->
    <div v-if="isMobile && view === 'carousel'">
      <ul
        ref="track"
        class="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onTrackScroll"
      >
        <li v-for="project in filteredProjects" :key="project.id" class="w-[86%] shrink-0 snap-center">
          <ProjectCard :project="project" />
        </li>
      </ul>
      <div v-if="filteredProjects.length > 1" class="mt-5 flex flex-wrap justify-center gap-1.5">
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
    </div>

    <!-- Phone, grid: 2 columns x 4 rows, then "show all" -->
    <div v-else-if="isMobile">
      <div class="grid grid-cols-2 gap-3">
        <ProjectTile v-for="project in gridProjects" :key="project.id" :project="project" />
      </div>
      <div v-if="filteredProjects.length > GRID_LIMIT && !showAll" class="mt-5 flex justify-center">
        <button type="button" @click="showAll = true" class="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-semibold shadow-card hover:border-accent/50">
          <LayoutGrid class="h-4 w-4" /> {{ $t('projects.showAll', { n: filteredProjects.length }) }}
        </button>
      </div>
    </div>

    <!-- Tablet / desktop: grid of full cards -->
    <TransitionGroup v-else tag="div" name="project" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project" />
    </TransitionGroup>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { GalleryHorizontal, LayoutGrid } from 'lucide-vue-next';
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

// --- Phone layouts: carousel (default) or 2-column grid, remembered ---
const VIEWS = [
  { value: 'carousel', label: 'projects.viewCarousel', icon: GalleryHorizontal },
  { value: 'grid', label: 'projects.viewGrid', icon: LayoutGrid }
];
const VIEW_KEY = 'projects-view';
const GRID_LIMIT = 8; // 2 columns x 4 rows

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

const gridProjects = computed(() => (showAll.value ? filteredProjects.value : filteredProjects.value.slice(0, GRID_LIMIT)));

const media = window.matchMedia('(max-width: 767px)');
const isMobile = ref(media.matches);
const onMedia = (event) => { isMobile.value = event.matches; };
onMounted(() => media.addEventListener('change', onMedia));
onUnmounted(() => media.removeEventListener('change', onMedia));

// Carousel position (dots)
const track = ref(null);
const active = ref(0);

function onTrackScroll() {
  const el = track.value;
  if (!el?.children.length) return;
  const center = el.scrollLeft + el.clientWidth / 2;
  let best = 0;
  let bestDistance = Infinity;
  [...el.children].forEach((child, i) => {
    const distance = Math.abs(child.offsetLeft + child.clientWidth / 2 - center);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  active.value = best;
}

function goTo(i) {
  const child = track.value?.children[i];
  if (child) track.value.scrollTo({ left: child.offsetLeft - (track.value.clientWidth - child.clientWidth) / 2 });
}

// A new filter starts the carousel / grid from the beginning
watch(activeFilter, () => {
  showAll.value = false;
  active.value = 0;
  nextTick(() => track.value?.scrollTo({ left: 0 }));
});
</script>

<style scoped>
.project-enter-active,
.project-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.project-enter-from,
.project-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.project-leave-active {
  position: absolute;
  visibility: hidden;
}
</style>
