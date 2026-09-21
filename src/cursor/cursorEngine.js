import { resolveTarget, DOOR_HOVER } from './cursorTargets.js'

/*
 * Living Magnetic Cursor engine — framework-free, ONE pointer lifecycle, ONE requestAnimationFrame loop.
 *
 * - The centre dot follows the pointer almost 1:1 (tiny inertia); the outer ring trails it with restrained inertia.
 * - Over an interactive element the ring is drawn a little toward the element's centre (capped, so the pointer stays yours),
 *   expands, and shows a stable contextual label in a layer of its own.
 * - While the pointer moves over an expanded ring it stretches very slightly along the motion; once it has been still for a
 *   moment the ring's edge starts a slow organic breathing (a controlled closed spline, ~3px at most, 3–4.5s cycles).
 * - Everything is written straight to element styles; React is never involved per frame. The loop sleeps whenever the cursor
 *   has settled (the breathing is the only thing that keeps it running).
 * - The corridor gets the same engine in a simplified 'immersive' mode: small dot + ring, no labels, no fills, no breathing.
 */

const R = 48                      // ring radius in its 100x100 viewBox
const N = 10                      // control points of the organic edge
const TAU = Math.PI * 2
const STILL_MS = 320              // pointer has to rest this long before the edge starts to breathe

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const damp = (dt, tau) => 1 - Math.exp(-dt / tau)

const CIRCLE = (() => {
  const k = 0.5522847498 * R
  return `M ${R} 0 C ${R} ${k} ${k} ${R} 0 ${R} C ${-k} ${R} ${-R} ${k} ${-R} 0 C ${-R} ${-k} ${-k} ${-R} 0 ${-R} C ${k} ${-R} ${R} ${-k} ${R} 0 Z`
})()

