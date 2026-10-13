/*
 * Case-study evidence captures.
 *
 * Captures the specific live-page moments each project case study is built around (a section, a page top, a mobile view) as sharp,
 * retina-quality WebP files in public/assets/projects/<slug>/ev-<name>.webp, each with a smaller -1x variant for responsive loading.
 * Every capture is a plain browser render of the public page: nothing is composited, retouched or invented.
 *
 * Run:  node scripts/capture-case-study-evidence.mjs [slug | slug:name ...]      (no argument = every project; slug:name = one capture)
 *
 * Desktop shots are 1440x900 (the 16:10 proportion of the site's browser frame) at 2x, saved 1920 px wide; mobile shots are
 * 390x844 at 3x, saved 780 px wide. Fixed headers are hidden on scrolled shots so each crop is clean. A page that scrolls inside
 * its own container instead of the document (PRIMA's partner and About pages) is measured and scrolled through that container.
 */
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const sharp = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')

const root = path.resolve('public/assets/projects')
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

const PRIMA = 'https://primaapp.com'
const BIZ = 'https://www.usmankhairdin.com/portfolio/bizcare/'
const BANSAR = 'https://www.bansarchina.com'
const RANTLE = 'https://www.rantle.com'
const BUM = 'https://www.usmankhairdin.com/portfolio/bum.life'
const PNW = 'https://www.usmankhairdin.com/portfolio/PNWLeads/'

