// Converts original browser captures without changing their interface content.
// Usage: node scripts/prepare-sanaira-media.mjs <capture-directory>
import { createRequire } from 'node:module'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const sharp = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const input = path.resolve(process.argv[2] || '.tmp-sanaira-captures')
const output = path.resolve('public/assets/projects/sanaira')
await mkdir(output, { recursive: true })
for (const name of await readdir(input)) {
  if (!name.endsWith('.jpg') || /^(home-strip-|portfolio-|brand-blue-|fixed-header-)/.test(name)) continue
  const stem = name.slice(0, -4)
  const source = path.join(input, name)
  await sharp(source).webp({ quality: 88, effort: 5 }).toFile(path.join(output, `ev-${stem}.webp`))
  await sharp(source).resize({ width: stem.startsWith('m-') ? 260 : 960, withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(path.join(output, `ev-${stem}-1x.webp`))
}
for (const name of ['hero', 'showcase', 'showcase-1x']) {
  await sharp(path.join(input, 'home-light.jpg')).webp({ quality: 88, effort: 5 }).toFile(path.join(output, `${name}.webp`))
}
await sharp(path.join(input, 'home-full.jpg')).webp({ quality: 88, effort: 5 }).toFile(path.join(output, 'fullpage.webp'))
await sharp(path.join(input, 'broker-app.jpg')).webp({ quality: 88, effort: 5 }).toFile(path.join(output, 'detail.webp'))
await sharp(path.join(input, 'm-home.jpg')).webp({ quality: 88, effort: 5 }).toFile(path.join(output, 'mobile.webp'))
await mkdir('public/assets/social', { recursive: true })
await sharp(path.join(input, 'home-light.jpg')).resize(1200, 630, { fit: 'contain', background: '#e2e9d9' }).jpeg({ quality: 90 }).toFile('public/assets/social/sanaira.jpg')
console.log('Sanaira original captures prepared.')
