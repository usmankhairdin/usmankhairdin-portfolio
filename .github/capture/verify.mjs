// Every page that shows PRIMA, plus the Corridor's Work room: which PRIMA image URLs the live site requests, and how they look.
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const SITE = 'https://www.usmankhairdin.com'
const OUT = 'review/v4'
await mkdir(OUT, { recursive: true })
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const watch = (page, label) => page.on('request', (r) => {
  const u = r.url()
  if (/\/assets\/projects\/prima\/|project-prima-desktop|work-project-desktop/.test(u)) log(`${label}  ${u.replace(SITE, '')}`)
})

for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  for (const path of ['/web/', '/work/', '/work/prima/', '/about/', '/work/personal-portfolio-web/']) {
    const page = await ctx.newPage(); watch(page, `${label} ${path}`)
    try {
      await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } })
      await page.waitForTimeout(1500)
    } catch (e) { log(`! ${label} ${path} ${e.message.split('\n')[0]}`) }
    await page.close()
  }
  await ctx.close()
}

// The Corridor: in through the door, then Menu > Work walks to the Work room
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await ctx.newPage(); watch(page, 'corridor /')
page.on('console', (m) => { if (m.type() === 'error') log('console error: ' + m.text().slice(0, 160)) })
try {
  await page.goto(SITE + '/', { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(8000)
  await page.screenshot({ path: `${OUT}/corridor-1-outside.jpg`, quality: 75 })
  await page.locator('.entry-door-hotspot').click({ timeout: 20000 }).catch((e) => log('door: ' + e.message.split('\n')[0]))
  await page.waitForTimeout(9000)
  await page.screenshot({ path: `${OUT}/corridor-2-inside.jpg`, quality: 75 })
  await page.locator('.hdr-menu').click({ timeout: 20000 }).catch((e) => log('menu: ' + e.message.split('\n')[0]))
  await page.waitForTimeout(1200)
  await page.locator('.menu-drawer__panel a', { hasText: /^Work$/ }).first().click({ timeout: 20000 }).catch((e) => log('work: ' + e.message.split('\n')[0]))
  for (let i = 1; i <= 4; i++) { await page.waitForTimeout(5000); await page.screenshot({ path: `${OUT}/corridor-3-work-${i}.jpg`, quality: 80 }) }
  for (const [name, dx] of [['left', -500], ['right', 500]]) {
    await page.mouse.move(720, 450); await page.mouse.down(); await page.mouse.move(720 + dx, 450, { steps: 20 }); await page.mouse.up()
    await page.waitForTimeout(2500); await page.screenshot({ path: `${OUT}/corridor-4-look-${name}.jpg`, quality: 80 })
    await page.mouse.move(720 + dx, 450); await page.mouse.down(); await page.mouse.move(720, 450, { steps: 20 }); await page.mouse.up()
  }
} catch (e) { log('! corridor ' + e.message.split('\n')[0]) }
await writeFile(`${OUT}/requests.txt`, lines.join('\n') + '\n')
await browser.close()
