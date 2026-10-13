import { useEffect, useState } from 'react'
import * as THREE from 'three'

/*
 * Room graphics: the site's own type, painted at real size onto the surfaces of the rooms -
 * printed on stone, inlaid in walnut, lit from behind in a light box. Everything is laid out in
 * metres on the surface it belongs to, in the site's fonts (Manrope, DM Mono, Playfair Display).
 */
const FAMILY = {
  sans: 'Manrope, system-ui, sans-serif',
  mono: '"DM Mono", monospace',
  serif: '"Playfair Display", Georgia, serif',
}
const FACES = ['800 64px Manrope', '700 64px Manrope', '600 64px Manrope', '500 64px Manrope', '500 64px "DM Mono"', 'italic 500 64px "Playfair Display"']

let fontsLoading = null
let fontsIn = false        // every face is in: from then on a text's measured width never changes
const loadFonts = () => {
  if (!fontsLoading) {
    fontsLoading = typeof document === 'undefined' || !document.fonts
      ? Promise.resolve()
      : Promise.all(FACES.map((face) => document.fonts.load(face))).catch(() => {}).then(() => {
        fontsIn = FACES.every((face) => document.fonts.check(face))
      })
  }
  return fontsLoading
}
// widths already measured, by font and text: the same words are laid out several times over
// (a piece of lettering is drawn once for its outline and again for each of its colours)
const widths = new Map()

/** True once the site's fonts are ready to paint with. */
export function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let live = true
    loadFonts().then(() => live && setReady(true))
    return () => { live = false }
  }, [])
  return ready
}

// Ink for light surfaces (stone, light boxes) and for dark ones (ink plaster, walnut, felt).
export const ON_LIGHT = { text: '#142030', body: '#3b4656', muted: '#5d6878', accent: '#455dff', rule: 'rgba(20,32,48,.28)' }
export const ON_DARK = { text: '#f4eee4', body: '#d4cbbd', muted: '#a99f90', accent: '#8f9dff', rule: 'rgba(244,238,228,.3)', brass: '#d9b878' }

/* A pen that writes in metres onto a canvas of `scale` pixels per metre. */
class Pen {
  constructor(g, scale) {
    this.g = g
    this.s = scale
  }

  font({ size, weight = 700, family = 'sans', italic = false }) {
    return `${italic ? 'italic ' : ''}${weight} ${size * this.s}px ${FAMILY[family]}`
  }

  // setting a canvas font is slow (it is parsed each time): only when it changes
  setFont(font) {
    if (this.current !== font) {
      this.g.font = font
      this.current = font
    }
  }

  measure(text) {
    if (!fontsIn) return this.g.measureText(text).width
    const key = `${this.current}
${text}`
    let w = widths.get(key)
    if (w === undefined) {
      w = this.g.measureText(text).width
      widths.set(key, w)
    }
    return w
  }

  width(text, style) {
    this.setFont(this.font(style))
    const tracking = (style.tracking || 0) * style.size * this.s
    return (this.measure(text) + tracking * Math.max(0, [...text].length - 1)) / this.s
  }

  /** One line; `y` is the top of the line. Returns the y below it. */
  text(text, x, y, style) {
    const { g, s } = this
    this.setFont(this.font(style))
    g.fillStyle = style.color
    g.textBaseline = 'top'
    const w = this.width(text, style)
    const x0 = style.align === 'center' ? x - w / 2 : style.align === 'right' ? x - w : x
    if (style.tracking) {
      let cursor = x0 * s
      const gap = style.tracking * style.size * s
      for (const ch of text) {
        g.fillText(ch, cursor, y * s)
        cursor += this.measure(ch) + gap
      }
    } else g.fillText(text, x0 * s, y * s)
    return y + style.size * (style.lineHeight || 1.2)
  }

  /** Wrapped runs of differently styled text (a title with its italic accent, a paragraph). */
  flow(runs, x, y, maxWidth, { lineHeight = 1.15, align = 'left' } = {}) {
    const words = runs.flatMap((run) => run.text.split(/(\s+)/).filter(Boolean).map((t) => ({ t, style: run.style })))
    const size = Math.max(...runs.map((r) => r.style.size))
    const lines = [[]]
    let lineW = 0
    for (const word of words) {
      const w = this.width(word.t, word.style)
      const blank = /^\s+$/.test(word.t)
      if (!blank && lineW + w > maxWidth && lines[lines.length - 1].length) {
        lines.push([])
        lineW = 0
      }
      if (blank && !lines[lines.length - 1].length) continue
      lines[lines.length - 1].push({ ...word, w })
      lineW += w
    }
    for (const line of lines) {
      while (line.length && /^\s+$/.test(line[line.length - 1].t)) line.pop()
      const total = line.reduce((a, w) => a + w.w, 0)
      let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
      for (const word of line) {
        if (!/^\s+$/.test(word.t)) this.text(word.t, cursor, y + (size - word.style.size) * 0.78, word.style)
        cursor += word.w
      }
      y += size * lineHeight
    }
    return y
  }

