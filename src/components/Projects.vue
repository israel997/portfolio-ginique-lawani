<template>
  <section id="projects" itemscope itemtype="https://schema.org/CreativeWork">
    <SectionHeading :index="index" :eyebrow="st('projects', 'nav')" :title="st('projects', 'title')" />

    <div v-if="categories.length > 1" class="-mx-4 mb-8 md:mb-10 overflow-x-auto px-4 [scrollbar-width:none]">
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

    <TransitionGroup tag="div" name="project" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      <article
        v-for="project in filteredProjects"
        :key="project.id"
        class="group flex flex-col rounded-2xl overflow-hidden bg-surface border border-line shadow-card transition-all duration-300 hover:border-accent/50"
      >
        <RouterLink
          :to="projectPath(project)"
          class="relative block aspect-[16/10] overflow-hidden border-b border-line bg-panel"
          :aria-label="`${$t('projects.cta1')} : ${project.name}`"
        >
          <img
            :src="project.image_url || '/images/project-default.jpg'"
            :alt="project.name"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>
          <span class="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
            <span v-for="cat in projectCategories(project)" :key="cat" class="rounded-md bg-slate-950/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/90 backdrop-blur-md">
              {{ categoryLabel(cat) }}
            </span>
          </span>
          <span class="absolute inset-0 hidden items-center justify-center bg-slate-950/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 md:flex" aria-hidden="true">
            <span class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
              <Eye class="h-4 w-4" /> {{ $t('projects.hover') }}
            </span>
          </span>
        </RouterLink>

        <div class="flex flex-1 flex-col p-5 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold mb-2">{{ project.name }}</h3>
          <p class="text-muted text-sm leading-relaxed mb-4 line-clamp-3">
            {{ localized(project, 'description') }}
          </p>

          <div class="flex flex-wrap gap-1.5 mb-5">
            <span v-for="tag in project.tags" :key="tag" class="px-2 py-1 font-mono text-[10px] uppercase tracking-wide rounded-md bg-surface border border-line text-ink-2">
              {{ tag }}
            </span>
          </div>

          <div class="mt-auto flex gap-2">
            <RouterLink
              :to="projectPath(project)"
              class="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand text-white text-sm font-semibold transition-colors hover:bg-brand-hover"
            >
              <Eye class="h-4 w-4" />
              {{ $t('projects.cta1') }}
            </RouterLink>
            <a
              v-if="project.project_url"
              :href="project.project_url"
              target="_blank"
              rel="noopener noreferrer"
              class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-surface-hover transition-colors hover:bg-surface-hover"
              :title="$t('projects.cta2')"
              :aria-label="`${$t('projects.cta2')} : ${project.name}`"
            >
              <ArrowUpRight class="h-4 w-4" />
            </a>
            <ShareButton :project="project" />
          </div>
        </div>
      </article>
    </TransitionGroup>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowUpRight, Eye } from 'lucide-vue-next';
import ShareButton from './ShareButton.vue';
import { projectPath } from '../composables/projectLinks';
import { PROJECT_CATEGORIES, projectCategories, categoryLabel as labelFor } from '../composables/projectCategories';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';
import { useSectionText } from '../composables/sectionTexts';

const { sectionText: st } = useSectionText();

defineProps({ index: { type: String, default: '' } });

const { t } = useI18n();
const { content, localized } = useContent();

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