// { name, url, at: { text | y }, top: px above the landmark, mobile?: true, wait?: extra ms before the shot, prep?: async (page) => void }
const SHOTS = {
  prima: [
    { name: 'economy', url: `${PRIMA}/about`, at: { y: 0 } },
    // These sections reveal as they scroll in, so their landmarks measure off; the crops are set by position instead.
    { name: 'find-table', url: `${PRIMA}/about`, at: { y: 1258 } },
    { name: 'markets', url: `${PRIMA}/about`, at: { text: "Where you'll find us" }, top: 90 },
    { name: 'who-sent', url: `${PRIMA}/restaurants`, at: { y: 1700 } },
    { name: 'earnings', url: `${PRIMA}/hotels`, at: { text: 'How you earn' }, top: 24 },
    { name: 'city', url: `${PRIMA}/city/miami`, at: { y: 0 } },
    { name: 'restaurant', url: `${PRIMA}/restaurant/miami-zuma`, at: { y: 0 } },
    { name: 'restaurants', url: `${PRIMA}/restaurants`, at: { y: 0 } },
    { name: 'hotels', url: `${PRIMA}/hotels`, at: { y: 0 } },
    { name: 'curators', url: `${PRIMA}/curators`, at: { y: 0 } },
    { name: 'companies', url: `${PRIMA}/companies`, at: { y: 0 } },
    { name: 'm-home', url: `${PRIMA}/`, at: { y: 0 }, mobile: true },
    { name: 'm-restaurant', url: `${PRIMA}/restaurant/miami-zuma`, at: { y: 0 }, mobile: true },
    { name: 'm-city', url: `${PRIMA}/city/miami`, at: { y: 0 }, mobile: true },
  ],
  bizcare: [
    { name: 'platform', url: BIZ, at: { text: 'A Single Platform' }, top: 60 },
    { name: 'work-with', url: BIZ, at: { text: 'We work with' }, top: 90 },
    { name: 'benefits', url: BIZ, at: { text: 'Benefits of BizCare' }, top: 90 },
    { name: 'how-it-works', url: BIZ, at: { text: 'How It Works' }, top: 90 },
    { name: 'about', url: BIZ, at: { text: 'About Us' }, top: 120 },
    { name: 'closing', url: BIZ, at: { text: 'A Smarter Way to Offer Benefits' }, top: 220 },
    { name: 'm-home', url: BIZ, at: { y: 0 }, mobile: true },
    { name: 'm-platform', url: BIZ, at: { text: 'A Single Platform' }, top: 40, mobile: true },
    { name: 'm-how', url: BIZ, at: { text: 'How It Works' }, top: 40, mobile: true },
  ],
  bansar: [
    { name: 'who', url: `${BANSAR}/`, at: { text: 'Who Ships with us' }, top: 80 },
    { name: 'solutions', url: `${BANSAR}/`, at: { text: 'Bansar Will Provide You Best Shipping Solution' }, top: 80 },
    { name: 'regions', url: `${BANSAR}/`, at: { text: 'Ship from China to Any Place You Want' }, top: 80 },
    { name: 'special', url: `${BANSAR}/`, at: { text: 'Besides Normal Container Services' }, top: 80 },
    { name: 'stories', url: `${BANSAR}/`, at: { text: 'Listen to What Our Clients Say' }, top: 80 },
    { name: 'resources', url: `${BANSAR}/`, at: { text: 'Become an Expert When Shipping from China' }, top: 80 },
    { name: 'sea', url: `${BANSAR}/sea-freight/`, at: { y: 0 } },
    { name: 'air', url: `${BANSAR}/air-freight/`, at: { y: 0 } },
    { name: 'rail', url: `${BANSAR}/rail-freight/`, at: { y: 0 } },
    { name: 'customs', url: `${BANSAR}/customs-clearance/`, at: { y: 0 } },
    { name: 'region', url: `${BANSAR}/shipping-from-china/`, at: { y: 0 } },
    { name: 'quote', url: `${BANSAR}/get-a-quick-quote/`, at: { y: 0 } },
    { name: 'chinese', url: `${BANSAR}/zh/`, at: { y: 0 } },
    { name: 'm-home', url: `${BANSAR}/`, at: { y: 0 }, mobile: true },
    { name: 'm-sea', url: `${BANSAR}/sea-freight/`, at: { y: 0 }, mobile: true },
    { name: 'm-solutions', url: `${BANSAR}/`, at: { text: 'Bansar Will Provide You Best Shipping Solution' }, top: 30, mobile: true },
  ],
  rantle: [
    { name: 'why', url: `${RANTLE}/`, at: { text: 'Why RANTLE Can be Your Trusted' }, top: 80 },
    { name: 'products', url: `${RANTLE}/`, at: { y: 1780 } },
    { name: 'sourcing', url: `${RANTLE}/`, at: { text: 'Electronic Components Distributor Powerful' }, top: 60 },
    { name: 'brands', url: `${RANTLE}/`, at: { text: 'Popular Manufacturers' }, top: 80 },
    { name: 'faq', url: `${RANTLE}/`, at: { text: 'FAQ' }, top: 60 },
    { name: 'category', url: `${RANTLE}/ic-chip/`, at: { y: 0 } },
    { name: 'category-quote', url: `${RANTLE}/ic-chip/`, at: { text: 'Tell Us Your Part Number To Get Instant Quote' }, top: 100 },
    { name: 'part', url: `${RANTLE}/ch340g/`, at: { y: 0 } },
    { name: 'about', url: `${RANTLE}/about-us/`, at: { y: 0 } },
    { name: 'resource', url: `${RANTLE}/resource/`, at: { y: 0 } },
    { name: 'm-home', url: `${RANTLE}/`, at: { y: 0 }, mobile: true },
    { name: 'm-category', url: `${RANTLE}/ic-chip/`, at: { y: 0 }, mobile: true },
  ],
  'bum-life': [
    { name: 'hero', url: `${BUM}/`, at: { y: 0 } },
    { name: 'videos', url: `${BUM}/`, at: { text: 'Featured Videos' }, top: 100 },
    { name: 'gallery', url: `${BUM}/`, at: { text: 'Gallery' }, top: 90 },
    { name: 'producers-cta', url: `${BUM}/`, at: { text: 'Looking to fund or produce' }, top: 260 },
    { name: 'characters', url: `${BUM}/characters.html`, at: { y: 0 } },
    { name: 'character', url: `${BUM}/phil.html`, at: { y: 0 } },
    { name: 'about', url: `${BUM}/about.html`, at: { y: 0 } },
    { name: 'humor', url: `${BUM}/about.html`, at: { text: 'Humor Style' }, top: 90 },
    { name: 'producers', url: `${BUM}/producers.html`, at: { y: 0 } },
    { name: 'pitch', url: `${BUM}/producers.html`, at: { text: 'Pitch Deck Information' }, top: 80 },
    { name: 'm-home', url: `${BUM}/`, at: { y: 0 }, mobile: true },
    { name: 'm-cast', url: `${BUM}/`, at: { text: 'Meet the Cast' }, top: 40, mobile: true },
    { name: 'm-character', url: `${BUM}/phil.html`, at: { y: 0 }, mobile: true },
  ],
  'pnw-leads': [
    { name: 'hero', url: PNW, at: { y: 0 } },
    { name: 'proof', url: PNW, at: { text: 'Why Service Businesses Trust PNWLeads' }, top: 90 },
    { name: 'process', url: PNW, at: { text: 'How We Generate Qualified Leads For You' }, top: 90 },
    { name: 'testimonials', url: PNW, at: { text: 'What Our Clients Say' }, top: 90 },
    { name: 'cta', url: PNW, at: { text: 'Ready to Scale Your Service Business' }, top: 200 },
    { name: 'm-home', url: PNW, at: { y: 0 }, mobile: true },
    { name: 'm-process', url: PNW, at: { text: 'How We Generate Qualified Leads For You' }, top: 30, mobile: true },
    { name: 'm-cta', url: PNW, at: { text: 'Ready to Scale Your Service Business' }, top: 120, mobile: true },
  ],
}

