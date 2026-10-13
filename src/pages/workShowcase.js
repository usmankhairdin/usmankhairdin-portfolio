import { useLayoutEffect } from 'react'
import { useWebScroll } from '../scroll/WebScrollProvider.jsx'
import { surfacesFor, toneFor, disciplineFor, hostLabel, projectAsset } from '../data/projects.js'

/*
 * Work showcase — composition config and scroll motion.
 *
 * The project SET and every fact shown come from src/data/projects.js (untouched). This file only adds presentation:
 * which composition each project uses, and the fresh high-resolution captures prepared for the large format.
 */

// Fresh captures of the SAME live URLs: 1440x900 viewport, 1x and 2x, one capture system for the whole set.
export const showcaseImage = (project) => {
  const asset = (file) => projectAsset(project.slug, file)
  return {
    src: asset('showcase-1x.webp'),
    srcSet: `${asset('showcase-1x.webp')} 1440w, ${asset('showcase.webp')} 2880w`,
    fallback: project.media?.preview?.[0] || project.poster,
  }
}

// The project surfaces (solid, opaque, one per theme) live in the project data (surfaceLight / surfaceDark) and are shared with the
// project detail hero; this file only re-exports the helper.
export { surfacesFor, toneFor, disciplineFor, hostLabel }


const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// cubic-bezier easing (start responsive, long soft landing, no overshoot).
const bezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
  const sx = (t) => ((ax * t + bx) * t + cx) * t
  const sy = (t) => ((ay * t + by) * t + cy) * t
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x
      if (Math.abs(e) < 1e-5) break
      const d = dx(t)
      if (Math.abs(d) < 1e-6) break
      t -= e / d
    }
    return sy(t)
  }
}
const PANEL_EASE = bezier(0.7, 0, 0.18, 1)
const PANEL_SECONDS = 0.88       // one complete project change
const SETTLE_SECONDS = 0.45      // docking into the stage / re-aligning after a stray scroll
const UNDER_SHIFT = 0.22         // the outgoing panel travels this fraction of the stage width, underneath the incoming one

const GESTURE_GAP = 120          // ms without wheel events = the previous gesture (and its momentum) is over
const THRESHOLD = 30             // px of intentional wheel input needed to start a project change
const isEditable = (node) => node instanceof Element && !!node.closest('input,textarea,select,[contenteditable="true"],[data-lenis-prevent]')

/*
 * Pinned project exhibition with DISCRETE full-panel transitions.
 *
 *   .wk-pin    tall block in normal flow (its extra height is the docked zone: one stage-width of scroll per project)
 *   .wk-stage  position: sticky; top: 0; height: 100dvh — the pinned viewport
 *   .wk-track  holds the projects as opaque, full-stage panels stacked on top of each other (later = higher)
 *
 * Input model (desktop / precise pointer only):
 *   - Lenis brings the visitor down from the hero as usual. The moment the stage docks, the section takes over the wheel.
 *   - While docked, every wheel event is consumed here (in the capture phase, before Lenis) so the page never drifts. One
 *     intentional gesture = one project: input is accumulated against a threshold, the change starts, the lock holds until the
 *     panel has fully settled, and trackpad momentum from the same gesture is ignored until the input has reset (a gap in events,
 *     a change of direction, or a fresh spike in speed).
 *   - The change itself is ONE Lenis tween of the real document scroll between two exact positions. Panel transforms are derived
 *     from that scroll position, so the whole panel (never its parts) travels: the incoming project comes in from the right over
 *     the outgoing one, which slides a little to the left underneath; backwards is the exact reverse.
 *   - At the first/last project a further deliberate gesture in the outward direction is NOT consumed: Lenis simply continues the
 *     page scroll. Keys (Arrow/Page/Space) use the same transition.
 * Elsewhere (touch, narrow/short screens, reduced motion) none of this runs and the projects follow one another vertically.
 */
