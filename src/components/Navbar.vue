<template>
  <nav class="flex justify-between items-center mb-20 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full px-6 py-4 shadow-xl">
    <div class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
      Ginique.Dev
    </div>
    <div class="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
      <a href="#hero" class="hover:text-white transition">{{ $t('nav.about') }}</a>
      <a href="#about" class="hover:text-white transition">{{ $t('nav.about') }}</a>
      <a href="#projects" class="hover:text-white transition">{{ $t('nav.projects') }}</a>
      <a href="#timeline" class="hover:text-white transition">{{ $t('nav.timeline') }}</a>
      <a href="#testimonials" class="hover:text-white transition">{{ $t('nav.testimonials') }}</a>
    </div>
    <div class="flex items-center gap-4">
      <LanguageSwitcher />
      <a href="#contact" class="bg-white text-slate-900 px-5 py-2 rounded-full font-bold text-sm hover:scale-105 transition transform shadow-lg shadow-white/10">
        {{ $t('nav.contact') }}
      </a>
    </div>
  </nav>
</template>

<script setup>
import LanguageSwitcher from './LanguageSwitcher.vue'
</script>
