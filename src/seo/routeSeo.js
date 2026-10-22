import { projects } from '../data/projects.js'
import { portrait } from '../data/portrait.js'

export const SITE_ORIGIN = 'https://www.usmankhairdin.com'
const PERSON_ID = `${SITE_ORIGIN}/#person`
const WEBSITE_ID = `${SITE_ORIGIN}/#website`
const SERVICE_ID = `${SITE_ORIGIN}/#practice`

const social = (name, alt) => ({
  image: `${SITE_ORIGIN}/assets/social/${name}.jpg`,
  imageAlt: alt,
  imageWidth: 1200,
  imageHeight: 630,
})

const pages = [
  {
    path: '/',
    title: 'Usman Khair Din | Product Designer & Frontend Developer',
    description: 'Senior product and UI/UX designer and frontend developer creating responsive websites, SaaS interfaces and production-ready UI for clients and agencies.',
    intent: 'Senior product designer and frontend developer portfolio',
    image: `${SITE_ORIGIN}/assets/og-card.png`,
    imageAlt: 'Usman Khair Din — product design and frontend production',
    imageWidth: 1200,
    imageHeight: 630,
    pageType: 'WebPage',
  },
  {
    path: '/about/',
    title: 'About Usman Khair Din | Product & UI/UX Designer',
    description: 'Meet Usman Khair Din and his design-to-frontend practice across product interfaces, responsive websites and client-ready production work.',
    intent: 'About a senior product and UI/UX designer who builds frontend',
    ...social('about', 'About page showing Usman’s product design and frontend practice'),
    pageType: 'AboutPage',
  },
  {
    path: '/services/',
    title: 'Product Design, UI/UX & Frontend Services | Usman Khair Din',
    description: 'Explore product UI/UX, responsive websites, SaaS dashboards, redesigns, frontend implementation and white-label agency production.',
    intent: 'Product UI/UX design and frontend implementation services',
    ...social('services', 'Services page introducing product UI/UX and frontend production'),
    pageType: 'WebPage',
  },
  {
    path: '/work/',
    title: 'Selected Product Design & Frontend Work | Usman Khair Din',
    description: 'Explore selected product, SaaS and responsive web case studies through real interface captures, project context and implementation evidence.',
    intent: 'Product design and frontend portfolio case studies',
    ...social('work', 'Selected Work page showing responsive portfolio project panels'),
    pageType: 'CollectionPage',
  },
  {
    path: '/for-agencies/',
    title: 'White-Label UI/UX & Frontend Partner | Usman Khair Din',
    description: 'Behind-the-scenes UI/UX design and responsive frontend production for agencies. Keep your client relationship while adding senior delivery support.',
    intent: 'White-label UI/UX designer and frontend partner for agencies',
    ...social('agencies', 'For Agencies page showing the white-label production offer'),
    pageType: 'WebPage',
  },
  {
    path: '/contact/',
    title: 'Contact Usman Khair Din | Design & Frontend Brief',
    description: 'Share a website, SaaS UI, dashboard or frontend brief with Usman Khair Din. Selected direct projects and agency partnerships are welcome.',
    intent: 'Contact a product designer and frontend developer',
    ...social('contact', 'Contact page inviting a design or frontend project brief'),
    pageType: 'ContactPage',
  },
  {
    path: '/design-system/',
    title: 'Portfolio Design System | Usman Khair Din',
    description: 'Explore the portfolio’s implemented design system: semantic colors, typography, responsive grids, UI components, forms, motion and accessibility.',
    intent: 'Implemented portfolio design system and UI component case study',
    ...social('design-system', 'Design System page documenting the implemented portfolio UI'),
    pageType: 'WebPage',
  },
  {
    path: '/work/personal-portfolio-3d/',
    title: 'Personal Portfolio 3D Case Study | Spatial Web Design',
    description: 'Explore a self-initiated 3D portfolio with navigable rooms, controlled camera movement, responsive overlays and production WebGL implementation.',
    intent: 'Immersive 3D portfolio and WebGL interaction design case study',
    ...social('personal-portfolio-3d', 'Personal Portfolio 3D corridor navigation and room interface'),
    pageType: 'WebPage',
    caseStudy: true,
  },
]

const projectSeo = {
  carthevia: {
    title: 'Carthevia Case Study | Commerce Website Design',
    description: 'Explore Carthevia: a complete commerce platform website with original interactive scenes, focused product pages, responsive interfaces and light and dark themes.',
    intent: 'Commerce website product design and frontend case study',
  },
  avenlo: {
    title: 'Avenlo Health Case Study | Healthcare Website Design',
    description: 'Explore Avenlo Health: a healthcare website for individuals, brokers and employers, with distinct colour systems, original graphics and coverage interfaces.',
    intent: 'Healthcare website product design and frontend case study',
  },
  forma: {
    title: 'Forma Case Study | SaaS Website, UI/UX & Frontend',
    description: 'Explore Forma, a complete AI-workspace marketing frontend with expressive product illustrations, reversible motion, platform pages and responsive light and dark themes.',
    intent: 'SaaS website product design and responsive frontend case study',
  },
  veyravael: {
    title: 'Veyravael Estates Case Study | Real-Estate Website Design',
    description: 'Explore an editorial real-estate frontend template with landscape-led photography, a curated property collection and a responsive enquiry presentation.',
    intent: 'Luxury real-estate website design and frontend case study',
  },
  sanaira: {
    title: 'Sanaira Health Case Study | Healthcare Website + SaaS UI',
    description: 'Explore Sanaira Health: a cinematic healthcare website and companion broker, member and employer application, with coverage discovery and interactive demo workflows.',
    intent: 'Healthcare website and SaaS application product design case study',
  },
  prima: {
    title: 'PRIMA Case Study | Hospitality Product UI & Frontend',
    description: 'Explore PRIMA’s hospitality network interface, bringing live restaurant booking, rewarded recommendations and partner earnings into one public product story.',
    intent: 'Hospitality product UI and frontend case study',
  },


  rantle: {
    title: 'Rantle Case Study | Electronics Website Design',
    description: 'See a responsive sourcing website for electronic components, organized around product families, part-number quotes and technical content.',
    intent: 'Electronics distributor website design and frontend case study',
  },
  'bum-life': {
    title: 'Bum.Life Case Study | Animated Series Website',
    description: 'Explore a responsive animated-series website portfolio build with cast profiles, clips, a gallery and a producer-facing pitch page.',
    intent: 'Animated series website design case study',
  },

}

