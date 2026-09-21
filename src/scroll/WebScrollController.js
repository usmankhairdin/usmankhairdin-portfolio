import Lenis from 'lenis'

/*
 * WebScrollController — the single owner of smooth scrolling for the standalone Web Experience.
 *
 * ONE controller, ONE Lenis instance at a time, ONE requestAnimationFrame loop, ONE lifecycle.
 * Lenis drives the REAL document scroll (window.scrollTo), so position: sticky, anchors, forms
 * and browser history keep working; nothing is translated or faked.
 *
 * Status
 *   'smooth' — desktop pointer, motion allowed: Lenis is running.
 *   'native' — desktop pointer, prefers-reduced-motion: native scrolling, no inertia.
 *   'off'    — touch-first devices (native momentum is kept) OR suspended by an immersive surface.
 *
 * The corridor claims exclusive wheel control by suspending this controller. Suspension DESTROYS the
 * Lenis instance (removing its window wheel/touch listeners) rather than merely pausing it, so the
 * two input systems can never consume the same event. Resuming builds a fresh instance from the
 * live document scroll position.
 */

// Medium-weight premium feel. lerp is frame-rate independent in Lenis (damped per second), so this is
// ~0.4s to settle 95% of a wheel travel: clearly smoother than native, yet the page stays under the hand.
const LENIS_OPTIONS = {
  autoRaf: false,          // this controller owns the single rAF loop
  lerp: 0.13,
  wheelMultiplier: 1,
  smoothWheel: true,
  syncTouch: false,        // touch keeps native momentum
  allowNestedScroll: true, // textareas, selects and inner scrollers keep native wheel behaviour
  anchors: false,          // same-page anchors are handled below so focus and history stay correct
  autoResize: true,
}

// Time-based ease for programmatic travel (anchors, scrollbar track clicks): quick start, soft landing.
const PROGRAMMATIC = { duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 4) }

const SCROLL_KEYS = new Set(['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'])

const isEditable = (node) => {
  if (!(node instanceof HTMLElement)) return false
  return node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName)
}

export default class WebScrollController {
  constructor() {
    this.lenis = null
    this.raf = 0
    this.mounted = false
    this.suspensions = new Set()
    this.locks = 0
    this.listeners = new Set()
    this.snapshot = { status: 'off', suspended: false }

    this.reducedMotion = null
    this.finePointer = null

    this.subscribe = this.subscribe.bind(this)
    this.getSnapshot = this.getSnapshot.bind(this)
    this.sync = this.sync.bind(this)
  }

  /* ---- external store (useSyncExternalStore) ---- */
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot() {
    return this.snapshot
  }

  /* ---- lifecycle ---- */
  mount() {
    if (this.mounted || typeof window === 'undefined') return
    this.mounted = true
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    this.reducedMotion.addEventListener('change', this.sync)
    this.finePointer.addEventListener('change', this.sync)
    document.addEventListener('click', this.onClick)
    window.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('focusin', this.onFocusIn)
    this.sync()
  }

  unmount() {
    if (!this.mounted) return
    this.mounted = false
    this.locks = 0
    document.documentElement.classList.remove('web-scroll-locked')
    this.reducedMotion?.removeEventListener('change', this.sync)
    this.finePointer?.removeEventListener('change', this.sync)
    document.removeEventListener('click', this.onClick)
    window.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('focusin', this.onFocusIn)
    this.sync()
  }

  /**
   * Suspend the Web scroll system (e.g. while the corridor owns the wheel). Returns a release function.
   * Synchronous: when this returns, Lenis and its listeners are already gone.
   */
  suspend(reason = 'immersive') {
    const token = { reason }
    this.suspensions.add(token)
    this.sync()
    return () => {
      if (!this.suspensions.delete(token)) return
      this.sync()
    }
  }

