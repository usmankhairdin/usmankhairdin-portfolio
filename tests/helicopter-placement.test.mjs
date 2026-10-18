import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HELIPAD, BUILDING, TERRACE, PLAZA_STAND_Z } from '../src/experience/corridorLayout.js'
import { BODY, isFree, roofRoute, slide } from '../src/experience/walkable.js'

const plan = await import('../src/rooms/helicopterPlacement.js').catch(() => ({}))

test('the parked helicopter uses one world transform for the model and its collision footprint', () => {
  assert.equal(typeof plan.helicopterWorldPoint, 'function')
  assert.equal(typeof plan.isHelicopterBlocked, 'function')
  const { x, y, z, scale, yaw } = plan.HELICOPTER_PLACEMENT
  assert.equal(x, HELIPAD.x)
  assert.equal(z, HELIPAD.z)
  assert.equal(y, -.075, 'skids touch the actual roof plane')
  assert.equal(scale, 1, 'the real Bell 206 retains its metre-scale proportions')
  const nose = plan.helicopterWorldPoint([5, 0, 0])
  assert.ok(nose[2] > z, 'the nose faces the gallery side of the pad')
  assert.ok(Math.abs(nose[0] - x - Math.cos(yaw)*5*scale) < 1e-10)
  for (const local of [[2,0,0],[2,0,1],[-3,0,0],[-5.5,0,-.4]]) {
    const point = plan.helicopterWorldPoint(local)
    assert.equal(plan.isHelicopterBlocked(point[0], point[2], .38), true)
  }
  for (const local of [[2,0,2.5],[-3,0,2],[-7.8,0,1.5],[0,0,5]]) {
    const point = plan.helicopterWorldPoint(local)
    assert.equal(plan.isHelicopterBlocked(point[0], point[2], .38), false)
  }
  assert.equal(plan.isHelicopterBlocked(HELIPAD.x+7.8, HELIPAD.z, .38), false, 'the rotor overhead does not block the whole pad')
})

test('the licensed asset is self contained and every actual vertex clears the roof and fits the pad', async () => {
  assert.equal(typeof plan.helicopterWorldPoint, 'function')
  const bytes = fs.readFileSync(new URL(`../public${plan.HELICOPTER_MODEL_URL}`, import.meta.url))
  const jsonLength = bytes.readUInt32LE(12)
  const json = JSON.parse(bytes.subarray(20, 20+jsonLength).toString())
  assert.match(json.asset.extras.author,/terran4627/)
  assert.match(json.asset.extras.license,/CC-BY-4.0/)
  assert.match(json.asset.extras.title,/Bell 206/)
  assert.ok(json.images.length >= 1)
  assert.ok(json.images.every(image => image.bufferView != null), 'textures are bundled, with no third-party network requests')
  assert.ok(json.buffers.every(buffer => !buffer.uri))
  globalThis.self ??= globalThis
  const loader = new GLTFLoader()
  // Geometry and transforms are parsed by the production loader. Image decoding
  // is irrelevant to placement, and is unavailable in the Node test process.
  loader.register(parser => {
    parser.loadTexture = async () => new THREE.Texture()
    parser.loadTextureImage = async () => new THREE.Texture()
    return { name: 'placement-test-textures' }
  })
  const { scene } = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset+bytes.byteLength), '')
  scene.updateMatrixWorld(true)
  let vertices=0, triangles=0, maxRadius=0, minY=Infinity, maxY=-Infinity, minZ=Infinity, maxZ=-Infinity
  const groundedSkids = new Set()
  const p = new THREE.Vector3()
  scene.traverse(mesh => {
    if (!mesh.isMesh) return
    const positions=mesh.geometry.attributes.position
    vertices+=positions.count
    triangles+=(mesh.geometry.index?.count ?? positions.count)/3
    for(let i=0;i<positions.count;i++) {
      p.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld)
      const [x,y,z]=plan.helicopterWorldPoint(p.toArray())
      maxRadius=Math.max(maxRadius,Math.hypot(x-HELIPAD.x,z-HELIPAD.z))
      minY=Math.min(minY,y);maxY=Math.max(maxY,y);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z)
      if (p.y<1e-7 && Math.abs(p.z)>.9) groundedSkids.add(Math.sign(p.z))
    }
  })
  assert.deepEqual([...groundedSkids].sort(),[-1,1], 'both left and right skids are grounded')
  assert.equal(vertices,8698, 'all source geometry is retained')
  assert.equal(triangles,6014, 'the full source exterior remains intact')
  assert.ok(Math.abs(maxY-minY-3.3115062713623047)<1e-6, 'the Bell retains its real 3.31 m height')
  assert.ok(maxRadius<HELIPAD.radius-.25, `rotor and tail fit inside the painted pad: ${maxRadius}`)
  assert.ok(Math.abs(minY-plan.HELICOPTER_PLACEMENT.y)<1e-7)
  assert.ok(minZ>TERRACE.backZ+2, 'tail clears the rear parapet')
  assert.ok(maxZ<BUILDING.backZ-4, 'the aircraft clears the gallery windows and door')
})

