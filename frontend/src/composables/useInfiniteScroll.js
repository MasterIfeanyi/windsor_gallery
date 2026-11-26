import { watch, onBeforeUnmount } from 'vue'

// Calls onReach() whenever the target element gets close to the screen.
// "target" is a template ref pointing at the invisible marker.
export const useInfiniteScroll = (target, onReach, { rootMargin = '400px' } = {}) => {
  let observer = null

  const stop = () => {
    observer?.disconnect()
    observer = null
  }

  // Starting fresh makes the browser check straight away. That matters on tall
  // screens, where the marker can still be visible after a page has loaded.
  const start = () => {
    stop()
    if (!target.value) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onReach()
      },
      { rootMargin },
    )
    observer.observe(target.value)
  }

  // Start when the marker appears on the page, stop when it disappears
  watch(target, (element) => (element ? start() : stop()), { flush: 'post' })

  onBeforeUnmount(stop)

  return { restart: start }
}
