// Full-page captures of the live portfolio pages that show PRIMA, so the new frames can be checked in place.
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const SITE = 'https://www.usmankhairdin.com'
const PAGES = ['/web/', '/work/', '/work/prima/', '/services/', '/about/', '/work/personal-portfolio-web/', '/work/personal-portfolio-3d/']
await mkdir('review', { recursive: true })
const browser = await chromium.launch()
for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  for (const path of PAGES) {
    const page = await context.newPage()
    try {
      await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)) }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(1500)
      const name = `${label}${path.replace(/\//g, '_')}`.replace(/_$/, '')
      await page.screenshot({ path: `review/${name}.jpg`, fullPage: true, type: 'jpeg', quality: 70 })
      console.log('review', name)
    } catch (e) { console.log('! review', path, e.message.split('\n')[0]) }
    await page.close()
  }
  await context.close()
}
await browser.close()