async function decline(page) {
  for (const name of [/^decline$/i, /^i decline$/i, /^reject( all)?$/i, /essential only/i]) {
    const button = page.getByRole('button', { name }).first()
    if (await button.isVisible().catch(() => false)) { await button.click({ timeout: 2000 }).catch(() => {}); break }
  }
}

// Wait until the page's images have actually painted (the Bum.Life build serves large PNGs), then return to the top.
// The element that really scrolls is marked first: the document, or a full-height container that scrolls further than it.
async function settle(page) {
  await page.waitForTimeout(2600)
  await decline(page)
  await page.evaluate(async () => {
    let scroller = document.scrollingElement
    let extra = scroller.scrollHeight - scroller.clientHeight
    for (const el of document.querySelectorAll('body *')) {
      if (!/(auto|scroll)/.test(getComputedStyle(el).overflowY) || el.clientHeight < innerHeight * 0.6) continue
      if (el.scrollHeight - el.clientHeight > extra + 200) { scroller = el; extra = el.scrollHeight - el.clientHeight }
    }
    document.querySelectorAll('[data-shot-scroller]').forEach((el) => el.removeAttribute('data-shot-scroller'))
    if (scroller !== document.scrollingElement) scroller.setAttribute('data-shot-scroller', '1')
    const step = Math.round(innerHeight * 0.6)
    for (let y = 0; y < scroller.scrollHeight; y += step) { scroller.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 160)) }
    const deadline = Date.now() + 70000
    while (Date.now() < deadline) {
      const pending = [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0) && i.getBoundingClientRect().width > 8 && getComputedStyle(i).display !== 'none')
      if (!pending.length) break
      pending.forEach((i) => i.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await new Promise((r) => setTimeout(r, 500))
    }
    scroller.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(1200)
}

// Absolute page-Y of the landmark (in the scrolling container, when the page has one): the first heading whose text contains
// the phrase, else the deepest element that does. Whitespace is ignored so a heading split by <br> or spans still matches.
const locate = (page, phrase) => page.evaluate((needle) => {
  const norm = (value) => value.replace(/\s+/g, '').toLowerCase()
  const want = norm(needle)
  const shown = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' }
  const scroller = document.querySelector('[data-shot-scroller]')
  const top = (el) => Math.round(el.getBoundingClientRect().top + (scroller ? scroller.scrollTop - scroller.getBoundingClientRect().top : window.scrollY))
  for (const el of document.querySelectorAll('h1,h2,h3,h4')) if (shown(el) && norm(el.textContent).includes(want)) return top(el)
  let best = null
  for (const el of document.querySelectorAll('body *')) {
    if (/^(script|style|noscript|html|body)$/i.test(el.tagName) || !shown(el)) continue
    if (!norm(el.textContent).includes(want)) continue
    if ([...el.children].some((child) => norm(child.textContent).includes(want))) continue
    best = el
    break
  }
  return best ? top(best) : -1
}, phrase)

