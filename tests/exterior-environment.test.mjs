import assert from 'node:assert/strict'
import { test } from 'node:test'
import { layoutBuildings, TOWER_TOP, GLASS_Z, SITE } from '../src/rooms/cityPlan.js'
import { EXTERIOR_OFFSET } from '../src/rooms/gallerySite.js'

test('the UKD skyline stays below the original gallery tower', () => {
  const layout = layoutBuildings()
  const neighbors = layout.boxes.filter(b => b.h !== TOWER_TOP)
  assert.ok(neighbors.every(b => b.y + b.h < TOWER_TOP - 5))
})

test('the compact exterior reduces geometry while keeping the original tower footprint', async () => {
  const { exteriorLayout, islandDistance } = await import('../src/rooms/exteriorPlan.js').catch(() => ({}))
  assert.equal(typeof exteriorLayout, 'function', 'compact UKD exterior must be available')
  const compact = exteriorLayout()
  const original = layoutBuildings()
  assert.ok(compact.boxes.length > 100)
  assert.ok(compact.boxes.length < original.boxes.length * .65)
  assert.ok(compact.trees.length < 200)
  assert.ok(compact.poles.length < 1800)
  const tower = compact.boxes.find(b => b.h === TOWER_TOP)
  assert.ok(tower, 'the existing gallery tower must still support the corridor')
  assert.equal(tower.x + EXTERIOR_OFFSET[0], 0)
  assert.ok(Math.abs(tower.z + EXTERIOR_OFFSET[2] - (GLASS_Z - (SITE.d0 + SITE.d1) / 2)) < 1e-8)
  for (const b of compact.boxes.filter(b => b !== tower)) {
    assert.ok(islandDistance(b.x, b.z) + Math.hypot(b.w / 2, b.d / 2) < -180, 'buildings stay inland')
  }
  assert.ok(islandDistance(tower.x, tower.z) < -180)
  assert.ok(islandDistance(2500, tower.z) > 0, 'the city ends in open ocean')
})

test('exterior assets include every glTF dependency without archived source models', async () => {
  const { readFile, stat } = await import('node:fs/promises')
  const { dirname, resolve } = await import('node:path')
  const paths = ['apartments-near']
  const dependencies = new Set()
  for (const name of paths) {
    const file = resolve('public/assets/city/apartments', `${name}.gltf`)
    let contents
    try { contents = await readFile(file, 'utf8') } catch { /* assertion explains the missing port */ }
    assert.ok(contents, `${name} runtime geometry is required`)
    const model = JSON.parse(contents)
    for (const { uri } of [...model.buffers, ...model.images]) dependencies.add(resolve(dirname(file), uri))
  }
  let bytes = 0
  for (const file of dependencies) bytes += (await stat(file)).size
  assert.ok(bytes < 10 * 1024 * 1024, 'runtime facade assets must remain under 10 MiB')
})

test('the reference ocean retains full horizon coverage within its expanded surf allocation', async () => {
  const { createCoastGeometry } = await import('../src/rooms/coastGeometry.js')
  const geometry = createCoastGeometry()
  geometry.computeBoundingBox()
  assert.ok(geometry.attributes.position.count < 350000)
  assert.ok(geometry.index.count / 3 < 700000)
  assert.ok(geometry.boundingBox.min.x < -2400 && geometry.boundingBox.max.x > 2400)
  assert.ok(geometry.boundingBox.min.z < -2400 && geometry.boundingBox.max.z > 2400)
  assert.ok([...geometry.attributes.position.array].every(Number.isFinite))
  geometry.dispose()
})