test('roof routing corners clear the real cabin and tail with space for a walker to turn', () => {
  assert.equal(typeof plan.helicopterRouteCorners, 'function')
  const corners = plan.helicopterRouteCorners(.38)
  assert.ok(corners.length>=6)
  for (const [x,z] of corners) {
    assert.equal(plan.isHelicopterBlocked(x,z,.38), false)
    assert.ok(x>-TERRACE.half+2 && x<TERRACE.half-2)
    assert.ok(z>TERRACE.backZ+2 && z<BUILDING.backZ-2)
  }
})

test('walking stops at the cabin and tail while both sides of the pad remain accessible', () => {
  const open = () => 1
  for (const local of [[2,0,0],[-3,0,0],[-5.5,0,-.4]]) {
    const [x,,z] = plan.helicopterWorldPoint(local)
    assert.equal(isFree(x,z,open),false, `solid helicopter part at ${local}`)
  }
  const [sx,,sz] = plan.helicopterWorldPoint([2,0,3.1])
  const [tx,,tz] = plan.helicopterWorldPoint([2,0,0])
  const out = []
  slide(sx,sz,tx-sx,tz-sz,open,out)
  assert.equal(isFree(...out,open),true, 'a long movement cannot tunnel into the cabin')
  assert.equal(plan.isHelicopterBlocked(...out,BODY),false)
  assert.ok(Math.hypot(out[0]-tx,out[1]-tz)>.5)
  for (const side of [-1,1]) {
    const [ax,,az] = plan.helicopterWorldPoint([2,0,side*3])
    const [bx,,bz] = plan.helicopterWorldPoint([-6.8,0,side*3])
    assert.equal(slide(ax,az,bx-ax,bz-az,open,out),true)
    assert.ok(Math.hypot(out[0]-bx,out[1]-bz)<1e-7, 'walking along either side stays open')
  }
})

test('roof return routes clear the helicopter from its two sides, tail and nose', () => {
  const open = () => 1
  for (const local of [[2,0,3],[2,0,-3],[-8.9,0,0],[7,0,0]]) {
    const [sx,,sz] = plan.helicopterWorldPoint(local)
    assert.equal(isFree(sx,sz,open),true, 'return starts on accessible deck')
    const route = roofRoute(sx,sz)
    assert.ok(route.length>0, `a roof route exists from ${local}`)
    assert.deepEqual(route.at(-1),[0,PLAZA_STAND_Z])
    assert.ok(route.some(([x])=>Math.abs(x)>BUILDING.half), 'the return goes round the gallery')
    let [x,z]=[sx,sz]
    for (const [tx,tz] of route) {
      const steps=Math.ceil(Math.hypot(tx-x,tz-z)/.08)
      for (let i=0;i<=steps;i++) {
        const px=x+(tx-x)*i/steps, pz=z+(tz-z)*i/steps
        assert.equal(isFree(px,pz,open),true, `roof route intersects an obstacle at ${px},${pz}`)
        assert.equal(plan.isHelicopterBlocked(px,pz,BODY),false)
      }
      ;[x,z]=[tx,tz]
    }
  }
})
