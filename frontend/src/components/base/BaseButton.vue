<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'outline', 'danger'].includes(value),
  },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--loading': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2.5rem;
  border: 1.5px solid var(--color-text);
  border-radius: 999px;
  font-size: var(--text-sm);
  font-weight: 500;
  transition:
    background-color var(--transition),
    color var(--transition),
    opacity var(--transition);
}

.btn--primary {
  background-color: var(--color-text);
  color: var(--color-bg);
}

.btn--primary:hover:not(:disabled) {
  opacity: 0.85;
}

.btn--outline {
  background-color: transparent;
  color: var(--color-text);
}

.btn--outline:hover:not(:disabled) {
  background-color: var(--color-text);
  color: var(--color-bg);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--loading {
  cursor: progress;
}

.btn--danger {
  background-color: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-bg);
}

.btn--danger:hover:not(:disabled) {
  opacity: 0.85;
}
</style>
