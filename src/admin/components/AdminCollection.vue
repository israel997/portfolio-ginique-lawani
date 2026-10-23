<template>
  <div class="mx-auto max-w-5xl">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        <h1 class="font-display text-2xl font-semibold md:text-3xl">{{ title }}</h1>
        <p class="mt-1 text-sm text-slate-400">
          <template v-if="loading">Chargement…</template>
          <template v-else>{{ count }} élément{{ count > 1 ? 's' : '' }} · {{ visibleCount }} visible{{ visibleCount > 1 ? 's' : '' }} sur le site</template>
        </p>
        <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
      </div>
      <button type="button" @click="$emit('create')" class="admin-btn-primary">
        <Plus class="h-4 w-4" /> {{ createLabel }}
      </button>
    </header>

    <!-- Unsaved drafts left from a previous visit (refresh, crash, closed panel) -->
    <div v-if="drafts.length" class="mb-5 space-y-2">
      <div v-for="draft in drafts" :key="draft.key" class="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.07] px-4 py-3">
        <FilePen class="h-4 w-4 shrink-0 text-amber-300" />
        <p class="min-w-0 flex-1 text-sm text-slate-200">
          Brouillon non enregistré : <span class="font-semibold">{{ draft.label }}</span>
          <span class="text-slate-400"> · {{ draft.when }}</span>
        </p>
        <div class="flex items-center gap-1">
          <button type="button" @click="$emit('resume', draft)" class="admin-btn-primary h-9 px-3">Reprendre</button>
          <button type="button" @click="$emit('drop-draft', draft)" class="h-9 rounded-lg px-3 text-xs text-slate-400 hover:bg-white/5 hover:text-white">Supprimer</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <div class="h-16 w-8 shrink-0 animate-pulse rounded-lg bg-white/5"></div>
        <div class="flex-1 space-y-2 py-2">
          <div class="h-4 w-1/3 animate-pulse rounded bg-white/10"></div>
          <div class="h-3 w-2/3 animate-pulse rounded bg-white/5"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!count" class="flex flex-col items-center rounded-2xl border-2 border-dashed border-white/10 px-6 py-16 text-center">
      <component :is="emptyIcon" class="mb-3 h-8 w-8 text-slate-500" />
      <p class="font-medium">{{ emptyTitle }}</p>
      <p v-if="emptyHint" class="mt-1 text-sm text-slate-400">{{ emptyHint }}</p>
      <button type="button" @click="$emit('create')" class="admin-btn-primary mt-5"><Plus class="h-4 w-4" /> {{ createLabel }}</button>
    </div>

    <TransitionGroup v-else tag="ul" move-class="transition-transform duration-300" class="space-y-3">
      <slot />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { Plus, Inbox, FilePen } from 'lucide-vue-next';

// Page shell for an admin list: header with counts + create button,
// loading skeleton, empty state, and the animated list itself (default slot).
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  createLabel: { type: String, required: true },
  loading: Boolean,
  count: { type: Number, default: 0 },
  visibleCount: { type: Number, default: 0 },
  emptyTitle: { type: String, default: 'Rien pour l\'instant' },
  emptyHint: { type: String, default: '' },
  emptyIcon: { type: [Object, Function], default: () => Inbox },
  drafts: { type: Array, default: () => [] }
});
defineEmits(['create', 'resume', 'drop-draft']);
</script>
