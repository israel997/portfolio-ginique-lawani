<template>
  <section id="about" class="mb-32">
    <h2 class="text-3xl font-bold mb-16 text-center">Développeur, mais pas que ...</h2>
    
    <div class="max-w-5xl mx-auto">
      <div class="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div class="relative">
          <div class="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden border-4 border-white/10">
            <img src="/profile2.jpg" alt="Ginique Oriadé LAWANI" loading="lazy" class="w-full h-auto">
            <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 pointer-events-none"></div>
          </div>
          <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full blur-2xl opacity-30"></div>
        </div>
        
        <div class="space-y-6">
          <h3 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
            Je suis,
          </h3>
          <p class="text-slate-400 leading-relaxed">
            Développeur Fullstack créatif avec <span class="text-white font-semibold">8 ans d'expertise</span> en gestion de projets d'entreprise.
          </p>
          <p class="text-slate-400 leading-relaxed">
            Spécialisé dans la <span class="text-white font-semibold">transformation digitale</span> et les stratégies de croissance business, je transforme des idées innovantes en solutions digitales impactantes.
          </p>
          <div class="grid grid-cols-3 gap-4 mt-6">
            <a href="#timeline" class="stat-card text-center p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:border-pink-400/50 hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div class="shine-loop"></div>
              <div class="relative z-10 text-2xl font-bold text-pink-400">8+</div>
              <div class="relative z-10 text-xs text-slate-400 mt-1">Années de gestion de projets</div>
            </a>
            <a href="#projects" class="stat-card text-center p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:border-purple-400/50 hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div class="shine-loop shine-delay-1"></div>
              <div class="relative z-10 text-2xl font-bold text-purple-400">15+</div>
              <div class="relative z-10 text-xs text-slate-400 mt-1">Projets réalisés</div>
            </a>
            <a href="#timeline" class="stat-card text-center p-4 rounded-xl bg-white/5 border-2 border-white/10 hover:border-indigo-400/50 hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
              <div class="shine-loop shine-delay-2"></div>
              <div class="relative z-10 text-2xl font-bold text-indigo-400">02</div>
              <div class="relative z-10 text-xs text-slate-400 mt-1">Certifications Internationales</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes shine-loop {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(30deg);
  }
}

.shine-loop {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(236, 72, 153, 0.1),
    rgba(236, 72, 153, 0.3),
    rgba(236, 72, 153, 0.1),
    transparent
  );
  animation: shine-loop 2s ease-in-out infinite;
}

.shine-delay-1 {
  animation-delay: 0.4s;
}

.shine-delay-2 {
  animation-delay: 0.8s;
}
</style>

<script setup>
</script>
