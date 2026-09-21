/*
 * Generates src/theme/dark-web.css — the authored dark counterpart of the Web Experience.
 *
 * The light stylesheets (src/styles.css, src/pages/Project.css) stay untouched. For every web-scope rule that
 * paints a colour, this script emits one dark override that maps the colour by ROLE (text, surface, border,
 * shadow, svg art) onto the tokens defined in src/theme/theme.css. Nothing is inverted blindly:
 *   - light text roles become the dark theme's text ramp (--text / --text-2 / --text-3),
 *   - cream and white surfaces become the dark surface ramp (--bg / --panel-solid / translucent white washes),
 *   - navy hairlines and grid lines become white hairlines with the same alpha,
 *   - cobalt accent fills are kept, accent TEXT is lifted to --accent-text for contrast,
 *   - surfaces that are already dark (footer, dark cards, dark pills) are left alone.
 *
 * Every generated selector is confined to the Web Experience surfaces (.route-page, .entry-gate--intro), so the
 * corridor, its rooms and its immersive HUD can never be reached by it.
 *
 * Run:  node scripts/generate-dark-theme.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SOURCES = ['src/styles.css', 'src/pages/Project.css']
const OUT = 'src/theme/dark-web.css'

/* ---------- selectors that must never receive a dark override ---------- */
const CORRIDOR = /\.experience-root(?!--)|\.room-|\.wall-|\.corridor|\.entry-door|\.entry-portal|\.work-led|\.work-wall|\.contact-room|\.experience-intro|\.experience-mark|\.scroll-hint|\.topbar--immersive|\.gallery-|\.door-/
const LEGACY_HEADER = /\.topbar|\.nav(?![\w-])|\.nav-toggle|\.mobile-nav|\.brand(?![\w-])|\.brand-dot|\.skip-link/
const LOADING = /\.entry-loading|(?<!:not\()\.entry-gate--loading/   // the loading screen is a separate task; ":not(.entry-gate--loading)" is the intro state and is kept
const MOCKUP = /\.browser-shot|\.mobile-shot|\.detail-laptop|\.laptop-device|\.work-feature__view|\.web-scrollbar/
const DARK_NATIVE = /\.footer|work-feature--stage|work-feature--circuit|\.pill--dark|\.pill--primary|\.entry-gallery-cta|\.evidence-frame__stamp|\.evidence-frame__hero|\.skip-link/
const skipPart = (p) => CORRIDOR.test(p) || LEGACY_HEADER.test(p) || LOADING.test(p) || MOCKUP.test(p) || DARK_NATIVE.test(p)

/* ---------- colour helpers ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const r3 = (n) => Math.round(n * 1000) / 1000
function parseColor(str) {
  str = str.trim().toLowerCase()
  let m
  if ((m = str.match(/^#([0-9a-f]{3,8})$/))) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('')
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }
  }
  if ((m = str.match(/^rgba?\(([^)]*)\)$/))) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map((x) => (x.endsWith('%') ? parseFloat(x) / 100 : parseFloat(x)))
    return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] }
  }
  return null
}
const lum = ({ r, g, b }) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function hsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2
  if (mx === mn) return { h: 0, s: 0, l }
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: h * 60, s, l }
}
function fromHsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('')
}
const isAccent = (c) => { const { h, s, l } = hsl(c); return h >= 215 && h <= 262 && s > 0.4 && l >= 0.2 && l <= 0.72 }   // cobalt family only: pale blue washes (#e9edf7) are surfaces, not accent
const isWhite = (c) => c.r >= 250 && c.g >= 250 && c.b >= 250
const isNavy = (c) => c.r < 70 && c.g < 80 && c.b < 95 && c.b >= c.r    // ink and its tints (9,17,29) (17,26,38) (24,32,44) ...
const isWarmDark = (c) => c.r >= c.b && lum(c) < 0.25                   // brown-ish shadows (51,42,31) (24,20,14) (0,0,0)

/* ---------- role mappers: return replacement string or null to keep ---------- */
const alpha = (a) => (a >= 1 ? '' : ` / ${r3(a)}`)
const mappers = {
  text(c) {
    if (c.a < 0.05 || lum(c) >= 0.6) return null
    if (isAccent(c)) return c.a < 1 ? `rgb(var(--accent-text-rgb)${alpha(c.a)})` : 'var(--accent-text)'
    const { h, s } = hsl(c)
    const navyFamily = h >= 195 && h <= 250 && s <= 0.6                  // the ink and its slate greys: they take the text ramp
    if (!navyFamily && s > 0.35) return fromHsl(h, clamp(s, 0.5, 0.85), 0.72)   // saturated status colours (red, gold): lift, keep hue
    const L = lum(c)
    const tok = L < 0.03 ? 'text' : L < 0.175 ? 'text-2' : 'text-3'
    return c.a < 1 ? `rgb(var(--${tok}-rgb)${alpha(c.a)})` : `var(--${tok})`
  },
  bg(c) {
    if (c.a === 0 || isAccent(c)) return null
    if (isWhite(c)) return c.a >= 0.96 ? 'var(--panel-solid)' : `rgb(255 255 255 / ${r3(c.a * 0.16)})`
    if (isNavy(c)) return c.a <= 0.3 ? `rgb(255 255 255 / ${r3(c.a)})` : null    // light-theme shading becomes a light wash; dark overlays stay
    const L = lum(c)
    if (L >= 0.72) {
      const warm = c.r - c.b > 10
      if (c.a < 0.95) return `rgb(var(--bg-rgb)${alpha(c.a)})`
      return warm && L > 0.78 ? 'var(--bg)' : 'var(--panel-solid)'
    }
    return null
  },
  border(c) {
    if (c.a === 0 || isAccent(c)) return null
    if (isNavy(c)) return `rgb(255 255 255 / ${r3(Math.min(0.32, c.a))})`
    if (lum(c) >= 0.72 && !isWhite(c)) return 'var(--line)'
    return null
  },
  shadow(c) {
    if (c.a === 0 || isAccent(c) || isWhite(c)) return null
    if (isNavy(c) || isWarmDark(c)) return `rgb(0 0 0 / ${r3(Math.min(0.6, c.a * 2.3))})`
    return null
  },
  svg(c) {
    if (c.a === 0 || isAccent(c)) return null
    if (isNavy(c)) return `rgb(255 255 255 / ${r3(c.a)})`
    if (isWhite(c)) return `rgb(255 255 255 / ${r3(c.a * 0.16)})`
    const L = lum(c)
    if (L >= 0.78 && c.r - c.b > 10) return 'var(--bg)'
    if (L >= 0.06 && L < 0.3 && Math.abs(c.r - c.b) < 30) return 'var(--text-3)'
    return null
  },
}
const roleFor = (prop) => {
  if (prop === 'color') return 'text'
  if (/^background/.test(prop) || prop === '--surface') return 'bg'
  if (/^border|^outline/.test(prop)) return 'border'
  if (prop === 'box-shadow' || prop === 'text-shadow' || prop === 'filter') return 'shadow'
  if (prop === 'fill' || prop === 'stroke') return 'svg'
  return null
}
const COLOR_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|rgba?\([^)]*\)/g

