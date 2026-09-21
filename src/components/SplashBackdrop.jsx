import { useEffect, useRef, useState } from 'react'
import './SplashBackdrop.css'
import HeroSignalBackground from './HeroSignalBackground.jsx'
import { TECH_TAG_MARKS } from './TechTagMarks.jsx'

/**
 * The atmosphere behind the Splash hero (light and dark). It is deliberately secondary to the content: the headline and the portrait are read
 * first, the CTA next, the signal traces are noticed a moment later, and the small Tech Stack tokens last.
 *   1  base             the gate's background (CSS)
 *   2  vertical lines   faint 1px technical lines on the gate (CSS), static
 *   3  signal traces    short luminous segments travelling down selected lines, at different columns, speeds and heights
 *   4  tech tokens      nine small frosted tokens in negative space, each drifting slowly around its own home; on a desktop they can be dragged
 *   5  hero content     above everything here (`.entry-hero` is z-index 1)
 *
 * Token homes are written in the portrait's units (origin at the portrait's centre, 1000 units = its height), so they stay in the same
 * negative space at every viewport. The portrait is measured (layout, not transforms) whenever the layout changes.
 *
 * Dragging (fine pointer, desktop layout, no reduced motion) is ONE shared manager: one set of pointer listeners, one on-demand frame loop, no React
 * state per frame. Tokens sit behind the hero, so each one has an invisible hit proxy in `.splash-hit` (above the hero, exactly the token's size)
 * that carries `data-cursor="drag"` for the shared Living Magnetic Cursor. A dropped token's position becomes its new home; a token that is pushed
 * aside makes room by moving to a new home too. No two tokens ever end up overlapping, and nothing settles on the copy, the CTA or the portrait.
 */

// Tech Stack tokens. Tier 1 = the primary stack, tier 2 = AI / build tools (secondary: a little smaller and quieter, and the first to be dropped when a
// width has no room for them), tier 3 = the closing "And many more". Home = units from the portrait centre for desktop (`d`), tablet (`t`, the hero stacks
// at 1024px) and mobile (`m`, up to 640px); null = not shown at that size. drift = [duration s, dx px, dy px, rotation deg, scale from, scale to] (a
// total range, centred on the home). Order matters when space is short: earlier tokens keep their place, later ones make room.
const TOKENS = [
  { id: 'react', tier: 1, label: 'React', d: [-1200, -407], t: [-620, -430], m: [-348, -535], drift: [13, 3, 7, 1.1, 0.99, 1.01] },
  { id: 'figma', tier: 1, label: 'Figma', d: [-937, -496], t: [620, -420], m: [-157, -549], drift: [10.5, -4, 8, -1, 1, 1] },
  { id: 'tailwind', tier: 1, label: 'Tailwind CSS', d: [-627, -415], t: [-610, -50], m: null, drift: [15, 5, -6, 0.8, 1, 1] },
  { id: 'vite', tier: 1, label: 'Vite', d: [-357, -512], t: null, m: null, drift: [9.5, -3, 5, 1.3, 1, 1] },
  { id: 'html5', tier: 1, label: 'HTML5', d: [212, -499], t: [630, 40], m: null, drift: [12, 4, -8, -1.2, 0.99, 1.01] },
  { id: 'css3', tier: 1, label: 'CSS3', d: [-627, 267], t: null, m: null, drift: [16.5, 5, 6, 0.9, 1, 1] },
  { id: 'javascript', tier: 1, label: 'JavaScript', d: [-1173, 422], t: [-585, 300], m: null, drift: [11, -5, 9, 1.4, 1, 1] },
  { id: 'photoshop', tier: 1, label: 'Photoshop', d: [-857, 478], t: null, m: null, drift: [14, 3, -7, -0.8, 1, 1] },
  { id: 'more', tier: 3, label: 'And many more', d: [-489, 432], t: [610, 330], m: [279, -537], drift: [9.2, 6, 5, 1, 1, 1] },
  { id: 'claude', tier: 2, label: 'Claude', d: [-81, -512], t: [-610, -190], m: [38, -541], drift: [12.5, -3, 6, 0.9, 1, 1] },
  { id: 'codex', tier: 2, label: 'Codex', d: [-489, -358], t: [640, -180], m: null, drift: [10, 4, -6, -1, 1, 1] },
  { id: 'lovable', tier: 2, label: 'Lovable', d: [-844, -378], t: null, m: null, drift: [14.5, -4, -7, 1.2, 1, 1] },
  { id: 'bolt', tier: 2, label: 'Bolt', d: [-1002, 366], t: null, m: null, drift: [11.5, 3, 8, -0.9, 1, 1] },
  { id: 'v0', tier: 2, label: 'v0', d: [448, -22], t: null, m: null, drift: [13.5, -3, 7, 1, 1, 1] },
  { id: 'builder', tier: 2, label: 'Builder', d: [129, 496], t: null, m: null, drift: [10.8, 5, -5, -1.1, 1, 1] },
]
const FIT = 70          // a tier-2 token that would have to sit further than this from its home is not shown at that width
const WIDE = 300        // ... but before a token is dropped it may still travel this far (px) to the nearest legal place, so a shorter viewport
                        // (the portrait is sized in vh, so its units shrink) never costs a tag that has room elsewhere

