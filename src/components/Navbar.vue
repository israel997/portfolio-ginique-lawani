<template>
  <nav class="flex justify-between items-center mb-12 md:mb-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full px-4 md:px-6 py-3 md:py-4 shadow-xl" role="navigation" aria-label="Navigation principale">
    <div class="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
      <span itemprop="brand">Ginique.Dev</span>
    </div>
    <div class="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
      <a href="#hero" class="hover:text-white transition">{{ $t('nav.about') }}</a>
      <a href="#about" class="hover:text-white transition">{{ $t('nav.about') }}</a>
      <a href="#projects" class="hover:text-white transition">{{ $t('nav.projects') }}</a>
      <a href="#timeline" class="hover:text-white transition">{{ $t('nav.timeline') }}</a>
      <a href="#testimonials" class="hover:text-white transition">{{ $t('nav.testimonials') }}</a>
    </div>
    <div class="flex items-center gap-2 md:gap-4">
      <LanguageSwitcher />
      <a href="#contact" class="bg-white text-slate-900 px-3 md:px-5 py-1.5 md:py-2 rounded-full font-bold text-xs md:text-sm hover:scale-105 transition transform shadow-lg shadow-white/10">
        {{ $t('nav.contact') }}
      </a>
    </div>
  </nav>
</template>

<script setup>
import LanguageSwitcher from './LanguageSwitcher.vue'
</script>
