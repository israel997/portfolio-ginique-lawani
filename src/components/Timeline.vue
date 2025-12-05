<template>
  <section id="timeline" class="mb-32 relative overflow-hidden">
    <h2 class="text-3xl font-bold mb-16 text-center">{{ $t('timeline.title') }}</h2>
    
    <div class="relative max-w-4xl mx-auto">
      <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 via-purple-500 to-transparent md:-translate-x-1/2"></div>
      
      <div v-for="(item, index) in timelineData" :key="index" class="relative mb-12 md:flex md:justify-between items-center group">
        
        <div class="absolute left-4 md:left-1/2 w-4 h-4 bg-slate-900 border-2 border-pink-500 rounded-full transform -translate-x-[7px] md:-translate-x-1/2 z-20 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>

        <div :class="[
          'ml-12 md:ml-0 md:w-[45%] p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
          index % 2 === 0 ? 'md:mr-auto md:text-right' : 'md:ml-auto'
        ]">
          <span class="text-pink-400 text-sm font-mono font-bold">{{ item.year }}</span>
          <h3 class="text-xl font-bold mt-1">{{ item.title }}</h3>
          <p class="text-indigo-300 text-sm mb-3">{{ item.company }}</p>
          <p class="text-slate-400 text-sm leading-relaxed">
            {{ item.desc }}
          </p>
        </div>

      </div>
    </div>
    <BackgroundShapes type="timeline" />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BackgroundShapes from './BackgroundShapes.vue';

const { t } = useI18n();

const timelineData = computed(() => [
  {
    year: '2025-2026',
    title: t('timeline.items.epitech.title'),
    company: t('timeline.items.epitech.company'),
    desc: t('timeline.items.epitech.desc')
  },
  {
    year: '2025',
    title: t('timeline.items.certifications.title'),
    company: t('timeline.items.certifications.company'),
    desc: t('timeline.items.certifications.desc')
  },
  {
    year: '2022-2025',
    title: t('timeline.items.consultant.title'),
    company: t('timeline.items.consultant.company'),
    desc: t('timeline.items.consultant.desc')
  },
  {
    year: '2020-2022',
    title: t('timeline.items.weema.title'),
    company: t('timeline.items.weema.company'),
    desc: t('timeline.items.weema.desc')
  },
  {
    year: '2017',
    title: t('timeline.items.university.title'),
    company: t('timeline.items.university.company'),
    desc: t('timeline.items.university.desc')
  }
]);
</script>