  sync() {
    const suspended = this.suspensions.size > 0
    let status = 'off'
    if (this.mounted && !suspended && this.finePointer?.matches) {
      status = this.reducedMotion?.matches ? 'native' : 'smooth'
    }

    if (status === 'smooth') this.startLenis()
    else this.stopLenis()

    const root = document.documentElement
    if (status === 'off') {
      root.classList.remove('web-scroll')
      root.removeAttribute('data-web-scroll')
    } else {
      root.classList.add('web-scroll')
      root.setAttribute('data-web-scroll', status)
    }

    if (status !== this.snapshot.status || suspended !== this.snapshot.suspended) {
      this.snapshot = { status, suspended }
      this.listeners.forEach((listener) => listener())
    }
  }

  startLenis() {
    if (this.lenis) return
    const lenis = new Lenis(LENIS_OPTIONS)
    if (this.locks > 0) lenis.stop()
    this.lenis = lenis
    const loop = (time) => {
      lenis.raf(time)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stopLenis() {
    if (!this.lenis) return
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.lenis.destroy()
    this.lenis = null
  }

  /**
   * Hold the page still while an overlay (the menu drawer) is open: Lenis stops swallowing wheel input and the document
   * cannot scroll behind it. Counted, so overlapping holds are safe; returns a release function. Nothing is torn down:
   * the single Lenis instance keeps its position and simply resumes on release.
   */
  lock() {
    this.locks += 1
    if (this.locks === 1) {
      document.documentElement.classList.add('web-scroll-locked')
      this.lenis?.stop()
    }
    let released = false
    return () => {
      if (released) return
      released = true
      this.unlock()
    }
  }

  unlock() {
    if (this.locks === 0) return
    this.locks -= 1
    if (this.locks === 0) {
      document.documentElement.classList.remove('web-scroll-locked')
      this.lenis?.start()
    }
  }

  /* ---- programmatic scrolling ---- */

  /** Scroll to a pixel offset, element or selector. Uses Lenis when active, the native scroller otherwise. */
  scrollTo(target, { immediate = false, ...options } = {}) {
    if (this.lenis) {
      this.lenis.scrollTo(target, immediate ? { immediate: true, force: true } : { ...PROGRAMMATIC, ...options })
      return
    }
    const top = typeof target === 'number'
      ? target
      : (() => {
          const node = typeof target === 'string' ? document.querySelector(target) : target
          return node ? node.getBoundingClientRect().top + window.scrollY : window.scrollY
        })()
    window.scrollTo({ top, left: 0, behavior: 'auto' })
  }

  /** New route: start at the top without a visible animation and without leaving Lenis mid-flight. */
  resetToTop() {
    this.scrollTo(0, { immediate: true })
  }

  /** Back/forward: the browser owns the position — realign Lenis to it and drop any in-flight glide. */
  syncPosition() {
    this.lenis?.reset()
  }

  /* ---- interaction glue ---- */

  // Same-page #anchors glide through Lenis instead of jumping. Focus and history behave like a native anchor.
  onClick = (event) => {
    if (!this.lenis || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null
    if (!link || link.target || link.hasAttribute('download')) return
    const hash = link.getAttribute('href')
    if (!hash || hash.length < 2) return
    let id
    try { id = decodeURIComponent(hash.slice(1)) } catch { return }
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    this.lenis.scrollTo(target, PROGRAMMATIC)
    if (window.location.hash !== hash) window.history.pushState(window.history.state, '', hash)
    if (target.tabIndex >= 0) target.focus({ preventScroll: true })
  }

  // Native keyboard scrolling (Page Up/Down, Home/End, arrows, Space) and keyboard focus movement are left
  // untouched. If a wheel glide is still in flight, drop it first so it cannot fight the native jump.
  onKeyDown = (event) => {
    if (!this.lenis || !this.lenis.isScrolling) return
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
    if (!SCROLL_KEYS.has(event.key) || isEditable(event.target)) return
    this.lenis.reset()
  }

  onFocusIn = (event) => {
    if (!this.lenis || this.lenis.isScrolling !== 'smooth') return
    if (event.target instanceof Element && event.target.matches(':focus-visible')) this.lenis.reset()
  }
}
