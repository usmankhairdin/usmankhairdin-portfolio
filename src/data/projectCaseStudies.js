/*
 * Case-study content for the BODY of each project's detail page (everything below the hero), keyed by the project's slug.
 *
 * Every fact here comes from the project's own public pages (reviewed September 2026) and is written in original words; nothing is
 * copied wholesale and nothing is invented: no metrics, results, dates, stack or process are claimed. What Usman contributed is
 * NOT inferred from the live site; it stays in the project record (`role`, `contribution`, `deliverables` in projects.js) and is
 * shown in the closing Scope section. Where a figure or testimonial is only interface content of a public concept, the project's
 * `sourceNote` (or a note beside the capture) says so.
 *
 * Every page is built from the same small vocabulary (rendered in src/pages/Project.jsx, laid out in Project.css):
 *
 *   overview   { title, lead, paragraphs[], facts[[label, value]] }     the "what is this" section
 *   chapters   [{ id, kicker, title, intro, points?, layout, aside?, slots[] }]
 *   contributionTitle                                                    optional heading for the closing Scope section
 *
 *   layout 'aside'   the text column (aside: 5 of 12 by default, or 4) beside one body column (7, or 8): text + a dominant visual, or text + data
 *   layout 'top'     the text column (8 of 12) above a full-width body: full-width evidence, repeated feature grids
 *   points           label / text rows shown under the lead in the text column
 *
 *   slots (the body of a chapter, stacked in order)
 *     media     { image, caption, support?: [{ image, caption } | { note: { label, text } }, ...] }   one dominant capture, quieter support beneath
 *     phones    { items: [{ image, caption }, ...] }                                                   mobile views on one panel
 *     cards     { numbered, cols?, items: [{ label?, title, text }] }                                 structured text
 *     features  { items: [{ image, label, title, text }] }                                            a repeated grid of capture + copy
 *
 * Captures live in public/assets/projects/<slug>/ev-<name>.webp (+ -1x) and are produced by scripts/capture-case-study-evidence.mjs.
 */

const ASSETS = '/assets/projects'

// A capture reference for one project: `at(name, alt, path)` for a desktop page moment, `phone(name, alt, path)` for a mobile view.
// `path` is the live page the capture was taken from (it labels the browser frame's address bar).
const captures = (slug, origin) => {
  const make = (name, alt, path, [small, large, height]) => ({
    src: `${ASSETS}/${slug}/ev-${name}.webp`,
    srcSet: `${ASSETS}/${slug}/ev-${name}-1x.webp ${small}w, ${ASSETS}/${slug}/ev-${name}.webp ${large}w`,
    width: large,
    height,
    alt,
    page: origin + path,
  })
  return {
    at: (name, alt, path = '') => make(name, alt, path, [960, 1920, 1200]),
    phone: (name, alt, path = '') => make(name, alt, path, [390, 780, 1688]),
  }
}

const prima = captures('prima', 'https://primaapp.com')
const bizcare = captures('bizcare', 'https://www.usmankhairdin.com/portfolio/bizcare/')
const bansar = captures('bansar', 'https://www.bansarchina.com')
const rantle = captures('rantle', 'https://www.rantle.com')
const bumLife = captures('bum-life', 'https://www.usmankhairdin.com/portfolio/bum.life')
const pnw = captures('pnw-leads', 'https://www.usmankhairdin.com/portfolio/PNWLeads/')

