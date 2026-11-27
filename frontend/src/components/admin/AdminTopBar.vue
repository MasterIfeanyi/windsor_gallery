<script setup>
import { RouterLink } from 'vue-router'
import AdminLinks from './AdminLinks.vue'
</script>

<template>
  <div class="top">
    <RouterLink :to="{ name: 'home' }" class="top__logo-link" aria-label="Go to homepage">
      <img src="../../assets/logo.png" alt="Site logo" class="top__logo" />
    </RouterLink>

    <AdminLinks />
  </div>
</template>

<style scoped>
.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.top__logo-link {
  display: flex;
  flex-shrink: 0;
  width: fit-content;
}

.top__logo {
  height: 4.5rem;
  width: auto;
}
</style>
