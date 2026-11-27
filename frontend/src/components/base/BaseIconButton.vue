<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

defineProps({
  icon: { type: Object, required: true },
  // Icons have no text, so the label is what screen readers and tooltips use
  label: { type: String, required: true },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button :type="type" class="icon-btn" :aria-label="label" :title="label" :disabled="disabled">
    <FontAwesomeIcon :icon="icon" />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  border-radius: 50%;
  font-size: var(--text-sm);
  color: var(--color-text);
  transition:
    background-color var(--transition),
    opacity var(--transition);
}

.icon-btn:hover:not(:disabled),
.icon-btn:focus-visible {
  background-color: #f0f0f0;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Fingers need bigger targets than mouse pointers */
@media (pointer: coarse) {
  .icon-btn {
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>
