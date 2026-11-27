<script setup>
import { ref, watch, nextTick, onBeforeUnmount, useId } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['confirm', 'cancel'])

const dialogRef = ref(null)
const titleId = useId()

// Open or close the real dialog whenever the "open" value changes
watch(
  () => props.open,
  async (isOpen) => {
    await nextTick()
    const dialog = dialogRef.value
    if (!dialog) return

    if (isOpen && !dialog.open) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (!isOpen && dialog.open) {
      dialog.close()
      document.body.style.overflow = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

// Cancelling is not allowed while the action is running
const requestCancel = () => {
  if (!props.loading) emit('cancel')
}

// If the browser closes the dialog by itself, tell the parent
const onClose = () => {
  if (props.open) requestCancel()
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="modal"
    :aria-labelledby="titleId"
    @cancel.prevent="requestCancel"
    @close="onClose"
    @click.self="requestCancel"
  >
    <div class="modal__body">
      <h2 :id="titleId" class="modal__title">{{ title }}</h2>
      <p v-if="message" class="modal__message">{{ message }}</p>
      <p v-if="error" class="modal__error" role="alert">{{ error }}</p>

      <div class="modal__actions">
        <BaseButton variant="outline" :disabled="loading" @click="requestCancel">
          {{ cancelLabel }}
        </BaseButton>
        <BaseButton
          :variant="danger ? 'danger' : 'primary'"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* Our global reset removes the browser's automatic centering, so we add it back */
.modal {
  margin: auto;
  width: min(26rem, calc(100vw - 2rem));
  padding: 0;
  border: none;
  border-radius: 20px;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.modal::backdrop {
  background-color: rgba(0, 0, 0, 0.45);
}

.modal[open] {
  animation: modal-in 0.2s ease;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.modal__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
}

.modal__title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.modal__message {
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

.modal__error {
  font-size: var(--text-sm);
  color: var(--color-error);
}

.modal__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

@media (prefers-reduced-motion: reduce) {
  .modal[open] {
    animation: none;
  }
}
</style>
