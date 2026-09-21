/*
 * Project brand palettes for the BODY of each project's case-study page (everything below the hero).
 *
 * The layout, typography and components stay UKD's; only the colour language comes from the real project. Each palette was curated from
 * the project's live site (its CSS variables, dominant surfaces, headline / body / button colours), not copied raw: brand colours become
 * pale surfaces in the light theme and deep, brand-derived surfaces in the dark theme, and are only used as TEXT where they meet contrast.
 *
 * Keyed by the project's stable slug. A project without an entry simply keeps the generic UKD body colours, so new projects can be added
 * later by adding one entry here — no page changes, no fixed project count.
 *
 * Tokens (per theme):
 *   ink / ink2   primary / secondary text          s1 / s2   primary / secondary section surface (the rhythm: s1 → s2 → close)
 *   panel        card fill                          line      hairlines and borders
 *   accent       brand colour safe for small text   soft      tint for tags / notes
 *   close        the highlight section (brand's strongest surface)   closeInk / closeInk2   its text   closeAccent   small accent text on it
 *   cta / ctaInk the primary button on it           deco      decorative glow colour
 */
export const PROJECT_BRANDS = {
  // primaapp.com — cool white UI, ink #0a0c10, blue #2563eb / #1d4ed8, theme gradient cyan #4bcfff → navy #002454
  prima: {
    light: { ink: '#0a0c10', ink2: '#475569', s1: '#f3f6fc', s2: '#e5ecf9', panel: '#fbfcff', line: '#c9d6ee', accent: '#1d4ed8', soft: '#dbe6fc', close: '#002454', closeInk: '#f4f8ff', closeInk2: '#b7c9e8', closeAccent: '#4bcfff', cta: '#4bcfff', ctaInk: '#00193d', deco: '#4bcfff' },
    dark: { ink: '#eaf0ff', ink2: '#a9b7d6', s1: '#0b1226', s2: '#0f1a36', panel: '#131f3f', line: '#26365f', accent: '#4bcfff', soft: '#15305a', close: '#002454', closeInk: '#f4f8ff', closeInk2: '#b7c9e8', closeAccent: '#4bcfff', cta: '#4bcfff', ctaInk: '#00193d', deco: '#4bcfff' },
  },
  // BizCare — navy #0a1d2d, indigo #2a3396, cyan surfaces #f0f4f4 / #ddeded, teal #139da0, warm yellow CTA #ffe169
  bizcare: {
    light: { ink: '#0a1d2d', ink2: '#3d5566', s1: '#f0f4f4', s2: '#dfeeee', panel: '#fbfefe', line: '#bcd6d6', accent: '#0a6568', soft: '#cbe7e7', close: '#0a1d2d', closeInk: '#f0f4f4', closeInk2: '#a9bfcc', closeAccent: '#ffe169', cta: '#ffe169', ctaInk: '#0a1d2d', deco: '#139da0' },
    dark: { ink: '#e8f3f3', ink2: '#9fbcc0', s1: '#0a181f', s2: '#0d2229', panel: '#102b34', line: '#1f4a56', accent: '#3ec6c9', soft: '#12414a', close: '#1e2a78', closeInk: '#f0f4f8', closeInk2: '#b9c3ee', closeAccent: '#ffe169', cta: '#ffe169', ctaInk: '#0a1d2d', deco: '#3ec6c9' },
  },
  // bansarchina.com — navy #173284, orange #f78619, neutral greys #f6f6f6 / #eff0f4, ink #222 / #333
  bansar: {
    light: { ink: '#1b2033', ink2: '#4a5164', s1: '#f7f4ee', s2: '#eee4d3', panel: '#fffdf9', line: '#dccfba', accent: '#173284', soft: '#f9e2c4', close: '#173284', closeInk: '#ffffff', closeInk2: '#c7d1ef', closeAccent: '#ffa44a', cta: '#f78619', ctaInk: '#1a0f02', deco: '#f78619' },
    dark: { ink: '#f4ece0', ink2: '#c2b5a3', s1: '#15100b', s2: '#1e1710', panel: '#261d14', line: '#3d2f21', accent: '#f78619', soft: '#3a2712', close: '#1a2f76', closeInk: '#ffffff', closeInk2: '#c7d1ef', closeAccent: '#ffa44a', cta: '#f78619', ctaInk: '#1a0f02', deco: '#f78619' },
  },
  // rantle.com — deep teal-blue #05496b, orange #f78619, light grey #f3f3f3, ink #181818 / #343a3b
  rantle: {
    light: { ink: '#0d1a22', ink2: '#3b505e', s1: '#eef3f6', s2: '#dce8ee', panel: '#fbfdfe', line: '#c2d3de', accent: '#05496b', soft: '#cde0ea', close: '#05496b', closeInk: '#ffffff', closeInk2: '#bcd8e6', closeAccent: '#ff9d3d', cta: '#f78619', ctaInk: '#1a0f02', deco: '#f78619' },
    dark: { ink: '#e9f2f7', ink2: '#9db8c7', s1: '#08161f', s2: '#0b1f2c', panel: '#0e2634', line: '#1c3d52', accent: '#58b6e0', soft: '#123549', close: '#05496b', closeInk: '#ffffff', closeInk2: '#bcd8e6', closeAccent: '#ff9d3d', cta: '#f78619', ctaInk: '#1a0f02', deco: '#f78619' },
  },
  // Bum.Life — a naturally dark brand: near-black #191919 / #202020 / #0f0f0f, yellow #ffdb26 (dark contrast #111827), white text.
  // It stays dark in BOTH themes (a pale body would misrepresent it); the light-theme variant is only a little warmer.
  'bum-life': {
    light: { ink: '#ffffff', ink2: '#d1d5db', s1: '#171614', s2: '#1f1e1b', panel: '#262521', line: '#3b3a35', accent: '#ffdb26', soft: '#37300f', close: '#ffdb26', closeInk: '#111827', closeInk2: '#3d3711', closeAccent: '#111827', cta: '#111827', ctaInk: '#ffffff', deco: '#ffdb26' },
    dark: { ink: '#ffffff', ink2: '#cfd3da', s1: '#0f0f0f', s2: '#151515', panel: '#1b1b1b', line: '#2f2f2f', accent: '#ffdb26', soft: '#2c270b', close: '#ffdb26', closeInk: '#111827', closeInk2: '#3d3711', closeAccent: '#111827', cta: '#111827', ctaInk: '#ffffff', deco: '#ffdb26' },
  },
  // PNWLeads — blue #2563eb, orange #f97316, green #16a34a accents, ink #111827, grey #4b5563, page #f9fafb, pale chips #dbeafe / #ffedd5
  'pnw-leads': {
    light: { ink: '#111827', ink2: '#4b5563', s1: '#f5f8fd', s2: '#e6eefb', panel: '#ffffff', line: '#cddcf3', accent: '#1d4ed8', soft: '#dbeafe', close: '#111827', closeInk: '#ffffff', closeInk2: '#c9d1e0', closeAccent: '#ff9a55', cta: '#f97316', ctaInk: '#1a0e04', deco: '#f97316' },
    dark: { ink: '#e8eefc', ink2: '#a6b4d2', s1: '#0a1224', s2: '#0e1a33', panel: '#122040', line: '#203764', accent: '#6ea0ff', soft: '#163060', close: '#16305f', closeInk: '#ffffff', closeInk2: '#b8c6e6', closeAccent: '#ff9a55', cta: '#f97316', ctaInk: '#1a0e04', deco: '#f97316' },
  },
}

export const brandFor = (project) => PROJECT_BRANDS[project.slug] || null

const TOKENS = ['ink', 'ink2', 's1', 's2', 'panel', 'line', 'accent', 'soft', 'close', 'closeInk', 'closeInk2', 'closeAccent', 'cta', 'ctaInk', 'deco']

// "r g b" of a #rrggbb colour, for the places that need an alpha channel (the browser frame's hairline, dots and url pill).
const rgbTriple = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ')

/** Both themes' tokens as CSS custom properties (--pt-l-* / --pt-d-*); the stylesheet picks the active theme's set. */
export const brandStyle = (brand) => {
  const style = {}
  for (const token of TOKENS) {
    style[`--pt-l-${token}`] = brand.light[token]
    style[`--pt-d-${token}`] = brand.dark[token]
  }
  style['--pt-l-inkRgb'] = rgbTriple(brand.light.ink)
  style['--pt-d-inkRgb'] = rgbTriple(brand.dark.ink)
  return style
}
