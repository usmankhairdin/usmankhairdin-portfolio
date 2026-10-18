// When a project's captures are replaced under the same file names, bump its version here: every page and the
// Corridor ask for the new files instead of reusing the copies browsers already cached.
const MEDIA_VERSION = { prima: '20261013c', forma: '20261018-local', veyravael: '20261018' }
export const projectAsset = (slug, file) => `/assets/projects/${slug}/${file}${MEDIA_VERSION[slug] ? `?v=${MEDIA_VERSION[slug]}` : ''}`

const localMedia = (slug, { mobile = true, poster = `/assets/posters/${slug}.svg` } = {}) => ({
  gallery: [projectAsset(slug, 'hero.webp'), poster],
  preview: [projectAsset(slug, 'hero.webp'), poster],
  hero: [projectAsset(slug, 'hero.webp'), poster],
  fullpage: [projectAsset(slug, 'fullpage.webp'), projectAsset(slug, 'hero.webp'), poster],
  detail: [projectAsset(slug, 'detail.webp'), projectAsset(slug, 'hero.webp'), poster],
  mobile: mobile
    ? [projectAsset(slug, 'mobile.webp'), projectAsset(slug, 'hero.webp'), poster]
    : [projectAsset(slug, 'detail.webp'), projectAsset(slug, 'hero.webp'), poster],
})

// Each project carries the ONE solid surface it is presented on, per theme (a refined tint of its real palette, curated once).
// The Work showcase panel and the project's detail-page hero both read these exact values through this helper.
export const surfacesFor = (project) => ({
  light: project.surfaceLight || project.surface || '#eee8dc',
  dark: project.surfaceDark || '#0b111b',
})

// Data-driven tone: a project whose own surface is dark (Bum.Life) gets light-on-dark type in either theme; everything else follows the theme.
export const toneFor = (project) => {
  const hex = String(surfacesFor(project).light || '').replace('#', '')
  if (hex.length !== 6) return 'theme'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2 ? 'dark' : 'theme'
}

// The project's discipline for the meta rail, from facts already in its data (its last two tags, e.g. "UI design · Frontend").
export const disciplineFor = (project) => (project.tags || []).slice(-2).join(' · ')

export const hostLabel = (url) => {
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/\/$/, '')
    return `${u.hostname.replace(/^www\./, '')}${path}`
  } catch { return '' }
}