  rule(x, y, w, color, thickness = 0.004) {
    this.g.fillStyle = color
    this.g.fillRect(x * this.s, y * this.s, w * this.s, Math.max(1, thickness * this.s))
  }
}

/** Paints a surface `width` x `height` metres; returns its texture. */
export function paintGraphic(width, height, draw, { ppm = 420, background = null } = {}) {
  const scale = Math.min(ppm, 4096 / Math.max(width, height))
  const c = document.createElement('canvas')
  c.width = Math.round(width * scale)
  c.height = Math.round(height * scale)
  const g = c.getContext('2d')
  if (background) {
    g.fillStyle = background
    g.fillRect(0, 0, c.width, c.height)
  }
  draw(new Pen(g, scale), { width, height })
  const texture = new THREE.CanvasTexture(c)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  return texture
}

/** A title in the site's voice: the middle part in Playfair italic and the accent colour. */
export function titleRuns([before, accent, after], size, ink, weight = 700) {
  const plain = { size, weight, family: 'sans', color: ink.text }
  const em = { size: size * 1.04, weight: 500, family: 'serif', italic: true, color: ink.accent }
  return [{ text: before, style: plain }, { text: accent, style: em }, { text: after, style: plain }].filter((r) => r.text)
}

export const eyebrow = (size, color) => ({ size, weight: 500, family: 'mono', color, tracking: 0.16 })
export const body = (size, color, weight = 500) => ({ size, weight, family: 'sans', color })

/* A box blur of a single-channel field, run twice (near-gaussian), in place. */
function blurField(src, w, h, r) {
  if (r < 1) return src
  const tmp = new Float32Array(src.length)
  const n = r * 2 + 1
  const clampTo = (i, last) => (i < 0 ? 0 : i > last ? last : i)
  // along each row: one running sum
  const across = (from, to) => {
    for (let y = 0; y < h; y++) {
      const base = y * w
      let sum = 0
      for (let i = -r; i <= r; i++) sum += from[base + clampTo(i, w - 1)]
      for (let x = 0; x < w; x++) {
        to[base + x] = sum / n
        sum += from[base + clampTo(x + r + 1, w - 1)] - from[base + clampTo(x - r, w - 1)]
      }
    }
  }
  // down each column: a running sum per column, walked a row at a time (memory in order)
  const down = (from, to) => {
    const sums = new Float64Array(w)
    for (let i = -r; i <= r; i++) {
      const row = clampTo(i, h - 1) * w
      for (let x = 0; x < w; x++) sums[x] += from[row + x]
    }
    for (let y = 0; y < h; y++) {
      const base = y * w
      const add = clampTo(y + r + 1, h - 1) * w
      const sub = clampTo(y - r, h - 1) * w
      for (let x = 0; x < w; x++) {
        to[base + x] = sums[x] / n
        sums[x] += from[add + x] - from[sub + x]
      }
    }
  }
  for (let k = 0; k < 2; k++) {
    across(src, tmp)
    down(tmp, src)
  }
  return src
}

/* ------------------------------------------------------------------ lettering in three dimensions */
/*
 * Real letters, not a picture of them: each colour of a piece of lettering is drawn in the
 * site's fonts exactly as the page draws them, its outline traced (marching squares on the
 * glyph coverage, interpolated to a fraction of a pixel, then simplified) and returned as
 * shapes in metres, ready to be extruded into solid letters. A soft shadow of the whole
 * piece comes with it, for the wall behind.
 */
class MaskPen extends Pen {
  constructor(g, scale, only, seen) {
    super(g, scale)
    this.only = only
    this.seen = seen
  }

  text(text, x, y, style) {
    this.seen?.add(style.color)
    if (this.only != null && style.color !== this.only) return y + style.size * (style.lineHeight || 1.2)
    return super.text(text, x, y, style)
  }

  rule(x, y, w, color, thickness) {
    this.seen?.add(color)
    if (this.only != null && color !== this.only) return
    super.rule(x, y, w, color, thickness)
  }
}

