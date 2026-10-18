import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { routeSeo, seoForPath, seoPaths, structuredDataFor } from '../src/seo/routeSeo.js'

const dist = join(process.cwd(), 'dist')
const template = await readFile(join(dist, 'index.html'), 'utf8')

function escapeHtml(value) {
  return String(value).replace(/[&"<]/g, (character) => ({
    '&': '&amp;', '"': '&quot;', '<': '&lt;',
  })[character])
}

function replaceMeta(html, attribute, name, value) {
  const pattern = new RegExp('<meta\\s+' + attribute + '="' + name + '"[^>]*>', 'i')
  const tag = '<meta ' + attribute + '="' + name + '" content="' + escapeHtml(value) + '" />'
  if (!pattern.test(html)) throw new Error('Missing SEO tag: ' + name)
  return html.replace(pattern, tag)
}

function render(page) {
  let html = template.replace(/<title>[^<]*<\/title>/i, '<title>' + escapeHtml(page.title) + '</title>')
  html = html.replace(/<link rel="canonical"[^>]*>/i, '<link rel="canonical" href="' + escapeHtml(page.canonical) + '" />')
  const tags = [
    ['name', 'description', page.description],
    ['name', 'robots', page.robots],
    ['property', 'og:type', page.caseStudy ? 'article' : 'website'],
    ['property', 'og:locale', 'en_US'],
    ['property', 'og:site_name', 'Usman Khair Din'],
    ['property', 'og:title', page.title],
    ['property', 'og:description', page.description],
    ['property', 'og:url', page.canonical],
    ['property', 'og:image', page.image],
    ['property', 'og:image:type', page.image.endsWith('.jpg') ? 'image/jpeg' : 'image/png'],
    ['property', 'og:image:width', page.imageWidth],
    ['property', 'og:image:height', page.imageHeight],
    ['property', 'og:image:alt', page.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', page.title],
    ['name', 'twitter:description', page.description],
    ['name', 'twitter:image', page.image],
    ['name', 'twitter:image:alt', page.imageAlt],
  ]
  for (const [attribute, name, value] of tags) html = replaceMeta(html, attribute, name, value)
  const json = JSON.stringify(structuredDataFor(page)).replace(/</g, '\\u003c')
  html = html.replace(
    /<script id="route-seo-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    '<script id="route-seo-jsonld" type="application/ld+json">' + json + '</script>',
  )
  return html
}

for (const path of seoPaths) {
  const page = routeSeo[path]
  const directory = path === '/' ? dist : join(dist, path.slice(1))
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, 'index.html'), render(page))
}

// Unlisted routes still need a real file to load directly (the host answers unknown URLs with a 404),
// but they stay out of search. Use complete metadata when it is available so
// direct loads and client-side navigation agree.
const UNLISTED = ['/web/', '/work/personal-portfolio-web/']
for (const path of UNLISTED) {
  const directory = join(dist, path.slice(1))
  await mkdir(directory, { recursive: true })
  const page = seoForPath(path)
  await writeFile(join(directory, 'index.html'), page ? render(page) : replaceMeta(template, 'name', 'robots', 'noindex,follow'))
}

console.log('Generated direct-load SEO HTML for ' + seoPaths.length + ' routes and ' + UNLISTED.length + ' unlisted route(s).')
