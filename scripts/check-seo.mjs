import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import { routeSeo, seoPaths } from '../src/seo/routeSeo.js'

const dist = join(process.cwd(), 'dist')
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8')
const robots = await readFile(join(dist, 'robots.txt'), 'utf8')
assert.match(robots, /Sitemap: https:\/\/www\.usmankhairdin\.com\/sitemap\.xml/)

const titles = new Set()
const descriptions = new Set()

for (const path of seoPaths) {
  const page = routeSeo[path]
  const html = await readFile(join(dist, path.slice(1), 'index.html'), 'utf8')
  assert.match(sitemap, new RegExp('<loc>' + page.canonical.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&') + '<\/loc>'))
  assert.ok(html.includes('<title>' + page.title.replaceAll('&', '&amp;') + '</title>'), path + ' title')
  assert.ok(html.includes('name="description" content="' + page.description.replaceAll('&', '&amp;') + '"'), path + ' description')
  assert.ok(html.includes('rel="canonical" href="' + page.canonical + '"'), path + ' canonical')
  assert.ok(html.includes('name="robots" content="' + page.robots + '"'), path + ' robots')
  assert.ok(html.includes('property="og:url" content="' + page.canonical + '"'), path + ' OG URL')
  assert.ok(html.includes('property="og:title" content="' + page.title.replaceAll('&', '&amp;') + '"'), path + ' OG title')
  assert.ok(html.includes('property="og:description" content="' + page.description.replaceAll('&', '&amp;') + '"'), path + ' OG description')
  assert.ok(html.includes('property="og:locale" content="en_US"'), path + ' OG locale')
  assert.ok(html.includes('property="og:image" content="' + page.image + '"'), path + ' OG image')
  assert.ok(html.includes('property="og:image:alt" content="' + page.imageAlt.replaceAll('&', '&amp;') + '"'), path + ' OG image alt')
  assert.ok(html.includes('name="twitter:image" content="' + page.image + '"'), path + ' Twitter image')
  assert.ok(html.includes('name="twitter:title" content="' + page.title.replaceAll('&', '&amp;') + '"'), path + ' Twitter title')
  assert.ok(html.includes('name="twitter:description" content="' + page.description.replaceAll('&', '&amp;') + '"'), path + ' Twitter description')
  assert.ok(html.includes('name="twitter:image:alt" content="' + page.imageAlt.replaceAll('&', '&amp;') + '"'), path + ' Twitter image alt')
  assert.ok(html.includes('property="og:image:width" content="1200"'), path + ' image width')
  assert.ok(html.includes('property="og:image:height" content="630"'), path + ' image height')
  const schemaText = html.match(/<script id="route-seo-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
  assert.ok(schemaText, path + ' schema')
  const schema = JSON.parse(schemaText)
  assert.equal(schema['@context'], 'https://schema.org')
  assert.equal(schema['@graph'][0]['@id']?.startsWith('https://www.usmankhairdin.com/'), true)
  assert.ok(schema['@graph'].some((node) => node['@type'] === page.pageType), path + ' page schema')
  if (page.caseStudy) {
    assert.ok(schema['@graph'].some((node) => node['@type'] === 'CreativeWork'), path + ' case study schema')
    assert.ok(schema['@graph'].some((node) => node['@type'] === 'BreadcrumbList'), path + ' breadcrumb schema')
  }
  await access(join(dist, new URL(page.image).pathname.slice(1)))
  assert.ok(!titles.has(page.title), 'Duplicate title: ' + page.title)
  assert.ok(!descriptions.has(page.description), 'Duplicate description: ' + page.description)
  titles.add(page.title)
  descriptions.add(page.description)
}

assert.equal((sitemap.match(/<url>/g) || []).length, seoPaths.length)
const webHome = await readFile(join(dist, 'web', 'index.html'), 'utf8')
assert.ok(webHome.includes('<title>Usman Khair Din | Product Designer &amp; Frontend Developer</title>'), 'Web Home title')
assert.ok(webHome.includes('rel="canonical" href="https://www.usmankhairdin.com/"'), 'Web Home canonical')
assert.ok(webHome.includes('name="robots" content="noindex,follow"'), 'Web Home stays unlisted')
assert.ok(webHome.includes('property="og:url" content="https://www.usmankhairdin.com/"'), 'Web Home share URL')
assert.ok(!sitemap.includes('<loc>https://www.usmankhairdin.com/web/</loc>'), 'Web Home stays out of the sitemap')
console.log('SEO checks passed for ' + seoPaths.length + ' indexed routes and the unlisted Web Home.')
