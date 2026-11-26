<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: 'off' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

// This is what makes v-model work on our own component
const model = defineModel({ type: String, default: '' })

// A unique id, so the label and the input are linked properly
const id = useId()
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">{{ label }}</label>

    <input
      :id="id"
      v-model="model"
      class="field__input"
      :class="{ 'field__input--error': error }"
      :type="type"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
    />

    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: var(--text-md);
  font-weight: 500;
}

.field__input {
  width: 100%;
  height: 3rem;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background-color: var(--color-bg);
  font: inherit;
  font-size: var(--text-md);
  color: var(--color-text);
  transition: border-color var(--transition);
}

.field__input:focus {
  outline: none;
  border-color: var(--color-text);
}

.field__input--error {
  border-color: #c0392b;
}

.field__error {
  font-size: var(--text-sm);
  color: #c0392b;
}
</style>
