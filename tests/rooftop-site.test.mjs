import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import { doors } from '../src/data/projects.js'
import { FACADE_Z, TERRACE, HELIPAD, TERRACE_WALK_BOUNDS, START_Z, END_Z } from '../src/experience/corridorLayout.js'
import { isFree, isOutside, routeTo, slide } from '../src/experience/walkable.js'
import { MASTER_TERRACE_DOOR, terraceDoor, terraceDoorPose, terraceLeafBlocks } from '../src/experience/terraceDoor.js'

const open = () => 1
const front=TERRACE.edgeZ, back=TERRACE.backZ
test('the parapet is opaque from the deck up on every side and through all four corners', async () => {
  const { createTerraceParapetGeometry } = await import('../src/experience/terraceParapet.js').catch(() => ({}))
  assert.equal(typeof createTerraceParapetGeometry, 'function', 'shared wall geometry is available to the exterior')
  const geometry = createTerraceParapetGeometry(-.075)
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
  const wall = new THREE.Mesh(geometry.wall, material)
  const metal = new THREE.Mesh(geometry.metal, material)
  wall.updateMatrixWorld(); metal.updateMatrixWorld()
  const hit = (mesh, origin, direction) => new THREE.Raycaster(new THREE.Vector3(...origin), new THREE.Vector3(...direction).normalize(), 0, 2).intersectObject(mesh).length > 0
  try {
    for (const y of [-.065, .32, .69]) {
      for (const z of [back+.4, -60, -30, 0, front-.4]) {
        assert.ok(hit(wall, [40.5,y,z], [1,0,0]), `right wall missing at ${y},${z}`)
        assert.ok(hit(wall, [-40.5,y,z], [-1,0,0]), `left wall missing at ${y},${z}`)
      }
      for (const x of [-41.7, -20, 0, 20, 41.7]) {
        assert.ok(hit(wall, [x,y,front-1.6], [0,0,1]), `front wall missing at ${x},${y}`)
        assert.ok(hit(wall, [x,y,back+1.6], [0,0,-1]), `rear wall missing at ${x},${y}`)
      }
      for (const x of [-1,1]) for (const z of [-1,1]) {
        const rear = z < 0
        assert.ok(hit(wall, [x*40.8,y,rear ? back+1.2 : front-1.2], [x,0,z]), 'corner must be continuously filled')
      }
    }
    assert.ok(hit(metal, [41.74,.5,back+.26], [0,1,0]), 'corner rail is supported from the coping')
    assert.ok(hit(metal, [41.74,1.2,back+.26], [0,-1,0]), 'corner handrail is joined above its support')
  } finally {
    Object.values(geometry).forEach(g => g.dispose())
    material.dispose()
  }
})

test('a walker cannot overlap the coping on any roof edge or escape through a corner', () => {
  // These positions leave 80 cm to the deck edge: the old thin glass rail
  // admitted them, but a full parapet must leave room for the visitor's body.
  for (const point of [[41.2, -30], [-41.2, -30], [0, front-.8], [0, back+.8],
    [41.2, front-.8], [-41.2, front-.8], [41.2, back+.8], [-41.2, back+.8]]) {
    assert.equal(isFree(...point, open), false, `walker overlaps parapet at ${point}`)
  }
  for (const point of [[41.1, -30], [-41.1, -30], [0, front-.9], [0, back+.9]]) {
    assert.equal(isFree(...point, open), true, `walkable deck remains open at ${point}`)
  }
  for (const [x, z, dx, dz] of [[40.8,front-1.2,6,6], [-40.8,front-1.2,-6,6],
    [40.8,back+1.2,6,-6], [-40.8,back+1.2,-6,-6]]) {
    const out = []
    slide(x,z,dx,dz,open,out)
    assert.ok(Math.abs(out[0]) <= 41.14 && out[1] <= TERRACE_WALK_BOUNDS.maxZ && out[1] >= TERRACE_WALK_BOUNDS.minZ,
      `diagonal travel escaped the solid corner at ${out}`)
  }
})

test('a continuous guarded roof circuit reaches every side without crossing the gallery', () => {
  const circuit = [[37, front-3], [37, back+3], [-37, back+3], [-37, front-3], [0, front-3]]
  let [x, z] = [0, front-3]
  for (const [tx, tz] of circuit) {
    const distance = Math.hypot(tx-x,tz-z), n = Math.ceil(distance/.15)
    const dx = (tx-x)/n, dz = (tz-z)/n, out = []
    for (let i=0;i<n;i++) {
      assert.equal(isOutside(z,x), true)
      assert.equal(slide(x,z,dx,dz,open,out), true)
      ;[x,z]=out
    }
    assert.ok(Math.hypot(tx-x,tz-z)<1e-7)
  }
  assert.equal(isFree(HELIPAD.x,HELIPAD.z,open),false, 'the parked helicopter occupies the pad centre')
  assert.equal(isFree(7.8,HELIPAD.z,open),true, 'the pad remains walkable outside the aircraft')
  assert.equal(isFree(TERRACE.half, HELIPAD.z, open),false,'the railing bounds the roof')
  assert.equal(isFree(0,-66,open),false,'the Contact window remains a solid boundary')
  assert.equal(isFree(29,0,open),false,'the gallery exterior is a solid wall')
})

