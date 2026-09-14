const mshot = (url, width = 1280, height = 800) =>
  `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${Math.min(width, 1280)}&h=${Math.min(height, 960)}`

const thum = (url, width = 1600, crop = 1000) =>
  `https://image.thum.io/get/width/${width}/crop/${crop}/noanimate/${url}`

const withScreens = project => ({
  ...project,
  screenshots: {
    desktop: [mshot(project.liveUrl, 1280, 800), thum(project.liveUrl, 1500, 950), project.poster],
    wide: [mshot(project.liveUrl, 1280, 800), thum(project.liveUrl, 1800, 1050), project.poster],
    mobile: [mshot(project.liveUrl, 620, 960), thum(project.liveUrl, 620, 1000), project.poster],
  },
})

export const projects = [
  withScreens({
    slug: 'prima',
    title: 'PRIMA',
    category: 'Hospitality platform',
    status: 'Live public site',
    liveUrl: 'https://primaapp.com/',
    poster: '/assets/posters/prima.svg',
    accent: '#b7ff24',
    summary: 'A premium hospitality platform built around trusted recommendations, live access and a refined digital booking experience.',
    role: 'UI direction · Frontend',
    contribution: 'Interface direction and responsive frontend work for a hospitality product where clarity, polish and premium interaction matter.',
    deliverables: ['Website / product interface direction', 'Responsive frontend production', 'Premium interaction and content presentation'],
    tags: ['Hospitality', 'UI design', 'Frontend'],
  }),
  withScreens({
    slug: 'bizcare',
    title: 'BizCare Benefits',
    category: 'Benefits / ICHRA platform',
    status: 'Public portfolio build',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/bizcare/',
    poster: '/assets/posters/bizcare.svg',
    accent: '#ff705d',
    summary: 'A benefits-focused product experience presenting ICHRA administration, marketplace enrollment and partnership options through a clear responsive interface.',
    role: 'UI / UX · Frontend',
    contribution: 'UI/UX and frontend work focused on simplifying a dense benefits proposition into a more legible, structured experience.',
    deliverables: ['Product / marketing UI', 'Responsive frontend', 'Complex-content hierarchy'],
    tags: ['Benefits', 'UI / UX', 'Frontend'],
  }),
  withScreens({
    slug: 'bansar',
    title: 'Bansar China',
    category: 'Logistics website',
    status: 'Live public site',
    liveUrl: 'https://www.bansarchina.com/',
    poster: '/assets/posters/bansar.svg',
    accent: '#5368ff',
    summary: 'A large freight-forwarding website presenting shipping services, routes, resources and quote paths for an international logistics business.',
    role: 'Website design · Frontend',
    contribution: 'Content-heavy website design and responsive frontend production across service, route and conversion-focused pages.',
    deliverables: ['Large website system', 'Responsive frontend', 'Quote-focused conversion paths'],
    tags: ['Logistics', 'Web design', 'Frontend'],
  }),
  withScreens({
    slug: 'rantle',
    title: 'Rantle',
    category: 'Electronics website',
    status: 'Live public site',
    liveUrl: 'https://www.rantle.com/',
    poster: '/assets/posters/rantle.svg',
    accent: '#ffca5f',
    summary: 'A content-rich electronics website balancing technical product information, sourcing content and practical browsing for an international audience.',
    role: 'Website design · Frontend',
    contribution: 'Website design and frontend production shaped around dense technical content, discoverability and responsive reading.',
    deliverables: ['Content-rich website UI', 'Responsive frontend', 'Technical content presentation'],
    tags: ['Electronics', 'Web design', 'Frontend'],
  }),
  withScreens({
    slug: 'bum-life',
    title: 'Bum.Life',
    category: 'Entertainment website',
    status: 'Public portfolio build',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/bum.life/',
    poster: '/assets/posters/bum-life.svg',
    accent: '#f4a8d5',
    summary: 'A character-led entertainment website with a bold visual personality, editorial storytelling and responsive presentation.',
    role: 'Website design · Frontend',
    contribution: 'Visual direction and frontend execution for a playful entertainment concept with a strong narrative tone.',
    deliverables: ['Visual website direction', 'Responsive frontend', 'Story-led content presentation'],
    tags: ['Entertainment', 'Web design', 'Frontend'],
  }),
  withScreens({
    slug: 'pnw-leads',
    title: 'PNWLeads',
    category: 'Lead-generation website',
    status: 'Public portfolio build',
    liveUrl: 'https://www.usmankhairdin.com/portfolio/PNWLeads/',
    poster: '/assets/posters/pnw-leads.svg',
    accent: '#a8e989',
    summary: 'A conversion-focused service website structured around a clear offer, lead-generation services and strong calls to action.',
    role: 'Conversion design · Frontend',
    contribution: 'Landing-page structure, visual hierarchy and responsive frontend designed to make the service offer easy to understand and act on.',
    deliverables: ['Landing-page design', 'Responsive frontend', 'Conversion-focused content structure'],
    tags: ['Lead generation', 'Landing page', 'Frontend'],
  }),
]

export const doors = [
  { id:'about', label:'ABOUT', side:'left', z:-18, accent:'#ff705d', route:'/about/' },
  { id:'services', label:'SERVICES', side:'right', z:-34, accent:'#5368ff', route:'/services/' },
  { id:'work', label:'WORK', side:'left', z:-50, accent:'#b7ff24', route:'/work/' },
  { id:'agencies', label:'FOR AGENCIES', side:'right', z:-66, accent:'#ff705d', route:'/for-agencies/' },
  { id:'contact', label:'CONTACT', side:'left', z:-82, accent:'#5368ff', route:'/contact/' }
]
