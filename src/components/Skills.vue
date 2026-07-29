<template>
  <section id="skills" class="mb-16 md:mb-32 px-4 md:px-0">
    <h2 class="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">{{ $t('skills.title') }}</h2>
    <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
    <div v-for="(skill, index) in skillsData" :key="skill.id" class="group relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden floating-skill-card" :style="{ animationDelay: `${index * 0.15}s` }">
      <!-- Animation lumineuse -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div class="shine-effect"></div>
      </div>

      <div class="relative z-10 flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
        <div :class="`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${skill.icon_bg_class} border border-white/10`">
          <Icon :name="skill.icon_key" class="w-6 h-6 text-white scale-90 md:scale-100" />
        </div>
        <h4 class="text-base md:text-lg font-bold">{{ localized(skill, 'title') }}</h4>
      </div>
      <p class="relative z-10 text-slate-400 text-xs md:text-sm leading-relaxed">{{ localized(skill, 'description') }}</p>
      <div class="relative z-10 mt-4 flex flex-wrap gap-2">
        <span v-for="tech in skill.techs" :key="tech" class="px-2 py-1 text-[10px] uppercase font-bold rounded-full bg-white/5 border border-white/10 text-slate-300">
          {{ tech }}
        </span>
      </div>
    </div>
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
@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(30deg);
  }
}

@keyframes floatSkill {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.floating-skill-card {
  animation: floatSkill 3s ease-in-out infinite;
}

.shine-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(236, 72, 153, 0.1),
    rgba(236, 72, 153, 0.3),
    rgba(236, 72, 153, 0.1),
    transparent
  );
  animation: shine 1.5s ease-in-out;
}

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
  color: rgb(148, 163, 184);
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.logo-item:hover .logo-img {
  opacity: 1;
  transform: scale(1.1);
}

.logo-item:hover .logo-name {
  color: rgb(236, 72, 153);
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
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
