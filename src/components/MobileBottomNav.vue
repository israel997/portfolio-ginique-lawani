<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 lg:hidden border-t border-line bg-nav backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    aria-label="Navigation mobile"
  >
    <ul class="grid grid-cols-5">
      <li v-for="item in navItems" :key="item.id">
        <RouterLink
          :to="{ path: '/', hash: `#${item.id}` }"
          :aria-current="onHome && activeSection === item.id ? 'true' : undefined"
          :class="[
            'flex h-16 flex-col items-center justify-center gap-1 transition-colors active:scale-95',
            onHome && activeSection === item.id ? 'text-accent' : 'text-muted'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5" :stroke-width="onHome && activeSection === item.id ? 2.25 : 1.75" />
          <span class="text-[10px] font-medium leading-none">{{ st(item.id, 'nav') }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { UserRound, Code2, LayoutGrid, Route, Mail } from 'lucide-vue-next';
import { useActiveSection } from '../composables/useActiveSection';
import { useSectionText } from '../composables/sectionTexts';

const { sectionText: st } = useSectionText();

const { activeSection } = useActiveSection();
const route = useRoute();
const onHome = computed(() => route.name === 'home');

const navItems = [
  { id: 'about', label: 'nav.about', icon: UserRound },
  { id: 'projects', label: 'nav.projects', icon: LayoutGrid },
  { id: 'skills', label: 'nav.skills', icon: Code2 },
  { id: 'timeline', label: 'nav.timeline', icon: Route },
  { id: 'contact', label: 'nav.contact', icon: Mail }
];
</script>
