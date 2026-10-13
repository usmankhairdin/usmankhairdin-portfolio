// PRIMA homepage top as the portfolio's "showcase" frame: 1440x900 viewport at 2x,
// saved 2880 wide (showcase.webp) and 1440 wide (showcase-1x.webp).
import { chromium } from 'playwright'
import sharp from 'sharp'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const out = 'public/assets/projects/prima'
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, userAgent: UA })).newPage()
await page.goto('https://primaapp.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2600)
for (const name of [/^decline$/i, /^i decline$/i, /^reject( all)?$/i, /essential only/i]) {
  const b = page.getByRole('button', { name }).first()
  if (await b.isVisible().catch(() => false)) { await b.click({ timeout: 2000 }).catch(() => {}); break }
}
await page.evaluate(() => document.fonts.ready)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1800)
const png = await page.screenshot({ animations: 'disabled' })
await sharp(png).resize({ width: 2880 }).webp({ quality: 84, effort: 5, smartSubsample: true }).toFile(`${out}/showcase.webp`)
await sharp(png).resize({ width: 1440 }).webp({ quality: 84, effort: 5, smartSubsample: true }).toFile(`${out}/showcase-1x.webp`)
console.log('showcase saved')
await browser.close()
