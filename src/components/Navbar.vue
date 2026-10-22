<template>
  <header class="sticky top-0 z-50 border-b border-line bg-nav backdrop-blur-xl supports-[backdrop-filter]:bg-nav">
    <nav class="mx-auto flex h-14 md:h-16 max-w-[1180px] items-center justify-end gap-4 px-4 md:px-6 lg:justify-between" aria-label="Navigation principale">
      <ul class="hidden lg:flex items-center gap-0.5 text-sm font-medium">
        <li v-for="link in links" :key="link.id">
          <RouterLink
            :to="{ path: '/', hash: `#${link.id}` }"
            :class="[
              'whitespace-nowrap rounded-full px-3 xl:px-3.5 py-2 transition-colors',
              onHome && activeSection === link.id ? 'bg-surface-hover text-ink' : 'text-muted hover:text-ink'
            ]"
          >{{ $t(link.label) }}</RouterLink>
        </li>
      </ul>

      <div class="flex items-center gap-2 md:gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
        <RouterLink :to="{ path: '/', hash: '#contact' }" class="hidden md:inline-flex items-center rounded-full bg-ink px-4 py-2 text-sm font-semibold text-page transition hover:bg-ink-2">
          {{ $t('nav.contact') }}
        </RouterLink>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeToggle from './ThemeToggle.vue'
import { useActiveSection } from '../composables/useActiveSection'

const { activeSection } = useActiveSection()
const route = useRoute()
const onHome = computed(() => route.name === 'home')

const links = [
  { id: 'about', label: 'nav.about' },
  { id: 'projects', label: 'nav.projects' },
  { id: 'skills', label: 'nav.skills' },
  { id: 'showcase', label: 'nav.showcase' },
  { id: 'timeline', label: 'nav.timeline' },
  { id: 'testimonials', label: 'nav.testimonials' }
]
</script>
