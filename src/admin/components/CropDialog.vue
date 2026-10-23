<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
      <div v-if="src" class="fixed inset-0 z-[70] flex flex-col bg-slate-950 text-white" role="dialog" aria-modal="true" aria-label="Recadrer l'image">
        <header class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <h2 class="font-display text-lg font-semibold">Recadrer l'image</h2>
          <button type="button" @click="$emit('cancel')" class="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Annuler">
            <X class="h-5 w-5" />
          </button>
        </header>

        <p v-if="recommended" class="flex items-center gap-2 border-b border-white/10 bg-brand/10 px-4 py-2 text-xs text-slate-300">
          <Crop class="h-3.5 w-3.5 shrink-0 text-brand-text" />
          Format utilisé par le site pour cette image : <span class="font-mono font-semibold text-brand-text">{{ recommended }}</span>
          <span v-if="!isSiteFormat" class="text-amber-300">· autre format choisi : l'image sera affichée avec des bandes</span>
        </p>

        <!-- Format presets -->
        <div class="flex gap-1.5 overflow-x-auto border-b border-white/10 px-4 py-2.5 [scrollbar-width:none]" role="radiogroup" aria-label="Format">
          <button
            v-for="preset in presets"
            :key="preset.label"
            type="button"
            role="radio"
            :aria-checked="ratio === preset.value"
            @click="setRatio(preset.value)"
            :class="[
              'h-9 shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors',
              ratio === preset.value || (Number.isNaN(ratio) && Number.isNaN(preset.value)) ? 'border-transparent bg-white text-slate-900' : preset.hint ? 'border-brand bg-brand/15 text-white' : 'border-transparent bg-white/5 text-slate-300 hover:bg-white/10'
            ]"
          >
            {{ preset.label }}<span v-if="preset.hint" class="ml-1 text-xs font-semibold opacity-80">· {{ preset.hint }}</span>
          </button>
        </div>

        <div class="relative min-h-0 flex-1 bg-black">
          <img ref="image" :src="src" crossorigin="anonymous" alt="" class="block max-w-full" @load="init" @error="loadError = true" />
          <div v-if="!ready && !loadError" class="absolute inset-0 grid place-items-center">
            <LoaderCircle class="h-6 w-6 animate-spin text-slate-400" />
          </div>
          <p v-if="loadError" class="absolute inset-0 grid place-items-center px-6 text-center text-sm text-red-300">
            Impossible de charger cette image pour la recadrer.
          </p>
        </div>

        <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div class="flex items-center gap-1">
            <button type="button" @click="cropper?.rotate(-90)" :disabled="!ready" class="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40" aria-label="Pivoter à gauche" title="Pivoter à gauche">
              <RotateCcw class="h-4 w-4" />
            </button>
            <button type="button" @click="cropper?.rotate(90)" :disabled="!ready" class="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40" aria-label="Pivoter à droite" title="Pivoter à droite">
              <RotateCw class="h-4 w-4" />
            </button>
            <button type="button" @click="cropper?.zoom(0.1)" :disabled="!ready" class="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40" aria-label="Zoomer" title="Zoomer">
              <ZoomIn class="h-4 w-4" />
            </button>
            <button type="button" @click="cropper?.zoom(-0.1)" :disabled="!ready" class="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40" aria-label="Dézoomer" title="Dézoomer">
              <ZoomOut class="h-4 w-4" />
            </button>
            <button type="button" @click="cropper?.reset()" :disabled="!ready" class="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-40" aria-label="Réinitialiser" title="Réinitialiser">
              <Undo2 class="h-4 w-4" />
            </button>
          </div>
          <div class="flex flex-1 items-center justify-end gap-2">
            <button v-if="allowOriginal" type="button" @click="$emit('original')" class="admin-btn-secondary">Sans recadrer</button>
            <button type="button" @click="confirm" :disabled="!ready || exporting" class="admin-btn-primary">
              <LoaderCircle v-if="exporting" class="h-4 w-4 animate-spin" />
              <Check v-else class="h-4 w-4" />
              Valider
            </button>
          </div>
          <p v-if="exportError" class="w-full text-sm text-red-300">{{ exportError }}</p>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { X, Check, LoaderCircle, RotateCcw, RotateCw, ZoomIn, ZoomOut, Undo2, Crop } from 'lucide-vue-next';

// Full-screen crop editor. Emits `crop` with a Blob of the cropped image,
// `original` to keep the file as-is, or `cancel`.
const props = defineProps({
  src: { type: String, default: '' },
  // Format selected when the editor opens (NaN = free)
  initialRatio: { type: Number, default: NaN },
  // Hint shown next to the format the site uses for this image
  recommended: { type: String, default: '' },
  // PNG keeps transparency; everything else is exported as JPEG
  outputType: { type: String, default: 'image/jpeg' },
  allowOriginal: { type: Boolean, default: true }
});
const emit = defineEmits(['crop', 'original', 'cancel']);

// Longest edge of the exported image: plenty for any screen, keeps files light
const MAX_EDGE = 2000;

const presets = [
  { label: 'Libre', value: NaN },
  { label: '16:10', value: 16 / 10 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '3:4', value: 3 / 4 }
].map((p) => ({ ...p, hint: props.recommended && p.label === props.recommended ? 'format du site' : '' }));

const image = ref(null);

const siteRatio = computed(() => {
  const [w, h] = (props.recommended || '').split(':').map(Number);
  return w && h ? w / h : NaN;
});
const ratio = ref(props.initialRatio);
const isSiteFormat = computed(() => Number.isNaN(siteRatio.value) || ratio.value === siteRatio.value);
const ready = ref(false);
const loadError = ref(false);
const exporting = ref(false);
const exportError = ref('');
let cropper = null;

function destroy() {
  cropper?.destroy();
  cropper = null;
  ready.value = false;
}

function init() {
  destroy();
  cropper = new Cropper(image.value, {
    viewMode: 1, // crop box stays inside the image
    dragMode: 'move',
    aspectRatio: ratio.value,
    autoCropArea: 1,
    background: false,
    responsive: true,
    toggleDragModeOnDblclick: false,
    ready() {
      ready.value = true;
    }
  });
}

function setRatio(value) {
  ratio.value = value;
  cropper?.setAspectRatio(value);
}

function confirm() {
  if (!cropper) return;
  exporting.value = true;
  exportError.value = '';
  const data = cropper.getData(true);
  const scale = Math.min(1, MAX_EDGE / Math.max(data.width, data.height));
  const canvas = cropper.getCroppedCanvas({
    width: Math.round(data.width * scale),
    height: Math.round(data.height * scale),
    imageSmoothingQuality: 'high',
    // JPEG has no transparency: paint transparent areas white
    fillColor: props.outputType === 'image/png' ? 'transparent' : '#ffffff'
  });
  try {
    canvas.toBlob((blob) => {
      exporting.value = false;
      if (!blob) {
        exportError.value = 'Impossible de générer l\'image recadrée.';
        return;
      }
      emit('crop', blob);
    }, props.outputType, 0.88);
  } catch {
    // A cross-origin image without CORS headers taints the canvas
    exporting.value = false;
    exportError.value = 'Cette image ne peut pas être recadrée depuis son adresse actuelle. Ré-importez le fichier.';
  }
}

watch(() => props.src, (value) => {
  loadError.value = false;
  exportError.value = '';
  ratio.value = props.initialRatio;
  if (!value) destroy();
});

onUnmounted(destroy);
</script>

