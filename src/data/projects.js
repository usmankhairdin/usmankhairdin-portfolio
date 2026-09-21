const localMedia = (slug, { mobile = true } = {}) => ({
  gallery: [`/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`],
  preview: [`/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`],
  hero: [`/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`],
  fullpage: [`/assets/projects/${slug}/fullpage.webp`, `/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`],
  detail: [`/assets/projects/${slug}/detail.webp`, `/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`],
  mobile: mobile
    ? [`/assets/projects/${slug}/mobile.webp`, `/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`]
    : [`/assets/projects/${slug}/detail.webp`, `/assets/projects/${slug}/hero.webp`, `/assets/posters/${slug}.svg`],
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
    contribution: 'Interface direction and responsive frontend work for a hospitality product where access, attribution and settlement need to read as one coherent experience.',
    deliverables: ['Website and product-interface direction', 'Responsive frontend production', 'Interaction and content presentation'],
    tags: ['Hospitality', 'UI design', 'Frontend'],
    media: localMedia('prima'),
    mediaAlt: {
      hero: 'PRIMA homepage showing the Recommendation Economy hero and city market navigation',
      detail: 'PRIMA interface section explaining access, attribution and settlement',
      mobile: 'PRIMA responsive homepage showing the recommendation economy introduction and market cards',
    },
    evidenceTitle: 'Access, attribution and settlement, on one rail.',
    evidenceCopy: 'The public site moves from a live view of the booking app to a three-part model of access, attribution and settlement, then to a page for each side of the network.',
  },
  {
    slug: 'bizcare',
    title: 'BizCare',
    category: 'ICHRA benefits platform',
    status: 'Public portfolio build',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/bizcare/',
    poster: '/assets/posters/bizcare.svg',
    accent: '#2789b7',
    surface: '#e8f5f6',
    surfaceLight: '#dcedec',
    surfaceDark: '#0a1c20',
    presentation: 'portal',
    summary: 'A responsive public website for an ICHRA administration and enrollment platform, with paths for brokers, PEOs and employers.',
    role: 'Public portfolio presentation',
    contextLabel: 'PROJECT CONTEXT',
    deliverablesLabel: 'VISIBLE SURFACES',
    contribution: 'The public portfolio build organizes BizCare’s ICHRA offer, partnership model, enrollment workflow and support story into a structured marketing experience.',
    deliverables: ['ICHRA platform and partnership overview', 'Benefits and enrollment workflow presentation', 'Responsive public website'],
    tags: ['Benefits technology', 'ICHRA', 'Responsive web'],
    media: localMedia('bizcare'),
    mediaAlt: {
      hero: 'BizCare Benefits homepage introducing its ICHRA platform for modern businesses',
      detail: 'BizCare interface section presenting full-service support and technology benefits',
      mobile: 'BizCare responsive hero with ICHRA positioning and partnership call to action',
    },
    evidenceTitle: 'From employer budget to carrier enrollment.',
    evidenceCopy: 'One long page moves from the offer to partner paths, a four-step process and the people behind it, with a call to action throughout.',
  },
  {
    slug: 'bansar',
    title: 'Bansar China',
    category: 'Freight-forwarding website',
    status: 'Live public site',
    liveUrl: 'https://www.bansarchina.com/',
    poster: '/assets/posters/bansar.svg',
    accent: '#f18716',
    surface: '#eef2f8',
    surfaceLight: '#f1e5d2',
    surfaceDark: '#1a130c',
    presentation: 'route',
    summary: 'A large freight-forwarding website for shipping from China: sea, air, rail and customs guides, regional pages and quote paths.',
    role: 'Website design · Frontend',
    contribution: 'Content-heavy website design and responsive frontend production across service, route and conversion-focused pages.',
    deliverables: ['Large website system', 'Responsive frontend', 'Quote-focused conversion paths'],
    tags: ['Logistics', 'Web design', 'Frontend'],
    media: localMedia('bansar'),
    mediaAlt: {
      hero: 'Bansar China homepage with freight forwarding hero and global shipping call to action',
      detail: 'Bansar service interface showing sea, air and railway freight options',
      mobile: 'Bansar responsive homepage with navigation, freight hero and support benefits',
    },
    evidenceTitle: 'Each freight mode gets its own guide page.',
    evidenceCopy: 'Service pages share one template: benefits and a quote form up top, then a long reference guide, in four languages.',
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
  {
    slug: 'pnw-leads',
    title: 'PNWLeads',
    category: 'Lead-generation website',
    status: 'Public portfolio concept',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/PNWLeads/',
    poster: '/assets/posters/pnw-leads.svg',
    accent: '#2e68f1',
    surface: '#eef3ff',
    surfaceLight: '#e2edfa',
    surfaceDark: '#0b1a35',
    presentation: 'signal',
    summary: 'A responsive single-page concept for a Pacific Northwest lead-generation offer built on local SEO, paid ads and canvassing.',
    role: 'Public portfolio presentation',
    contextLabel: 'PROJECT CONTEXT',
    deliverablesLabel: 'VISIBLE SURFACES',
    contribution: 'The public portfolio concept structures a lead-generation offer, its three-part acquisition process and contact path into a responsive marketing interface.',
    deliverables: ['Lead-generation service overview', 'Three-part acquisition process', 'Responsive public website'],
    tags: ['Lead generation', 'Services', 'Responsive web'],
    media: localMedia('pnw-leads'),
    mediaAlt: {
      hero: 'PNWLeads responsive marketing homepage with lead-generation positioning and dashboard composition',
      detail: 'PNWLeads interface section presenting its three-part acquisition process',
      mobile: 'PNWLeads responsive hero with qualified-leads positioning and calls to action',
    },
    evidenceTitle: 'One offer, three acquisition paths.',
    evidenceCopy: 'The page moves from a dashboard-led hero to a proof band, a three-part process, testimonials and a contact call to action.',
    sourceNote: 'Figures and testimonials visible inside the public concept are interface content, not verified client results, and are not claimed here as outcomes.',
  },
]

export const doors = [
  { id:'about', label:'ABOUT', side:'left', z:-18, accent:'#455dff', route:'/about/' },
  { id:'services', label:'SERVICES', side:'right', z:-34, accent:'#455dff', route:'/services/' },
  { id:'work', label:'WORK', side:'left', z:-50, accent:'#455dff', route:'/work/' },
  { id:'agencies', label:'FOR AGENCIES', side:'right', z:-66, accent:'#455dff', route:'/for-agencies/' },
  { id:'contact', label:'CONTACT', side:'left', z:-82, accent:'#455dff', route:'/contact/' }
]
