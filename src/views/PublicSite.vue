<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUp } from 'lucide-vue-next'
import { useSEO } from '../composables/useSEO'
import Navbar from '../components/Navbar.vue'
import Hero from '../components/Hero.vue'
import About from '../components/About.vue'
import Skills from '../components/Skills.vue'
import Timeline from '../components/Timeline.vue'
import Projects from '../components/Projects.vue'
import Showcase from '../components/Showcase.vue'
import Testimonials from '../components/Testimonials.vue'
import Contact from '../components/Contact.vue'
import Footer from '../components/Footer.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'
import { useContent } from '../composables/useContent'
import { useActiveSection } from '../composables/useActiveSection'

const { t } = useI18n()

// Initialize SEO
useSEO()

const { content } = useContent()

// Page order. Sections are numbered by position, so hiding an empty one
// (the showcase carousel with no items) doesn't leave a gap in "01, 02…".
const sections = computed(() => {
  const all = [
    { id: 'about', component: About },
    { id: 'projects', component: Projects },
    { id: 'skills', component: Skills },
    { id: 'showcase', component: Showcase, hidden: !(content.value.showcase || []).length },
    { id: 'timeline', component: Timeline },
    { id: 'testimonials', component: Testimonials },
    { id: 'contact', component: Contact }
  ]
  return all
    .filter((section) => !section.hidden)
    .map((section, i) => ({ ...section, index: String(i + 1).padStart(2, '0') }))
})

const { refresh: refreshActiveSection } = useActiveSection()
watch(() => sections.value.length, () => nextTick(refreshActiveSection))

const scrollProgress = ref(0)
const showScrollTop = ref(false)
let ticking = false

const updateScrollProgress = () => {
  const scrollTop = window.scrollY
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight

  scrollProgress.value = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
  showScrollTop.value = scrollTop > 300
  ticking = false
}

// Throttle to one update per frame — scroll fires far more often than that on mobile
const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateScrollProgress)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateScrollProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
    <!-- Barre de progression -->
    <div class="fixed top-0 left-0 w-full h-0.5 bg-white/5 z-[60]">
      <div class="h-full bg-blue-500" :style="{ width: scrollProgress + '%' }"></div>
    </div>

    <Navbar />

    <main>
      <div class="band band-hero">
        <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] md:w-[700px] md:h-[700px] bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full filter blur-[110px] opacity-20 animate-blob"></div>
          <div class="hidden md:block absolute top-1/3 -right-24 w-96 h-96 bg-blue-500 rounded-full filter blur-[90px] opacity-15 animate-blob delay-2000"></div>
        </div>
        <div class="band-inner"><Hero /></div>
      </div>

      <div v-for="section in sections" :key="section.id" :class="`band band-${section.id}`">
        <div class="band-inner"><component :is="section.component" :index="section.index" /></div>
      </div>
    </main>

    <Footer />

    <!-- Navigation mobile en bas -->
    <MobileBottomNav />

    <!-- Bouton Retour en haut -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0 translate-y-2"
    >
      <button
        v-show="showScrollTop"
        @click="scrollToTop"
        class="fixed right-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-8 lg:right-8 w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform flex items-center justify-center z-50"
        :aria-label="t('contact.scrollTop')"
        :title="t('contact.scrollTop')"
      >
        <ArrowUp class="w-5 h-5" :stroke-width="2.25" />
      </button>
    </Transition>
  </div>
</template>
