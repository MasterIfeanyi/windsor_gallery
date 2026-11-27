<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft, faChevronRight, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import { storeToRefs } from 'pinia'
import { useArtistsStore } from '../../stores/artists.js'

// How many artist names show at once on wide screens
const VISIBLE_COUNT = 4

// Screens at or above this width use the sliding row instead of the drawer
const DESKTOP_MIN_WIDTH = 768

const route = useRoute()

// True when the page we are on belongs to this artist (gallery or detail page)
const isActiveArtist = (slug) => route.params.slug === slug

// The artists now come from the server through our store
const artistsStore = useArtistsStore()
const { artists } = storeToRefs(artistsStore)

/* ---------- Wide screen: sliding row ---------- */
const startIndex = ref(0)

const canGoBack = computed(() => startIndex.value > 0)
const canGoForward = computed(() => startIndex.value + VISIBLE_COUNT < artists.value.length)

const goBack = () => {
  startIndex.value = Math.max(0, startIndex.value - VISIBLE_COUNT)
}

const goForward = () => {
  const lastStart = Math.max(0, artists.value.length - VISIBLE_COUNT)
  startIndex.value = Math.min(lastStart, startIndex.value + VISIBLE_COUNT)
}

const isInView = (index) => index >= startIndex.value && index < startIndex.value + VISIBLE_COUNT

/* ---------- Small screen: right-side drawer ---------- */
const isMenuOpen = ref(false)

const openMenu = () => {
  isMenuOpen.value = true
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Close the drawer whenever the page address changes (an artist was picked)
watch(() => route.fullPath, closeMenu)

// Freeze the page behind the drawer while it is open
watch(isMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

// Close with the Escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

// If the window grows to desktop size, close the drawer
const handleResize = () => {
  if (window.innerWidth >= DESKTOP_MIN_WIDTH) closeMenu()
}

onMounted(() => {
  artistsStore.loadArtists()
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink :to="{ name: 'home' }" class="header__logo-link" aria-label="Go to homepage">
        <img src="../../assets/logo.png" alt="Site logo" class="header__logo" />
      </RouterLink>

      <!-- Wide screens: sliding row with arrows -->
      <nav class="nav" aria-label="Artists">
        <button
          class="nav__arrow"
          type="button"
          aria-label="Previous artists"
          :disabled="!canGoBack"
          @click="goBack"
        >
          <FontAwesomeIcon :icon="faChevronLeft" />
        </button>

        <div class="nav__window" :style="{ '--visible-count': VISIBLE_COUNT }">
          <ul class="nav__track" :style="{ '--start-index': startIndex }">
            <li v-for="(artist, index) in artists" :key="artist.slug" class="nav__slot">
              <RouterLink
                :to="{ name: 'artist', params: { slug: artist.slug } }"
                class="nav__item"
                :class="{ 'nav__item--active': isActiveArtist(artist.slug) }"
                :tabindex="isInView(index) ? 0 : -1"
              >
                {{ artist.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <button
          class="nav__arrow"
          type="button"
          aria-label="Next artists"
          :disabled="!canGoForward"
          @click="goForward"
        >
          <FontAwesomeIcon :icon="faChevronRight" />
        </button>
      </nav>

      <!-- Small screens: hamburger button and right-side drawer -->
      <div class="mobile-menu">
        <button
          class="mobile-menu__toggle"
          type="button"
          aria-label="Open artist menu"
          aria-controls="mobile-menu-panel"
          :aria-expanded="isMenuOpen"
          @click="openMenu"
        >
          <FontAwesomeIcon :icon="faBars" />
        </button>

        <!-- The dark layer behind the drawer -->
        <Transition name="fade">
          <div v-if="isMenuOpen" class="drawer-backdrop" @click="closeMenu"></div>
        </Transition>

        <!-- The drawer itself -->
        <Transition name="slide">
          <aside
            v-if="isMenuOpen"
            id="mobile-menu-panel"
            class="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Artist menu"
          >
            <div class="drawer__top">
              <p class="drawer__title">Artists</p>
              <button
                class="drawer__close"
                type="button"
                aria-label="Close artist menu"
                @click="closeMenu"
              >
                <FontAwesomeIcon :icon="faXmark" />
              </button>
            </div>

            <ul class="drawer__list">
              <li v-for="artist in artists" :key="artist.slug">
                <RouterLink
                  :to="{ name: 'artist', params: { slug: artist.slug } }"
                  class="drawer__link"
                  active-class="drawer__link--active"
                  :class="{ 'drawer__link--active': isActiveArtist(artist.slug) }"
                >
                  {{ artist.name }}
                </RouterLink>
              </li>
            </ul>
          </aside>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: var(--space-4) var(--space-3);
}

.header__inner {
  max-width: var(--container-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.header__logo {
  height: 48px;
  width: auto;
}

.header__logo-link {
  display: flex;
  align-items: center;
  justify-self: start;
  width: fit-content;
}

/* ---------- Wide screen nav ---------- */
.nav {
  --nav-item-width: 7rem;
  --nav-height: 2.5rem;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav__window {
  width: calc(var(--nav-item-width) * var(--visible-count));
  height: 100%;
  overflow: hidden;
}

.nav__track {
  height: 100%;
  display: flex;
  align-items: center;
  list-style: none;
  transform: translateX(calc(var(--start-index) * var(--nav-item-width) * -1));
  transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}

.nav__slot {
  flex: 0 0 var(--nav-item-width);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;
}

.nav__item,
.nav__arrow {
  color: var(--color-text-muted);
  transition: color var(--transition);
}

.nav__item {
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  padding: var(--space-2);
}

.nav__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: none;
  border: none;
  font-size: var(--text-xs);
  line-height: 1;
  padding: 0 var(--space-1);
}

.nav__item:hover,
.nav__item--active,
.nav__arrow:not(:disabled):hover {
  color: var(--color-text);
}

.nav__arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ---------- Small screen menu (hidden on wide screens) ---------- */
.mobile-menu {
  display: none;
  justify-self: end;
}

.mobile-menu__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: none;
  border: none;
  font-size: var(--text-lg);
  color: var(--color-text);
}

/* The dark layer that covers the page behind the drawer */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background-color: rgba(0, 0, 0, 0.4);
}

/* The panel that slides in from the right */
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  width: min(20rem, 85vw);
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.15);
}

.drawer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.drawer__title {
  font-size: var(--text-md);
  font-weight: 600;
}

.drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  background: none;
  border: none;
  font-size: var(--text-lg);
  color: var(--color-text);
}

/* The list takes the leftover height and scrolls inside itself */
.drawer__list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
  list-style: none;
}

.drawer__link {
  display: block;
  padding: 0.875rem var(--space-3);
  border-radius: 8px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  transition:
    color var(--transition),
    background-color var(--transition);
}

.drawer__link:hover,
.drawer__link--active {
  color: var(--color-text);
  background-color: #f5f5f5;
}

/* Backdrop fades in and out */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Drawer slides in from the right and back out */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* ---------- Breakpoint: phones and small tablets ---------- */
/* Note: CSS variables cannot be used inside media queries, so 767px is typed here. */
@media (max-width: 767px) {
  .header__inner {
    display: flex;
    justify-content: space-between;
  }

  .nav {
    display: none;
  }

  .mobile-menu {
    display: block;
  }
}

/* Respect people who turn off animations on their device */
@media (prefers-reduced-motion: reduce) {
  .nav__track,
  .fade-enter-active,
  .fade-leave-active,
  .slide-enter-active,
  .slide-leave-active {
    transition: none;
  }
}
</style>
