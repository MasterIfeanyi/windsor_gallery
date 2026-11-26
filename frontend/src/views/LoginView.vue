<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

// Only follow redirects that stay inside our own site
const getSafeRedirect = () => {
  const target = route.query.redirect
  const isInternal =
    typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
  return isInternal ? target : { name: 'admin' }
}

const submit = async () => {
  if (isSubmitting.value) return

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push(getSafeRedirect())
  } catch (err) {
    errorMessage.value = err.response
      ? err.response.data?.message || 'Could not log in. Please try again.'
      : 'Could not reach the server. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="login">
    <img src="../assets/logo.png" alt="Site logo" class="login__logo" />

    <form class="login__form" @submit.prevent="submit">
      <h1 class="login__title">Admin login</h1>

      <BaseInput v-model="email" label="Email:" type="email" autocomplete="username" required />

      <BaseInput
        v-model="password"
        label="Password:"
        type="password"
        autocomplete="current-password"
        required
      />

      <p v-if="errorMessage" class="login__error" role="alert">{{ errorMessage }}</p>

      <BaseButton type="submit" class="login__submit" :loading="isSubmitting">
        {{ isSubmitting ? 'Logging in...' : 'Log in' }}
      </BaseButton>
    </form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5) var(--space-3);
}

.login__logo {
  height: 4.5rem;
  width: auto;
}

/* Takes the leftover height and centers the form in it */
.login__form {
  flex: 1;
  width: 100%;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-4);
}

.login__title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.login__error {
  font-size: var(--text-sm);
  color: #c0392b;
}

.login__submit {
  width: 100%;
}
</style>
