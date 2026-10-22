<template>
  <section id="skills">
    <SectionHeading :index="index" :eyebrow="$t('nav.skills')" :title="$t('skills.title')" />
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      <article v-for="skill in skillsData" :key="skill.id" class="group relative flex flex-col p-5 md:p-6 rounded-2xl bg-surface border border-line transition-all duration-300 hover:border-accent/40 hover:bg-surface-hover md:hover:-translate-y-1">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-brand/15 border border-brand/30 text-brand-text">
            <Icon :name="skill.icon_key" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-semibold">{{ localized(skill, 'title') }}</h3>
        </div>
        <p class="text-muted text-sm leading-relaxed">{{ localized(skill, 'description') }}</p>

        <!-- Each tech shown by its logo; techs without one keep a text label -->
        <ul class="mt-5 flex flex-wrap items-center gap-2" :aria-label="localized(skill, 'title')">
          <li v-for="tech in skill.techs" :key="tech">
            <span
              v-if="logoFor(tech)"
              class="grid h-10 w-10 place-items-center rounded-lg border border-line bg-page"
              :title="tech"
            >
              <img
                :src="logoFor(tech).image_url"
                :alt="tech"
                loading="lazy"
                decoding="async"
                :class="['h-6 w-6 object-contain', isMonoLogo(logoFor(tech).image_url) ? 'logo-mono' : '']"
              />
            </span>
            <span v-else class="inline-flex h-10 items-center rounded-lg border border-line bg-page px-3 font-mono text-[10px] uppercase tracking-wide text-ink-2">
              {{ tech }}
            </span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useContent } from '../composables/useContent';
import { findLogo, isMonoLogo } from '../composables/techLogos';
import Icon from './icons/Icon.vue';
import SectionHeading from './SectionHeading.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();

const skillsData = computed(() => content.value.skills || []);
const logos = computed(() => content.value.logos || []);

const logoFor = (tech) => findLogo(tech, logos.value);
</script>
