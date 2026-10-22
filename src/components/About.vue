<template>
  <section id="about" itemscope itemtype="https://schema.org/Person">
    <SectionHeading :index="index" :eyebrow="$t('nav.about')" :title="$t('about.title')" />

    <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
      <div class="relative mx-auto w-full max-w-[18rem] sm:max-w-sm">
        <div class="relative rounded-3xl overflow-hidden border border-line bg-panel">
          <img v-if="settings.profile_photo_url" :src="settings.profile_photo_url" :alt="settings.full_name" loading="lazy" decoding="async" class="w-full h-auto">
        </div>
      </div>

      <div class="space-y-5">
        <h3 class="text-xl md:text-2xl font-semibold text-brand-text">
          {{ $t('about.subtitle') }}
        </h3>
        <p class="text-base text-ink-2 leading-relaxed">{{ localized(settings, 'bio1') }}</p>
        <p class="text-base text-muted leading-relaxed">{{ localized(settings, 'bio2') }}</p>

        <div class="grid grid-cols-3 gap-2.5 md:gap-4 pt-2">
          <a
            v-for="stat in stats"
            :key="stat.n"
            :href="stat.href"
            :class="`group rounded-xl border border-line bg-surface p-3 md:p-4 transition-colors hover:bg-surface-hover ${stat.border}`"
          >
            <div :class="`font-mono text-2xl md:text-3xl font-semibold ${stat.color}`"><CountUp :value="settings[`stat${stat.n}_value`]" /></div>
            <div class="mt-1 text-[11px] md:text-xs leading-snug text-muted">{{ localized(settings, `stat${stat.n}_label`) }}</div>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';
import CountUp from './CountUp.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});

const stats = [
  { n: 1, href: '#timeline', color: 'text-stat-1', border: 'hover:border-stat-1/40' },
  { n: 2, href: '#projects', color: 'text-stat-2', border: 'hover:border-stat-2/40' },
  { n: 3, href: '#timeline', color: 'text-stat-3', border: 'hover:border-stat-3/40' }
];
</script>