// The portrait art (head, floating cards, badge, script) is one opaque silhouette; these rectangles, in portrait units, cover it. Tokens are never
// left on them.
const PORTRAIT_ZONES = [[-150, -455, 360, -375], [-250, -375, 352, -300], [-372, -300, 386, 452]]
const COPY_ZONES = ['.hero-eyebrow', '.hero-headline', '.hero-supporting']

const GAP = 10          // minimum visual gap between two tokens (px), measured between their boxes INCLUDING the idle drift, so it holds at every moment
const ZONE_PAD = 14     // clear space kept around the copy and the CTA
const ART_PAD = 12      // clear space kept around the portrait art
const EDGE = 16         // clear space kept at the viewport edge
const ACT = 84          // a token starts to lean away from a dragged one when the gap between them is below this
const SOFT = 16         // how far (px) a token leans away, at most, before it actually has to make room
const LEAN = 2.5        // hover: a token leans this far (px) toward the pointer
const TAU_DRAG = 0.028  // pointer tracking of the dragged token (s): direct, without lag you can feel
const TAU_MOVE = 0.075  // a token that makes room (s): soft, critically damped, no overshoot
const TAU_SETTLE = 0.13 // after a drop (s)

const reducedQuery = '(prefers-reduced-motion: reduce)'
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const smooth = (t) => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c) }


const fmt = (v) => v.toFixed(2)

