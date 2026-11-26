<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <main class="admin">
    <h1>Admin area</h1>
    <p>Logged in as {{ authStore.admin?.email }}</p>
    <p>The upload form arrives in the next step.</p>

    <BaseButton variant="outline" @click="logout">Log out</BaseButton>
  </main>
</template>

<style scoped>
.admin {
  max-width: 40rem;
  margin: 0 auto;
  padding: var(--space-6) var(--space-3);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
}
</style>