// [edge a, edge b, a reference corner, whether that corner is inside], per marching-squares case
// corners: 0 tl, 1 tr, 2 br, 3 bl; edges: 0 top, 1 right, 2 bottom, 3 left
const CASES = {
  1: [[3, 2, 3, true]], 2: [[2, 1, 2, true]], 3: [[3, 1, 3, true]], 4: [[0, 1, 1, true]],
  6: [[0, 2, 1, true]], 7: [[3, 0, 0, false]], 8: [[3, 0, 0, true]], 9: [[0, 2, 0, true]],
  11: [[0, 1, 1, false]], 12: [[3, 1, 0, true]], 13: [[2, 1, 2, false]], 14: [[3, 2, 3, false]],
}

function traceField(field, W, H, t = 0.5) {
  const pt = new Map()
  const next = new Map()
  const corner = [[0, 0], [1, 0], [1, 1], [0, 1]]
  // the first and last column of each row with any of the letter in it: a cell whose four
  // corners all lie outside those spans is empty and is never looked at
  const first = new Int32Array(H).fill(W)
  const last = new Int32Array(H).fill(-1)
  for (let y = 0; y < H; y++) {
    const row = y * W
    let x = 0
    while (x < W && !(field[row + x] > t)) x++
    if (x === W) continue
    first[y] = x
    x = W - 1
    while (!(field[row + x] > t)) x--
    last[y] = x
  }
  for (let y = 0; y < H - 1; y++) {
    const from = Math.max(0, Math.min(first[y], first[y + 1]) - 1)
    const to = Math.min(W - 2, Math.max(last[y], last[y + 1]))
    for (let x = from; x <= to; x++) {
      const a = field[y * W + x]
      const b = field[y * W + x + 1]
      const c = field[(y + 1) * W + x + 1]
      const d = field[(y + 1) * W + x]
      const code = (a > t ? 8 : 0) | (b > t ? 4 : 0) | (c > t ? 2 : 0) | (d > t ? 1 : 0)
      if (code === 0 || code === 15) continue
      let segs = CASES[code]
      if (code === 5 || code === 10) {
        const mid = (a + b + c + d) / 4 > t
        segs = code === 5
          ? (mid ? [[3, 0, 0, false], [2, 1, 2, false]] : [[0, 1, 1, true], [3, 2, 3, true]])
          : (mid ? [[0, 1, 1, false], [3, 2, 3, false]] : [[3, 0, 0, true], [2, 1, 2, true]])
      }
      const edge = (e) => {
        if (e === 0) return [(y * W + x) * 2, x + (t - a) / (b - a), y]
        if (e === 1) return [(y * W + x + 1) * 2 + 1, x + 1, y + (t - b) / (c - b)]
        if (e === 2) return [((y + 1) * W + x) * 2, x + (t - d) / (c - d), y + 1]
        return [(y * W + x) * 2 + 1, x, y + (t - a) / (d - a)]
      }
      for (const [e0, e1, k, inside] of segs) {
        let p = edge(e0)
        let q = edge(e1)
        // inside always on the right of the step from p to q (y down)
        const cx = x + corner[k][0] - p[1]
        const cy = y + corner[k][1] - p[2]
        const z = (q[1] - p[1]) * cy - (q[2] - p[2]) * cx
        if ((inside && z < 0) || (!inside && z > 0)) [p, q] = [q, p]
        pt.set(p[0], [p[1], p[2]])
        pt.set(q[0], [q[1], q[2]])
        next.set(p[0], q[0])
      }
    }
  }
  const loops = []
  for (const start of next.keys()) {
    if (!next.has(start)) continue
    const loop = []
    let id = start
    while (next.has(id)) {
      loop.push(pt.get(id))
      const to = next.get(id)
      next.delete(id)
      id = to
    }
    if (loop.length > 2) loops.push(loop)
  }
  return loops
}

// Ramer-Douglas-Peucker on a closed loop
function simplifyLoop(loop, eps) {
  const rdp = (pts) => {
    if (pts.length < 3) return pts
    const [ax, ay] = pts[0]
    const [bx, by] = pts[pts.length - 1]
    const len = Math.hypot(bx - ax, by - ay) || 1e-9
    let worst = 0
    let at = 0
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / len
      if (d > worst) { worst = d; at = i }
    }
    if (worst <= eps) return [pts[0], pts[pts.length - 1]]
    const left = rdp(pts.slice(0, at + 1))
    return left.slice(0, -1).concat(rdp(pts.slice(at)))
  }
  const half = Math.floor(loop.length / 2)
  const a = rdp(loop.slice(0, half + 1))
  const b = rdp(loop.slice(half).concat([loop[0]]))
  return a.slice(0, -1).concat(b.slice(0, -1))
}

