<template>
  <RouterLink
    :to="projectPath(project)"
    class="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-colors hover:border-accent/50"
  >
    <span class="relative block aspect-[4/3] overflow-hidden border-b border-line bg-panel">
      <img
        :src="project.image_url || '/images/project-default.jpg'"
        :alt="project.name"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover"
      />
    </span>
    <span class="flex flex-1 flex-col gap-1 p-2.5">
      <span class="line-clamp-1 text-sm font-semibold">{{ project.name }}</span>
      <span class="line-clamp-1 font-mono text-[9px] uppercase tracking-wider text-subtle">
        {{ projectCategories(project).map(categoryLabel).join(' · ') }}
      </span>
    </span>
  </RouterLink>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { projectPath } from '../composables/projectLinks';
import { projectCategories, categoryLabel as labelFor } from '../composables/projectCategories';

// Compact project card for the mobile 2-column grid: image, name, categories
defineProps({ project: { type: Object, required: true } });

const { t } = useI18n();
const categoryLabel = (category) => labelFor(t, category);
</script>
