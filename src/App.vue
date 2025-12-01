<script setup>
import Navbar from './components/Navbar.vue'
import Hero from './components/Hero.vue'
import About from './components/About.vue'
import Skills from './components/Skills.vue'
import Timeline from './components/Timeline.vue'
import Projects from './components/Projects.vue'
import Testimonials from './components/Testimonials.vue'
import Contact from './components/Contact.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div id="app" class="relative min-h-screen overflow-hidden">
    <!-- Blobs animés en arrière-plan -->
    <div class="fixed inset-0 w-full h-full pointer-events-none z-0">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
      <div class="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob delay-2000"></div>
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-blob delay-4000"></div>
      <div class="absolute top-32 left-10 w-16 h-16 border-4 border-white/10 rounded-full animate-float"></div>
      <div class="absolute bottom-1/3 right-10 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-purple-500/20 animate-float delay-2000 rotate-12"></div>
    </div>

    <!-- Contenu principal -->
    <div class="relative z-10 container mx-auto px-6 py-6">
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Timeline />
      <Projects />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  </div>
</template>
