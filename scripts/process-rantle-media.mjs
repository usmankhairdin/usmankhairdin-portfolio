import { createRequire } from 'node:module'
import { access, rm } from 'node:fs/promises'

const require = createRequire(import.meta.url)
const sharp = require('C:/Users/Usman/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')

const source = 'public/assets/projects/rantle/source.png'
if (await access(source).then(() => true).catch(() => false)) {
  const image = sharp(source)
  const { width = 1280, height = 960 } = await image.metadata()

  await sharp(source)
    .webp({ quality: 86, effort: 5, smartSubsample: true })
    .toFile('public/assets/projects/rantle/hero.webp')

  await sharp(source)
    .extract({ left: 0, top: Math.max(0, height - Math.min(540, height)), width, height: Math.min(540, height) })
    .webp({ quality: 86, effort: 5, smartSubsample: true })
    .toFile('public/assets/projects/rantle/detail.webp')

  await rm(source)
}

const bumSource = 'public/assets/projects/bum-life/source.png'
if (await access(bumSource).then(() => true).catch(() => false)) {
  await sharp(bumSource)
    .webp({ quality: 86, effort: 5, smartSubsample: true })
    .toFile('public/assets/projects/bum-life/hero.webp')
  await rm(bumSource)
}

const bumHero = 'public/assets/projects/bum-life/hero.webp'
if (await access(bumHero).then(() => true).catch(() => false)) {
  const { width = 1280, height = 800 } = await sharp(bumHero).metadata()
  const cropHeight = Math.min(650, height)
  await sharp(bumHero)
    .extract({ left: 0, top: Math.max(0, height - cropHeight), width, height: cropHeight })
    .webp({ quality: 86, effort: 5, smartSubsample: true })
    .toFile('public/assets/projects/bum-life/detail.webp')
}

const bizcareSource = 'public/assets/projects/bizcare/source.png'
if (await access(bizcareSource).then(() => true).catch(() => false)) {
  await sharp(bizcareSource)
    .webp({ quality: 86, effort: 5, smartSubsample: true })
    .toFile('public/assets/projects/bizcare/hero.webp')
  await rm(bizcareSource)
}
