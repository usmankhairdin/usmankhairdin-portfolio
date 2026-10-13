// Live portfolio after the PRIMA update: the two Personal Portfolio Web captures that show PRIMA, plus review pages.
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const SITE = 'https://www.usmankhairdin.com'
const OUT = 'review/v3'
await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: 'light' })
await ctx.addInitScript(() => { try { localStorage.setItem('ukd-theme', 'light'); sessionStorage.setItem('ukd-skip-boot', '1') } catch {} })
const save = (buf, name) => sharp(buf).webp({ quality: 95, effort: 4 }).toFile(`${OUT}/${name}.webp`)
const warm = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
  window.scrollTo(0, 0)
})

let page = await ctx.newPage()
await page.goto(SITE + '/work/prima/', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3500)
await save(await page.screenshot(), 'project-prima-desktop')
await page.close()

page = await ctx.newPage()
await page.goto(SITE + '/work/', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2500)
await warm(page); await page.waitForTimeout(1500)
const top = await page.evaluate(() => {
  const a = document.querySelector('.wk-project a[href="/work/prima/"]')
  const card = a?.closest('.wk-project')
  return card ? Math.round(card.getBoundingClientRect().top + window.scrollY) : -1
})
console.log('prima panel top', top)
for (const off of [0, 40, 80, 120]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, top - off))
  await page.waitForTimeout(2200)
  await save(await page.screenshot(), `work-project-desktop-o${off}`)
}
await page.close()

for (const path of ['/web/', '/work/prima/', '/about/', '/services/', '/work/personal-portfolio-web/']) {
  page = await ctx.newPage()
  await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2000); await warm(page); await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/page${path.replace(/\//g, '_').replace(/_$/, '')}.jpg`, fullPage: true, type: 'jpeg', quality: 70, scale: 'css' })
  await page.close()
}
await browser.close()
