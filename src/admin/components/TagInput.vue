<template>
  <div>
    <label v-if="label" :for="inputId" class="admin-label">{{ label }}</label>
    <div
      class="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 transition-colors focus-within:border-pink-500/60 focus-within:ring-2 focus-within:ring-pink-500/20"
      @click="inputEl?.focus()"
    >
      <span
        v-for="(tag, index) in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-md bg-pink-500/15 py-1 pl-2 pr-1 font-mono text-xs text-pink-200"
      >
        {{ tag }}
        <button type="button" @click.stop="remove(index)" class="rounded p-0.5 hover:bg-white/10" :aria-label="`Retirer ${tag}`">
          <X class="h-3 w-3" />
        </button>
      </span>
      <input
        :id="inputId"
        ref="inputEl"
        v-model="pending"
        @keydown="onKeydown"
        @blur="commit"
        :placeholder="modelValue.length ? '' : placeholder"
        enterkeyhint="done"
        class="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-base md:text-sm text-white placeholder:text-slate-500 focus:outline-none"
      />
    </div>
    <p class="mt-1.5 text-xs text-slate-500">Entrée ou virgule pour ajouter.</p>
  </div>
</template>

<script setup>
import { ref, useId } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Vue.js, Laravel…' }
});
const emit = defineEmits(['update:modelValue']);

const inputId = useId();
const inputEl = ref(null);
const pending = ref('');

function commit() {
  const additions = pending.value.split(',').map((t) => t.trim()).filter(Boolean);
  pending.value = '';
  const next = [...props.modelValue];
  for (const tag of additions) {
    if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag);
  }
  if (next.length !== props.modelValue.length) emit('update:modelValue', next);
}

function remove(index) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}

function onKeydown(event) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    commit();
  } else if (event.key === 'Backspace' && !pending.value && props.modelValue.length) {
    remove(props.modelValue.length - 1);
  }
}
</script>
