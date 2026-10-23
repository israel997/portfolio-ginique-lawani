import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useApi } from './useApi';
import { useToast } from './useToast';
import { readDraft, writeDraft, removeDraft, listDrafts, formatDraftTime } from './drafts';

// Shared state and actions for an admin list page backed by
// /api/admin/<resource>: load, create/edit in a slide-over, inline
// visibility toggle, reorder, delete — with toasts for feedback.
//
//   fields    editable columns copied into the form (sort_order excluded)
//   defaults  () => values for a new item
//   validate  (form) => error message, or '' when valid
//   prepare   (values) => values, adjust form values when the panel opens
//   clean     (payload) => payload, last-minute normalisation before saving
//   labels    { created, saved, deleted } toast messages
//
// Unsaved edits are autosaved as local drafts (see drafts.js) and offered
// back after a refresh or when the item is reopened.
export function useCrudList(resource, { fields, defaults, validate = () => '', prepare = (v) => v, clean = (p) => p, labels }) {
  const api = useApi();
  const toast = useToast();
  const base = `/api/admin/${resource}`;

  const items = ref([]);
  const loading = ref(true);
  const pendingDelete = ref(null);

  const form = ref(null);
  const formSnapshot = ref('');
  const formError = ref('');
  const saving = ref(false);
  const confirmDiscard = ref(false);

  // --- Drafts ----------------------------------------------------------------
  const draftKey = (id) => `${resource}:${id ?? 'new'}`;
  const drafts = ref([]); // [{ key, label, savedAt, id }] shown above the list
  const restoredAt = ref(null); // set when the open form came from a draft

  const draftLabel = (v) => v?.name || v?.title_fr || v?.label_fr || v?.year_label || v?.value || 'Sans titre';

  function refreshDrafts() {
    drafts.value = listDrafts(`${resource}:`).map((d) => {
      const id = d.key.slice(resource.length + 1);
      return { ...d, id: id === 'new' ? null : Number(id), when: formatDraftTime(d.savedAt) };
    });
  }

  async function load() {
    loading.value = true;
    try {
      items.value = await api.get(base);
    } catch (err) {
      toast.error(err.message);
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    load();
    refreshDrafts();
  });

  // --- Create / edit panel -------------------------------------------------

  function openForm(values) {
    // Deep copy so nested values (tags, gallery) never alias the list item
    form.value = prepare(JSON.parse(JSON.stringify(values)));
    formSnapshot.value = JSON.stringify(form.value);
    formError.value = '';
    restoredAt.value = null;
    // An unsaved draft for this item wins over the stored version
    const draft = readDraft(draftKey(values.id));
    if (draft) {
      form.value = { ...form.value, ...draft.values };
      restoredAt.value = formatDraftTime(draft.savedAt);
    }
  }

  // Throw the draft away and go back to the saved version
  function revertDraft() {
    if (!form.value) return;
    removeDraft(draftKey(form.value.id));
    form.value = JSON.parse(formSnapshot.value);
    restoredAt.value = null;
    refreshDrafts();
  }

  function resumeDraft(draft) {
    if (draft.id === null) return openCreate();
    const item = items.value.find((i) => i.id === draft.id);
    if (item) openEdit(item);
    else dropDraft(draft); // the item was deleted meanwhile
  }

  function dropDraft(draft) {
    removeDraft(draft.key);
    refreshDrafts();
  }

  function openCreate() {
    openForm({ ...defaults(), is_visible: true });
  }

  function openEdit(item) {
    const empty = defaults();
    const values = Object.fromEntries(fields.map((k) => [k, item[k] ?? empty[k] ?? '']));
    openForm({ ...values, id: item.id, is_visible: !!item.is_visible });
  }

  const isDirty = computed(() => !!form.value && JSON.stringify(form.value) !== formSnapshot.value);

  // Autosave while there are unsaved changes (debounced); no changes, no draft
  let draftTimer = null;
  watch(form, (value) => {
    clearTimeout(draftTimer);
    if (!value) return;
    draftTimer = setTimeout(() => {
      if (!form.value) return;
      if (isDirty.value) writeDraft(draftKey(form.value.id), form.value, draftLabel(form.value));
      else removeDraft(draftKey(form.value.id));
    }, 400);
  }, { deep: true });

  // Last line of defence: the browser asks before leaving with unsaved edits
  function beforeUnload(event) {
    if (!isDirty.value) return;
    if (form.value) writeDraft(draftKey(form.value.id), form.value, draftLabel(form.value));
    event.preventDefault();
    event.returnValue = '';
  }
  window.addEventListener('beforeunload', beforeUnload);
  onUnmounted(() => {
    clearTimeout(draftTimer);
    window.removeEventListener('beforeunload', beforeUnload);
  });

  // Closing never loses work: unsaved changes stay as a draft to resume later
  function requestClose() {
    if (isDirty.value && form.value) {
      writeDraft(draftKey(form.value.id), form.value, draftLabel(form.value));
      toast.success('Brouillon gardé : vous pourrez le reprendre');
    }
    closeForm();
  }

  function closeForm() {
    clearTimeout(draftTimer);
    form.value = null;
    refreshDrafts();
  }

  function discard() {
    confirmDiscard.value = false;
    removeDraft(draftKey(form.value?.id));
    closeForm();
  }

  async function submit() {
    const problem = validate(form.value);
    if (problem) {
      formError.value = problem;
      return;
    }
    saving.value = true;
    formError.value = '';
    try {
      const payload = clean(Object.fromEntries([...fields, 'is_visible'].map((k) => [k, form.value[k]])));
      if (form.value.id) {
        const updated = await api.patch(`${base}/${form.value.id}`, payload);
        const index = items.value.findIndex((i) => i.id === updated.id);
        if (index !== -1) items.value[index] = updated;
        toast.success(labels.saved);
      } else {
        const sortOrder = items.value.length ? Math.max(...items.value.map((i) => i.sort_order)) + 1 : 0;
        const created = await api.post(base, { ...payload, sort_order: sortOrder });
        items.value.push(created);
        toast.success(labels.created);
      }
      removeDraft(draftKey(form.value.id));
      closeForm();
    } catch (err) {
      formError.value = err.message;
    } finally {
      saving.value = false;
    }
  }

  // --- Inline list actions -------------------------------------------------

  async function toggleVisibility(item, value) {
    item.is_visible = value;
    item._saving = true;
    try {
      await api.patch(`${base}/${item.id}`, { is_visible: value });
      toast.success(value ? 'Affiché sur le site' : 'Masqué du site');
    } catch (err) {
      item.is_visible = !value;
      toast.error(err.message);
    } finally {
      item._saving = false;
    }
  }

  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.value.length) return;
    const reordered = [...items.value];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    items.value = reordered;

    // Renumber everything so duplicate sort_order values can't make a swap a
    // no-op, and only send the rows whose position actually changed.
    const changed = reordered.filter((item, i) => item.sort_order !== i);
    reordered.forEach((item, i) => { item.sort_order = i; });
    try {
      await Promise.all(changed.map((item) => api.patch(`${base}/${item.id}`, { sort_order: item.sort_order })));
    } catch (err) {
      toast.error(err.message);
      load();
    }
  }

  async function handleDelete() {
    const item = pendingDelete.value;
    pendingDelete.value = null;
    try {
      await api.del(`${base}/${item.id}`);
      items.value = items.value.filter((i) => i.id !== item.id);
      toast.success(labels.deleted);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return {
    items, loading, pendingDelete,
    form, formError, saving, confirmDiscard, isDirty,
    drafts, restoredAt, resumeDraft, dropDraft, revertDraft,
    load, openCreate, openEdit, requestClose, discard, submit,
    toggleVisibility, move, handleDelete
  };
}
