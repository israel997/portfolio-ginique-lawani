<template>
  <li
    :class="[
      'flex items-center gap-3 rounded-2xl border bg-white/[0.03] p-3 transition-colors md:gap-4',
      visible ? 'border-white/10 hover:border-white/20' : 'border-dashed border-white/10 opacity-60 hover:opacity-100'
    ]"
  >
    <ReorderControls :disabled-up="first" :disabled-down="last" @up="$emit('up')" @down="$emit('down')" />

    <button v-if="$slots.thumb" type="button" @click="$emit('edit')" class="shrink-0" :aria-label="`Modifier ${title}`">
      <slot name="thumb" />
    </button>

    <button type="button" @click="$emit('edit')" class="min-w-0 flex-1 py-1 text-left">
      <p v-if="eyebrow" class="font-mono text-xs text-pink-400">{{ eyebrow }}</p>
      <p class="truncate font-semibold">{{ title || 'Sans titre' }}</p>
      <p v-if="subtitle" class="mt-0.5 line-clamp-1 text-sm text-slate-400">{{ subtitle }}</p>
      <div v-if="$slots.meta" class="mt-1.5 hidden items-center gap-3 text-xs text-slate-500 sm:flex">
        <slot name="meta" />
      </div>
    </button>

    <div class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-1">
      <ToggleSwitch
        :model-value="visible"
        @update:model-value="$emit('toggle', $event)"
        :disabled="saving"
        :aria-label="visible ? 'Masquer du site' : 'Afficher sur le site'"
        :title="visible ? 'Visible sur le site' : 'Masqué'"
      />
      <div class="flex items-center gap-1">
        <button type="button" @click="$emit('edit')" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Modifier">
          <Pencil class="h-4 w-4" />
        </button>
        <button type="button" @click="$emit('delete')" class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Supprimer">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>
  </li>
</template>

<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next';
import ReorderControls from './ReorderControls.vue';
import ToggleSwitch from './ToggleSwitch.vue';

// Collapsed list row: reorder arrows, a short summary (eyebrow / title /
// subtitle), visibility switch, edit and delete. Clicking opens the editor.
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  visible: Boolean,
  saving: Boolean,
  first: Boolean,
  last: Boolean
});
defineEmits(['up', 'down', 'edit', 'delete', 'toggle']);
</script>
