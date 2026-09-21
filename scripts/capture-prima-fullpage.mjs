import { createRequire } from 'node:module'
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const sharp = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outFile = path.join(root, 'public/assets/projects/prima/fullpage.webp')
const pngFile = path.join(root, 'public/assets/projects/prima/fullpage.png')
await mkdir(path.dirname(outFile), { recursive: true })

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()

try {
  await page.goto('https://primaapp.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(3500)

  for (const name of [/^reject all$/i, /^decline$/i, /^essential only$/i]) {
    const btn = page.getByRole('button', { name }).first()
    if (await btn.isVisible()) { await btn.click(); break }
  }

  await page.evaluate(() => document.fonts.ready)

  let bottomReached = false
  for (let step = 0; step < 160; step++) {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), step * 650)
    await page.waitForTimeout(180)
    const atBottom = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)
    if (atBottom) {
      await page.waitForTimeout(1500)
      if (await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) {
        bottomReached = true; break
      }
    }
  }

  if (!bottomReached) {
    console.log(JSON.stringify({ status: 'blocked', reason: 'Could not reach stable page bottom' }))
    process.exitCode = 1
  } else {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(1000)

    const dims = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }))
    console.log(JSON.stringify({ status: 'dims', width: dims.width, height: dims.height }))

    const pngBuffer = await page.screenshot({ fullPage: true, animations: 'disabled', timeout: 60000 })
    await writeFile(pngFile, pngBuffer)
    console.log(JSON.stringify({ status: 'png_saved', file: pngFile, size: pngBuffer.length }))

    // Convert PNG → WebP using a two-pass approach to reduce memory pressure:
    // Pass 1: PNG → resized intermediate PNG (same dimensions, just re-encoded lighter)
    // Pass 2: intermediate → WebP with lowMemory + minimal effort
    const intermediate = path.join(root, 'public/assets/projects/prima/fullpage intermediate.png')

    try {
      // Re-encode PNG losslessly but with strip to reduce size before webp conversion
      await sharp(pngFile)
        .png({ compressionLevel: 9, force: true })
        .toFile(intermediate)

      const img = sharp(intermediate)
      const meta = await img.metadata()
      console.log(JSON.stringify({ status: 'intermediate_meta', width: meta.width, height: meta.height }))

      await img
        .webp({ quality: 85, effort: 2, smartSubsample: true, lowMemory: true })
        .toFile(outFile)

      // Clean up intermediate
      await unlink(intermediate).catch(() => {})

      const outMeta = await sharp(outFile).metadata()
      console.log(JSON.stringify({ status: 'saved', file: outFile, width: outMeta.width, height: outMeta.height, size: outMeta.size }))
    } catch (convertError) {
      console.log(JSON.stringify({ status: 'convert_failed', reason: convertError.message }))

      // Last resort: try direct from buffer with minimal settings
      try {
        const img = sharp(pngBuffer)
        await img
          .webp({ quality: 80, effort: 1, smartSubsample: false, lowMemory: true })
          .toFile(outFile)

        const outMeta = await sharp(outFile).metadata()
        console.log(JSON.stringify({ status: 'saved_v2', file: outFile, width: outMeta.width, height: outMeta.height, size: outMeta.size }))
      } catch (v2Error) {
        console.log(JSON.stringify({ status: 'v2_failed', reason: v2Error.message }))
        console.log(JSON.stringify({ status: 'fallback_png', file: pngFile }))
      }
    }

    // Always clean up the large PNG if webp succeeded
    try { await unlink(pngFile) } catch (_) {}
  }
} catch (error) {
  console.log(JSON.stringify({ status: 'error', reason: error.message }))
  process.exitCode = 1
} finally {
  await browser.close()
}
