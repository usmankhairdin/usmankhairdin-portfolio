import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { projects, workProjects, nextCaseStudy } from '../src/data/projects.js'
import { workRoomProjects } from '../src/rooms/workRoomProjects.js'
import { CASE_STUDIES } from '../src/data/projectCaseStudies.js'
import { PROJECT_BRANDS } from '../src/data/projectBrands.js'
import { seoForPath, structuredDataFor } from '../src/seo/routeSeo.js'

test('Latest Work items and exactly six exhibits occupy the existing corridor bays', () => {
  const selected = ['forme', 'meridian', 'nexora', 'carthevia', 'forma', 'avenlo']
  assert.deepEqual(workProjects.map(p => p.slug), [...selected, 'veyravael', 'sanaira'])
  assert.deepEqual(workRoomProjects.map(p => p.slug), selected)
  for (const project of workRoomProjects) {
    assert.ok(fs.existsSync(`public${project.screenUrl.split('?')[0]}`), project.screenUrl)
    assert.equal(project.embedUrl, `/portfolio/${project.slug}/`)
    assert.ok(fs.existsSync(`public${project.embedUrl}index.html`), project.embedUrl)
  }
  assert.equal(nextCaseStudy('/work/meridian/').href, '/work/nexora/')
  assert.equal(nextCaseStudy('/work/nexora/').href, '/work/carthevia/')
  assert.ok(!projects.some(p => ['prima','rantle','bum-life'].includes(p.slug)), 'only independently developed projects are active')
})

test('Meridian has a complete case study, theme palette, captures and portable demo', () => {
  const p = projects.find(p => p.slug === 'meridian')
  assert.ok(p)
  assert.ok(CASE_STUDIES.meridian.chapters.length >= 3)
  assert.ok(PROJECT_BRANDS.meridian.light && PROJECT_BRANDS.meridian.dark)
  const assets = new Set(Object.values(p.media).flat().filter(v => typeof v === 'string' && v.startsWith('/assets/')))
  const visit = value => {
    if (!value || typeof value !== 'object') return
    if (value.src) assets.add(value.src)
    if (value.srcSet) value.srcSet.split(',').forEach(v => assets.add(v.trim().split(' ')[0]))
    Object.values(value).forEach(visit)
  }
  visit(CASE_STUDIES.meridian)
  const page = seoForPath('/work/meridian/')
  assert.equal(page.canonical, 'https://www.usmankhairdin.com/work/meridian/')
  assets.add(new URL(page.image).pathname)
  for (const asset of assets) assert.ok(fs.existsSync(`public${asset.split('?')[0]}`), asset)
  assert.ok(structuredDataFor(page)['@graph'].some(v => v['@type'] === 'CreativeWork' && v.name === 'Meridian interface case study'))
  assert.ok(fs.readFileSync('public/sitemap.xml', 'utf8').includes(page.canonical))
  const html = fs.readFileSync('public/portfolio/meridian/index.html', 'utf8')
  const references = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)/g)].map(v => v[1])
  assert.ok(references.some(v => v.endsWith('.js')))
  assert.ok(references.some(v => v.endsWith('.css')))
  for (const reference of references) assert.ok(fs.existsSync(`public/portfolio/meridian/${reference}`), reference)
  for (const file of ['showcase.webp', 'showcase-1x.webp', 'brandmark.svg']) assert.ok(fs.existsSync(`public/assets/projects/meridian/${file}`))
})
