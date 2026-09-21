import { useEffect, useRef } from 'react'

// Tuned on the real pages: the header only leaves once the visitor has clearly committed to reading down, and it
// returns on a short deliberate upward move. Wheel / trackpad noise (a few px either way) never toggles it.
const HIDE_AFTER = 80    // px from the top of the page: nearer than this the header is always visible
const DOWN_INTENT = 10   // px of continuous downward travel (beyond HIDE_AFTER) before the header leaves
const UP_INTENT = 20     // px of continuous upward travel before it comes back

/**
 * Premium auto-hide for the frameless Web header.
 * Writes data-hidden straight onto the element (no React render per scroll event) and only ever touches the DOM when the
 * state actually changes. Works with Lenis because Lenis drives the real window scroll position.
 *
 *  - enabled: false leaves the header permanently visible (corridor HUD, splash)
 *  - paused: true (menu open) forces it visible and stable
 *  - <html data-header-hold> (set by a pinned stage that owns the wheel, e.g. Work's project stage) does the same for as long
 *    as the attribute is present; removing it restores the normal behaviour
 *  - keyboard focus moving into the header always reveals it
 */
export default function useHeaderAutoHide(ref, { enabled, paused }) {
  const pausedRef = useRef(paused)
  const forceShowRef = useRef(null)

  useEffect(() => {
    pausedRef.current = paused
    if (paused) forceShowRef.current?.()
  }, [paused])

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return undefined
    let last = window.scrollY
    let down = 0
    let up = 0
    let hidden = false

    const set = (value) => {
      if (hidden === value) return
      hidden = value
      el.dataset.hidden = value ? 'true' : 'false'
    }
    forceShowRef.current = () => { down = 0; up = 0; set(false) }

    const held = () => document.documentElement.hasAttribute('data-header-hold')
    const onScroll = () => {
      const y = window.scrollY
      const dy = y - last
      last = y
      if (pausedRef.current || held() || y <= HIDE_AFTER) { down = 0; up = 0; set(false); return }
      if (dy > 0) { up = 0; down += dy; if (down >= DOWN_INTENT) set(true) }
      else if (dy < 0) { down = 0; up -= dy; if (up >= UP_INTENT) set(false) }
    }
    const onFocusIn = () => forceShowRef.current?.()

    window.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('focusin', onFocusIn)
    const holdObserver = new MutationObserver(() => { if (held()) forceShowRef.current?.() })
    holdObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-header-hold'] })
    onScroll()
    return () => {
      holdObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      el.removeEventListener('focusin', onFocusIn)
      forceShowRef.current = null
      el.dataset.hidden = 'false'
    }
  }, [ref, enabled])
}
