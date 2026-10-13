// PRIMA's redesigned pages scroll inside their own container, so the window is one screen tall.
// Find each page's scroller, report it, then unroll it and take the whole page 1440 wide.
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'

const SITE = 'https://primaapp.com'
const OUT = 'review/v6'
await mkdir(OUT, { recursive: true })
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const browser = await chromium.launch()

const findScrollers = (page) => page.evaluate(() => [...document.querySelectorAll('*')]
  .filter((el) => { const cs = getComputedStyle(el); return /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 50 })
  .map((el) => ({ tag: el.tagName, id: el.id, cls: String(el.className).slice(0, 80), sh: el.scrollHeight, ch: el.clientHeight })))

for (const path of ['/', '/restaurants', '/hotels', '/curators', '/companies', '/about']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, userAgent: UA })
  const page = await ctx.newPage()
  const name = path === '/' ? 'home' : path.slice(1)
  try {
    await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4000)
    const sc = await findScrollers(page)
    log(`${path}: window ${await page.evaluate(() => document.documentElement.scrollHeight)}, scrollers ${JSON.stringify(sc)}`)
    if (path === '/') {
      // does the wheel lead anywhere on the homepage?
      await page.mouse.move(720, 450)
      for (let i = 1; i <= 3; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(2000); log(`/ after wheel ${i}: url ${page.url()}`); await sharp(await page.screenshot()).webp({ quality: 80 }).toFile(`${OUT}/home-wheel-${i}.webp`) }
      await ctx.close(); continue
    }
    const target = sc.sort((a, b) => b.sh - a.sh)[0]
    if (!target) { log(`${path}: no inner scroller`); await ctx.close(); continue }
    // walk the scroller once so lazy images and reveal animations settle
    await page.evaluate(async (t) => {
      const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight === t.sh && e.clientHeight === t.ch)
      for (let y = 0; y < el.scrollHeight; y += 500) { el.scrollTop = y; await new Promise((r) => setTimeout(r, 250)) }
      el.scrollTop = 0
    }, target)
    await page.waitForTimeout(2500)
    // unroll: the scroller and its ancestors take their full height, so the window scrolls the whole page
    const total = await page.evaluate((t) => {
      const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight === t.sh && e.clientHeight === t.ch)
      const h = el.scrollHeight
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) { n.style.height = 'auto'; n.style.maxHeight = 'none'; n.style.overflow = 'visible' }
      el.style.height = h + 'px'
      document.documentElement.style.height = 'auto'; document.documentElement.style.overflow = 'visible'
      return document.documentElement.scrollHeight
    }, target)
    await page.waitForTimeout(2000)
    const buf = await page.screenshot({ fullPage: true, animations: 'disabled', timeout: 120000 })
    const meta = await sharp(buf).metadata()
    await sharp(buf).webp({ quality: 85, effort: 4 }).toFile(`${OUT}/full-${name}.webp`)
    log(`${path}: unrolled ${total}, saved ${meta.width}x${meta.height}`)
  } catch (e) { log(`! ${path} ${e.message.split('\n')[0]}`) }
  await ctx.close()
}
await writeFile(`${OUT}/log.txt`, lines.join('\n') + '\n')
await browser.close()
