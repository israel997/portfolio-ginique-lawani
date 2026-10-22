import { ref } from 'vue';

// Module-level singleton so any admin view can raise a toast that the
// layout's <ToastHost> renders.
const toasts = ref([]);
let nextId = 1;

function push(message, tone = 'success', timeout = 3200) {
  const id = nextId++;
  toasts.value.push({ id, message, tone });
  setTimeout(() => dismiss(id), timeout);
}

function dismiss(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error', 5000)
  };
}
