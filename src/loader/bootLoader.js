/*
 * Hand-off for the branded boot loader.
 *
 * The loader itself is static markup + critical CSS in index.html, so it paints on the very first frame in the correct
 * theme (no React, no bundle needed). This module is the only React-side contact point: the homepage calls
 * releaseBootLoader() once its scene is ready, and the loader recedes. It is idempotent and a no-op on every visit where
 * the loader is not showing (deep links to other routes).
 *
 * The full sequence is never cut short: the loader stays until its own choreography has had time to complete, and if the
 * app is slower it simply holds in its settled state.
 */
const MIN_VISIBLE = 2000     // ms after the logo starts revealing: the mark, the accent sweep and all three lines are in by then
const MIN_VISIBLE_REDUCED = 520
const LEAVE_MS = 660         // recede duration (CSS transition is .58s)
const HERO_GO_MS = 140       // the homepage reveal resumes this long after the recede begins

let requested = false

export function claimBootLoader() {
  window.__ukdBootManaged = true
  return () => { window.__ukdBootManaged = false }
}

export function releaseBootLoader() {
  const root = document.documentElement
  if (requested || root.getAttribute('data-boot') !== 'on') return
  requested = true

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const startedAt = typeof window.__ukdBootPlayAt === 'number' ? window.__ukdBootPlayAt : performance.now()
  const wait = Math.max(0, (reduced ? MIN_VISIBLE_REDUCED : MIN_VISIBLE) - (performance.now() - startedAt))

  window.setTimeout(() => {
    // "leaving" fades the loader; a beat later the held homepage reveal resumes: a cross-dissolve, not a cut.
    root.setAttribute('data-boot', 'leaving')
    window.setTimeout(() => root.setAttribute('data-hero-go', ''), HERO_GO_MS)
    window.setTimeout(() => {
      document.getElementById('boot')?.remove()
      root.removeAttribute('data-hero-go')
      root.setAttribute('data-boot', 'off')
    }, LEAVE_MS)
  }, wait)
}
