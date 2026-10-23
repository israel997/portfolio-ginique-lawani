<template>
  <section id="timeline" class="relative">
    <SectionHeading :index="index" :eyebrow="$t('nav.timeline')" :title="$t('timeline.title')" />

    <ol class="relative max-w-4xl mx-auto">
      <div class="absolute left-[7px] md:left-1/2 top-2 bottom-0 w-px bg-line-strong md:-translate-x-1/2" aria-hidden="true"></div>

      <li v-for="(item, index) in timelineItems" :key="item.id" class="relative pl-9 md:pl-0 mb-8 md:mb-12 md:flex md:justify-between items-center group">
        <div class="absolute left-0 top-6 md:top-1/2 md:left-1/2 w-[15px] h-[15px] bg-page border-2 border-brand-text rounded-full md:-translate-x-1/2 md:-translate-y-1/2 z-20" aria-hidden="true"></div>

        <div :class="[
          'md:w-[45%] p-5 md:p-6 rounded-2xl bg-surface border border-line shadow-card backdrop-blur-md transition-all duration-300 hover:border-accent/40 md:hover:-translate-y-1',
          index % 2 === 0 ? 'md:mr-auto md:text-right' : 'md:ml-auto'
        ]">
          <span class="font-mono text-xs md:text-sm font-medium text-accent">{{ item.year_label }}</span>
          <h3 class="text-lg md:text-xl font-semibold mt-1">{{ localized(item, 'title') }}</h3>
          <p class="text-brand-text text-sm mb-2 md:mb-3">{{ localized(item, 'company') }}</p>
          <p class="text-muted text-sm leading-relaxed">{{ localized(item, 'description') }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();
const timelineItems = computed(() => content.value.timeline || []);
</script>