export const CASE_STUDIES = {
  prima: {
    overview: {
      title: 'Bookings, recommendations and payouts on one network.',
      lead: 'A hospitality network where guests book held tables, concierges and curators share recommendations, and every introduction is tracked and rewarded.',
      paragraphs: [
        'The public site opens on the idea of a “recommendation economy”, proves it with a live view of the real booking app, then explains the model in three parts: access, attribution and settlement.',
        'Restaurants, hotels and curators each get their own page, and city pages list partner venues market by market.',
      ],
      facts: [
        ['AUDIENCE', 'Guests, concierges and advisors, restaurants and hotels'],
        ['MARKETS', 'Seven live cities, with more announced'],
        ['PAGE TYPES', 'Home, city guides, partner pages, sign-in'],
      ],
    },
    chapters: [
      {
        id: 'proposition',
        layout: 'aside',
        kicker: 'THE PROPOSITION',
        title: 'Word of mouth, made visible.',
        intro: 'The homepage frames recommending a restaurant as an economy nobody was paid for, then shows the product that pays it: the real PRIMA app, running inside the page.',
        points: [
          ['Held inventory', 'Tables at partner restaurants that are otherwise closed'],
          ['Updating live', 'Availability changes on screen, with no calling ahead or waiting for a reply'],
          ['Try it', 'Scroll the list and tap a time before any sign-in'],
        ],
        slots: [
          {
            type: 'media',
            image: prima.at('live-inventory', 'PRIMA homepage section with a phone showing the live PRIMA app listing partner restaurant tables in Paris', '/'),
            caption: 'HOME / LIVE INVENTORY',
            support: [
              { image: prima.at('recommendation', 'PRIMA homepage section explaining that word of mouth moves value but rarely returns it to the person who recommended', '/'), caption: 'HOME / THE ARGUMENT' },
              { note: { label: 'THE ARGUMENT', text: 'Introductions between people already drive spend that advertising usually gets credit for. PRIMA positions itself as the route that sends that value back to the people who created it.' } },
            ],
          },
        ],
      },
      {
        id: 'model',
        layout: 'top',
        kicker: 'CORE MODEL',
        title: 'Access, attribution and settlement.',
        intro: 'One three-part rail sits beneath every booking. The site gives each part its own card and keeps the language calm and specific.',
        slots: [
          { type: 'media', image: prima.at('rail', 'PRIMA homepage section titled One rail beneath the whole night out, with three cards for access, attribution and settlement', '/'), caption: 'HOME / THE RAIL' },
          {
            type: 'cards',
            numbered: true,
            items: [
              { title: 'Access', text: 'Held inventory at partner restaurants, across every live market, under a single membership.' },
              { title: 'Attribution', text: 'Every introduction is recognised and recorded. Concierges, advisors and members all carry credit, and a guest is resolved once, then remembered.' },
              { title: 'Settlement', text: 'Whoever moved the guest is paid automatically, in real time and on an auditable record.' },
            ],
          },
        ],
      },
      {
        id: 'audiences',
        layout: 'top',
        kicker: 'THREE SIDES OF THE NETWORK',
        title: 'A page for each side of it.',
        intro: 'Restaurants, hotels and curators each have a dedicated entry: a hero built around their own goal, three steps, the benefits, and straight answers to the questions they would ask.',
        slots: [
          {
            type: 'features',
            items: [
              { image: prima.at('restaurants', 'PRIMA restaurants page hero headed Fill your floor on your terms', '/for-restaurants'), label: 'FOR RESTAURANTS', title: 'Fill prime tables on your terms', text: 'Set prime slots and pricing, distribute to a vetted network, get paid on prime bookings. Reservations flow into the system already in use.' },
              { image: prima.at('hotels', 'PRIMA hotels page hero headed Offer your guests the one amenity they actually want', '/for-hotels'), label: 'FOR HOTELS', title: 'Give guests the hardest tables', text: 'Concierges secure prime reservations across the stay, earn on every booking, and pay nothing to join.' },
              { image: prima.at('curators', 'PRIMA curators page hero headed Turn recommendations into revenue', '/website/concierges'), label: 'FOR CURATORS', title: 'Turn a taste for places into income', text: 'Curate favourites, share one link, and follow clicks, bookings and pending payouts on a live dashboard.' },
            ],
          },
        ],
      },
      {
        id: 'markets',
        layout: 'aside',
        aside: 4,
        kicker: 'CITY DISCOVERY',
        title: 'From market picker to city guide.',
        intro: 'Location is the main way into the product: a market selector on the homepage leads to city pages that pair a map with featured and complete restaurant lists.',
        points: [
          ['Market cards', 'Seven live cities, each a tall photograph with its restaurant count'],
          ['City pages', 'A map above featured and complete restaurant lists'],
          ['Roadmap', 'Upcoming cities appear as “coming soon” cards'],
        ],
        slots: [
          {
            type: 'media',
            image: prima.at('markets', 'PRIMA homepage market selector showing photographic city cards for Miami, New York, Los Angeles, Ibiza, London, Paris and Barcelona', '/'),
            caption: 'HOME / SELECT A MARKET',
            support: [
              { image: prima.at('city', 'PRIMA city page for Miami with a map of partner restaurants above a featured list', '/city/miami'), caption: 'CITY PAGE / MIAMI' },
              { image: prima.at('roadmap', 'PRIMA homepage section showing upcoming cities marked coming soon', '/'), caption: 'ROADMAP / COMING SOON' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'aside',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'The same product, on the phone people book from.',
        intro: 'On a phone, the market picker, the live app view and the city map all reflow into a single column. Headline, selector and proof keep their order, and the city guide leads with its map.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: prima.phone('m-home', 'PRIMA homepage on a phone with the recommendation economy headline and city market cards', '/'), caption: 'HOME' },
              { image: prima.phone('m-live', 'PRIMA live inventory section on a phone with the app view below the copy', '/'), caption: 'LIVE APP' },
              { image: prima.phone('m-city', 'PRIMA Miami city page on a phone with the restaurant map', '/city/miami'), caption: 'CITY GUIDE' },
            ],
          },
        ],
      },
    ],
  },

  bizcare: {
    overview: {
      title: 'ICHRA administration and enrollment on a single platform.',
      lead: 'BizCare Benefits sells an ICHRA platform to brokers, PEOs and employers, and the public site explains how the offer works in a single long page.',
      paragraphs: [
        'ICHRA is a way for employers to give employees a monthly tax-free allowance toward the individual health plan they choose. The page has to explain that model, its partnership options and its enrollment flow to several audiences at once.',
        'It does this with one scrolling page: an offer hero, a rotating platform panel, partner paths, a four-step process, and an about and closing section.',
      ],
      facts: [
        ['AUDIENCE', 'Brokers, PEOs, platform partners and employers'],
        ['STRUCTURE', 'One long page with a quote and contact call to action throughout'],
        ['OFFER', 'ICHRA administration with full marketplace enrollment'],
      ],
    },
    chapters: [
      {
        id: 'offer',
        layout: 'aside',
        kicker: 'THE OFFER',
        title: 'The platform, one benefit at a time.',
        intro: 'The hero names the category and its audience, and the first section pairs a product dashboard with a rotating panel so each benefit lands on its own.',
        points: [
          ['Enrollment', 'Full-service direct enrollment for on- and off-exchange plans, including Medicare eligibility'],
          ['No prefunding', 'Employers pay only for the policies their employees enroll in'],
          ['Integrations', 'Works with PEO, HRO, CDH and HCM platforms to reduce admin'],
          ['Quote tool', 'A free, no-commitment estimate tool to simplify the sales conversation'],
        ],
        slots: [
          { type: 'media', image: bizcare.at('platform', 'BizCare section titled A Single Platform, with a laptop showing a benefits dashboard beside a panel about enrollment flexibility'), caption: 'SECTION / A SINGLE PLATFORM' },
        ],
      },
      {
        id: 'process',
        layout: 'top',
        kicker: 'HOW IT WORKS',
        title: 'Four steps from budget to enrollment.',
        intro: 'The clearest explanation on the page is a short, illustrated four-step process. Each step names who acts and what happens next.',
        slots: [
          { type: 'media', image: bizcare.at('how-it-works', 'BizCare How It Works section with four illustrated steps: employer sets a budget, employees choose a plan, employer pays the invoice, enrollments are submitted'), caption: 'SECTION / HOW IT WORKS' },
          {
            type: 'cards',
            numbered: true,
            items: [
              { title: 'Employer sets a budget', text: 'The employer decides how much tax-free money to contribute each month instead of offering a traditional group plan.' },
              { title: 'Employees choose a plan', text: 'Employees shop for individual health insurance, on or off the exchange, that fits their family.' },
              { title: 'Employer pays the invoice', text: 'BizCare generates one exact invoice and the employer pays it.' },
              { title: 'Enrollments are submitted', text: 'Enrollments go to the carriers ahead of the group effective date.' },
            ],
          },
        ],
      },
      {
        id: 'partners',
        layout: 'aside',
        aside: 4,
        kicker: 'PARTNERSHIP PATHS',
        title: 'A path for each kind of partner.',
        intro: 'BizCare sells through brokers, PEOs and platform partners as well as to employers, so a rotating picker lists each partner type and changes its message to match.',
        points: [
          ['Brokers', 'A non-exclusive, free RFP option with training and sales material for their groups'],
          ['PEOs', 'The platform’s first partnerships, and possibly already integrated with their software'],
          ['Platforms', 'An embedded estimate, administration and enrollment tool inside their own product'],
        ],
        slots: [
          { type: 'media', image: bizcare.at('work-with', 'BizCare section titled We work with, with a vertical list of partner types beside a call to action card'), caption: 'SECTION / WE WORK WITH' },
        ],
      },
      {
        id: 'support',
        layout: 'top',
        kicker: 'BENEFITS AND SUPPORT',
        title: 'Support is presented as part of the product.',
        intro: 'After the process, the page turns from mechanics to relationship: what the service promises, and who is behind it.',
        slots: [
          {
            type: 'media',
            image: bizcare.at('benefits', 'BizCare Benefits of BizCare section with three cards: full-service partner, support that never stops, technology that works for you'),
            caption: 'SECTION / BENEFITS OF BIZCARE',
            support: [
              { image: bizcare.at('about', 'BizCare About Us section with a group portrait and notes to current and potential partners'), caption: 'ABOUT US' },
              { image: bizcare.at('closing', 'BizCare closing section headed A Smarter Way to Offer Benefits with a call to action'), caption: 'CLOSING' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'aside',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'The long page, reflowed for a phone.',
        intro: 'Illustrated steps, dashboards and partner cards stack into a single readable column. The offer hero, the platform panel and the four-step process keep their order and their call to action.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: bizcare.phone('m-home', 'BizCare homepage on a phone with the ICHRA hero and call to action'), caption: 'HERO' },
              { image: bizcare.phone('m-platform', 'BizCare platform section on a phone with the laptop dashboard and benefit card'), caption: 'PLATFORM' },
              { image: bizcare.phone('m-how', 'BizCare How It Works on a phone with the first illustrated steps'), caption: 'PROCESS' },
            ],
          },
        ],
      },
    ],
  },

  bansar: {
    overview: {
      title: 'Every route out of China, organised for depth.',
      lead: 'Bansar is a freight forwarder and customs broker in China. Its website lays out sea, air and rail freight, customs and regional shipping guides, each with a way to ask for a quote.',
      paragraphs: [
        'The site states more than ten years in logistics and speaks to importers, exporters and other freight forwarders shipping worldwide from any port or city in China.',
        'The result is a very large, content-heavy website: the homepage routes visitors to service pages that run to full guide length, and every page leads back to a quote request.',
      ],
      facts: [
        ['AUDIENCE', 'Importers, exporters and other freight forwarders'],
        ['LANGUAGES', 'English, Spanish, Portuguese and Chinese'],
        ['PAGE TYPES', 'Home, service guides, regional guides, quote, contact'],
      ],
    },
    chapters: [
      {
        id: 'services',
        layout: 'top',
        kicker: 'SERVICE ARCHITECTURE',
        title: 'Six services, each with a page of its own.',
        intro: 'The homepage sets the range out as a grid of service tiles, after first saying who the service is for. Each tile leads to a dedicated page for that mode or step of the journey.',
        slots: [
          {
            type: 'media',
            image: bansar.at('solutions', 'Bansar homepage grid of six service tiles: sea freight, air freight, railway freight, customs clearance, pickup and delivery, and shipping to Amazon FBA', '/'),
            caption: 'HOME / SHIPPING SOLUTIONS',
            support: [
              { image: bansar.at('who', 'Bansar homepage section titled Who ships with us, with importers and exporters and global freight forwarders', '/'), caption: 'HOME / WHO SHIPS WITH US' },
              { note: { label: 'TWO AUDIENCES, TWO ACTIONS', text: 'Before showing any service, the page splits its audience in two. Importers and exporters get a quote button; freight forwarders get a link to talk to the founder.' } },
            ],
          },
        ],
      },
      {
        id: 'guides',
        layout: 'aside',
        kicker: 'SERVICE PAGES',
        title: 'Every mode is a guide with a quote form beside it.',
        intro: 'Sea, air, rail and customs share one template: a short benefits list and a request form above the fold, then a long educational guide beneath.',
        points: [
          ['Sea', 'Ports, incoterms, container types, rates and transit times'],
          ['Air', 'The forwarding process step by step, plus IATA rules and cost factors'],
          ['Rail', 'Route options to Europe, Russia and Central Asia, and a long Q&A'],
          ['Customs', 'Classification, the role of a broker and how to speed up clearance'],
        ],
        slots: [
          {
            type: 'media',
            image: bansar.at('sea', 'Bansar sea freight page with a benefits list and a request form above the fold', '/sea-freight/'),
            caption: 'SEA FREIGHT',
            support: [
              { image: bansar.at('air', 'Bansar air freight page with a benefits list and a request form above the fold', '/air-freight/'), caption: 'AIR' },
              { image: bansar.at('rail', 'Bansar rail freight page with a benefits list and a request form above the fold', '/rail-freight/'), caption: 'RAIL' },
              { image: bansar.at('customs', 'Bansar customs clearance page with a benefits list and a request form above the fold', '/customs-clearance/'), caption: 'CUSTOMS' },
            ],
          },
        ],
      },
      {
        id: 'regions',
        layout: 'top',
        kicker: 'REGIONS AND LANGUAGES',
        title: 'Organised by where the cargo goes.',
        intro: 'The homepage shows routes fanning out from China on a world map, and the Ship by Region menu lists destinations such as the United States, Mexico, the Philippines and Singapore. The whole site is published in four languages.',
        slots: [
          {
            type: 'media',
            image: bansar.at('regions', 'Bansar homepage section headed Ship from China to any place you want, with a world map of shipping routes', '/'),
            caption: 'HOME / SHIP BY REGION',
            support: [
              { image: bansar.at('region', 'Bansar Shipping From China hub page with a guide to shipping to different regions', '/shipping-from-china/'), caption: 'SHIP BY REGION / HUB' },
              { image: bansar.at('chinese', 'Bansar homepage in Chinese with the same hero and service highlights', '/zh/'), caption: 'CHINESE EDITION' },
            ],
          },
        ],
      },
      {
        id: 'proof',
        layout: 'aside',
        kicker: 'PROOF AND SPECIAL CARGO',
        title: 'Client stories and unusual cargo, shown in context.',
        intro: 'Below the service grid, the homepage turns to the harder jobs and to what customers say about them.',
        points: [
          ['Special shipping', 'Dry cargo, a bus and railway freight shown as worked examples'],
          ['Client stories', 'A carousel of customer accounts of shipping from China'],
          ['Resources', 'A row of shipping guides under the heading Become an expert'],
        ],
        slots: [
          {
            type: 'media',
            image: bansar.at('special', 'Bansar homepage section on special shipping with dry cargo, bus and railway examples', '/'),
            caption: 'HOME / SPECIAL SHIPPING',
            support: [
              { image: bansar.at('stories', 'Bansar homepage carousel of client stories about shipping from China', '/'), caption: 'CLIENT STORIES' },
              { image: bansar.at('resources', 'Bansar homepage section of shipping guides under the heading Become an expert when shipping from China', '/'), caption: 'RESOURCES' },
            ],
          },
        ],
      },
      {
        id: 'quote',
        layout: 'top',
        kicker: 'QUOTE PATHS',
        title: 'A route to a quote on every page.',
        intro: 'The whole information architecture is built to end in an inquiry, and it offers that action at three levels of commitment so a visitor never has to look for it.',
        slots: [
          { type: 'media', image: bansar.at('quote', 'Bansar Get a Quick Quote page with a form asking for name, phone, email, product name and requirement', '/get-a-quick-quote/'), caption: 'QUOTE PAGE' },
          {
            type: 'cards',
            numbered: true,
            items: [
              { title: 'Header', text: 'A persistent Get Better Quote button beside the main navigation.' },
              { title: 'Service pages', text: 'A short request form beside each mode’s benefits.' },
              { title: 'Quote page', text: 'Name, email, phone, product and a detailed requirement.' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'aside',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'A very large site, reduced to one column.',
        intro: 'On a phone the navigation collapses into a menu button and the service tiles stack, so the same hierarchy reads top to bottom.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: bansar.phone('m-home', 'Bansar homepage on a phone with a menu button and the freight forwarding hero', '/'), caption: 'HOME' },
              { image: bansar.phone('m-sea', 'Bansar sea freight page on a phone with the benefits list', '/sea-freight/'), caption: 'SEA FREIGHT' },
              { image: bansar.phone('m-solutions', 'Bansar shipping solutions on a phone with stacked service tiles', '/'), caption: 'SERVICES' },
            ],
          },
        ],
      },
    ],
  },

  rantle: {
    overview: {
      title: 'A parts catalogue built around one action: send a part number.',
      lead: 'Rantle is an independent electronic-components distributor. Its website leads buyers from product families to part pages, and from every page to a quote request.',
      paragraphs: [
        'The site presents a supplier with more than twenty years in the components market, sourcing from a wide network of manufacturers and stockists, including hard-to-find and end-of-life parts.',
        'Category and part pages combine short product copy with a long technical FAQ, so one page serves both a buyer who knows the part and one still learning the category.',
      ],
      facts: [
        ['AUDIENCE', 'Manufacturers, brokers and electronics engineers'],
        ['APPLICATIONS', 'Industrial, automotive, medical, new energy, IoT, computing, AI and robotics'],
        ['PAGE TYPES', 'Home, product families, part pages, resources, blog, contact'],
      ],
    },
    chapters: [
      {
        id: 'trust',
        layout: 'aside',
        kicker: 'THE PROPOSITION',
        title: 'Credentials first, then the catalogue.',
        intro: 'The homepage opens with what the supplier promises before it opens the product range, which suits a buyer deciding whether to trust a distributor with an order. A numbered list keeps the argument to four lines.',
        points: [
          ['Experience', 'More than twenty years in electronic components distribution'],
          ['Delivery', 'Fast delivery on most orders, with prompt responses from sales'],
          ['Quality', 'Components tested by a QC team before dispatch'],
          ['Sourcing', 'Hard-to-find, allocated and obsolete parts located on request'],
        ],
        slots: [
          { type: 'media', image: rantle.at('why', 'Rantle homepage section listing four numbered reasons to choose the distributor', '/'), caption: 'HOME / WHY RANTLE' },
        ],
      },
      {
        id: 'catalogue',
        layout: 'top',
        kicker: 'THE CATALOGUE',
        title: 'Product families as a visual grid.',
        intro: 'Eight families are shown as photographed parts on a plain grid: IC chips, memory IC, transistors, diodes, power modules, capacitors, connectors and resistors. The manufacturers the distributor deals in and a standing inquiry band follow.',
        slots: [
          {
            type: 'media',
            image: rantle.at('products', 'Rantle homepage grid of product families: IC chips, memory IC, transistors, diodes, power modules, capacitors, connectors and resistors', '/'),
            caption: 'HOME / PRODUCT FAMILIES',
            support: [
              { image: rantle.at('brands', 'Rantle homepage section of popular manufacturer and distribution brand logos', '/'), caption: 'HOME / MANUFACTURERS' },
              { image: rantle.at('sourcing', 'Rantle homepage inquiry band with name, email, part number, quantity and requirement fields', '/'), caption: 'HOME / INQUIRY BAND' },
            ],
          },
        ],
      },
      {
        id: 'part-pages',
        layout: 'aside',
        kicker: 'PRODUCT PAGES',
        title: 'One template from category to part number.',
        intro: 'Category pages and single-part pages share a layout: a bold promise, a product image, a part-number quote form and then a long technical guide.',
        points: [
          ['Quote fields', 'Name, email, part number, quantity and free-text requirements'],
          ['Multiple parts', 'An Add parts and quantity control extends the request'],
          ['Where', 'On category and part pages, and repeated as a band on the homepage'],
        ],
        slots: [
          {
            type: 'media',
            image: rantle.at('category', 'Rantle IC chips category page with a hero promise, a Submit Your Part Number button and a product image', '/ic-chip/'),
            caption: 'CATEGORY / IC CHIPS',
            support: [
              { image: rantle.at('part', 'Rantle CH340G part page with the same hero layout and a product image', '/ch340g/'), caption: 'PART / CH340G' },
              { image: rantle.at('category-quote', 'Rantle quote form headed Tell us your part number to get instant quote', '/ic-chip/'), caption: 'INSTANT QUOTE FORM' },
            ],
          },
        ],
      },
      {
        id: 'depth',
        layout: 'top',
        kicker: 'TECHNICAL DEPTH',
        title: 'Every category page teaches the category.',
        intro: 'Beneath the quote form, category pages carry a long question-and-answer guide, written for engineers who are still choosing.',
        slots: [
          {
            type: 'cards',
            cols: 4,
            items: [
              { label: 'IC CHIPS', title: 'What they are and how to tell them apart', text: 'How they are made, the types, and how to identify one.' },
              { label: 'AMPLIFIER IC', title: 'How to choose and test', text: 'Key characteristics, testing and troubleshooting.' },
              { label: 'LOGIC IC', title: 'Families and design', text: 'Logic families, design techniques and testing.' },
              { label: 'INTERFACE IC', title: 'How they connect', text: 'How they work, what to weigh when choosing, and the standards involved.' },
            ],
          },
        ],
      },
      {
        id: 'buyer-info',
        layout: 'aside',
        kicker: 'BUYER INFORMATION',
        title: 'The terms of the order, stated up front.',
        intro: 'A Resource page sets out the practical terms of buying, and the homepage answers the usual questions in an FAQ.',
        points: [
          ['Resource page', 'Shipping and delivery terms, payment terms and component quality'],
          ['Warranty', 'Parts warranty, and refund and replacement policies'],
          ['FAQ', 'The homepage answers the usual buying questions'],
        ],
        slots: [
          {
            type: 'media',
            image: rantle.at('resource', 'Rantle Resource page covering shipping and delivery terms, with a message form beside it', '/resource/'),
            caption: 'RESOURCE / TERMS',
            support: [
              { image: rantle.at('faq', 'Rantle homepage FAQ about sourcing electronic components', '/'), caption: 'HOME / FAQ' },
              { image: rantle.at('about', 'Rantle About us page with a hero photograph and a description of the distributor', '/about-us/'), caption: 'ABOUT US' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'top',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'Dense product content, single column.',
        intro: 'On a phone the navigation folds into a menu icon and the hero, copy and call to action stack in reading order.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: rantle.phone('m-home', 'Rantle homepage on a phone with the sourcing specialist hero and quote button', '/'), caption: 'HOME' },
              { image: rantle.phone('m-category', 'Rantle IC chips category page on a phone with the hero and part-number button', '/ic-chip/'), caption: 'CATEGORY' },
            ],
          },
        ],
      },
    ],
  },

  'bum-life': {
    overview: {
      title: 'Five characters, one bench, one story world.',
      lead: 'Bum.Life is an animated comedy series, and its website introduces the show, its cast and its makers to viewers and to producers.',
      paragraphs: [
        'The site is built like a series pitch: a premise hero, featured clips, a cast of five characters with a profile page each, an image gallery, and an About page on the show’s humour and creator vision.',
        'A separate For Producers page then recasts the same material as a project: concept, audience fit and the contents of the pitch deck, with a one-pager to download and an inquiry form.',
      ],
      facts: [
        ['AUDIENCE', 'Animation viewers, and producers and funders'],
        ['SITE MAP', 'Home, Characters, Videos, Photos, About, For Producers, Contact'],
        ['SERIES FORMAT', '22-minute episodes, with a 13-episode season targeted'],
      ],
    },
    chapters: [
      {
        id: 'premise',
        layout: 'aside',
        kicker: 'THE PREMISE',
        title: 'A title, a tagline, then straight to the clips.',
        intro: 'The homepage opens on the series name and one line of premise over character art, then moves directly to the work: featured videos, the cast and a gallery.',
        points: [
          ['Title', 'The series name with its five-word premise line'],
          ['Actions', 'Watch Clips and Meet the Cast'],
          ['Backdrop', 'Character artwork behind the type, in the show’s black and yellow'],
        ],
        slots: [
          {
            type: 'media',
            image: bumLife.at('hero', 'Bum.Life homepage hero with the series title, its tagline and buttons to watch clips or meet the cast over character artwork', '/'),
            caption: 'HOME / HERO',
            support: [
              { image: bumLife.at('videos', 'Bum.Life homepage section of three featured videos with a Watch More on YouTube button', '/'), caption: 'HOME / FEATURED VIDEOS' },
              { note: { label: 'CLIPS', text: 'Each featured video is a thumbnail card with a title and episode number, and a single button leads on to the series’ YouTube channel.' } },
            ],
          },
        ],
      },
      {
        id: 'cast',
        layout: 'top',
        kicker: 'THE CAST',
        title: 'Five characters, each with a page of their own.',
        intro: 'The ensemble is the site’s centre of gravity: it appears on the homepage, on a Characters page and again as five individual profile pages.',
        slots: [
          {
            type: 'media',
            image: bumLife.at('characters', 'Bum.Life Characters page with five character cards: Phil, Roxy, Mikey, Richie and Jamal', '/characters.html'),
            caption: 'CHARACTERS PAGE',
            support: [
              { image: bumLife.at('character', 'Bum.Life profile page for Phil, the Philosopher, with a portrait and a panel of key characteristics', '/phil.html'), caption: 'CHARACTER PROFILE / PHIL' },
              { note: { label: 'A PROFILE, LIKE A CHARACTER SHEET', text: 'Each profile opens on the character’s title and tagline, then gives a portrait, a key-characteristics panel (strength, flaw, quirk and vibe) and a longer personality write-up.' } },
            ],
          },
          {
            type: 'cards',
            cols: 5,
            items: [
              { label: 'PHIL', title: 'The Philosopher', text: 'A deep thinker who turns trash into metaphors, wise or possibly just crazy.' },
              { label: 'ROXY', title: 'The Boss of the Crew', text: 'The loud, sassy powerhouse who calls out the group’s nonsense and keeps it in check.' },
              { label: 'MIKEY', title: 'The Prankster', text: 'The wild card, for whom life is one big prank and dull moments are there to be disrupted.' },
              { label: 'RICHIE', title: 'The Former Rich Guy', text: 'A one-time crypto hotshot, broke now but sure he is one deal from a comeback.' },
              { label: 'JAMAL', title: 'The Street Hustler', text: 'A street-smart schemer with a silver tongue, turning scraps into something valuable.' },
            ],
          },
        ],
      },
      {
        id: 'world',
        layout: 'aside',
        kicker: 'THE STORY WORLD',
        title: 'The world, in pictures and in words.',
        intro: 'Beyond the cast, the site gives the series a visual archive and a written point of view.',
        points: [
          ['Gallery', 'A grid of scenes from the series on the homepage'],
          ['Origin story', 'The About page opens on where the show came from'],
          ['Humour', 'A section on its humour style and character dynamics'],
        ],
        slots: [
          {
            type: 'media',
            image: bumLife.at('gallery', 'Bum.Life homepage image gallery of eight scenes from the series in a grid', '/'),
            caption: 'HOME / GALLERY',
            support: [
              { image: bumLife.at('about', 'Bum.Life About page opening on the origin story with a character illustration', '/about.html'), caption: 'ABOUT / ORIGIN STORY' },
              { image: bumLife.at('humor', 'Bum.Life About page section on humour style and character dynamics', '/about.html'), caption: 'ABOUT / HUMOUR' },
            ],
          },
        ],
      },
      {
        id: 'producers',
        layout: 'top',
        kicker: 'FOR PRODUCERS',
        title: 'The same show, pitched as a project.',
        intro: 'A dedicated page turns the series into something a producer can evaluate: what it is, who it is for, and what the pitch deck contains.',
        slots: [
          {
            type: 'media',
            image: bumLife.at('producers', 'Bum.Life For Producers page with a project concept and a series overview panel', '/producers.html'),
            caption: 'FOR PRODUCERS / CONCEPT',
            support: [
              { image: bumLife.at('pitch', 'Bum.Life pitch deck section listing what the deck contains, with download buttons', '/producers.html'), caption: 'FOR PRODUCERS / PITCH DECK' },
              { image: bumLife.at('producers-cta', 'Bum.Life homepage banner asking whether a visitor wants to fund or produce the series, with screener and one-pager buttons', '/'), caption: 'HOME / PRODUCER CALL TO ACTION' },
            ],
          },
          {
            type: 'cards',
            items: [
              { label: 'FORMAT', title: '22-minute episodes', text: 'With a 13-episode target season.' },
              { label: 'STYLE AND TONE', title: 'Adult animated comedy', text: 'Dark comedy with heart.' },
              { label: 'PLATFORM', title: 'Streaming and cable', text: 'As stated on the producers page.' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'aside',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'The dark stage, on a phone.',
        intro: 'The black-and-yellow palette and the character artwork carry over to a single column, with the cast stacked for reading.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: bumLife.phone('m-home', 'Bum.Life homepage on a phone with the series title and tagline', '/'), caption: 'HOME' },
              { image: bumLife.phone('m-cast', 'Bum.Life cast section on a phone with stacked character cards', '/'), caption: 'CAST' },
              { image: bumLife.phone('m-character', 'Bum.Life character profile for Phil on a phone', '/phil.html'), caption: 'PROFILE' },
            ],
          },
        ],
      },
    ],
  },

  'pnw-leads': {
    overview: {
      title: 'A lead-generation offer, explained on one page.',
      lead: 'PNWLeads is a concept for a Pacific Northwest lead-generation service. Its single page explains the offer to service businesses and ends on a contact action.',
      paragraphs: [
        'The page presents local SEO, targeted paid advertising and in-person canvassing as one three-part system for generating qualified leads.',
        'It is a compact conversion page: a dashboard-led hero, a proof band, the three-part process, testimonials and a closing call to action.',
      ],
      facts: [
        ['AUDIENCE', 'Service businesses in the Pacific Northwest'],
        ['STRUCTURE', 'A single page, with a header call to action'],
        ['PAGES', 'The navigation also names Services, Case Studies, About and Contact; the concept builds the home page'],
      ],
    },
    chapters: [
      {
        id: 'first-screen',
        layout: 'aside',
        kicker: 'FIRST SCREEN',
        title: 'A dashboard to make the outcome tangible.',
        intro: 'Before any process is explained, the hero shows what the service is selling. The headline speaks to service businesses tired of unqualified prospects, and a sample dashboard makes the result concrete.',
        points: [
          ['Headline', 'Qualified leads for service businesses, with the key phrase in the brand blue'],
          ['Actions', 'Book a Free Call, and Watch Demo'],
          ['Dashboard', 'A card of sample lead metrics'],
        ],
        slots: [
          { type: 'media', image: pnw.at('hero', 'PNWLeads homepage hero with a headline about qualified leads and a lead generation dashboard card'), caption: 'HOME / HERO' },
        ],
      },
      {
        id: 'proof',
        layout: 'top',
        kicker: 'PROOF',
        title: 'Three figures, then three testimonials.',
        intro: 'Trust is built in two stages: a short band of headline figures, then three customer quotes with star ratings.',
        slots: [
          {
            type: 'media',
            image: pnw.at('proof', 'PNWLeads proof band with three colour-coded statistic cards'),
            caption: 'HOME / PROOF BAND',
            support: [
              { image: pnw.at('testimonials', 'PNWLeads testimonials section with three star-rated customer quotes'), caption: 'HOME / TESTIMONIALS' },
              { note: { label: 'INTERFACE CONTENT, NOT RESULTS', text: 'The figures and quotes are content written for the concept. They show how proof would be presented and are not verified client results.' } },
            ],
          },
        ],
      },
      {
        id: 'process',
        layout: 'aside',
        aside: 4,
        kicker: 'THE PROCESS',
        title: 'One offer, three acquisition paths.',
        intro: 'The core of the page is a three-card process, each card given its own icon and colour.',
        slots: [
          { type: 'media', image: pnw.at('process', 'PNWLeads section with three process cards: local SEO optimisation, targeted paid advertising and in-person canvassing'), caption: 'HOME / THE PROCESS' },
          {
            type: 'cards',
            numbered: true,
            items: [
              { title: 'Local SEO', text: 'Improve the business’s online presence so it shows up in local search when customers need it.' },
              { title: 'Targeted paid ads', text: 'Campaigns aimed at ideal customers at the right moment, to make the advertising budget work harder.' },
              { title: 'In-person canvassing', text: 'Face-to-face outreach in the local market to build trust and generate leads.' },
            ],
          },
        ],
      },
      {
        id: 'conversion',
        layout: 'top',
        kicker: 'CONTACT PATH',
        title: 'Every section points to an action.',
        intro: 'The page keeps the next step in view from header to footer, in the style of each surface it sits on.',
        slots: [
          { type: 'media', image: pnw.at('cta', 'PNWLeads closing section on a dark surface asking visitors to scale their service business, with two buttons and a footer'), caption: 'HOME / CLOSING CALL TO ACTION' },
          {
            type: 'cards',
            items: [
              { label: 'HEADER', title: 'Get Started', text: 'A button beside the navigation, present from the first screen.' },
              { label: 'HERO', title: 'Book a Free Call', text: 'A primary action, with Watch Demo as the quieter alternative.' },
              { label: 'CLOSING', title: 'Grow My Leads Now', text: 'A final action with Chat With Us, above a footer with services and contact details.' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'aside',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'A short page that stacks cleanly.',
        intro: 'On a phone the hero, the three process cards and the closing call to action each take a full width.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: pnw.phone('m-home', 'PNWLeads homepage on a phone with the headline and two buttons'), caption: 'HERO' },
              { image: pnw.phone('m-process', 'PNWLeads process section on a phone with the first card'), caption: 'PROCESS' },
              { image: pnw.phone('m-cta', 'PNWLeads closing call to action on a phone'), caption: 'CLOSING' },
            ],
          },
        ],
      },
    ],
  },
}

export const caseStudyFor = (project) => CASE_STUDIES[project.slug] || {
  overview: { title: `${project.title} in focus.`, lead: project.summary, paragraphs: [], facts: [] },
  chapters: [],
}
