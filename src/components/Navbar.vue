<template>
  <header class="sticky top-0 z-50 border-b border-white/5 bg-[#0f172a]/75 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f172a]/60">
    <nav class="mx-auto flex h-14 md:h-16 max-w-[1180px] items-center justify-between gap-4 px-4 md:px-6" aria-label="Navigation principale">
      <a href="#hero" class="flex items-center gap-2.5 min-w-0" :aria-label="settings.full_name">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-indigo-500 font-display text-sm font-bold">
          {{ initials }}
        </span>
        <span class="truncate font-display text-base md:text-lg font-semibold tracking-tight">{{ shortName }}</span>
      </a>

      <ul class="hidden lg:flex items-center gap-1 text-sm font-medium">
        <li v-for="link in links" :key="link.id">
          <a
            :href="`#${link.id}`"
            :class="[
              'rounded-full px-3.5 py-2 transition-colors',
              activeSection === link.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
            ]"
          >{{ $t(link.label) }}</a>
        </li>
      </ul>

      <div class="flex items-center gap-2 md:gap-3">
        <LanguageSwitcher />
        <a href="#contact" class="hidden md:inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
          {{ $t('nav.contact') }}
        </a>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import { useContent } from '../composables/useContent'
import { useActiveSection } from '../composables/useActiveSection'

const { content } = useContent()
const { activeSection } = useActiveSection()
const settings = computed(() => content.value.settings || {})

// "Ginique Oriadé LAWANI" -> "Ginique LAWANI" / "GL"
const nameParts = computed(() => (settings.value.full_name || '').trim().split(/\s+/).filter(Boolean))
const shortName = computed(() => {
  const parts = nameParts.value
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : parts[0] || ''
})
const initials = computed(() => {
  const parts = nameParts.value
  if (!parts.length) return ''
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
})

const links = [
  { id: 'about', label: 'nav.about' },
  { id: 'skills', label: 'nav.skills' },
  { id: 'timeline', label: 'nav.timeline' },
  { id: 'projects', label: 'nav.projects' },
  { id: 'testimonials', label: 'nav.testimonials' }
]
</script>
