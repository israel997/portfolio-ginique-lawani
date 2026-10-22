<template>
  <section id="skills">
    <SectionHeading :index="index" :eyebrow="$t('nav.skills')" :title="$t('skills.title')" />
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      <article v-for="skill in skillsData" :key="skill.id" class="group relative p-5 md:p-6 rounded-2xl bg-surface border border-line backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-surface-hover md:hover:-translate-y-1">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-brand/15 border border-brand/30 text-brand-text">
            <Icon :name="skill.icon_key" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-semibold">{{ localized(skill, 'title') }}</h3>
        </div>
        <p class="text-muted text-sm leading-relaxed">{{ localized(skill, 'description') }}</p>
        <div class="mt-4 flex flex-wrap gap-1.5">
          <span v-for="tech in skill.techs" :key="tech" class="px-2 py-1 font-mono text-[10px] uppercase tracking-wide rounded-md bg-surface border border-line text-ink-2">
            {{ tech }}
          </span>
        </div>
      </article>
    </div>

  <!-- Défilement des logos tech -->
  <div class="mt-8 md:mt-16 overflow-hidden">
    <div class="logos-slider">
      <div class="logos-track">
        <!-- Desktop: défilement avec duplication -->
        <template v-if="isDesktop">
          <div v-for="(logo, index) in [...logosData, ...logosData]" :key="index" class="logo-item">
            <img :src="logo.image_url" :alt="logo.name" class="logo-img" />
            <span class="logo-name">{{ logo.name }}</span>
          </div>
        </template>
        <!-- Mobile: grille statique -->
        <template v-else>
          <div v-for="(logo, index) in logosData" :key="index" class="logo-item">
            <img :src="logo.image_url" :alt="logo.name" class="logo-img" />
            <span class="logo-name">{{ logo.name }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useContent } from '../composables/useContent';
import Icon from './icons/Icon.vue';
import SectionHeading from './SectionHeading.vue';

defineProps({ index: { type: String, default: '' } });

const { content, localized } = useContent();

const skillsData = computed(() => content.value.skills || []);
const logosData = computed(() => content.value.logos || []);

// Détection desktop/mobile
const isDesktop = ref(window.innerWidth >= 768);

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Slider de logos */
.logos-slider {
  position: relative;
  width: 100%;
  padding: 2rem 0;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.logos-track {
  display: flex;
  gap: 3rem;
  animation: scroll 30s linear infinite;
}

.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.logo-img {
  height: 48px;
  width: auto;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.logo-name {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.logo-item:hover .logo-img {
  opacity: 1;
  transform: scale(1.1);
}

.logo-item:hover .logo-name {
  color: var(--accent);
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .logo-img {
    height: 28px;
  }

  .logo-name {
    font-size: 0.625rem;
  }

  .logos-slider {
    padding: 1rem 0;
  }

  .logos-track {
    flex-wrap: wrap;
    gap: 1.5rem;
    animation: none;
    justify-content: center;
    row-gap: 1.25rem;
  }
}
</style>
