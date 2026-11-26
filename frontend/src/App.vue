<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TheHeader from './components/layout/TheHeader.vue'

const route = useRoute()

// Pages can switch the header off by setting meta: { hideHeader: true }
const showHeader = computed(() => !route.meta.hideHeader)
</script>

<template>
  <Transition name="header-fade">
    <TheHeader v-if="showHeader" />
  </Transition>

  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style scoped>
/* Page change: fade and drift. The old page leaves first, then the new one arrives */
.page-enter-active,
.page-leave-active {
  transition:
    opacity var(--page-duration) ease,
    transform var(--page-duration) ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(24px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}

/* Header: when arriving, wait for the old page to finish leaving, then fade in */
.header-fade-enter-active {
  transition: opacity var(--page-duration) ease var(--page-duration);
}

.header-fade-leave-active {
  transition: opacity var(--page-duration) ease;
}

.header-fade-enter-from,
.header-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .header-fade-enter-active,
  .header-fade-leave-active {
    transition: none;
  }
}
</style>
