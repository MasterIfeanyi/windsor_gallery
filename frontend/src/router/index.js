import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

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
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/LoginView.vue'),
      meta: { hideHeader: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { hideHeader: true, requiresAuth: true },
    },
    {
      path: '/admin/artworks/:slug',
      name: 'admin-artworks',
      component: () => import('../views/AdminArtworksView.vue'),
      // No hideHeader, so the artist names show. adminNav makes them stay on this page.
      meta: { requiresAuth: true, adminNav: true },
    },
    {
      path: '/artist/:slug/:id',
      name: 'artwork',
      component: () => import('../views/ArtworkDetailView.vue'),
    },
    {
      path: '/admin/artists/new',
      name: 'admin-artist-new',
      component: () => import('../views/AdminArtistView.vue'),
      meta: { hideHeader: true, requiresAuth: true },
    },
  ],
})

// Runs before every page change
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Protected pages: no login, no entry
  if (to.meta.requiresAuth) {
    await authStore.checkSession()
    if (!authStore.isLoggedIn) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
  }

  // Already logged in? There is no reason to see the login page again
  if (to.name === 'admin-login') {
    await authStore.checkSession()
    if (authStore.isLoggedIn) return { name: 'admin' }
  }
})

export default router
