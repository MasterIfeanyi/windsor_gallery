<script setup>
import { useId } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

defineProps({
  label: { type: String, required: true },
  // A list like [{ value: '123', label: 'Basquiat' }]
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select...' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const model = defineModel({ type: String, default: '' })

const id = useId()
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">{{ label }}</label>

    <div class="field__control">
      <select
        :id="id"
        v-model="model"
        class="field__input field__input--select"
        :class="{
          'field__input--error': error,
          'field__input--placeholder': !model,
        }"
        :required="required"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <FontAwesomeIcon class="field__icon" :icon="faChevronDown" aria-hidden="true" />
    </div>

    <p v-if="error" :id="`${id}-error`" class="field__error" role="alert">{{ error }}</p>
  </div>
</template>
