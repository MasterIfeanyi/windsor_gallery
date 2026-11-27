<script setup>
import { useId } from 'vue'

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  inputmode: { type: String, default: undefined },
  autocomplete: { type: String, default: 'off' },
  placeholder: { type: String, default: '' },
  maxlength: { type: Number, default: undefined },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
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
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :required="required"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
    />

    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>