for (const project of projects) {
  const meta = projectSeo[project.slug]
  if (!meta) throw new Error(`Missing SEO copy for ${project.slug}`)
  pages.push({
    path: `/work/${project.slug}/`,
    ...meta,
    ...social(project.slug, project.mediaAlt.hero),
    pageType: 'WebPage',
    caseStudy: true,
  })
}

export const routeSeo = Object.fromEntries(pages.map((page) => [page.path, {
  ...page,
  canonical: `${SITE_ORIGIN}${page.path}`,
  robots: 'index,follow,max-image-preview:large',
}]))

export const seoPaths = pages.map(({ path }) => path)

// Web Home presents the same portfolio as /, but is deliberately kept out of
// the sitemap. Resolve all of its metadata so SPA visits cannot inherit it
// from Contact or a case study. Both entries share the root canonical URL.
const unlistedRouteSeo = {
  '/web/': { ...routeSeo['/'], robots: 'noindex,follow' },
}

export function seoForPath(pathname) {
  const normalized = pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`
  return routeSeo[normalized] || unlistedRouteSeo[normalized] || null
}

const ref = (id) => ({ '@id': id })

export function structuredDataFor(page) {
  const pageId = `${page.canonical}#webpage`
  const graph = [
    {
      '@type': page.pageType,
      '@id': pageId,
      url: page.canonical,
      name: page.title,
      description: page.description,
      inLanguage: 'en',
      isPartOf: ref(WEBSITE_ID),
      about: ref(PERSON_ID),
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: page.image,
        width: page.imageWidth,
        height: page.imageHeight,
        caption: page.imageAlt,
      },
    },
  ]

  if (page.path === '/') {
    graph.unshift(
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: 'Usman Khair Din',
        url: `${SITE_ORIGIN}/`,
        image: `${SITE_ORIGIN}${portrait.src}`,
        jobTitle: 'Product Designer, UI/UX Designer and Frontend Developer',
        description: 'Product and UI/UX design with responsive frontend implementation for selected direct clients and agency partners.',
        email: 'brief@usmankhairdin.com',
        sameAs: [
          'https://pk.linkedin.com/in/usmankhairdin1',
          'https://www.upwork.com/freelancers/~0172c60344ca2309b3',
        ],
        knowsAbout: ['Product design', 'UI/UX design', 'Web design', 'SaaS interfaces', 'Responsive frontend development', 'Design systems'],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_ORIGIN}/`,
        name: 'Usman Khair Din',
        description: 'Portfolio of product design, UI/UX and frontend implementation work.',
        inLanguage: 'en',
        publisher: ref(PERSON_ID),
      },
    )
  }

  if (page.path === '/services/') {
    graph.push({
      '@type': 'ProfessionalService',
      '@id': SERVICE_ID,
      name: 'Usman Khair Din — Product Design and Frontend',
      url: page.canonical,
      description: page.description,
      email: 'brief@usmankhairdin.com',
      telephone: '+923217247317',
      areaServed: 'Worldwide',
      founder: ref(PERSON_ID),
      address: { '@type': 'PostalAddress', addressLocality: 'Lahore', addressCountry: 'PK' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Design and frontend services',
        itemListElement: [
          'Product / UI/UX design',
          'Websites & landing pages',
          'SaaS / dashboard UI',
          'Website redesign',
          'Frontend implementation',
          'White-label agency production',
        ].map((name) => ({ '@type': 'OfferCatalog', name })),
      },
    })
  }

  if (page.path === '/for-agencies/') {
    graph.push({
      '@type': 'Service',
      '@id': `${page.canonical}#service`,
      name: 'White-label UI/UX design and frontend production',
      serviceType: 'White-label design and frontend production for agencies',
      description: page.description,
      provider: ref(PERSON_ID),
      areaServed: 'Worldwide',
      url: page.canonical,
    })
  }

  if (page.caseStudy) {
    graph[0].mainEntity = ref(`${page.canonical}#case-study`)
    graph[0].breadcrumb = ref(`${page.canonical}#breadcrumb`)
    const projectName = page.path.includes('personal-portfolio-3d')
        ? 'Personal Portfolio — 3D'
        : projects.find((project) => page.path === `/work/${project.slug}/`)?.title
    graph.push(
      {
        '@type': 'CreativeWork',
        '@id': `${page.canonical}#case-study`,
        name: `${projectName} interface case study`,
        description: page.description,
        image: page.image,
        author: ref(PERSON_ID),
        mainEntityOfPage: ref(pageId),
        genre: 'Design case study',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE_ORIGIN}/work/` },
          { '@type': 'ListItem', position: 3, name: projectName, item: page.canonical },
        ],
      },
    )
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
