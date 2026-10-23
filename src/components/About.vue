<template>
  <section id="about" itemscope itemtype="https://schema.org/Person">
    <SectionHeading :index="index" :eyebrow="$t('nav.about')" :title="$t('about.title')" />

    <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
      <div class="relative mx-auto w-full max-w-[18rem] sm:max-w-sm">
        <div class="relative rounded-3xl overflow-hidden border border-line bg-panel shadow-card">
          <img v-if="settings.profile_photo_url" :src="settings.profile_photo_url" :alt="settings.full_name" loading="lazy" decoding="async" class="w-full h-auto">
        </div>
      </div>

      <div class="space-y-5">
        <h3 class="text-xl md:text-2xl font-semibold text-brand-text">
          {{ $t('about.subtitle') }}
        </h3>
        <p class="text-base text-ink-2 leading-relaxed">{{ localized(settings, 'bio1') }}</p>
        <p class="text-base text-muted leading-relaxed">{{ localized(settings, 'bio2') }}</p>

        <ul v-if="keyFigures.length" class="space-y-3 border-t border-line pt-5">
          <li v-for="(figure, i) in keyFigures" :key="figure.id" class="flex items-baseline gap-3">
            <span class="relative top-[-0.1em] h-2 w-2 shrink-0 rounded-full" :style="{ background: figureColor(figure.color, i) }" aria-hidden="true"></span>
            <p class="text-base leading-snug text-ink-2">
              <span v-if="figure.value" class="mr-1.5 font-mono text-xl font-semibold md:text-2xl" :style="{ color: figureColor(figure.color, i) }"><CountUp :value="figure.value" /></span>
              {{ localized(figure, 'label') }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';
import SectionHeading from './SectionHeading.vue';
import CountUp from './CountUp.vue';
import { figureColor } from '../composables/figureColors';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();
const settings = computed(() => content.value.settings || {});

const keyFigures = computed(() => content.value.keyFigures || []);
</script>
