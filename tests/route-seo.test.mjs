import test from 'node:test'
import assert from 'node:assert/strict'
import { seoForPath, seoPaths, structuredDataFor } from '../src/seo/routeSeo.js'

test('Web Home supplies complete homepage metadata instead of retaining the previous route', () => {
  const page = seoForPath('/web/')
  assert.ok(page, 'Web Home needs its own metadata resolution')
  assert.equal(page.title, 'Usman Khair Din | Product Designer & Frontend Developer')
  assert.equal(page.canonical, 'https://www.usmankhairdin.com/')
  assert.equal(page.image, 'https://www.usmankhairdin.com/assets/og-card.png')
  assert.equal(page.robots, 'noindex,follow')
  assert.equal(seoForPath('/web').canonical, page.canonical)
})

test('Web Home remains unlisted while its structured data describes the canonical homepage', () => {
  assert.equal(seoPaths.includes('/web/'), false)
  const page = seoForPath('/web/')
  assert.ok(page, 'Web Home metadata must exist even though it is unlisted')
  const graph = structuredDataFor(page)['@graph']
  const home = graph.find(node => node['@type'] === 'WebPage')
  assert.equal(home.url, 'https://www.usmankhairdin.com/')
  assert.equal(home['@id'], 'https://www.usmankhairdin.com/#webpage')
  assert.equal(graph.some(node => node['@type'] === 'ContactPage'), false)
})
