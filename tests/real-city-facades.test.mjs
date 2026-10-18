import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import * as THREE from 'three'
import { exteriorLayout } from '../src/rooms/exteriorPlan.js'
import { planRealBuilding, planRealRound } from '../src/rooms/realCityBuildingPlan.js'
import * as facade from '../src/rooms/realCityFacade.js'

test('distant facades retain every side and a solid roof without repeated source geometry', () => {
  assert.equal(typeof facade.createDistantArchitecture, 'function')
  const box = planRealBuilding({ x: 0, z: 0, y: 0, w: 20, d: 16, h: 30 })
  const round = planRealRound({ x: 50, z: 0, y: 0, w: 20, d: 16, h: 30 })
  const distant = facade.createDistantArchitecture([box, round])
  assert.equal(distant.entries[0].count, 30, 'four quad walls plus a two triangle roof')
  assert.equal(distant.entries[1].count, round.faces.length * 9 - 6, 'polygon walls and a closed fan roof')
  const geometry = distant.mesh.geometry
  const index = geometry.index.array
  const points = geometry.getAttribute('position')
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), normal = new THREE.Vector3()
  for (const entry of distant.entries) {
    for (let i = 0; i < entry.indices.length; i += 3) {
      a.fromBufferAttribute(points, entry.indices[i])
      b.fromBufferAttribute(points, entry.indices[i + 1])
      c.fromBufferAttribute(points, entry.indices[i + 2])
      const cross = b.sub(a).cross(c.sub(a))
      assert.ok(cross.lengthSq() > 0, 'no degenerate triangles')
      normal.fromBufferAttribute(geometry.getAttribute('normal'), entry.indices[i])
      assert.ok(cross.dot(normal) > 0, 'all walls and roofs face outward for opaque depth occlusion')
    }
  }
  distant.pack(new Uint8Array([2, 0]))
  assert.equal(geometry.drawRange.count, 30)
  distant.pack(new Uint8Array([0, 2]))
  assert.equal(geometry.drawRange.count, round.faces.length * 9 - 6)
  assert.equal(geometry.index.array, index, 'turning reuses the resident index allocation')
  distant.dispose()
})

test('visibility reacts to turning and projection changes while bounding downloaded near detail', () => {
  assert.equal(typeof facade.createArchitectureVisibility, 'function')
  const buildings = [
    planRealBuilding({ x: 0, z: -30, y: 0, w: 10, d: 10, h: 20 }),
    planRealBuilding({ x: 0, z: -80, y: 0, w: 10, d: 10, h: 20 }),
  ]
  const visibility = facade.createArchitectureVisibility(buildings, new Float64Array([300000, 500000]), 700000)
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 500)
  camera.position.set(0, 10, 0)
  camera.updateMatrixWorld()
  const rootMatrix = new THREE.Matrix4()
  assert.equal(visibility.update(camera, rootMatrix, 180), true)
  assert.deepEqual([...visibility.state], [1, 2], 'nearest detailed building wins; next keeps its distant facade')
  assert.equal(visibility.update(camera, rootMatrix, 180), false)
  camera.rotation.y = Math.PI
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [0, 0], 'rotation alone culls behind-camera lots')
  camera.rotation.y = 0
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [1, 2], 'returning restores the same complete buildings')
  camera.far = 50
  camera.updateProjectionMatrix()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [1, 0], 'projection changes invalidate visibility')
  rootMatrix.makeTranslation(0, -96, 0)
  camera.position.y = -86
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [1, 0], 'ground translation keeps culling and near distances in building coordinates')
  rootMatrix.makeTranslation(1000, -96, 0)
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [0, 0], 'parent movement invalidates the local frustum')
})

test('the compact exterior stays below one million building triangles for every near selection', async () => {
  assert.equal(typeof facade.assembleArchitecture, 'function')
  const plan = facade.assembleArchitecture(exteriorLayout())
  const gltf = JSON.parse(await readFile('public/assets/city/apartments/apartments-near.gltf', 'utf8'))
  const costs = new Map(gltf.nodes.map(node => [node.name, gltf.meshes[node.mesh].primitives.reduce((sum, p) => sum + gltf.accessors[p.indices].count / 3, 0)]))
  const triangleCosts = new Float64Array(plan.buildings.length)
  for (const module of plan.modules) {
    const cost = costs.get(module.name) ?? (module.name === 'core' ? 12 : module.name.startsWith('coreRound-') ? Number(module.name.slice(10)) * 4 : module.name === 'roofRound' ? 48 : 2)
    for (const entry of module.entries) triangleCosts[entry.buildingIndex] += cost * entry.count
  }
  const distant = facade.createDistantArchitecture(plan.buildings)
  const allFarTriangles = distant.entries.reduce((sum, entry) => sum + entry.count / 3, 0)
  assert.ok(allFarTriangles < 15000, `all distant facades use ${allFarTriangles} triangles`)
  assert.ok(facade.NEAR_TRIANGLE_BUDGET + allFarTriangles < 1000000, 'the detail cap plus every far building fits the budget')
  const camera = new THREE.PerspectiveCamera(75, 1.8, .1, 5000)
  const visibility = facade.createArchitectureVisibility(plan.buildings, triangleCosts)
  let sawDownloadedFacade=false
  for (const building of plan.buildings) {
    camera.position.set(building.x, building.y + Math.min(building.h / 2, 18), building.z + building.d / 2 + 8)
    camera.lookAt(building.x, building.y + building.h / 2, building.z)
    camera.updateMatrixWorld()
    visibility.update(camera, new THREE.Matrix4(), 180)
    sawDownloadedFacade ||= visibility.state.some(value=>value===1)
    let nearTriangles = 0
    for (let i = 0; i < triangleCosts.length; i++) if (visibility.state[i] === 1) nearTriangles += triangleCosts[i]
    assert.ok(nearTriangles <= facade.NEAR_TRIANGLE_BUDGET)
  }
  assert.ok(sawDownloadedFacade, 'downloaded geometry remains in use across the near-view sweep, regardless of final lot order')
  distant.dispose()
})

