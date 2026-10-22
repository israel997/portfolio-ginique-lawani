<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 lg:hidden border-t border-white/10 bg-[#0f172a]/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    aria-label="Navigation mobile"
  >
    <ul class="grid grid-cols-5">
      <li v-for="item in navItems" :key="item.id">
        <a
          :href="`#${item.id}`"
          :aria-current="activeSection === item.id ? 'true' : undefined"
          :class="[
            'flex h-16 flex-col items-center justify-center gap-1 transition-colors active:scale-95',
            activeSection === item.id ? 'text-pink-400' : 'text-slate-400'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5" :stroke-width="activeSection === item.id ? 2.25 : 1.75" />
          <span class="text-[10px] font-medium leading-none">{{ $t(item.label) }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { UserRound, Code2, LayoutGrid, Route, Mail } from 'lucide-vue-next';
import { useActiveSection } from '../composables/useActiveSection';

const { activeSection } = useActiveSection();

const navItems = [
  { id: 'about', label: 'nav.about', icon: UserRound },
  { id: 'skills', label: 'nav.skills', icon: Code2 },
  { id: 'timeline', label: 'nav.timeline', icon: Route },
  { id: 'projects', label: 'nav.projects', icon: LayoutGrid },
  { id: 'contact', label: 'nav.contact', icon: Mail }
];
</script>