export default function SplashBackdrop() {
  const hostRef = useRef(null)
  const hitRef = useRef(null)
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(reducedQuery).matches)

  useEffect(() => {
    const query = window.matchMedia(reducedQuery)
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Layout, token homes and the drag manager.
  useEffect(() => {
    const host = hostRef.current
    const hitHost = hitRef.current
    const gate = host?.closest('.entry-gate')
    const image = gate?.querySelector('.entry-portrait img')
    const hero = gate?.querySelector('.entry-hero')
    const copy = gate?.querySelector('.entry-intro-copy')
    if (!host || !hitHost || !gate || !image) return undefined

    const stacked = window.matchMedia('(max-width: 1024px)')
    const compact = window.matchMedia('(max-width: 640px)')
    const precise = window.matchMedia('(hover: hover) and (pointer: fine)')

    const items = TOKENS.map((token) => {
      const el = host.querySelector(`.sbt[data-id="${token.id}"]`)
      return { ...token, el, body: el?.querySelector('.sbt__body'), hit: hitHost.querySelector(`.sbt-hit[data-id="${token.id}"]`), w: 0, h: 0, ew: 0, eh: 0, x: 0, y: 0, hx: 0, hy: 0, tx: 0, ty: 0, softX: 0, softY: 0, sx: 1, sy: 1, on: false, fit: true, blocked: false, placed: false }
    })
    if (items.some((s) => !s.el || !s.body || !s.hit)) return undefined
    // homes per size, in portrait units; a dropped or displaced token rewrites its own
    const units = { d: {}, t: {}, m: {} }
    for (const s of items) for (const tier of ['d', 't', 'm']) units[tier][s.id] = s[tier] ? [...s[tier]] : null

    const geo = { cx: 0, cy: 0, k: 1, tier: 'd', draggable: false, dirty: true, zones: [], W: 0, H: 0, gx: 0, gy: 0, top: 80, signature: '' }
    const pointer = { x: 0, y: 0 }
    let drag = null      // { s, id, ox, oy }
    let hovered = null
    let settling = null  // the token that was just dropped, until it has arrived
    let frame = 0
    let last = 0
    let measureFrame = 0
    let dead = false

    const offsetIn = (node) => {
      let x = 0
      let y = 0
      for (let n = node; n && n !== gate; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop }
      return [x, y - (hero ? hero.scrollTop : 0)]
    }

    // ---- where tokens may not stay: the copy, the CTA, the portrait art (rectangles in gate px) ----
    const textBox = (el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const r = range.getBoundingClientRect()
      const e = el.getBoundingClientRect()
      const [x, y] = offsetIn(el)
      return [x + r.left - e.left - ZONE_PAD, y + r.top - e.top - ZONE_PAD, x + r.right - e.left + ZONE_PAD, y + r.bottom - e.top + ZONE_PAD]
    }
    const buildZones = () => {
      const zones = []
      for (const selector of COPY_ZONES) { const el = gate.querySelector(selector); if (el) zones.push(textBox(el)) }
      const cta = gate.querySelector('.entry-gallery-cta')
      if (cta) { const [x, y] = offsetIn(cta); zones.push([x - ZONE_PAD, y - ZONE_PAD, x + cta.offsetWidth + ZONE_PAD, y + cta.offsetHeight + ZONE_PAD]) }
      for (const [x0, y0, x1, y1] of PORTRAIT_ZONES) zones.push([geo.cx + x0 * geo.k - ART_PAD, geo.cy + y0 * geo.k - ART_PAD, geo.cx + x1 * geo.k + ART_PAD, geo.cy + y1 * geo.k + ART_PAD])
      geo.zones = zones
    }

    // ---- geometry helpers: a token is a centre + size ----
    const inBounds = (s, x, y) => x - s.w / 2 >= EDGE - 0.5 && x + s.w / 2 <= geo.W - EDGE + 0.5 && y - s.h / 2 >= geo.top - 0.5 && y + s.h / 2 <= geo.H - EDGE + 0.5
    const hitsZone = (s, x, y) => geo.zones.some((z) => x + s.w / 2 > z[0] && x - s.w / 2 < z[2] && y + s.h / 2 > z[1] && y - s.h / 2 < z[3])
    const hitsToken = (s, x, y, other) => Math.abs(x - other.hx) < (s.ew + other.ew) / 2 + GAP - 0.5 && Math.abs(y - other.hy) < (s.eh + other.eh) / 2 + GAP - 0.5
    const valid = (s, x, y, placed) => inBounds(s, x, y) && !hitsZone(s, x, y) && !placed.some((o) => hitsToken(s, x, y, o))
    // the nearest legal centre to (x, y): rings of growing radius, so a token settles a short way from where it was left, never far.
    // `cap` bounds the search: the first pass keeps a token close to its designed home, a second, wider pass keeps it on screen at all.
    const nearestValid = (s, x, y, placed, cap) => {
      if (valid(s, x, y, placed)) return [x, y]
      for (let r = 4; r <= cap; r += 4) {
        const n = Math.max(16, Math.ceil((Math.PI * 2 * r) / 10))
        for (let i = 0; i < n; i += 1) {
          const a = (i / n) * Math.PI * 2 + 0.6
          const cx = x + Math.cos(a) * r
          const cy = y + Math.sin(a) * r
          if (valid(s, cx, cy, placed)) return [cx, cy]
        }
      }
      return null
    }
    const saveUnits = (s) => { units[geo.tier][s.id] = [(s.hx - geo.cx) / geo.k, (s.hy - geo.cy) / geo.k] }

    // Put every token on a legal home (first: the token that was just dropped, so it keeps its place and the others make room).
    // A token takes the nearest legal centre: inside FIT that is its designed home, and if the designed home needs a nudge (the portrait is
    // sized in vh, so a shorter viewport shrinks its units and closes the gaps around it) it still travels up to WIDE. Only a secondary token
    // that finds no legal centre inside WIDE steps out, which is how the set is reduced on a width that is genuinely short of space.
    const legalizeAll = (first, fitCheck) => {
      const order = first ? [first, ...items.filter((s) => s !== first)] : items
      const placed = []
      for (const s of order) {
        if (!s.on) continue
        let found = nearestValid(s, s.hx, s.hy, placed, FIT)
        if (!found) found = nearestValid(s, s.hx, s.hy, placed, WIDE)
        if (!found && fitCheck && s.tier === 2) { // nowhere comfortable at this width: the AI / build token is the first to make room
          s.fit = false
          s.on = false
          s.el.classList.add('is-off')
          s.hit.classList.add('is-off')
          continue
        }
        if (found) { s.hx = found[0]; s.hy = found[1] } else pushClear(s, placed)
        saveUnits(s)
        placed.push(s)
      }
    }

    // ---- layout: portrait, homes, sizes ----
    const measure = () => {
      measureFrame = 0
      const height = image.offsetHeight
      if (!height) return
      geo.k = height / 1000
      const [ix, iy] = offsetIn(image)
      geo.cx = ix + image.offsetWidth / 2
      geo.cy = iy + height / 2
      const box = gate.getBoundingClientRect()
      geo.gx = box.left
      geo.gy = box.top
      geo.W = gate.clientWidth
      geo.H = gate.clientHeight
      if (copy) { // the quiet zone for signal traces: an ellipse over the copy block
        const [cxp, cyp] = offsetIn(copy)
        host.style.setProperty('--ccx', `${(cxp + copy.offsetWidth / 2).toFixed(1)}px`)
        host.style.setProperty('--ccy', `${(cyp + copy.offsetHeight / 2).toFixed(1)}px`)
        host.style.setProperty('--crx', `${(copy.offsetWidth * 0.64).toFixed(1)}px`)
        host.style.setProperty('--cry', `${(copy.offsetHeight * 0.7).toFixed(1)}px`)
      }
      const tier = compact.matches ? 'm' : stacked.matches ? 't' : 'd'
      const draggable = !reduced && tier === 'd' && precise.matches
      const changed = tier !== geo.tier || draggable !== geo.draggable
      // A change of the portrait's size or place is a change of layout too: the token homes are written in the portrait's units, so a shorter
      // viewport (the portrait is sized in vh) closes the negative space around the same homes. Re-checking here gives a token that had to
      // step out at an earlier geometry a fresh, fair look, instead of hiding it for the rest of the session.
      const signature = `${tier}|${geo.k.toFixed(3)}|${geo.cx.toFixed(1)}|${geo.cy.toFixed(1)}|${geo.W}x${geo.H}`
      const relayout = changed || signature !== geo.signature
      geo.signature = signature
      geo.tier = tier
      geo.draggable = draggable
      geo.top = tier === 'd' ? 80 : 64
      hitHost.classList.toggle('is-draggable', draggable)
      if (drag && (changed || !draggable)) endDrag(true)

      let resized = !items.every((s) => s.placed)
      if (relayout || geo.dirty) for (const s of items) s.fit = true
      for (const s of items) {
        s.on = !!units[tier][s.id] && s.fit
        s.el.classList.toggle('is-off', !s.on)
        s.hit.classList.toggle('is-off', !s.on || !draggable)
        if (!s.on) continue
        if (Math.abs(s.body.offsetWidth - s.w) > 0.5 || Math.abs(s.body.offsetHeight - s.h) > 0.5) resized = true
        s.w = s.body.offsetWidth
        s.h = s.body.offsetHeight
        s.ew = s.w + Math.abs(s.drift[1]) + 2 + LEAN // the box the token can ever occupy: its idle drift, a hair for its tilt and scale, and the hover lean
        s.eh = s.h + Math.abs(s.drift[2]) + 2 + LEAN
        s.hit.style.width = `${s.w + 12}px`
        s.hit.style.height = `${s.h + 12}px`
      }
      buildZones()
      for (const s of items) {
        if (!s.on) continue
        const u = units[tier][s.id]
        s.hx = geo.cx + u[0] * geo.k
        s.hy = geo.cy + u[1] * geo.k
      }
      // only a real change of layout re-checks the homes (a scroll of the stacked hero just moves them); this never runs mid-drag
      if (changed || relayout || resized || geo.dirty) { legalizeAll(undefined, true); geo.dirty = false }
      for (const s of items) {
        if (!s.on) continue
        s.placed = true
        s.softX = 0
        s.softY = 0
        s.x = s.tx = s.hx
        s.y = s.ty = s.hy
        place(s)
      }
      host.classList.add('is-ready')
    }
    const scheduleMeasure = () => { if (!measureFrame && !dead) measureFrame = requestAnimationFrame(measure) }

    const place = (s) => {
      const t = `translate3d(${fmt(s.x)}px,${fmt(s.y)}px,0)`
      s.el.style.transform = t
      s.hit.style.transform = t
    }

    // ---- drag: one manager ----
    const separate = (a, b, shareA) => {
      const dx = a.hx - b.hx
      const dy = a.hy - b.hy
      const needX = (a.ew + b.ew) / 2 + GAP - Math.abs(dx)
      const needY = (a.eh + b.eh) / 2 + GAP - Math.abs(dy)
      if (needX <= 0 || needY <= 0) return
      if (needX < needY) {
        const sign = Math.abs(dx) > 0.5 ? Math.sign(dx) : a.sx
        a.sx = sign
        a.hx += sign * needX * shareA
        b.hx -= sign * needX * (1 - shareA)
      } else {
        const sign = Math.abs(dy) > 0.5 ? Math.sign(dy) : a.sy
        a.sy = sign
        a.hy += sign * needY * shareA
        b.hy -= sign * needY * (1 - shareA)
      }
    }
    const leaveZones = (s) => {
      for (let pass = 0; pass < 3; pass += 1) {
        let moved = false
        for (const z of geo.zones) {
          const l = s.hx - s.w / 2, r = s.hx + s.w / 2, t = s.hy - s.h / 2, b = s.hy + s.h / 2
          if (r <= z[0] || l >= z[2] || b <= z[1] || t >= z[3]) continue
          const options = [[z[0] - r, 0], [z[2] - l, 0], [0, z[1] - b], [0, z[3] - t]].sort((p, q) => Math.abs(p[0] + p[1]) - Math.abs(q[0] + q[1]))
          s.hx += options[0][0]
          s.hy += options[0][1]
          moved = true
        }
        if (!moved) break
      }
      s.hx = clamp(s.hx, EDGE + s.w / 2, geo.W - EDGE - s.w / 2)
      s.hy = clamp(s.hy, geo.top + s.h / 2, geo.H - EDGE - s.h / 2)
    }
    // Last resort, for a viewport so short that no legal centre exists at all: push the token clear of the protected zones and of the tokens
    // already placed, then back inside the safe bounds. A tag is never left resting on the copy, the CTA, the portrait art or another tag.
    const pushClear = (s, placed) => {
      for (let pass = 0; pass < 4; pass += 1) {
        leaveZones(s)
        for (const o of placed) separate(s, o, 1)
      }
      leaveZones(s)
    }

    // The dragged token pushes the others: they lean away first (soft), and if it comes closer than the gap they move out of the way for good.
    const makeRoom = (D) => {
      const others = items.filter((s) => s.on && s !== D)
      for (let pass = 0; pass < 3; pass += 1) {
        for (const s of others) separate(s, D, 1)
        for (let i = 0; i < others.length; i += 1) for (let j = i + 1; j < others.length; j += 1) separate(others[i], others[j], 0.5)
        for (const s of others) leaveZones(s)
      }
      for (const s of others) {
        const dx = s.hx - D.hx
        const dy = s.hy - D.hy
        const edge = Math.hypot(Math.max(Math.abs(dx) - (s.ew + D.ew) / 2, 0), Math.max(Math.abs(dy) - (s.eh + D.eh) / 2, 0))
        const lean = SOFT * smooth(1 - edge / ACT)
        const dist = Math.hypot(dx, dy) || 1
        s.softX = (dx / dist) * lean
        s.softY = (dy / dist) * lean
      }
    }

    const step = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
      last = now
      let moving = !!drag
      if (drag) {
        const D = drag.s
        D.hx = clamp(pointer.x - drag.ox, 4 + D.w / 2, geo.W - 4 - D.w / 2)
        D.hy = clamp(pointer.y - drag.oy, 4 + D.h / 2, geo.H - 4 - D.h / 2)
        makeRoom(D)
        const blocked = !valid(D, D.hx, D.hy, [])
        if (blocked !== D.blocked) { D.blocked = blocked; D.el.classList.toggle('is-blocked', blocked) }
      }
      for (const s of items) {
        if (!s.on) continue
        let goalX = s.hx
        let goalY = s.hy
        if (s !== (drag && drag.s)) { goalX += s.softX; goalY += s.softY }
        if (s === hovered && !drag) { // hover: a small lean toward the pointer
          goalX += clamp((pointer.x - s.hx) / (s.w / 2), -1, 1) * LEAN
          goalY += clamp((pointer.y - s.hy) / (s.h / 2), -1, 1) * LEAN
        }
        s.tx = goalX
        s.ty = goalY
        const a = 1 - Math.exp(-dt / (drag && s === drag.s ? TAU_DRAG : settling ? TAU_SETTLE : TAU_MOVE))
        const ddx = s.tx - s.x
        const ddy = s.ty - s.y
        if (Math.abs(ddx) > 0.02 || Math.abs(ddy) > 0.02) {
          s.x += ddx * a
          s.y += ddy * a
          place(s)
          if (Math.abs(ddx) > 0.15 || Math.abs(ddy) > 0.15) moving = true
        }
      }
      if (!drag) {
        for (const s of items) { s.softX = 0; s.softY = 0 } // soft leaning ends with the drag
        if (settling && Math.abs(settling.x - settling.tx) < 0.4 && Math.abs(settling.y - settling.ty) < 0.4) {
          settling.el.classList.remove('is-dragging')
          settling.hit.classList.remove('is-dragging')
          settling = null
        }
        if (settling) moving = true
      }
      frame = moving ? requestAnimationFrame(step) : 0
      if (!moving) last = 0
    }
    const wake = () => { if (!frame) frame = requestAnimationFrame(step) }

    function endDrag(cancel) {
      if (!drag) return
      const D = drag.s
      try { D.hit.releasePointerCapture(drag.id) } catch { /* already released */ }
      drag = null
      D.blocked = false
      D.el.classList.remove('is-blocked')
      // drop: the nearest legal place is its new home; whatever had to move over keeps its new home as well
      buildZones()
      legalizeAll(D)
      settling = D
      if (cancel) { D.el.classList.remove('is-dragging'); D.hit.classList.remove('is-dragging'); settling = null }
      wake()
    }

    const toGate = (event) => { pointer.x = event.clientX - geo.gx; pointer.y = event.clientY - geo.gy }
    const onDown = (event) => {
      if (event.button !== 0 || !geo.draggable || drag) return
      const s = items.find((it) => it.hit === event.currentTarget)
      if (!s || !s.on) return
      event.preventDefault()
      toGate(event)
      buildZones()
      try { s.hit.setPointerCapture(event.pointerId) } catch { /* not capturable */ }
      settling = null
      drag = { s, id: event.pointerId, ox: pointer.x - s.x, oy: pointer.y - s.y }
      for (const it of items) { it.softX = 0; it.softY = 0 }
      s.el.classList.add('is-dragging')
      s.hit.classList.add('is-dragging')
      wake()
    }
    const onMove = (event) => { toGate(event); wake() }
    const onEnter = (event) => {
      if (drag || !geo.draggable) return
      const s = items.find((it) => it.hit === event.currentTarget)
      if (!s) return
      hovered = s
      toGate(event)
      s.el.classList.add('is-hover')
      wake()
    }
    const onLeave = (event) => {
      const s = items.find((it) => it.hit === event.currentTarget)
      if (!s) return
      if (hovered === s) hovered = null
      s.el.classList.remove('is-hover')
      wake()
    }
    const onUp = (event) => { if (drag && event.pointerId === drag.id) endDrag(false) }

    for (const s of items) {
      s.hit.addEventListener('pointerdown', onDown)
      s.hit.addEventListener('pointermove', onMove, { passive: true })
      s.hit.addEventListener('pointerenter', onEnter, { passive: true })
      s.hit.addEventListener('pointerleave', onLeave, { passive: true })
      s.hit.addEventListener('pointerup', onUp)
      s.hit.addEventListener('pointercancel', onUp)
      s.hit.addEventListener('lostpointercapture', onUp)
    }
    const resize = new ResizeObserver(() => { geo.dirty = true; scheduleMeasure() })
    resize.observe(gate)
    resize.observe(image)
    const onImage = () => scheduleMeasure()
    const onScroll = () => { if (!drag) scheduleMeasure() }
    image.addEventListener('load', onImage)
    hero?.addEventListener('scroll', onScroll, { passive: true })
    document.fonts?.ready.then(() => { geo.dirty = true; scheduleMeasure() })
    scheduleMeasure()

    return () => {
      dead = true
      if (frame) cancelAnimationFrame(frame)
      if (measureFrame) cancelAnimationFrame(measureFrame)
      resize.disconnect()
      image.removeEventListener('load', onImage)
      hero?.removeEventListener('scroll', onScroll)
      for (const s of items) {
        s.hit.removeEventListener('pointerdown', onDown)
        s.hit.removeEventListener('pointermove', onMove)
        s.hit.removeEventListener('pointerenter', onEnter)
        s.hit.removeEventListener('pointerleave', onLeave)
        s.hit.removeEventListener('pointerup', onUp)
        s.hit.removeEventListener('pointercancel', onUp)
        s.hit.removeEventListener('lostpointercapture', onUp)
        s.el.style.transform = ''
        s.hit.style.transform = ''
        s.el.classList.remove('is-dragging', 'is-hover', 'is-blocked')
      }
    }
  }, [reduced])

  return <>
    <div className="splash-bg" ref={hostRef} aria-hidden="true">
      <HeroSignalBackground/>

      <div className="splash-bg__tokens">
        {TOKENS.map((token) => {
          const [dur, dx, dy, dr, s0, s1] = token.drift
          return <div key={token.id} className={`sbt sbt--t${token.tier} is-off`} data-id={token.id}>
            <div className="sbt__drift" style={{ '--dur': `${dur}s`, '--delay': `${-(dur * 0.37).toFixed(1)}s`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--dr': `${dr}deg`, '--s0': s0, '--s1': s1 }}>
              <span className="sbt__body">{TECH_TAG_MARKS[token.id]}<span className="sbt__label">{token.label}</span></span>
            </div>
          </div>
        })}
      </div>
    </div>

    <div className="splash-hit" ref={hitRef} aria-hidden="true">
      {TOKENS.map((token) => <div key={token.id} className="sbt-hit is-off" data-id={token.id} data-cursor="drag" data-cursor-live="" />)}
    </div>
  </>
}
