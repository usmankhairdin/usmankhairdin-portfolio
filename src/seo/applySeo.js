import { seoForPath, structuredDataFor } from './routeSeo.js'

function setMeta(attribute, name, content) {
  let node = document.head.querySelector(`meta[${attribute}="${name}"]`)
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute(attribute, name)
    document.head.appendChild(node)
  }
  node.setAttribute('content', String(content))
}

export function applySeo(pathname) {
  const page = seoForPath(pathname)
  if (!page) {
    setMeta('name', 'robots', 'noindex,nofollow')
    return
  }

  document.title = page.title
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = page.canonical

  setMeta('name', 'description', page.description)
  setMeta('name', 'robots', page.robots)
  setMeta('property', 'og:type', page.caseStudy ? 'article' : 'website')
  setMeta('property', 'og:locale', 'en_US')
  setMeta('property', 'og:site_name', 'Usman Khair Din')
  setMeta('property', 'og:title', page.title)
  setMeta('property', 'og:description', page.description)
  setMeta('property', 'og:url', page.canonical)
  setMeta('property', 'og:image', page.image)
  setMeta('property', 'og:image:type', page.image.endsWith('.jpg') ? 'image/jpeg' : 'image/png')
  setMeta('property', 'og:image:width', page.imageWidth)
  setMeta('property', 'og:image:height', page.imageHeight)
  setMeta('property', 'og:image:alt', page.imageAlt)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', page.title)
  setMeta('name', 'twitter:description', page.description)
  setMeta('name', 'twitter:image', page.image)
  setMeta('name', 'twitter:image:alt', page.imageAlt)

  let schema = document.head.querySelector('#route-seo-jsonld')
  if (!schema) {
    schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.id = 'route-seo-jsonld'
    document.head.appendChild(schema)
  }
  schema.textContent = JSON.stringify(structuredDataFor(page)).replace(/</g, '\\u003c')
}
