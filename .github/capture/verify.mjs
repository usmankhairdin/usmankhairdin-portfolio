// Every page that shows PRIMA, plus the Corridor's Work room: which PRIMA image URLs the live site requests, and how they look.
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'

const SITE = 'https://www.usmankhairdin.com'
const OUT = 'review/v5'
await mkdir(OUT, { recursive: true })
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const watch = (page, label) => page.on('request', (r) => {
  const u = r.url()
  if (/\/assets\/projects\/prima\/|project-prima-desktop|work-project-desktop/.test(u)) log(`${label}  ${u.replace(SITE, '')}`)
})

// The Corridor: in through the door, then Menu > Work walks to the Work room
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
const page = await ctx.newPage(); watch(page, 'corridor /')
page.setDefaultTimeout(240000)
const shot = async (path) => { try { const cdp = await page.context().newCDPSession(page); const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 }); await writeFile(path, Buffer.from(data, 'base64')); log('shot ' + path) } catch (e) { log('! shot ' + path + ' ' + e.message.split('\n')[0]) } }
page.on('console', (m) => { if (m.type() === 'error') log('console error: ' + m.text().slice(0, 160)) })
try {
  await page.goto(SITE + '/', { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(8000)
  await shot(`${OUT}/corridor-1-outside.jpg`)
  await page.locator('.entry-door-hotspot').click({ timeout: 20000 }).catch((e) => log('door: ' + e.message.split('\n')[0]))
  await page.waitForTimeout(9000)
  await shot(`${OUT}/corridor-2-inside.jpg`)
  await page.locator('.hdr-menu').click({ timeout: 20000 }).catch((e) => log('menu: ' + e.message.split('\n')[0]))
  await page.waitForTimeout(1200)
  await page.locator('.menu-drawer__panel a', { hasText: /^Work$/ }).first().click({ timeout: 20000 }).catch((e) => log('work: ' + e.message.split('\n')[0]))
  for (let i = 1; i <= 4; i++) { await page.waitForTimeout(5000); await shot(`${OUT}/corridor-3-work-${i}.jpg`) }
  for (const [name, dx] of [['left', -500], ['right', 500]]) {
    await page.mouse.move(640, 400); await page.mouse.down(); await page.mouse.move(640 + dx, 400, { steps: 20 }); await page.mouse.up()
    await page.waitForTimeout(2500); await shot(`${OUT}/corridor-4-look-${name}.jpg`)
    await page.mouse.move(640 + dx, 400); await page.mouse.down(); await page.mouse.move(640, 400, { steps: 20 }); await page.mouse.up()
  }
} catch (e) { log('! corridor ' + e.message.split('\n')[0]) }
await writeFile(`${OUT}/requests.txt`, lines.join('\n') + '\n')
await browser.close()