export function useShowcaseMotion(rootRef) {
  const controller = useWebScroll()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const pin = root.querySelector('.wk-pin')
    const stage = root.querySelector('.wk-stage')
    const panels = [...root.querySelectorAll('.wk-project')]
    const count = panels.length
    const last = count - 1
    const fit = window.matchMedia('(min-width: 1024px) and (min-height: 600px) and (hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    let on = false          // the pinned experience is in use at this viewport
    let owned = false       // the stage is docked and this hook owns project navigation
    let busy = false        // a project change is running
    let index = 0           // the one active project
    let canAcquire = true   // false right after handing the page back, until the visitor has really left the docked zone
    let wantIndex = -1      // a project that received keyboard focus while off-stage
    let armed = true        // fresh intentional input may start a change
    let accum = 0
    let avg = 0
    let lastDir = 0
    let lastWheel = 0
    let pinTop = 0
    let travel = 1
    let step = 1
    let width = 1
    let token = 0
    let focusFrame = 0

    const positionOf = (i) => pinTop + i * step
    const smooth = () => !!controller && controller.getSnapshot().status === 'smooth'
    const locked = () => document.documentElement.classList.contains('web-scroll-locked')

    const measure = () => {
      // Whole pixels everywhere: the document can only rest on integer scroll offsets, so every project position is an integer
      // and each panel lands on an exact transform (0 / stage width / the fixed underneath shift), never 0.4px off.
      pinTop = Math.ceil(pin.getBoundingClientRect().top + window.scrollY)
      travel = Math.max(1, pin.offsetHeight - stage.clientHeight)
      step = Math.max(1, Math.floor(travel / Math.max(1, last)))
      width = stage.clientWidth
    }

    // Panel transforms are a pure function of the document scroll position (whole panels only, transforms only).
    let shown = -1
    const edges = new Array(count).fill(-1)
    const render = () => {
      const x = clamp((window.scrollY - pinTop) / step, 0, last)
      for (let i = 0; i < count; i++) {
        const shift = i > x ? Math.min(i - x, 1) * width : -Math.min(x - i, 1) * width * UNDER_SHIFT
        panels[i].style.transform = `translate3d(${shift.toFixed(2)}px,0,0)`
        // The edge shadow belongs to the panel that is really entering (fading in as it arrives, out as it settles); any panel that is
        // parked off-stage or already covered has none, so shadows never accumulate at the viewport edge.
        const d = i - x
        const edge = d > 0 && d < 1 ? clamp(Math.min(d, 1 - d) * 4, 0, 1) : 0
        if (edge !== edges[i] && (edge === 0 || edge === 1 || Math.abs(edge - edges[i]) > 0.004)) { edges[i] = edge; panels[i].style.setProperty('--edge', edge.toFixed(3)) }
      }
      stage.style.setProperty('--wk-t', (x / Math.max(1, last)).toFixed(4))
      const current = Math.round(x)
      if (current !== shown) { shown = current; root.dataset.wkCurrent = String(current + 1) }
    }

    // One tween of the real scroll between two exact positions. Only one can run; nothing is queued.
    const tweenTo = (target, seconds, then) => {
      const mine = ++token
      busy = true
      const done = () => {
        if (mine !== token) return
        token += 1
        busy = false
        if (Math.abs(window.scrollY - target) > 0.5) window.scrollTo({ top: target, left: 0, behavior: 'auto' })
        render()
        then?.()
      }
      if (smooth()) {
        controller.scrollTo(target, { duration: seconds, easing: PANEL_EASE, lock: true, force: true, onComplete: done })
        window.setTimeout(done, seconds * 1000 + 160)      // safety net: the lock can never outlive its animation
      } else {
        window.scrollTo({ top: target, left: 0, behavior: 'auto' })
        done()
      }
    }

    const flushQueuedFocus = () => {
      const queued = wantIndex
      wantIndex = -1
      if (queued >= 0 && queued !== index) goTo(queued)
    }

    const goTo = (next) => {
      if (busy || next < 0 || next > last || next === index) return
      armed = false
      accum = 0
      index = next                                        // the state is decided up front; the tween lands exactly on it
      tweenTo(positionOf(next), PANEL_SECONDS, () => {
        armed = false
        accum = 0
        flushQueuedFocus()
      })
    }

    // While the stage owns the wheel the shared header stays visible (the project changes are programmatic scrolls; the header's
    // auto-hide must not read them as "reading down"). Removing the attribute restores the normal behaviour.
    const holdHeader = (on) => {
      if (on) document.documentElement.setAttribute('data-header-hold', '')
      else document.documentElement.removeAttribute('data-header-hold')
    }

    const acquire = (y) => {
      owned = true
      holdHeader(true)
      armed = false
      accum = 0
      // The nearest project: entering from either end lands on 01 / 06, a restored or jumped-to position lands where it points.
      if (wantIndex >= 0) index = wantIndex
      else index = clamp(Math.round((y - pinTop) / step), 0, last)
      wantIndex = -1
      if (Math.abs(y - positionOf(index)) > 1) tweenTo(positionOf(index), SETTLE_SECONDS, flushQueuedFocus)
      else flushQueuedFocus()
    }

    const release = () => {
      owned = false
      holdHeader(false)
      canAcquire = false
      accum = 0
    }

    const onScroll = () => {
      if (!on) return
      const y = window.scrollY
      render()
      const inZone = y >= pinTop - 2 && y <= pinTop + travel + 2
      if (!inZone) {
        if (owned && !busy) release()
        if (y < pinTop - 2 || y > pinTop + travel + 2) canAcquire = true
      } else if (!owned && canAcquire && !locked()) {
        acquire(y)
      } else if (owned && !busy && Math.abs(y - positionOf(index)) > 3) {
        // something else moved the page (e.g. native key scroll): re-align to the nearest project
        index = clamp(Math.round((y - pinTop) / step), 0, last)
        tweenTo(positionOf(index), SETTLE_SECONDS)
      }
    }

    const onWheel = (event) => {
      if (!on || !owned || event.ctrlKey || locked() || isEditable(event.target)) return
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
      const dy = event.deltaY * unit
      const dx = event.deltaX * unit
      if (dy === 0 || Math.abs(dx) > Math.abs(dy)) return
      const now = performance.now()
      const gap = now - lastWheel
      lastWheel = now
      const mag = Math.abs(dy)
      const dir = Math.sign(dy)
      const fresh = gap > GESTURE_GAP || dir !== lastDir || mag > avg * 1.6 + 10
      avg = gap > 200 ? mag : avg * 0.7 + mag * 0.3
      lastDir = dir

      // While docked the page must not drift: this input belongs to the project stage.
      const consume = () => { event.preventDefault(); event.stopImmediatePropagation() }
      if (busy) { consume(); return }
      if (fresh) { armed = true; accum = 0 }
      if (!armed) { consume(); return }                    // momentum from the previous gesture
      accum += mag
      if (accum < THRESHOLD) { consume(); return }

      armed = false
      accum = 0
      const outward = (dir > 0 && index === last) || (dir < 0 && index === 0)
      if (outward) { release(); return }                   // not consumed: Lenis carries on with the page
      consume()
      goTo(index + dir)
    }

    const onKeyDown = (event) => {
      if (!on || !owned || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || locked()) return
      const target = event.target
      if (isEditable(target)) return
      let dir = 0
      if (event.key === 'ArrowDown' || event.key === 'PageDown') dir = 1
      else if (event.key === 'ArrowUp' || event.key === 'PageUp') dir = -1
      else if ((event.key === ' ' || event.key === 'Spacebar') && !(target instanceof Element && target.closest('a,button,summary'))) dir = event.shiftKey ? -1 : 1
      if (!dir) return
      if ((dir > 0 && index === last) || (dir < 0 && index === 0)) { release(); return }   // native page navigation takes over
      event.preventDefault()
      if (!event.repeat) goTo(index + dir)
    }

    // Keyboard focus in another project brings that project on stage through the same transition (never a native sideways scroll).
    const onFocusIn = (event) => {
      if (!on) return
      const panel = event.target instanceof Element ? event.target.closest('.wk-project') : null
      const target = panel ? panels.indexOf(panel) : -1
      if (target < 0) return
      // The global smooth-scroll controller cancels any old glide on keyboard
      // focus. Start this panel handoff on the next frame, after that cleanup,
      // so the new transition is not mistaken for stale scrolling.
      if (focusFrame) cancelAnimationFrame(focusFrame)
      focusFrame = requestAnimationFrame(() => {
        focusFrame = 0
        if (!on) return
        if (!owned) {
          wantIndex = target
          if (!locked()) acquire(window.scrollY)
          return
        }
        if (busy) wantIndex = target
        else if (target !== index) goTo(target)
      })
    }

    const remeasure = () => {
      if (!on) return
      const y = window.scrollY
      measure()
      if (owned && !busy && Math.abs(y - positionOf(index)) > 1) window.scrollTo({ top: positionOf(index), left: 0, behavior: 'auto' })
      render()
    }

    const setMode = () => {
      const next = fit.matches && !reduced.matches
      if (next === on) { remeasure(); return }
      on = next
      token += 1
      busy = false
      owned = false
      holdHeader(false)
      canAcquire = true
      if (on) {
        root.dataset.wkMode = 'horizontal'
        measure()
        render()
        onScroll()
      } else {
        delete root.dataset.wkMode
        stage.style.removeProperty('--wk-t')
        panels.forEach((panel, i) => { panel.style.transform = ''; panel.style.removeProperty('--edge'); edges[i] = -1 })
      }
    }

    setMode()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('resize', remeasure)
    fit.addEventListener('change', setMode)
    reduced.addEventListener('change', setMode)
    root.addEventListener('focusin', onFocusIn)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remeasure)
    observer?.observe(root)
    return () => {
      on = false
      token += 1
      if (focusFrame) cancelAnimationFrame(focusFrame)
      focusFrame = 0
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('resize', remeasure)
      fit.removeEventListener('change', setMode)
      reduced.removeEventListener('change', setMode)
      root.removeEventListener('focusin', onFocusIn)
      observer?.disconnect()
      holdHeader(false)
      delete root.dataset.wkMode
    }
  }, [rootRef, controller])
}
