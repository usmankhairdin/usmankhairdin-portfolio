import { createRequire } from 'node:module'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const sharp = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')

const root = path.resolve('public/assets/projects')
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const projects = [
  { slug: 'prima', url: 'https://primaapp.com/', landmark: 'One rail beneath' },
  { slug: 'bum-life', url: 'https://www.usmankhairdin.com/portfolio/bum.life/', landmark: 'Meet our lovable gang' },
]

async function saveWebp(page, file, options = {}) {
  const png = `${file}.png`
  await page.screenshot({ path: png, animations: 'disabled', ...options })
  await sharp(png).webp({ quality: 84, effort: 5, smartSubsample: true }).toFile(file)
  await rm(png)
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2600)
  for (const name of [/decline/i, /reject/i, /essential only/i]) {
    const button = page.getByRole('button', { name }).first()
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 2000 }).catch(() => {})
      break
    }
  }
  await page.waitForTimeout(650)
}

async function capture(project, browser) {
  const output = path.join(root, project.slug)
  await mkdir(output, { recursive: true })

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await desktop.newPage()
  await page.goto(project.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await settle(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  // The Bum.Life desktop background is suppressed by its own headless CSS path;
  // its hero is captured from the public mshots rendering in the companion script.
  if (project.slug !== 'bum-life') await saveWebp(page, path.join(output, 'hero.webp'))

  const landmark = page.getByText(project.landmark, { exact: false }).first()
  if (await landmark.count()) {
    await landmark.evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' })).catch(() => {})
    await page.evaluate(() => window.scrollBy(0, -90))
  } else {
    await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight * .36)))
  }
  await page.waitForTimeout(2600)
  await saveWebp(page, path.join(output, 'detail.webp'))
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  const mobilePage = await mobile.newPage()
  await mobilePage.goto(project.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await settle(mobilePage)
  await mobilePage.evaluate(() => window.scrollTo(0, 0))
  await saveWebp(mobilePage, path.join(output, 'mobile.webp'))
  await mobile.close()
}

const browser = await chromium.launch({ executablePath: chrome, headless: true })
try {
  const requested = new Set(process.argv.slice(2))
  const selected = requested.size ? projects.filter(project => requested.has(project.slug)) : projects
  for (const project of selected) {
    process.stdout.write(`Capturing ${project.slug}...\n`)
    await capture(project, browser)
  }
} finally {
  await browser.close()
}
