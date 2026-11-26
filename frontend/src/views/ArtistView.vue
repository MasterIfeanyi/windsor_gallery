<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const slug = computed(() => route.params.slug)
</script>

<template>
  <main>
    <h1>Artworks for: {{ slug }}</h1>
  </main>
</template>