function mapValue(prop, value) {
  const role = roleFor(prop)
  if (!role) return null
  let changed = false
  const out = value.replace(COLOR_RE, (tok) => {
    const c = parseColor(tok)
    if (!c) return tok
    const rep = mappers[role](c)
    if (rep == null) return tok
    changed = true
    return rep
  })
  return changed ? out : null
}

/* ---------- CSS parsing (comments stripped, @media/@supports flattened, other at-rules skipped) ---------- */
function parse(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  const stack = []
  let i = 0, buf = ''
  while (i < css.length) {
    const ch = css[i]
    if (ch === '{') {
      const head = buf.replace(/\s+/g, ' ').trim(); buf = ''
      if (head.startsWith('@media') || head.startsWith('@supports')) stack.push(head)
      else if (head.startsWith('@')) { let d = 1, j = i + 1; while (j < css.length && d) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++ } i = j; continue }
      else { const j = css.indexOf('}', i); rules.push({ media: stack[stack.length - 1] || '', selector: head, body: css.slice(i + 1, j) }); i = j }
    } else if (ch === '}') { stack.pop(); buf = '' } else buf += ch
    i++
  }
  return rules
}
function splitSelectors(sel) {
  const parts = []; let depth = 0, cur = ''
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++
    if (ch === ')' || ch === ']') depth--
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = '' } else cur += ch
  }
  if (cur.trim()) parts.push(cur.trim())
  return parts
}
const DARK = 'html[data-theme="dark"]'
function scopePart(p) {
  if (/^(html|body|:root)\b/.test(p)) return null                       // handled by hand in theme.css
  if (p.startsWith('.route-page') || p.startsWith('.entry-gate--intro')) return `${DARK} ${p}`
  if (p.startsWith('.entry-gate')) return `${DARK} ${p.replace(/^\.entry-gate/, '.entry-gate:not(.entry-gate--loading)')}`
  // descendant of a Web surface, or (for classes such as .case-page that sit on the route-page root itself) the same element
  return /^[.[]/.test(p)
    ? `${DARK} :is(.route-page,.entry-gate--intro) ${p},
${DARK} :is(.route-page,.entry-gate--intro)${p}`
    : `${DARK} :is(.route-page,.entry-gate--intro) ${p}`
}

/* ---------- build ---------- */
const emitted = []
for (const file of SOURCES) {
  for (const rule of parse(readFileSync(file, 'utf8'))) {
    const parts = splitSelectors(rule.selector).filter((p) => !skipPart(p))
    const scoped = parts.map(scopePart).filter(Boolean)
    if (!scoped.length) continue
    const decls = []
    for (const d of rule.body.split(';')) {
      const k = d.indexOf(':'); if (k < 0) continue
      const prop = d.slice(0, k).trim(), raw = d.slice(k + 1).trim()
      const important = /!important\s*$/.test(raw)
      const val = raw.replace(/\s*!important\s*$/, '')
      const mapped = mapValue(prop, val)
      if (mapped != null) decls.push(`${prop}:${mapped}${important || prop === '--surface' ? '!important' : ''}`)
    }
    if (decls.length) emitted.push({ media: rule.media, css: `${scoped.join(',\n')}{${decls.join(';')}}` })
  }
}
let out = `/* GENERATED by scripts/generate-dark-theme.mjs — do not edit by hand; edit the generator or theme.css, then re-run.\n   Dark counterpart of the Web Experience. Confined to .route-page / .entry-gate--intro; the corridor is unreachable from here. */\n`
let openMedia = ''
for (const e of emitted) {
  if (e.media !== openMedia) { if (openMedia) out += '}\n'; if (e.media) out += `${e.media}{\n`; openMedia = e.media }
  out += e.css + '\n'
}
if (openMedia) out += '}\n'

/* Page-scoped hand-authored locks that depend on theme variables rather than literal-colour mapping. */
out += `\n/* Page-scoped About lock: the generated legacy hero gradient must not override the Splash-derived system. */\nhtml[data-theme="dark"] .route-page--about{background:var(--splash-surface);color:var(--text)}\nhtml[data-theme="dark"] .route-page--about .route-hero--about{background:var(--splash-surface);border-bottom-color:var(--about-line-soft)}\nhtml[data-theme="dark"] .route-page--about .route-hero--about:before{background-image:linear-gradient(90deg,var(--splash-grid) 1px,transparent 1px)}\nhtml[data-theme="dark"] .route-page--about .route-hero h1 em{color:var(--accent-text)}\nhtml[data-theme="dark"] .route-page--about .route-hero__ledger{background:rgb(18 28 45 / .72);border-color:var(--about-line);box-shadow:0 20px 54px rgb(0 0 0 / .2)}\nhtml[data-theme="dark"] .route-page--about .about-blueprint__selection rect:not(:first-child){fill:#0c1322}\nhtml[data-theme="dark"] .route-page--about .about-blueprint__flow-dot--end{fill:#0c1322}\nhtml[data-theme="dark"] .route-page--about .about-practice-card,\nhtml[data-theme="dark"] .route-page--about .timeline-list--premium article,\nhtml[data-theme="dark"] .route-page--about .tool-grid--premium>div{border-color:var(--about-line);box-shadow:0 22px 62px rgb(0 0 0 / .18)}\nhtml[data-theme="dark"] .route-page--about .about-experience-card__icon{background:rgb(142 160 255 / .09);border-color:rgb(142 160 255 / .2);color:var(--accent-text)}\nhtml[data-theme="dark"] .route-page--about .about-continuity strong,\nhtml[data-theme="dark"] .route-page--about .timeline-list h3,\nhtml[data-theme="dark"] .route-page--about .tool-grid h3{color:var(--text)}\nhtml[data-theme="dark"] .route-page--about .about-section__lead,\nhtml[data-theme="dark"] .route-page--about .about-practice-card>p,\nhtml[data-theme="dark"] .route-page--about .timeline-list p,\nhtml[data-theme="dark"] .route-page--about .tool-grid p{color:var(--text-2)}\n`

writeFileSync(OUT, out)
console.log(`${emitted.length} dark rules written to ${OUT} (${(out.length / 1024).toFixed(1)} KB)`)
