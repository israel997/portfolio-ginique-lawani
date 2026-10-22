<template>
  <section id="projects" itemscope itemtype="https://schema.org/CreativeWork">
    <SectionHeading index="04" :eyebrow="$t('nav.projects')" :title="$t('projects.title')" />

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
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
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
        class="group flex flex-col rounded-2xl overflow-hidden bg-slate-900/70 border border-white/[0.08] transition-all duration-300 hover:border-pink-500/40 hover:shadow-2xl hover:shadow-purple-950/40"
      >
        <component
          :is="project.project_url ? 'a' : 'div'"
          :href="project.project_url || undefined"
          :target="project.project_url ? '_blank' : undefined"
          :rel="project.project_url ? 'noopener noreferrer' : undefined"
          :class="`relative block aspect-[16/10] overflow-hidden bg-gradient-to-br ${project.gradient_class}`"
          :aria-label="project.project_url ? `${$t('projects.cta2')} — ${project.name}` : undefined"
        >
          <img
            :src="project.image_url || '/images/project-default.jpg'"
            :alt="project.name"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent"></div>
          <span class="absolute left-3 top-3 rounded-md bg-slate-950/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white/90 backdrop-blur-md">
            {{ categoryLabel(project.category) }}
          </span>
          <span
            v-if="project.project_url"
            class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-slate-900 shadow-lg transition-transform duration-300 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
            aria-hidden="true"
          >
            <ArrowUpRight class="h-4 w-4" :stroke-width="2.25" />
          </span>
        </component>

        <div class="flex flex-1 flex-col p-5 md:p-6">
          <h3 class="text-lg md:text-xl font-semibold mb-2">{{ project.name }}</h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {{ localized(project, 'description') }}
          </p>

          <div class="flex flex-wrap gap-1.5 mb-5">
            <span v-for="tag in project.tags" :key="tag" class="px-2 py-1 font-mono text-[10px] uppercase tracking-wide rounded-md bg-white/5 border border-white/10 text-slate-300">
              {{ tag }}
            </span>
          </div>

          <div class="mt-auto">
            <a
              v-if="project.project_url"
              :href="project.project_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-semibold transition-colors hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:border-transparent"
            >
              <Globe class="h-4 w-4" />
              {{ $t('projects.cta2') }}
              <ArrowUpRight class="h-4 w-4 opacity-70" />
            </a>
            <span
              v-else
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 text-sm font-medium text-slate-500"
            >
              <Clock class="h-4 w-4" />
              {{ $t('projects.soon') }}
            </span>
          </div>
        </div>
      </article>
    </TransitionGroup>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowUpRight, Globe, Clock } from 'lucide-vue-next';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';

const { t } = useI18n();
const { content, localized } = useContent();

// Filters are keyed by the DB category (not by translated label), so switching
// language never desyncs the active filter. Only categories that actually have
// projects get a button.
const CATEGORY_ORDER = ['Fullstack', 'Frontend', 'Backend', 'Mobile'];
const activeFilter = ref('all');

const projectsData = computed(() => content.value.projects || []);

const categories = computed(() =>
  CATEGORY_ORDER.filter((c) => projectsData.value.some((p) => p.category === c))
);

function categoryLabel(category) {
  const key = `projects.filters.${String(category).toLowerCase()}`;
  const label = t(key);
  return label === key ? category : label;
}

const filters = computed(() => [
  { key: 'all', label: t('projects.filters.all') },
  ...categories.value.map((c) => ({ key: c, label: categoryLabel(c) }))
]);

const filteredProjects = computed(() =>
  activeFilter.value === 'all'
    ? projectsData.value
    : projectsData.value.filter((p) => p.category === activeFilter.value)
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
