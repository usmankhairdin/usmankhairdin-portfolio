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
forme: {"light":{"ink":"#282923","ink2":"#595a50","s1":"#f7f5ef","s2":"#e9e3d7","panel":"#fffdf8","line":"#c9c1b2","accent":"#a63720","soft":"#f0dfd3","close":"#171714","closeInk":"#f4f0e8","closeInk2":"#c4c0b4","closeAccent":"#ff9b80","cta":"#ee6043","ctaInk":"#11110e","deco":"#ee6043"},"dark":{"ink":"#f4f0e8","ink2":"#c4c0b4","s1":"#0e0e0d","s2":"#171714","panel":"#24241f","line":"#505044","accent":"#ff9b80","soft":"#453027","close":"#262620","closeInk":"#f4f0e8","closeInk2":"#c4c0b4","closeAccent":"#ff9b80","cta":"#ee6043","ctaInk":"#11110e","deco":"#ee6043"}},
  meridian: {
    light: {ink:'#14243a',ink2:'#4c6074',s1:'#f3f8f7',s2:'#e2eee9',panel:'#ffffff',line:'#bbcec7',accent:'#116443',soft:'#d5eee1',close:'#101a30',closeInk:'#f3f6ff',closeInk2:'#b6c2d8',closeAccent:'#5df0a8',cta:'#5df0a8',ctaInk:'#032018',deco:'#5df0a8'},
    dark: {ink:'#f3f6ff',ink2:'#a6b1cc',s1:'#04060f',s2:'#0b1122',panel:'#101a30',line:'#34455c',accent:'#5df0a8',soft:'#173c32',close:'#101a30',closeInk:'#f3f6ff',closeInk2:'#b6c2d8',closeAccent:'#5df0a8',cta:'#5df0a8',ctaInk:'#032018',deco:'#5df0a8'},
  },
  nexora: {
    light: {ink:'#182039',ink2:'#505b74',s1:'#f4f6fc',s2:'#e6edf5',panel:'#ffffff',line:'#c0cadc',accent:'#07596c',soft:'#d6eef3',close:'#10162b',closeInk:'#eef0f6',closeInk2:'#b9becf',closeAccent:'#7beeff',cta:'#00e5ff',ctaInk:'#071321',deco:'#895cff'},
    dark: {ink:'#eef0f6',ink2:'#b9becf',s1:'#070914',s2:'#0b1020',panel:'#10162b',line:'#35415d',accent:'#7beeff',soft:'#143443',close:'#10162b',closeInk:'#eef0f6',closeInk2:'#b9becf',closeAccent:'#7beeff',cta:'#00e5ff',ctaInk:'#071321',deco:'#895cff'},
  },
 carthevia: {
  light:{ink:'#30251e',ink2:'#6b5546',s1:'#faf7f0',s2:'#f0e8dd',panel:'#fffdf8',line:'#d8c6b4',accent:'#a74323',soft:'#f0ddcc',close:'#34261e',closeInk:'#fff8ed',closeInk2:'#d8c8b8',closeAccent:'#ffb284',cta:'#f4b187',ctaInk:'#332219',deco:'#df9162'},
  dark:{ink:'#fff5e9',ink2:'#cdb9a8',s1:'#211b17',s2:'#30261f',panel:'#3b2e25',line:'#66503e',accent:'#ffb78b',soft:'#513827',close:'#34261e',closeInk:'#fff8ed',closeInk2:'#d8c8b8',closeAccent:'#ffb284',cta:'#f4b187',ctaInk:'#332219',deco:'#df9162'},
 },
  avenlo: {
    light: {ink:'#15244d',ink2:'#4c5b7b',s1:'#f7f8ff',s2:'#e9edff',panel:'#ffffff',line:'#c3cdec',accent:'#2645ad',soft:'#dce5ff',close:'#243a83',closeInk:'#f7f9ff',closeInk2:'#cbd6f4',closeAccent:'#ccd7ff',cta:'#dbe5ff',ctaInk:'#15244d',deco:'#849ae9'},
    dark: {ink:'#f1f4ff',ink2:'#b8c4e2',s1:'#151d3c',s2:'#1d2950',panel:'#25335d',line:'#485b8b',accent:'#b4c5ff',soft:'#304170',close:'#243a83',closeInk:'#f7f9ff',closeInk2:'#cbd6f4',closeAccent:'#ccd7ff',cta:'#dbe5ff',ctaInk:'#15244d',deco:'#849ae9'},
  },
  forma: {
    light: {ink:'#251d43',ink2:'#60566e',s1:'#f7f5fc',s2:'#e6e3f4',panel:'#fdfbff',line:'#c9c0df',accent:'#64509f',soft:'#e5dcf5',close:'#211a3b',closeInk:'#f5f1ff',closeInk2:'#c5bdd9',closeAccent:'#bdabf1',cta:'#d2c3fa',ctaInk:'#241a42',deco:'#9e89df'},
    dark: {ink:'#f0edfc',ink2:'#bab3cd',s1:'#101126',s2:'#19182f',panel:'#211f3a',line:'#45405e',accent:'#bfa9f2',soft:'#33294b',close:'#251e40',closeInk:'#f5f1ff',closeInk2:'#c5bdd9',closeAccent:'#bdabf1',cta:'#d2c3fa',ctaInk:'#241a42',deco:'#9e89df'},
  },
  veyravael: {
    light: {ink:'#2e3028',ink2:'#606254',s1:'#f7f5ed',s2:'#e9e5da',panel:'#fdfbf4',line:'#cbc6b6',accent:'#72613b',soft:'#e5dfce',close:'#30372d',closeInk:'#f5f3e9',closeInk2:'#c6cbb9',closeAccent:'#d8caa3',cta:'#ded4b6',ctaInk:'#30372d',deco:'#a1a48a'},
    dark: {ink:'#f2f0e6',ink2:'#c1c4b5',s1:'#20241e',s2:'#2a3027',panel:'#31382d',line:'#515b48',accent:'#d1c093',soft:'#464735',close:'#30372d',closeInk:'#f5f3e9',closeInk2:'#c6cbb9',closeAccent:'#d8caa3',cta:'#ded4b6',ctaInk:'#30372d',deco:'#a1a48a'},
  },
  sanaira: {
    light: { ink: '#223c36', ink2: '#51665e', s1: '#f7f4e9', s2: '#e2e9d9', panel: '#fffcf3', line: '#b9c7b4', accent: '#3a6c61', soft: '#dce5d3', close: '#203e32', closeInk: '#f3f0df', closeInk2: '#c5d2be', closeAccent: '#dec79f', cta: '#d0dabb', ctaInk: '#253d2d', deco: '#8eaa99' },
    dark: { ink: '#f0eddf', ink2: '#b8cbc0', s1: '#142d27', s2: '#203e32', panel: '#233d33', line: '#466759', accent: '#d9bb91', soft: '#2d4a3c', close: '#132f24', closeInk: '#f0f1df', closeInk2: '#bad0b2', closeAccent: '#d9c9a0', cta: '#d1dfb7', ctaInk: '#203729', deco: '#a2c4b7' },
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
