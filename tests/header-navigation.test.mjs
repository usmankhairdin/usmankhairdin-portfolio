import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { createServer } from 'vite'

// SSR only reads the initial saved theme; effects and browser input are checked
// in the real local preview. No routing, header or theme components are mocked.
globalThis.document = { documentElement: { getAttribute: () => 'light' } }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { default: Header } = await server.ssrLoadModule('/src/components/Header.jsx')
const { ThemeProvider } = await server.ssrLoadModule('/src/theme/ThemeProvider.jsx')
const { ActionLink } = await server.ssrLoadModule('/src/components/ui/Action.jsx')
const { default: SectionIntro } = await server.ssrLoadModule('/src/components/ui/SectionIntro.jsx')
after(async () => { await server.close(); delete globalThis.document })

const render = (location, immersive = false) => renderToStaticMarkup(
  React.createElement(StaticRouter, { location },
    React.createElement(ThemeProvider, null, React.createElement(Header, { immersive }))),
)
const headerBand = (html) => html.match(/<header\b[\s\S]*?<\/header>/)?.[0] || ''

test('every Web header exposes direct corridor entry after Rescue, before utility controls', () => {
  for (const path of ['/web/', '/about/', '/work/sanaira/', '/contact/']) {
    const band = headerBand(render(path))
    const corridor = band.match(/<a\b[^>]*class="[^"]*hdr-corridor[^>]*>[\s\S]*?<\/a>/)?.[0]
    assert.ok(corridor, `Direct corridor entry missing on ${path}`)
    assert.match(corridor, /href="\/"/, 'Corridor must lead to the existing immersive entrance')
    assert.ok(band.indexOf('hdr-rescue') < band.indexOf('hdr-corridor'))
    assert.ok(band.indexOf('hdr-corridor') < band.indexOf('hdr-theme'))
  }
})

test('Web drawer does not duplicate the direct corridor action', () => {
  const html = render('/web/')
  const drawer = html.slice(html.indexOf('<aside'))
  assert.doesNotMatch(drawer, />3D Corridor</)
  assert.match(drawer, />About</)
  assert.match(drawer, />Work</)
  assert.match(drawer, />Send a brief/)
})

test('immersive header remains menu-only with its Web Experience exit', () => {
  const html = render('/', true)
  const band = headerBand(html)
  assert.doesNotMatch(band, /hdr-corridor|hdr-rescue|hdr-theme/)
  assert.match(band, /hdr-menu/)
  assert.match(html, />Web Experience</)
})

test('action arrows carry motion coordinates matching the visible arrow, not a fixed diagonal', () => {
  for (const [glyph, x, y] of [['→', '3px', '0px'], ['↗', '3px', '-3px'], ['↓', '0px', '3px'], ['←', '-3px', '0px']]) {
    const html = renderToStaticMarkup(React.createElement(ActionLink, { href: '#section' },
      'Explore ', React.createElement('span', { 'aria-hidden': true }, glyph)))
    assert.ok(html.includes(`--action-arrow-x:${x}`), `${glyph} has the wrong horizontal motion`)
    assert.ok(html.includes(`--action-arrow-y:${y}`), `${glyph} has the wrong vertical motion`)
    assert.match(html, /data-action-arrow="true"/)
  }
})

test('action labels do not get mistaken for moving arrow glyphs', () => {
  const html = renderToStaticMarkup(React.createElement(ActionLink, { href: '#section' },
    React.createElement('span', null, 'Explore selected work')))
  assert.doesNotMatch(html, /data-action-arrow|--action-arrow-/)
})

test('section intro keeps its heading and explanation together, apart from optional actions', () => {
  const html = renderToStaticMarkup(React.createElement(SectionIntro,
    { eyebrow: 'Selected work', title: 'Built for people', intro: 'Real interfaces and clear decisions.' },
    React.createElement('a', { href: '/work/' }, 'See all work')))
  const copy = html.match(/<div class="route-section-intro__copy">([\s\S]*?)<\/div>/)?.[1]
  assert.ok(copy, 'The connected heading/copy group is missing')
  assert.match(copy, /<h2>Built for people<\/h2>/)
  assert.match(copy, /<p>Real interfaces and clear decisions\.<\/p>/)
  assert.doesNotMatch(copy, /See all work/)
  assert.ok(html.indexOf('</div><a') > html.indexOf('Real interfaces'))
})

test('section intro without an eyebrow has no empty label', () => {
  const html = renderToStaticMarkup(React.createElement(SectionIntro,
    { title: 'Selected work', intro: 'Real interfaces.' }))
  assert.doesNotMatch(html, /class="kicker"/)
})