test('roof return routes go round the gallery through the physical entrance', () => {
  const target = doors.find(d=>d.id==='contact')
  for (const start of [[0,back+3],[-37,-35],[37,-35],[0,14.51],[0,14.6],[0,14.79],[0,14.9],[0,15.4],[3,15.5],[20,16]]) {
    let [x,z]=start
    const route=routeTo(target,x,z)
    assert.ok(route.some(([px,pz])=>Math.abs(px)<.01&&pz>FACADE_Z+1))
    for (const [tx,tz] of route) {
      const distance=Math.hypot(tx-x,tz-z), n=Math.ceil(distance/.1)
      for(let i=1;i<=n;i++) assert.equal(isFree(x+(tx-x)*i/n,z+(tz-z)*i/n,open),true,`blocked route at ${tx},${tz}`)
      ;[x,z]=[tx,tz]
    }
  }
})

test('rear-roof return routes avoid the master door leaf throughout its swing',()=>{
  const target=doors.find(d=>d.id==='about')
  for(const [x,z] of [[.98,-67.02],[3.98,-67.02]]){
    const points=[[x,z],...routeTo(target,x,z)]
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.05)
      if(!isOutside(a[1],a[0]))break
      for(let j=0;j<=n;j++)for(const progress of [0,.25,.5,.75,1]){
        const px=a[0]+(b[0]-a[0])*j/n,pz=a[1]+(b[1]-a[1])*j/n
        assert.equal(terraceLeafBlocks(px,pz,terraceDoorPose(progress).open),false,`route crossed swinging leaf at ${px},${pz}`)
      }
    }
  }
})

test('an open master-door threshold can step clear before taking a reserved roof route',()=>{
  const previous=terraceDoor.progress
  try{
    terraceDoor.progress=1
    for(const z of [-65.78,-65.9,-66.1]){
      assert.equal(isFree(7.5,z,open),true)
      const route=routeTo(doors[0],7.5,z)
      assert.ok(route[0][1]<MASTER_TERRACE_DOOR.z-1.5,'exit first clears the swinging leaf')
      let [x,pz]=[7.5,z]
      for(const [nx,nz] of route){
        const steps=Math.ceil(Math.hypot(nx-x,nz-pz)/.05)
        for(let i=0;i<=steps;i++)assert.equal(isFree(x+(nx-x)*i/steps,pz+(nz-pz)*i/steps,open),true)
        ;[x,pz]=[nx,nz]
      }
    }
  }finally{terraceDoor.progress=previous}
})

test('the side terraces remove unnecessary forecourt and apron depth while preserving room and aircraft clearance',()=>{
  assert.ok(front-back<110,'the former 127 metre side streets are compacted')
  assert.ok(front>START_Z+7,'the entrance still has a clear landing')
  assert.ok(back<END_Z-34,'the full Contact room and real aircraft still fit')
})

test('the whole gallery stands inland with a clear sea-facing view', async () => {
  const { EXTERIOR_OFFSET, GALLERY_PLOT, galleryPlotContains } = await import('../src/rooms/gallerySite.js')
  const { exteriorLayout, islandDistance } = await import('../src/rooms/exteriorPlan.js')
  const { TOWER_TOP } = await import('../src/rooms/cityPlan.js')
  const layout=exteriorLayout(), tower=layout.boxes.find(b=>b.h===TOWER_TOP)
  const neighbors=layout.boxes.filter(b=>b!==tower)
  assert.ok(neighbors.every(b=>b.y+b.h<TOWER_TOP-5),'the gallery is the tallest building')
  for(const side of [-1,1]) assert.ok(neighbors.some(b=>(b.x-tower.x)*side>0&&Math.abs(b.x-tower.x)<300&&Math.abs(b.z-tower.z)<120),'houses remain on both sides')
  assert.equal(tower.x+EXTERIOR_OFFSET[0],0)
  assert.ok(Math.abs(tower.z+EXTERIOR_OFFSET[2]-(TERRACE.edgeZ+TERRACE.backZ)/2)<1e-8)
  for(const x of [GALLERY_PLOT.x0,GALLERY_PLOT.x1]) for(const z of [GALLERY_PLOT.z0,GALLERY_PLOT.z1]) {
    assert.ok(islandDistance(x,z)<-180,'even the seaward corners stay off the beach')
  }
  const shoreDistance=islandDistance(tower.x,GALLERY_PLOT.z0)
  assert.ok(shoreDistance>-310&&shoreDistance<-180,'the shoreline is close with a dry land buffer')
  for(const b of layout.boxes.filter(b=>b!==tower)) {
    assert.equal(galleryPlotContains(b.x,b.z,Math.hypot(b.w,b.d)/2+8),false)
    assert.ok(b.z-b.d/2>GALLERY_PLOT.z0 || Math.abs(b.x-tower.x)>140,'no houses in the sea-facing outlook')
  }
})
