import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as layout from '../src/experience/corridorLayout.js'
import { MASTER_TERRACE_DOOR } from '../src/experience/terraceDoor.js'
import { isFree, isOutside, slide } from '../src/experience/walkable.js'
import { HELIPAD_FLOODS } from '../src/rooms/helicopterPlacement.js'

test('both exterior flanks exactly match entrance to the last room glass', () => {
  const distance = layout.START_Z - MASTER_TERRACE_DOOR.z
  assert.equal(typeof layout.buildingSideRuns, 'function')
  const sides = layout.buildingSideRuns()
  assert.equal(sides.length, 2)
  for (const side of sides) {
    assert.ok(Math.abs(side.length - distance) < 1e-10)
    assert.ok(Math.abs(side.z + side.length / 2 - layout.FACADE_Z) < 1e-10)
    assert.ok(Math.abs(side.z - side.length / 2 - layout.BUILDING.sideBackZ) < 1e-10)
  }
  assert.equal(sides[0].x, -sides[1].x)
})

test('large terrace, master room and helicopter retain their positions', () => {
  assert.deepEqual(layout.TERRACE, { half: 42, edgeZ: 23.5, backZ: -86 })
  assert.deepEqual(layout.HELIPAD, { x: 0, z: -76, radius: 7.3 })
  assert.equal(MASTER_TERRACE_DOOR.z, -65.77)
  for (const light of HELIPAD_FLOODS) {
    assert.equal(light.position[2], layout.BUILDING.sideBackZ - .24,
      'rear fixtures stay attached to the shortened stone piers')
    assert.deepEqual(light.target, [0, 1.2, -76])
  }
  assert.equal(isFree(0, -65.2, () => 0), true, 'last room stays usable to its original end')
  assert.equal(isFree(0, -66, () => 0), false, 'closed rear glazing stays solid')
  for (const offset of [-.01, 0, .01]) {
    assert.equal(isOutside(layout.BUILDING.sideBackZ + offset, 0), false,
      'the join between footprint rectangles remains inside the master room')
  }
})

test('shortened flanks have matching collision corners and a continuous rear terrace', () => {
  const z = layout.BUILDING.sideBackZ - .5
  for (const side of [-1, 1]) {
    const x = side * 20
    assert.equal(isFree(x, z, () => 0), true, 'new corner apron is walkable')
    assert.equal(isFree(x, layout.BUILDING.sideBackZ + .1, () => 0), false)
    const out = []
    assert.equal(slide(side * 30.5, z, -side * 10.5, 0, () => 0, out), true)
    assert.ok(Math.abs(out[0] - x) < 1e-8)
  }
})
