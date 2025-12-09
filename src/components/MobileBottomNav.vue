<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
    <div class="flex justify-around items-center px-2 py-3">
      <a 
        v-for="item in navItems" 
        :key="item.id"
        :href="item.href"
        class="flex flex-col items-center gap-1 text-slate-400 hover:text-pink-400 transition-colors duration-300 active:scale-95 px-3 py-1"
        :class="{ 'text-pink-400': activeSection === item.id }"
      >
        <div v-html="item.icon" class="w-5 h-5"></div>
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </a>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const activeSection = ref('hero');

const navItems = computed(() => [
  {
    id: 'about',
    href: '#about',
    label: t('nav.about'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>'
  },
  {
    id: 'skills',
    href: '#skills',
    label: t('nav.skills'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>'
  },
  {
    id: 'projects',
    href: '#projects',
    label: t('nav.projects'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>'
  },
  {
    id: 'timeline',
    href: '#timeline',
    label: t('nav.timeline'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
  },
  {
    id: 'contact',
    href: '#contact',
    label: t('nav.contact'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>'
  }
]);

const handleScroll = () => {
  const sections = ['hero', 'about', 'skills', 'projects', 'timeline', 'contact'];
  const scrollPosition = window.scrollY + window.innerHeight / 3;

  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const { offsetTop, offsetHeight } = element;
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        activeSection.value = section;
        break;
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Ajouter un padding-bottom au body pour éviter que le contenu soit caché */
</style>
