import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { hideHeader: true },
    },
    {
      path: '/artist/:slug',
      name: 'artist',
      component: () => import('../views/ArtistView.vue'),
    },
  ],
})

export default router
