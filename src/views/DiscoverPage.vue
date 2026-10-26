<template>
  <div class="relative min-h-screen overflow-x-clip pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
    <Navbar />

    <main>
      <!-- Header -->
      <div class="band band-hero pb-10! md:pb-14!">
        <div class="hero-orb" aria-hidden="true"></div>
        <div class="band-inner">
          <RouterLink :to="{ path: '/', hash: '#about' }" class="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
            <ArrowLeft class="h-4 w-4" /> {{ $t('discover.back') }}
          </RouterLink>
          <p class="section-eyebrow mb-3">{{ $t('discover.eyebrow') }}</p>
          <h1 class="mb-5 max-w-4xl text-4xl font-bold text-balance md:text-6xl">{{ pageTitle }}</h1>
          <p v-if="intro" class="max-w-3xl whitespace-pre-line text-base leading-relaxed text-ink-2 md:text-lg text-pretty">{{ intro }}</p>

          <!-- Quick access to each section (scrolls sideways on phones) -->
          <nav v-if="sections.length > 1" class="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden" :aria-label="$t('discover.jump')">
            <ul class="flex w-max gap-2 md:w-auto md:flex-wrap">
              <li v-for="(section, i) in sections" :key="section.id">
                <RouterLink :to="{ hash: `#${anchor(section)}` }" class="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-2 transition-colors hover:border-accent/50 hover:text-ink">
                  <span class="font-mono text-xs text-subtle">{{ number(i) }}</span>{{ localized(section, 'title') }}
                </RouterLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div v-if="!loaded && !sections.length" class="band band-projects">
        <div class="band-inner grid min-h-[30vh] place-items-center">
          <LoaderCircle class="h-6 w-6 animate-spin text-accent" />
        </div>
      </div>

      <div v-else-if="!sections.length" class="band band-projects">
        <p class="band-inner text-center text-muted">{{ $t('discover.soon') }}</p>
      </div>

      <!-- One band per section, each with its carousel of cards -->
      <div v-for="(section, i) in sections" :key="section.id" :class="['band', BANDS[i % BANDS.length]]">
        <section :id="anchor(section)" class="band-inner">
          <SectionHeading :index="number(i)" :eyebrow="$t('discover.eyebrow')" :title="localized(section, 'title')" align="left" />
          <p v-if="localized(section, 'intro')" class="-mt-6 mb-10 max-w-3xl whitespace-pre-line text-base leading-relaxed text-muted md:-mt-8 md:mb-12 md:text-lg">{{ localized(section, 'intro') }}</p>

          <CardCarousel :items="section.cards" :label="localized(section, 'title')">
            <template #default="{ item: card, index: c }">
              <article class="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <img v-if="card.image_url" :src="card.image_url" :alt="localized(card, 'title')" loading="lazy" decoding="async" class="aspect-[4/3] w-full object-cover" />
                <div class="flex flex-1 flex-col p-5 md:p-6">
                  <span class="mb-3 font-mono text-xs font-semibold" :style="{ color: listColor('mixed', c) }">{{ number(c) }}</span>
                  <h3 v-if="localized(card, 'title')" class="mb-2.5 text-xl font-semibold text-balance">{{ localized(card, 'title') }}</h3>
                  <p class="whitespace-pre-line text-base leading-relaxed text-ink-2">{{ localized(card, 'text') }}</p>
                </div>
              </article>
            </template>
          </CardCarousel>
        </section>
      </div>

      <!-- Way back into the portfolio -->
      <div class="band band-contact">
        <div class="section-orb" aria-hidden="true"></div>
        <div class="band-inner flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <RouterLink to="/" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-hover sm:w-auto">
            <LayoutGrid class="h-4 w-4" /> {{ $t('projectDetail.viewPortfolio') }}
          </RouterLink>
          <RouterLink :to="{ path: '/', hash: '#contact' }" class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-6 text-sm font-semibold transition-colors hover:bg-surface-hover sm:w-auto">
            <Mail class="h-4 w-4" /> {{ $t('discover.contact') }}
          </RouterLink>
        </div>
      </div>
    </main>

    <Footer />
    <MobileBottomNav />
  </div>
</template>

<script setup>
import { computed, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, LayoutGrid, LoaderCircle, Mail } from 'lucide-vue-next';
import { useContent } from '../composables/useContent';
import { listColor } from '../composables/figureColors';
import { discoverSections } from '../composables/discover';
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';
import MobileBottomNav from '../components/MobileBottomNav.vue';
import SectionHeading from '../components/SectionHeading.vue';
import CardCarousel from '../components/CardCarousel.vue';

// "Découvrir" page (/decouvrir): everything the portfolio doesn't say, in
// sections edited from Admin > Découvrir, each one a carousel of cards.
const { t } = useI18n();
const { content, loaded, localized } = useContent();

const BANDS = ['band-about', 'band-projects', 'band-skills'];

const settings = computed(() => content.value.settings || {});
const sections = computed(() => discoverSections(content.value));
const pageTitle = computed(() => localized(settings.value, 'discover_title') || t('discover.title'));
const intro = computed(() => localized(settings.value, 'discover_intro'));

const number = (i) => String(i + 1).padStart(2, '0');
const anchor = (section) => `decouvrir-${section.id}`;

watchEffect(() => {
  document.title = `${pageTitle.value} | ${settings.value.full_name || 'Portfolio'}`;
});
</script>
