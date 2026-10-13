// Mechanical migration of old UKD blue literals onto the logo-derived shared tokens.
// Original project palettes, screenshots, 3D assets and corridor styles are excluded.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const postcss = require('postcss')
const files = ['src/styles.css']
for (const directory of ['src/pages', 'src/components', 'src/theme']) {
  const collect = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory() && entry.name !== 'sanaira') collect(file)
      else if (entry.isFile() && file.endsWith('.css')) files.push(file)
    }
  }
  collect(directory)
}
const corridor = /\.experience-root|\.room-|\.wall-|\.corridor|\.entry-door|\.entry-portal|\.work-led|\.work-wall|\.contact-room|\.experience-intro|\.experience-mark|\.scroll-hint|\.topbar--immersive|\.gallery-|\.door-|\.exterior-/
const primary = /#(?:455dff|5368ff|3157ff|3148e7|3d56ec|1954df|184bc5|3549b8)\b/gi
const bright = /#(?:8ea0ff|94a7ff|6a7dff)\b/gi
let count = 0
for (const file of files) {
  const before = readFileSync(file, 'utf8')
  const css = postcss.parse(before)
  css.walkDecls(declaration => {
    const rule = declaration.parent
    if (rule.type === 'rule' && (corridor.test(rule.selector) || rule.selector.includes('[data-mode="immersive"]'))) return
    if (file === 'src/styles.css' && rule.type === 'rule' && rule.selector === ':root') return
    const textRole = declaration.prop === 'color' || /(?:accent-text|editorial-accent$|about-accent$|dw-accent$)/.test(declaration.prop)
    const token = textRole ? 'var(--brand-blue-text)' : 'var(--brand-blue)'
    const after = declaration.value
      .replace(primary, token)
      .replace(bright, 'var(--brand-blue-text)')
      .replace(/rgba\(\s*(?:69\s*,\s*93|83\s*,\s*104|49\s*,\s*87)\s*,\s*255\s*,\s*([\d.]+)\s*\)/gi, 'rgb(var(--brand-blue-rgb) / $1)')
      .replace(/rgb\(\s*(?:69\s+93|83\s+104|49\s+87)\s+255\s*\/\s*([\d.]+)\s*\)/gi, 'rgb(var(--brand-blue-rgb) / $1)')
    if (after !== declaration.value) { declaration.value = after; count++ }
  })
  const after = css.toString()
  if (after !== before) writeFileSync(file, after)
}
console.log(`Migrated ${count} Web color declarations to shared brand tokens.`)