const signedArea = (pts) => {
  let s = 0
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += (pts[j].x * pts[i].y) - (pts[i].x * pts[j].y)
  return s / 2
}
const contains = (pts, p) => {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i]
    const b = pts[j]
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

// Tracing is the slow part, and a piece's letters never change: their shapes are kept, keyed by
// the piece's own coverage, so returning to the corridor (Back from a page) does not trace again.
const tracedShapes = new Map()
function coverageKey(data, W, H) {
  let a = 0x811c9dc5
  let b = 0x9e3779b9
  for (let i = 3; i < data.length; i += 4) {
    a = Math.imul(a ^ data[i], 0x01000193)
    b = Math.imul(b ^ data[i], 0x85ebca6b) ^ (b >>> 13)
  }
  return `${W}x${H}:${(a >>> 0).toString(36)}:${(b >>> 0).toString(36)}`
}

/**
 * The shapes of each colour of a piece of lettering, in metres about its centre (y up), and
 * a soft shadow of the whole as a texture. `draw` is the same pen-in-metres function the
 * painted graphics use.
 */
export function traceLettering(width, height, draw, { ppm = 400 } = {}) {
  const scale = Math.min(ppm, 6000 / Math.max(width, height))
  const pad = Math.round(scale * 0.15)          // italic tails and descenders reach past the box
  const W = Math.round(width * scale) + pad * 2
  const H = Math.round(height * scale) + pad * 2
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d', { willReadFrequently: true })
  // which colours the piece is written in
  const seen = new Set()
  g.save()
  g.translate(pad, pad)
  draw(new MaskPen(g, scale, null, seen), { width, height })
  g.restore()
  const all = g.getImageData(0, 0, W, H).data
  const key = `${width}|${height}|${scale}|${[...seen].join(',')}|${coverageKey(all, W, H)}`
  const groups = tracedShapes.get(key) || []
  if (!tracedShapes.has(key)) for (const color of seen) {
    g.clearRect(0, 0, W, H)
    g.save()
    g.translate(pad, pad)
    draw(new MaskPen(g, scale, color, null), { width, height })
    g.restore()
    const px = g.getImageData(0, 0, W, H).data
    const field = new Float32Array(W * H)
    for (let i = 0; i < W * H; i++) field[i] = px[i * 4 + 3] / 255
    const loops = traceField(field, W, H).map((loop) => simplifyLoop(loop, 0.3).map(([x, y]) => new THREE.Vector2((x - pad) / scale - width / 2, height / 2 - (y - pad) / scale)))
    const outers = []
    const holes = []
    for (const pts of loops) {
      if (pts.length < 3) continue
      const area = signedArea(pts)
      if (Math.abs(area) < 1e-7) continue
      // traced with the letter on the right of each step, outlines come out clockwise in y-up (negative)
      ;(area < 0 ? outers : holes).push({ pts, area: Math.abs(area) })
    }
    outers.sort((a, b) => a.area - b.area)
    const shapes = outers.map((o) => ({ ...o, shape: new THREE.Shape(o.pts) }))
    for (const h of holes) {
      const home = shapes.find((o) => o.area > h.area && contains(o.pts, h.pts[0]))
      if (home) home.shape.holes.push(new THREE.Path(h.pts))
    }
    if (shapes.length) groups.push({ color, shapes: shapes.map((s) => s.shape) })
  }
  tracedShapes.set(key, groups)
  // the shadow: the whole piece's coverage, softened
  const field = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) field[i] = all[i * 4 + 3] / 255
  blurField(field, W, H, Math.max(2, Math.round(scale * 0.012)))
  const s = document.createElement('canvas')
  s.width = W
  s.height = H
  const sg = s.getContext('2d')
  const img = sg.createImageData(W, H)
  const data = img.data
  for (let i = 0; i < W * H; i++) {
    const v = Math.min(255, field[i] * 255)
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v
    data[i * 4 + 3] = 255
  }
  sg.putImageData(img, 0, 0)
  const shadow = new THREE.CanvasTexture(s)
  shadow.colorSpace = THREE.NoColorSpace
  return { groups, shadow, size: [W / scale, H / scale] }
}