async function save(buffer, base, widths) {
  const [small, large] = widths
  await sharp(buffer).resize({ width: large }).webp({ quality: 80, effort: 5, smartSubsample: true }).toFile(`${base}.webp`)
  await sharp(buffer).resize({ width: small }).webp({ quality: 78, effort: 5, smartSubsample: true }).toFile(`${base}-1x.webp`)
}

async function run(slug, browser, only) {
  const groups = new Map()
  for (const shot of SHOTS[slug].filter((item) => !only || only.has(item.name))) {
    const key = `${shot.mobile ? 'm' : 'd'}|${shot.url}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(shot)
  }
  await mkdir(path.join(root, slug), { recursive: true })
  for (const [key, shots] of groups) {
    const mobile = key.startsWith('m')
    const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }
    const context = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 3 : 2, isMobile: mobile, hasTouch: mobile, userAgent: mobile ? MOBILE_UA : DESKTOP_UA })
    const page = await context.newPage()
    page.setDefaultTimeout(60000)
    const url = shots[0].url
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await settle(page)
    } catch (error) { console.log(`  ! ${slug} ${url}: ${String(error.message).split('\n')[0]}`); await context.close(); continue }

    for (const shot of shots) {
      try {
        let y = shot.at.y ?? 0
        if (shot.at.text) {
          const found = await locate(page, shot.at.text)
          if (found < 0) { console.log(`  ! ${slug}/${shot.name}: landmark "${shot.at.text}" not found`); continue }
          y = Math.max(0, found - (shot.top ?? 0))
        }
        if (shot.prep) await shot.prep(page)
        if (shot.wait) await page.waitForTimeout(shot.wait)
        const furthest = await page.evaluate(() => { const s = document.querySelector('[data-shot-scroller]') || document.scrollingElement; return s.scrollHeight - s.clientHeight })
        y = Math.min(y, Math.max(0, furthest))
        await page.evaluate((top) => (document.querySelector('[data-shot-scroller]') || document.scrollingElement).scrollTo({ top, behavior: 'instant' }), y)
        await page.waitForTimeout(900)
        // Hide fixed/sticky chrome so each crop is a clean page moment: bottom-anchored banners always, top bars once scrolled
        // (the very top of a page keeps its own header). A fixed layer that holds the page itself (its scrolling container, or a
        // full-screen backdrop) is page, not chrome, and stays.
        await page.evaluate(({ scrolled, height }) => {
          document.querySelectorAll('[data-shot-hidden]').forEach((el) => { el.style.visibility = ''; el.removeAttribute('data-shot-hidden') })
          const scroller = document.querySelector('[data-shot-scroller]')
          for (const el of document.querySelectorAll('body *')) {
            const position = getComputedStyle(el).position
            if (position !== 'fixed' && position !== 'sticky') continue
            const r = el.getBoundingClientRect()
            if (r.width < 60 || r.height < 12) continue
            if ((scroller && el.contains(scroller)) || r.height > height * 0.6) continue
            // a sticky panel low in the view (a booking column) is page content; only fixed layers there are banners
            const bottomAnchored = position === 'fixed' && r.top > height * 0.5
            if (bottomAnchored || (scrolled && (r.width > 200 || r.height > 20))) { el.style.visibility = 'hidden'; el.setAttribute('data-shot-hidden', '1') }
          }
        }, { scrolled: y > 40, height: viewport.height })
        await page.waitForTimeout(250)
        const buffer = await page.screenshot({ animations: 'disabled' })
        await save(buffer, path.join(root, slug, `ev-${shot.name}`), mobile ? [390, 780] : [960, 1920])
        console.log(`  ✓ ${slug}/ev-${shot.name}  (y=${y})`)
      } catch (error) { console.log(`  ! ${slug}/${shot.name}: ${String(error.message).split('\n')[0]}`) }
    }
    await context.close()
  }
}

const requested = process.argv.slice(2)
const plan = new Map() // slug -> Set of capture names, or null for all of that project's captures
for (const arg of requested.length ? requested : Object.keys(SHOTS)) {
  const [slug, name] = arg.split(':')
  if (!name) plan.set(slug, null)
  else if (plan.get(slug) !== null) plan.set(slug, (plan.get(slug) || new Set()).add(name))
}
const browser = await chromium.launch({ executablePath: chrome, headless: true })
for (const [slug, only] of plan) { console.log(slug); await run(slug, browser, only) }
await browser.close()
