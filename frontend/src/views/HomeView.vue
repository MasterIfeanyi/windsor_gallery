<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowDown } from '@fortawesome/free-solid-svg-icons'

const quote = {
  text: 'Art is the soul of mankind made visible.',
  author: 'Unknown',
}

// Temporary. Later this becomes the first artist from the database.
const FIRST_ARTIST_SLUG = 'basquiat'
</script>

<template>
  <main class="home">
    <img src="../assets/logo.png" alt="Site logo" class="home__logo" />

    <div class="home__middle">
      <figure class="quote">
        <blockquote>
          <p class="quote__text">{{ quote.text }}</p>
        </blockquote>
        <figcaption class="quote__author">- {{ quote.author }}</figcaption>
      </figure>
    </div>

    <RouterLink
      :to="{ name: 'artist', params: { slug: FIRST_ARTIST_SLUG } }"
      class="home__enter"
      aria-label="Enter the gallery"
    >
      <FontAwesomeIcon :icon="faArrowDown" />
    </RouterLink>
  </main>
</template>

<style scoped>
.home {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5) var(--space-3);
}

.home__logo {
  height: 4.5rem;
  width: auto;
}

/* Takes all the leftover height and centers the quote inside it */
.home__middle {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* fit-content makes the box only as wide as the text, so the
   author name can sit at the right edge of the quote */
.quote {
  width: fit-content;
  max-width: 40rem;
}

.quote__text {
  font-size: clamp(1.25rem, 1rem + 1.5vw, 1.875rem);
  font-weight: 400;
  line-height: 1.4;
}

.quote__author {
  margin-top: var(--space-2);
  text-align: right;
  font-size: var(--text-sm);
  font-weight: 600;
}

.home__enter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1.5px solid var(--color-text);
  border-radius: 50%;
  font-size: var(--text-md);
  color: var(--color-text);
  transition:
    transform var(--transition),
    background-color var(--transition),
    color var(--transition);
}

.home__enter:hover,
.home__enter:focus-visible {
  background-color: var(--color-text);
  color: var(--color-bg);
  transform: translateY(4px);
}

/* While the homepage fades away, take it out of the normal flow so the
   header appearing above it does not push it down */
.home.page-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .home__enter {
    transition: none;
  }
}
</style>
