// Second pass for PRIMA's redesigned site. Writes candidates to review/v2 for choosing frames by eye.
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'

const SITE = 'https://primaapp.com'
const OUT = 'review/v2'
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
await mkdir(OUT, { recursive: true })
const log = []
const note = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }
const save = (buf, name) => sharp(buf).webp({ quality: 95, effort: 4 }).toFile(`${OUT}/${name}.webp`)

async function decline(page) {
  for (const name of [/^decline$/i, /^i decline$/i, /^reject( all)?$/i, /essential only/i]) {
    const b = page.getByRole('button', { name }).first()
    if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 2000 }).catch(() => {}); note('cookie:', String(name)); break }
  }
}

const browser = await chromium.launch()
const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, userAgent: DESKTOP_UA }
const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: MOBILE_UA }

// 1. Where the old partner/city URLs land now
for (const path of ['/for-hotels', '/for-restaurants', '/website/concierges', '/city/miami', '/hotels', '/restaurants', '/curators', '/companies']) {
  const ctx = await browser.newContext(desktop); const page = await ctx.newPage()
  try {
    const res = await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(1500)
    const h = await page.evaluate(() => [...document.querySelectorAll('h1,h2')].slice(0, 4).map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
    note('URL', path, '->', page.url(), res?.status(), 'height', await page.evaluate(() => document.documentElement.scrollHeight), '::', h)
  } catch (e) { note('URL', path, 'ERR', e.message.split('\n')[0]) }
  await ctx.close()
}

// 2. Homepage frames over time (the network keeps drifting), desktop 2x and mobile 3x
for (const [label, opts] of [['home-d', desktop], ['home-m', mobile]]) {
  const ctx = await browser.newContext(opts); const page = await ctx.newPage()
  await page.goto(SITE + '/', { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1500); await decline(page)
  await page.evaluate(() => document.fonts.ready)
  for (const t of [4, 6, 8, 10, 13, 16, 20, 25]) {
    const elapsed = await page.evaluate(() => performance.now() / 1000)
    if (elapsed < t) await page.waitForTimeout((t - elapsed) * 1000)
    await save(await page.screenshot(), `${label}-t${t}`)
  }
  if (label === 'home-d') {
    note('home text:', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1500))
    // what is behind "Learn more"
    const lm = page.getByText(/learn more/i).first()
    if (await lm.isVisible().catch(() => false)) {
      await lm.click().catch((e) => note('learn more click failed', e.message.split('\n')[0]))
      await page.waitForTimeout(3500)
      note('after learn more url:', page.url(), 'height', await page.evaluate(() => document.documentElement.scrollHeight))
      note('after learn more text:', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 2500))
      await save(await page.screenshot(), 'home-d-learnmore')
      for (let i = 1; i <= 4; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(1500); await save(await page.screenshot(), `home-d-learnmore-${i}`) }
    } else note('no visible Learn more')
  }
  await ctx.close()
}

// 3. Partner pages at their current addresses, page top, a few moments apart (entrance animations)
for (const [name, path] of [['hotels', '/hotels'], ['restaurants', '/restaurants'], ['curators', '/curators']]) {
  const ctx = await browser.newContext(desktop); const page = await ctx.newPage()
  await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1500); await decline(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  for (const t of [3, 6, 10]) { await page.waitForTimeout(t === 3 ? 3000 : (t === 6 ? 3000 : 4000)); await save(await page.screenshot(), `${name}-t${t}`) }
  await ctx.close()
}

await writeFile(`${OUT}/log.txt`, log.join('\n') + '\n')
await browser.close()