test('walking bob at the near threshold cannot flash between different facade representations', () => {
  const building = planRealBuilding({ x: 0, z: -190, y: 0, w: 20, d: 20, h: 25 })
  const visibility = facade.createArchitectureVisibility([building], new Float64Array([300000]))
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 500)
  camera.position.set(0, 10, -.2)
  camera.updateMatrixWorld()
  const rootMatrix = new THREE.Matrix4()
  visibility.update(camera, rootMatrix, 180)
  assert.equal(visibility.state[0], 1)
  for (const z of [.2, -.1, .1, -.2, .15]) {
    camera.position.z = z
    camera.updateMatrixWorld()
    visibility.update(camera, rootMatrix, 180)
    assert.equal(visibility.state[0], 1, 'sub-metre bob preserves the existing downloaded facade')
  }
  camera.position.z = 50
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.equal(visibility.state[0], 2, 'moving away still releases near geometry')
})

test('budget ties and changing view direction preserve established nearby facade detail', () => {
  const buildings = [-12, 12].map(x => planRealBuilding({ x, z: -40, y: 0, w: 10, d: 10, h: 20 }))
  const visibility = facade.createArchitectureVisibility(buildings, new Float64Array([400000, 400000]), 700000)
  const camera = new THREE.PerspectiveCamera(90, 1, .1, 500)
  const rootMatrix = new THREE.Matrix4()
  camera.position.set(-.1, 10, 0)
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [1, 2])
  camera.position.x = .1
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [1, 2], 'a tiny distance-ranking reversal cannot switch both buildings')
  camera.rotation.y = -.65
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.equal(visibility.state[1], 2, 'a detailed neighbor leaving the frustum must not promote this building')
  camera.rotation.y = 0
  camera.position.x = 35
  camera.updateMatrixWorld()
  visibility.update(camera, rootMatrix, 180)
  assert.deepEqual([...visibility.state], [2, 1], 'a material approach toward the other building can transfer the detail budget')
})

test('far window masks use deterministic mip levels that preserve light energy under minification', () => {
  assert.equal(typeof facade.createFacadePatternTexture, 'function')
  const texture = facade.createFacadePatternTexture()
  const repeat = facade.createFacadePatternTexture()
  assert.deepEqual(texture.image.data, repeat.image.data, 'facades have no frame-dependent lighting or grain')
  assert.equal(texture.minFilter, THREE.LinearMipmapLinearFilter)
  assert.equal(texture.magFilter, THREE.LinearFilter)
  assert.ok(texture.mipmaps.length >= 8, 'unresolved window grids have averaged mip levels')
  const energy = data => {
    let sum = 0
    for (let i = 2; i < data.length; i += 4) sum += data[i]
    return sum / (data.length / 4)
  }
  const baseEnergy = energy(texture.image.data)
  assert.ok(baseEnergy > 3 && baseEnergy < 100, 'only part of the glazing emits interior light')
  let previousVariance = Infinity
  for (const level of texture.mipmaps) {
    const mean = energy(level.data)
    let variance = 0
    for (let i = 2; i < level.data.length; i += 4) variance += (level.data[i] - mean) ** 2
    variance /= level.data.length / 4
    assert.ok(variance <= previousVariance + 1, 'smaller windows lose unstable high-frequency contrast')
    assert.ok(Math.abs(mean - baseEnergy) < 3, 'lit windows do not extinguish or brighten with distance')
    previousVariance = variance
  }
  texture.dispose()
  repeat.dispose()
})

test('downloaded glazing and filtered distant windows retain the same interior light decisions', () => {
  assert.equal(typeof facade.facadeWindowLight, 'function')
  const texture = facade.createFacadePatternTexture()
  for (let family = 0; family < 6; family++) for (const seed of [.03, .57, .92]) {
    for (let side = 0; side < 4; side++) for (let bay = 0; bay < 4; bay++) for (let floor = 0; floor < 4; floor++) {
      const column = (bay + Math.floor(seed * 31 + side)) % 4, row = (floor + Math.floor(seed * 17)) % 4
      const left = (family % 4) * 128 + 16 + column * 24
      const bottom = Math.floor(family / 4) * 128 + 16 + row * 24
      let litPixels = 0
      for (let y = bottom; y < bottom + 24; y++) for (let x = left; x < left + 24; x++) {
        litPixels += texture.image.data[(y * texture.image.width + x) * 4 + 2]
      }
      assert.equal(facade.facadeWindowLight(family, seed, bay, floor, side), litPixels > 0 ? 1 : 0)
    }
  }
  const plan = facade.assembleArchitecture([{ x: 0, z: -30, y: 0, w: 20, d: 18, h: 30 }])
  const glazing = plan.modules.filter(module => /^(?:window_|door_)/.test(module.name)).flatMap(module => module.entries)
  assert.ok(glazing.length > 0)
  for (const entry of glazing) {
    assert.equal(entry.glow.length, entry.count, 'each downloaded window carries its stable light decision')
    assert.ok(entry.glow.every(value => value === 0 || value === 1))
  }
  texture.dispose()
})
