// PRIMA's redesigned pages scroll inside #door (a fixed, viewport-tall container). Scroll it a screen at a time and
// join the screens into one 1440-wide full page. Every pixel is a plain render of the live page.
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'

const SITE = 'https://primaapp.com'
const OUT = 'review/v7'
const W = 1440, H = 900
await mkdir(OUT, { recursive: true })
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const browser = await chromium.launch()

for (const path of ['/restaurants', '/hotels', '/curators', '/companies']) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, userAgent: UA })
  const page = await ctx.newPage()
  const name = path.slice(1)
  try {
    await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(4000)
    const total = await page.evaluate(async () => {
      const el = document.getElementById('door')
      for (let y = 0; y < el.scrollHeight; y += 450) { el.scrollTop = y; await new Promise((r) => setTimeout(r, 300)) }
      el.scrollTop = 0
      return el.scrollHeight
    })
    await page.waitForTimeout(2500)
    const parts = []
    for (let top = 0; ; top += H) {
      const y = Math.min(top, total - H)
      await page.evaluate(({ y, first }) => {
        const el = document.getElementById('door')
        el.scrollTop = y
        // fixed chrome appears once: bottom-anchored pills never, top bars only on the first screen
        for (const n of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(n)
          if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
          if (n === el || n.contains(el)) continue
          const r = n.getBoundingClientRect()
          if (r.width < 40 || r.height < 12) continue
          const bottom = r.top > innerHeight * 0.5
          n.style.visibility = bottom || !first ? 'hidden' : ''
        }
      }, { y, first: top === 0 })
      await page.waitForTimeout(900)
      const shot = await page.screenshot({ animations: 'disabled' })
      const keep = top === 0 ? H : (y === top ? H : top + H - (total - H) - 0) // rows of this screen not yet covered
      const from = H - Math.min(H, (y + H) - top)
      parts.push({ input: await sharp(shot).extract({ left: 0, top: from, width: W, height: H - from }).toBuffer(), top })
      if (y + H >= total) break
    }
    const img = sharp({ create: { width: W, height: total, channels: 3, background: '#000' } }).composite(parts.map((p) => ({ input: p.input, top: p.top, left: 0 })))
    await img.webp({ quality: 85, effort: 4 }).toFile(`${OUT}/full-${name}.webp`)
    log(`${path}: ${parts.length} screens, ${W}x${total}`)
  } catch (e) { log(`! ${path} ${e.message.split('\n')[0]}`) }
  await ctx.close()
}
await writeFile(`${OUT}/log.txt`, lines.join('\n') + '\n')
await browser.close()