// Closed Catmull-Rom spline through N points. The radius breathes by at most `amp` (viewBox units) using three LOW angular
// harmonics (2, 3, 1) drifting at slow, incommensurate speeds (~3.3s / 4.5s / 2.7s): the outline moves like a soft ellipse that
// gently changes its mind — "circle → slight asymmetry → another variation → calm return" — never lumpy, never random.
function blob(amp, t) {
  const p = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU
    const w = 0.55 * Math.sin(2 * a + t * 1.9) + 0.3 * Math.sin(3 * a - t * 1.4 + 1.1) + 0.15 * Math.sin(a + t * 2.35 + 0.4)
    const r = R + amp * w
    p.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  let d = `M ${p[0][0].toFixed(2)} ${p[0][1].toFixed(2)}`
  for (let i = 0; i < N; i++) {
    const p0 = p[(i - 1 + N) % N], p1 = p[i], p2 = p[(i + 1) % N], p3 = p[(i + 2) % N]
    d += ` C ${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d + ' Z'
}

export function createCursor(root) {
  const ring = root.querySelector('.ukd-cursor__ring')
  const svg = root.querySelector('.ukd-cursor__svg')
  const path = root.querySelector('.ukd-cursor__path')
  const label = root.querySelector('.ukd-cursor__label')
  const dot = root.querySelector('.ukd-cursor__dot')
  const html = document.documentElement
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  let enabled = finePointer.matches
  let reduced = reducedQuery.matches
  let mode = 'web'

  // pointer
  let px = 0, py = 0, seen = false, lastMove = 0, vx = 0, vy = 0, pressed = false
  // rendered state
  let rx = 0, ry = 0, dx = 0, dy = 0, size = 30, labelAmt = 0, fillAmt = 0, dotScale = 1, stretch = 0, angle = 0, press = 1
  let organic = 0, morphT = 0, blobOn = false, visible = false
  // target under the pointer
  let hoverEl = null, cfg = resolveTarget(null, mode), rect = null, rectStamp = 0, rectDirty = true
  let raf = 0, tPrev = 0, scrollPending = false

  const setVisible = (v) => {
    if (v === visible) return
    visible = v
    root.classList.toggle('is-visible', v)
  }

  const apply = (element) => {
    hoverEl = element
    cfg = resolveTarget(element, mode)
    rect = null
    rectDirty = true
    root.dataset.tone = cfg.tone
    root.dataset.state = cfg.label ? 'label' : cfg.interactive ? 'hover' : 'idle'
    if (cfg.label) label.textContent = cfg.label
    if (seen) setVisible(cfg.kind !== 'native' && enabled)
    kick()
  }

  const kick = () => { if (!raf && enabled && seen) { tPrev = performance.now(); raf = requestAnimationFrame(tick) } }

  function tick(now) {
    raf = 0
    const dt = clamp((now - tPrev) / 1000, 0.001, 0.05)
    tPrev = now

    // The corridor already flags "a door is under the pointer" through the body cursor; the presentation follows it.
    const c = mode === 'immersive' && cfg.kind === 'idle' && document.body.style.cursor === 'pointer' ? DOOR_HOVER : cfg
    const base = mode === 'immersive' ? 24 : 30

    // ---- magnetic pull toward the element's visual centre (rect is cached and only re-read after scroll/resize) ----
    let mx = 0, my = 0
    if (c.magnet && c.element && c.element.isConnected) {
      // an element that moves on its own (a draggable token: data-cursor-live) is re-read, throttled; everything else only after scroll/resize
      if (!rect || ((rectDirty || c.element.hasAttribute('data-cursor-live')) && now - rectStamp > 90)) { rect = c.element.getBoundingClientRect(); rectDirty = false; rectStamp = now }
      const ex = rect.left + rect.width / 2 - px
      const ey = rect.top + rect.height / 2 - py
      const dist = Math.hypot(ex, ey)
      const ramp = clamp((size - base) / Math.max(1, c.size - base), 0, 1)   // attraction grows with the expansion
      if (dist > 0.001) {
        const pull = Math.min(c.magnet.max, dist * c.magnet.k) * ramp
        mx = (ex / dist) * pull
        my = (ey / dist) * pull
      }
    } else if (c.element && !c.element.isConnected) {
      apply(document.elementFromPoint(px, py))
    }

    // ---- motion ----
    const ringTau = reduced ? 0.045 : c.interactive ? 0.105 : 0.085
    rx += (px + mx - rx) * damp(dt, ringTau)
    ry += (py + my - ry) * damp(dt, ringTau)
    dx += (px + mx * 0.22 - dx) * damp(dt, 0.018)
    dy += (py + my * 0.22 - dy) * damp(dt, 0.018)

    const decay = Math.exp(-dt / 0.09)
    vx *= decay; vy *= decay
    const speed = Math.hypot(vx, vy)
    if (speed > 30) angle = Math.atan2(vy, vx)
    const stretchTarget = reduced || mode === 'immersive' ? 0 : c.interactive ? clamp(speed / 1900, 0, 0.13) : clamp(speed / 4500, 0, 0.04)
    stretch += (stretchTarget - stretch) * damp(dt, 0.07)

    const targetSize = c.kind === 'native' ? base : (c.size || base)
    size += (targetSize - size) * damp(dt, reduced ? 0.05 : 0.11)
    const pressTarget = pressed ? 0.9 : 1
    press += (pressTarget - press) * damp(dt, 0.05)

    const labelTarget = c.label && size >= targetSize * 0.82 ? 1 : 0
    labelAmt += (labelTarget - labelAmt) * damp(dt, 0.1)
    fillAmt += (c.fill - fillAmt) * damp(dt, 0.12)
    const dotTarget = c.label ? 0 : c.interactive ? 0.7 : 1
    dotScale += (dotTarget - dotScale) * damp(dt, 0.09)

    // ---- organic edge: only over an expanded, important element, only after the pointer has rested ----
    const still = now - lastMove > STILL_MS
    const canBreathe = !reduced && mode === 'web' && c.interactive && c.size >= 44 && visible
    const breathe = canBreathe && still
    organic += ((breathe ? 1 : 0) - organic) * damp(dt, breathe ? 0.7 : 0.22)
    morphT += dt

    // ---- paint ----
    const scale = (size / (R * 2)) * press
    ring.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0)`
    const co = Math.cos(angle), si = Math.sin(angle), sx = 1 + stretch, sy = 1 - stretch * 0.55
    const m11 = (co * co * sx + si * si * sy) * scale
    const m12 = co * si * (sx - sy) * scale
    const m22 = (si * si * sx + co * co * sy) * scale
    svg.style.transform = `matrix(${m11.toFixed(4)},${m12.toFixed(4)},${m12.toFixed(4)},${m22.toFixed(4)},0,0)`
    if (organic > 0.004) {
      const ampPx = organic * (c.size >= 60 ? 3 : 2.2)
      path.setAttribute('d', blob(ampPx / Math.max(0.05, scale), morphT))
      blobOn = true
    } else if (blobOn) {
      path.setAttribute('d', CIRCLE)
      blobOn = false
    }
    path.style.fillOpacity = fillAmt.toFixed(3)
    if (!c.label && labelAmt < 0.03 && label.textContent) label.textContent = ''
    label.style.opacity = labelAmt.toFixed(3)
    label.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0) translate(-50%,-50%) scale(${(0.9 + 0.1 * labelAmt).toFixed(3)})`
    dot.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${dotScale.toFixed(3)})`
    dot.style.opacity = (1 - labelAmt).toFixed(3)

    // ---- sleep when settled (the breathing is the only thing that keeps the loop alive) ----
    const settled =
      Math.abs(px + mx - rx) < 0.1 && Math.abs(py + my - ry) < 0.1 && Math.abs(px + mx * 0.22 - dx) < 0.1 && Math.abs(py + my * 0.22 - dy) < 0.1 &&
      Math.abs(size - targetSize) < 0.2 && speed < 20 && Math.abs(labelAmt - labelTarget) < 0.01 && Math.abs(fillAmt - c.fill) < 0.005 &&
      Math.abs(dotScale - dotTarget) < 0.01 && stretch < 0.002 && Math.abs(press - pressTarget) < 0.002 && !breathe && organic < 0.004 &&
      !(canBreathe && !still)
    if (!settled) raf = requestAnimationFrame(tick)
  }

  // ---- input (attached once) ----
  const onMove = (event) => {
    if (!enabled || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return
    // The 3D corridor uses the browser cursor (including the existing door `pointer` state).
    // Keep the Living Cursor completely out of the immersive camera/door experience.
    if (mode === 'immersive') {
      html.classList.remove('ukd-cursor-on')
      setVisible(false)
      return
    }
    const now = performance.now()
    const ddx = event.clientX - px, ddy = event.clientY - py
    if (!seen) {
      seen = true
      px = rx = dx = event.clientX
      py = ry = dy = event.clientY
      html.classList.add('ukd-cursor-on')
      apply(event.target)
    } else {
      const span = Math.max(8, now - lastMove) / 1000
      vx += (ddx / span - vx) * 0.5
      vy += (ddy / span - vy) * 0.5
      if (event.target !== hoverEl) apply(event.target)
      else if (!visible && cfg.kind !== 'native') setVisible(true)
    }
    px = event.clientX
    py = event.clientY
    if (Math.abs(ddx) + Math.abs(ddy) > 0.6) lastMove = now
    kick()
  }
  const onDown = (event) => { if (event.button === 0 && seen) { pressed = true; kick() } }
  const onUp = () => { if (pressed) { pressed = false; kick() } }
  const onLeave = () => setVisible(false)
  const onScroll = () => {
    rectDirty = true
    if (!seen || scrollPending) return
    scrollPending = true
    requestAnimationFrame(() => {
      scrollPending = false
      const element = document.elementFromPoint(px, py)
      if (element !== hoverEl) apply(element)
      else kick()
    })
  }
  const onResize = () => { rectDirty = true }
  const onEnvChange = () => {
    enabled = finePointer.matches
    reduced = reducedQuery.matches
    if (!enabled) { setVisible(false); html.classList.remove('ukd-cursor-on') }
    else if (seen) html.classList.add('ukd-cursor-on')
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('blur', onLeave)
  document.documentElement.addEventListener('mouseleave', onLeave)
  finePointer.addEventListener('change', onEnvChange)
  reducedQuery.addEventListener('change', onEnvChange)
  path.setAttribute('d', CIRCLE)

  return {
    setMode(next) {
      if (next === mode) return
      mode = next
      root.dataset.mode = next
      if (next === 'immersive') {
        html.classList.remove('ukd-cursor-on')
        setVisible(false)
        pressed = false
      } else {
        if (enabled && seen) html.classList.add('ukd-cursor-on')
        apply(document.elementFromPoint(px, py) || hoverEl)
      }
    },
    destroy() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('blur', onLeave)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      finePointer.removeEventListener('change', onEnvChange)
      reducedQuery.removeEventListener('change', onEnvChange)
      if (raf) cancelAnimationFrame(raf)
      html.classList.remove('ukd-cursor-on')
    },
  }
}
