import { projectAsset } from './projects.js'
import { sanairaCaseStudy } from './sanairaCaseStudy.js'
import { formaCaseStudy, veyravaelCaseStudy } from './featuredTemplateCaseStudies.js'
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


// A capture reference for one project: `at(name, alt, path)` for a desktop page moment, `phone(name, alt, path)` for a mobile view.
// `path` is the live page the capture was taken from (it labels the browser frame's address bar).
const captures = (slug, origin) => {
  const make = (name, alt, path, [small, large, height]) => ({
    src: projectAsset(slug, `ev-${name}.webp`),
    srcSet: `${projectAsset(slug, `ev-${name}-1x.webp`)} ${small}w, ${projectAsset(slug, `ev-${name}.webp`)} ${large}w`,
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


const rantle = captures('rantle', 'https://www.rantle.com')
const bumLife = captures('bum-life', 'https://www.usmankhairdin.com/portfolio/bum.life')


export const CASE_STUDIES = {
  sanaira: sanairaCaseStudy,
  forma: formaCaseStudy,
  veyravael: veyravaelCaseStudy,
  prima: {
    overview: {
      title: 'Bookings, recommendations and payouts on one network.',
      lead: 'A hospitality network where guests book held tables, concierges and curators share recommendations, and every introduction is tracked and rewarded.',
      paragraphs: [
        'The public site opens on a single interactive screen: a network of the people and places that recommend restaurants, from concierges and creators to hotels and companies, drawn around the PRIMA mark. Its About page names the idea, a “recommendation economy”, and shows the booking app with live times at real restaurants.',
        'Restaurants, hotels, curators and companies each get their own page explaining what a booking earns them. City pages map partner venues market by market, and every restaurant has a booking page of its own.',
      ],
      facts: [
        ['AUDIENCE', 'Guests, restaurants, hotels, curators and companies'],
        ['MARKETS', 'Seven live cities, eight more announced'],
        ['PAGE TYPES', 'Network home, partner pages, city guides, restaurant booking'],
      ],
    },
    chapters: [
      {
        id: 'proposition',
        layout: 'aside',
        kicker: 'THE PROPOSITION',
        title: 'Word of mouth, made visible.',
        intro: 'The About page frames recommending a restaurant as an economy of its own, then shows the product behind it: a phone running the PRIMA app, with tonight’s open times at real Miami restaurants.',
        points: [
          ['Real-time availability', 'Times shown live and booked directly, with no waiting for a call back'],
          ['One network, every city', 'The same app at home and when travelling'],
          ['A reward for recommending', 'Earn when someone books a restaurant you shared'],
        ],
        slots: [
          {
            type: 'media',
            image: prima.at('find-table', 'PRIMA About page section A better way to find your next table, with a phone showing tonight’s times at Miami restaurants between the benefits', '/about'),
            caption: 'ABOUT / FIND YOUR NEXT TABLE',
            support: [
              { image: prima.at('economy', 'PRIMA About page hero headed Welcome to the recommendation economy, over a still from its film', '/about'), caption: 'ABOUT / THE ARGUMENT' },
              { note: { label: 'THE ARGUMENT', text: 'Getting a good table should not mean endless searching, unanswered calls or calling in favours. PRIMA puts live availability in one app, and rewards the people whose recommendations bring the guest.' } },
            ],
          },
        ],
      },
      {
        id: 'model',
        layout: 'top',
        kicker: 'CORE MODEL',
        title: 'Two kinds of table, one shared fee.',
        intro: 'Every partner page explains the same model in its own terms: free tables, paid for by the restaurant; prime tables, paid for by the guest; and a share of that fee for whoever sent the booking.',
        slots: [
          {
            type: 'media',
            image: prima.at('earnings', 'PRIMA hotels page section How you earn: a property keeps 50% of the fee on a free table and 20% on a prime table, above a calculator for its own numbers', '/hotels'),
            caption: 'HOTELS / HOW YOU EARN',
            support: [
              { image: prima.at('who-sent', 'PRIMA restaurants page section More diners. Less guesswork., beside a booking card marked Recommended by a concierge', '/restaurants'), caption: 'RESTAURANTS / WHO SENT THEM' },
              { note: { label: 'ATTRIBUTION', text: 'Once a guest books through a hotel, their later PRIMA reservations stay attributed to it, in the same city or anywhere else in the network. A curator’s bookings are tracked back to their link.' } },
            ],
          },
          {
            type: 'cards',
            numbered: true,
            items: [
              { title: 'Standard tables', text: 'Free for the guest. The restaurant pays a per-guest fee only when guests arrive, and whoever sent them keeps half of it.' },
              { title: 'Prime tables', text: 'On sold-out nights the guest pays a separate fee for a top table. The restaurant keeps 60%, and PRIMA and whoever sent the guest take 20% each.' },
              { title: 'Attribution', text: 'Every booking is traced to the hotel, curator or company that sent it, and credited to their account.' },
            ],
          },
        ],
      },
      {
        id: 'audiences',
        layout: 'top',
        kicker: 'EVERY SIDE OF THE NETWORK',
        title: 'A page for each side of it.',
        intro: 'Restaurants, hotels, curators and companies each have a dedicated page: a hero built around their own goal, how it works for them, and what a booking earns them.',
        slots: [
          {
            type: 'features',
            items: [
              { image: prima.at('restaurants', 'PRIMA restaurants page hero headed Fill more tables. Pay only when we deliver.', '/restaurants'), label: 'FOR RESTAURANTS', title: 'Fill more tables, pay on arrival', text: 'Choose which tables to offer and what they cost, night by night. Bookings land in SevenRooms, OpenTable or the system already in use, with nothing new to install.' },
              { image: prima.at('hotels', 'PRIMA hotels page hero headed The amenity that actually pays', '/hotels'), label: 'FOR HOTELS', title: 'A dining page that pays', text: 'A booking page in the property’s own brand puts its restaurants, spa and events first, then the city’s hard-to-book tables, and goes live in 14 days or less.' },
              { image: prima.at('curators', 'PRIMA curators page hero headed Turn your restaurant recommendations into revenue', '/curators'), label: 'FOR CURATORS', title: 'Turn a taste for places into income', text: 'Pick restaurants from every city PRIMA holds tables in, share one link to a page of them, and earn on every booking made through it.' },
              { image: prima.at('companies', 'PRIMA companies page hero headed Bring more to the table', '/companies'), label: 'FOR COMPANIES', title: 'Great tables as a benefit', text: 'Customers, members or employees book through the company’s own app, website or benefits program, and the company earns a share of every booking fee.' },
            ],
          },
        ],
      },
      {
        id: 'markets',
        layout: 'aside',
        aside: 4,
        kicker: 'CITY DISCOVERY',
        title: 'From city tabs to a booked table.',
        intro: 'Location is the main way in. City tabs on the About page open each market’s restaurants, city pages pair a map with featured and complete lists, and every restaurant has a booking page with its available times.',
        points: [
          ['City tabs', 'Seven live cities, each opening a row of its partner restaurants'],
          ['City pages', 'A map above featured and complete restaurant lists'],
          ['Restaurant pages', 'Photographs, a short introduction and the times open today, tomorrow or on a chosen date'],
          ['Coming soon', 'Eight more destinations listed beneath the tabs'],
        ],
        slots: [
          {
            type: 'media',
            image: prima.at('markets', 'PRIMA About page section Where you’ll find us, with tabs for Miami, NY, London, Ibiza, Paris, Barcelona and LA above Miami restaurant photographs and the cities coming soon', '/about'),
            caption: 'ABOUT / WHERE YOU’LL FIND US',
            support: [
              { image: prima.at('city', 'PRIMA city page for Miami with a map of partner restaurants above a featured list', '/city/miami'), caption: 'CITY PAGE / MIAMI' },
              { image: prima.at('restaurant', 'PRIMA restaurant page for Zuma Miami: photographs, an About text and the Available times panel', '/restaurant/miami-zuma'), caption: 'RESTAURANT PAGE / ZUMA MIAMI' },
            ],
          },
        ],
      },
      {
        id: 'responsive',
        layout: 'aside',
        kicker: 'RESPONSIVE PRESENTATION',
        title: 'The same product, on the phone people book from.',
        intro: 'On a phone the network homepage, a restaurant’s booking page and the city guide each reflow into a single column. The booking page brings its available times straight under the restaurant’s name, and the city guide leads with its map.',
        slots: [
          {
            type: 'phones',
            items: [
              { image: prima.phone('m-home', 'PRIMA homepage on a phone with the recommendation network around the PRIMA mark', '/'), caption: 'HOME' },
              { image: prima.phone('m-restaurant', 'PRIMA restaurant page for Zuma Miami on a phone, with the times open today, tomorrow and Thursday', '/restaurant/miami-zuma'), caption: 'RESTAURANT PAGE' },
              { image: prima.phone('m-city', 'PRIMA Miami city page on a phone with the restaurant map', '/city/miami'), caption: 'CITY GUIDE' },
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


}

export const caseStudyFor = (project) => CASE_STUDIES[project.slug] || {
  overview: { title: `${project.title} in focus.`, lead: project.summary, paragraphs: [], facts: [] },
  chapters: [],
}