export const projects = [
  {
    slug: 'sanaira',
    title: 'Sanaira Health',
    category: 'Healthcare website + application',
    status: 'Self-initiated template · Public demo',
    liveUrl: 'https://sanaira.usmankhairdin.com/',
    appUrl: 'https://sanaira.usmankhairdin.com/app/broker/',
    poster: '/assets/projects/sanaira/hero.webp',
    accent: '#3a6c61',
    surface: '#e2e9d9',
    surfaceLight: '#e2e9d9',
    surfaceDark: '#142d27',
    presentation: 'care',
    summary: 'A complete healthcare frontend package: a cinematic coverage website and a connected application for brokers, members and employers.',
    role: 'Product design · UI/UX · Frontend',
    contribution: 'A self-initiated website and companion application, designed and built as one coherent healthcare template: shared branding, responsive interfaces, coverage discovery and connected workspace journeys.',
    deliverables: ['Responsive healthcare marketing website', 'Broker, member and employer application interfaces', 'Coverage finder, plan comparison and enrollment demo flows', 'Animated 3D Care Weave and shared light/dark design system'],
    tags: ['Healthcare', 'SaaS UI', 'Product design', 'Frontend'],
    media: { ...localMedia('sanaira', { poster: '/assets/projects/sanaira/care-weave-still-light.webp' }), showcaseWidths: [1440, 1440] },
    mediaAlt: {
      hero: 'Sanaira Health homepage: Coverage for your kind of life, beside its animated Care Weave and member coverage preview',
      detail: 'Sanaira broker application overview with workload, client follow-up and recent activity',
      mobile: 'Sanaira Health responsive homepage on a phone',
    },
    evidenceTitle: 'One brand, from discovery to workspace.',
    evidenceCopy: 'Coverage discovery and comparison lead into application interfaces for client records, quotes, enrollment, documents, messages and renewals.',
    sourceNote: 'Sanaira is a fictional healthcare brand and an interactive frontend template. Plans, prices, people and metrics are illustrative demo content; no live insurance quoting, enrollment, accounts or backend service is claimed.',
  },
  {
    slug: 'forma',
    title: 'Forma',
    category: 'AI workspace website',
    status: 'Self-initiated template · Public demo',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/forma/',
    poster: '/assets/projects/forma/hero.webp',
    accent: '#7661cf',
    surfaceLight: '#e6e3f4',
    surfaceDark: '#101126',
    presentation: 'workspace',
    summary: 'A complete SaaS marketing template that turns connected data, intelligence and automation into a clear, expressive product story.',
    role: 'Product design · UI/UX · Frontend',
    contribution: 'A self-initiated multipage frontend: brand direction, responsive product illustrations, reversible scroll choreography, platform pages and focused onboarding and sign-in demonstrations.',
    deliverables: ['Multipage SaaS marketing website', 'Six platform feature pages and connected product illustrations', 'Integrations, pricing and editorial content', 'Responsive light/dark design system and frontend entry flows'],
    tags: ['SaaS', 'Product design', 'UI/UX', 'Frontend'],
    media: {...localMedia('forma',{poster:'/assets/rooms/work/forma.webp'}),showcaseWidths:[1440,1440]},
    mediaAlt: {
      hero: 'Forma homepage with its violet Intelligence in motion identity and connected workspace preview',
      detail: 'Forma intelligence workspace showing revenue, audience, live activity and automation cards',
      mobile: 'Forma responsive homepage and workspace preview on a phone',
    },
    evidenceTitle: 'From connected signals to a useful next step.',
    evidenceCopy: 'The homepage assembles a shared workspace, explains connect, understand and act, and continues into purpose-built platform, integration and entry pages.',
    sourceNote: 'Forma is a fictional product and a frontend template. Product metrics, automation and AI responses are illustrative; no live AI service, authentication or account creation is claimed.',
  },
  {
    slug: 'prima',
    title: 'PRIMA',
    category: 'Hospitality network',
    status: 'Live public site',
    liveUrl: 'https://primaapp.com/',
    poster: '/assets/posters/prima.svg',
    accent: '#4168ef',
    surface: '#edf3ff',
    surfaceLight: '#e6e8f6',
    surfaceDark: '#0e1328',
    presentation: 'atlas',
    summary: 'A hospitality network pairing live restaurant booking with tracked, rewarded recommendations from concierges and hotels.',
    role: 'UI direction · Frontend',
    contribution: 'Interface direction and responsive frontend work for a hospitality product where booking, recommendations and payouts need to read as one coherent experience.',
    deliverables: ['Website and product-interface direction', 'Responsive frontend production', 'Interaction and content presentation'],
    tags: ['Hospitality', 'UI design', 'Frontend'],
    media: localMedia('prima'),
    mediaAlt: {
      hero: 'PRIMA homepage showing its recommendation network, with Hotels, Curators and Companies around the PRIMA mark',
      detail: 'PRIMA hotels page section explaining what a property earns from free and prime table fees',
      mobile: 'PRIMA responsive homepage showing the recommendation network and its introduction on a phone',
    },
    evidenceTitle: 'Two kinds of table, one shared fee.',
    evidenceCopy: 'The public site moves from a network of recommenders to a booking app with live times, explains how free and prime table fees are shared, and gives each kind of partner its own page.',
  },
  {
    slug: 'veyravael',
    title: 'Veyravael Estates',
    titleMeasure: 10,
    category: 'Luxury real-estate website',
    status: 'Self-initiated template · Public demo',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/veyravael/',
    poster: '/assets/projects/veyravael/hero.webp',
    accent: '#806f4c',
    surfaceLight: '#e9e5da',
    surfaceDark: '#25261f',
    presentation: 'estate',
    summary: 'An editorial real-estate template where considered photography, property collections and quiet detail lead toward a private enquiry.',
    role: 'Product design · UI/UX · Frontend',
    contribution: 'A self-initiated responsive real-estate website, combining brand direction, an editorial property presentation and a coherent frontend enquiry journey.',
    deliverables: ['Luxury real-estate website direction', 'Property collection and destination presentation', 'Responsive frontend and enquiry interface'],
    tags: ['Real estate', 'Web design', 'Frontend'],
    media: {...localMedia('veyravael',{poster:'/assets/rooms/work/veyravael.webp'}),showcaseWidths:[1440,1440]},
    mediaAlt: {
      hero: 'Veyravael Estates homepage with A place apart over a landscape-led property photograph',
      detail: 'Veyravael curated property collection with architectural photography and property details',
      mobile: 'Veyravael Estates responsive property homepage on a phone',
    },
    evidenceTitle: 'A considered setting for distinctive properties.',
    evidenceCopy: 'A landscape-led arrival introduces selected homes, the practice’s point of view, destinations and a personal enquiry path.',
    sourceNote: 'Veyravael is a fictional real-estate brand and a frontend template. Properties and enquiry interfaces are demo content; no live inventory or completed enquiry is claimed.',
  },
  {
    slug: 'rantle',
    title: 'Rantle',
    category: 'Electronics distributor',
    status: 'Live public site',
    liveUrl: 'https://www.rantle.com/',
    poster: '/assets/posters/rantle.svg',
    accent: '#f49622',
    surface: '#e8f1f3',
    surfaceLight: '#dae5ed',
    surfaceDark: '#0a1a26',
    presentation: 'circuit',
    summary: 'A sourcing site for an independent electronic-components distributor, built around product families and part-number quotes.',
    role: 'Website design · Frontend',
    contribution: 'Website design and frontend production shaped around dense component information, sourcing content and responsive reading.',
    deliverables: ['Product and sourcing website UI', 'Responsive frontend', 'Technical content presentation'],
    tags: ['Electronics', 'Web design', 'Frontend'],
    media: localMedia('rantle', { mobile: false }),
    mediaAlt: {
      hero: 'Rantle homepage presenting electronic components sourcing and inquiry navigation',
      detail: 'Rantle homepage section introducing its electronic components supplier offer',
      mobile: 'Rantle electronic components homepage detail',
    },
    evidenceTitle: 'Part-number quotes on every product page.',
    evidenceCopy: 'Category and part pages pair short product copy with a quote form and a long technical guide for engineers.',
  },
  {
    slug: 'bum-life',
    title: 'Bum.Life',
    category: 'Animated series website',
    status: 'Public portfolio build',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/bum.life/',
    poster: '/assets/posters/bum-life.svg',
    accent: '#ffd51d',
    surface: '#111620',
    surfaceLight: '#1a160f',
    surfaceDark: '#12100b',
    presentation: 'stage',
    summary: 'A multi-page website for an animated comedy series: its five-character cast, clips, gallery and a producer-facing pitch page.',
    role: 'Public portfolio presentation',
    contextLabel: 'PROJECT CONTEXT',
    deliverablesLabel: 'VISIBLE SURFACES',
    contribution: 'The public portfolio build introduces the series, characters, clips, image gallery and producer-facing information through a responsive presentation.',
    deliverables: ['Series and story-world introduction', 'Character and video presentation', 'Responsive public website'],
    tags: ['Entertainment', 'Storytelling', 'Responsive web'],
    media: localMedia('bum-life'),
    mediaAlt: {
      hero: 'Bum.Life homepage showing the five animated characters and series introduction',
      detail: 'Bum.Life featured videos section with character artwork',
      mobile: 'Bum.Life responsive hero with series introduction and calls to action',
    },
    evidenceTitle: 'From cast and clips to a producer pitch.',
    evidenceCopy: 'The site moves from the series premise to featured clips, the cast, a gallery and a dedicated page for producers.',
  },
]

