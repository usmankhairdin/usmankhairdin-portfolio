import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { projects, workProjects, nextCaseStudy } from '../src/data/projects.js'
import { workRoomProjects } from '../src/rooms/workRoomProjects.js'
import { CASE_STUDIES } from '../src/data/projectCaseStudies.js'
import { PROJECT_BRANDS } from '../src/data/projectBrands.js'
import { seoForPath, seoPaths, structuredDataFor } from '../src/seo/routeSeo.js'

test('Nexora follows Meridian in Work and joins the six latest immersive exhibits', () => {
  const project = projects.find(item => item.slug === 'nexora')
  assert.ok(project)
  assert.equal(project.title, 'Nexora')
  assert.equal(project.category, 'Animated productivity landing page')
  assert.equal(project.liveUrl, 'https://www.usmankhairdin.com/portfolio/nexora/')
  assert.deepEqual(workProjects.map(item => item.slug), ['forme', 'meridian', 'nexora', 'carthevia', 'forma', 'avenlo', 'veyravael', 'sanaira'])
  assert.deepEqual(workRoomProjects.map(item => item.slug), ['forme', 'meridian', 'nexora', 'carthevia', 'forma', 'avenlo'])
  assert.equal(nextCaseStudy('/work/sanaira/').href, '/work/personal-portfolio-3d/')
  assert.equal(nextCaseStudy('/work/nexora/').href, '/work/carthevia/')
  assert.ok(CASE_STUDIES.nexora.chapters.length >= 3)
  assert.ok(PROJECT_BRANDS.nexora.light && PROJECT_BRANDS.nexora.dark)
})

test('Nexora has direct-route metadata, structured data and a sitemap entry', () => {
  const page = seoForPath('/work/nexora/')
  assert.ok(page)
  assert.match(page.title, /Nexora/)
  assert.equal(page.canonical, 'https://www.usmankhairdin.com/work/nexora/')
  assert.ok(seoPaths.includes('/work/nexora/'))
  assert.ok(structuredDataFor(page)['@graph'].some(item => item['@type'] === 'CreativeWork' && item.name === 'Nexora interface case study'))
  assert.ok(fs.readFileSync('public/sitemap.xml', 'utf8').includes(page.canonical))
})

test('Nexora media references and the compiled relative-base demo resolve locally', () => {
  const project = projects.find(item => item.slug === 'nexora')
  assert.ok(project)
  const mediaSources = new Set(Object.values(project.media).flat().filter(value => typeof value === 'string' && value.startsWith('/assets/')))
  const visit = node => {
    if (!node || typeof node !== 'object') return
    if (typeof node.src === 'string') mediaSources.add(node.src)
    if (typeof node.srcSet === 'string') node.srcSet.split(',').forEach(entry => mediaSources.add(entry.trim().split(' ')[0]))
    Object.values(node).forEach(visit)
  }
  visit(CASE_STUDIES.nexora)
  mediaSources.add(new URL(seoForPath('/work/nexora/').image).pathname)
  for (const source of mediaSources) assert.ok(fs.existsSync(`public${source.split('?')[0]}`), source)
  for (const name of ['showcase.webp', 'showcase-1x.webp', 'brandmark.svg']) assert.ok(fs.existsSync(`public/assets/projects/nexora/${name}`))
  const html = fs.readFileSync('public/portfolio/nexora/index.html', 'utf8')
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)/g)].map(match => match[1])
  assert.ok(assets.some(source => source.endsWith('.js')))
  assert.ok(assets.some(source => source.endsWith('.css')))
  for (const source of assets) assert.ok(fs.existsSync(`public/portfolio/nexora/${source}`), source)
  assert.doesNotMatch(html, /(?:src|href)="\/assets\//)
})