// The spatial portfolio case study, ahead of the same curated project sequence as Work Room.
export const featuredProjects = [
  {
    title: 'The Corridor — 3D Portfolio',
    href: '/work/personal-portfolio-3d/',
    category: 'SPATIAL / 3D EXPERIENCE',
    summary: 'A walkable portfolio with material-rich rooms, automatic mouse look and live websites inside the Work Room’s project screens.',
    tags: ['Spatial Experience', 'Interaction Design', 'WebGL', 'Frontend'],
    image: '/assets/case-studies/personal-portfolio-3d/room-work-current.webp',
    imageAlt: 'Current Corridor Work Room: framed live websites set into the travertine walls',
  },
]

// Every case-study route in Work-page order, so each detail page can point onward to the next one.
const caseStudies = [
  ...featuredProjects.map(({ title, href }) => ({ title, href })),
  ...projects.map(({ title, slug }) => ({ title, href: `/work/${slug}/` })),
]
export const nextCaseStudy = (href) => {
  const index = caseStudies.findIndex((item) => item.href === href)
  return index < 0 ? null : caseStudies[(index + 1) % caseStudies.length]
}

export const doors = [
  { id:'about', label:'ABOUT', side:'left', z:-12, accent:'#455dff', route:'/about/' },
  { id:'services', label:'SERVICES', side:'right', z:-24, accent:'#455dff', route:'/services/' },
  { id:'work', label:'WORK', side:'left', z:-36, accent:'#455dff', route:'/work/' },
  // Contact is the hall straight ahead, through the door in the corridor's end wall
  { id:'contact', label:'CONTACT', side:'end', z:-48, accent:'#455dff', route:'/contact/' }
]
