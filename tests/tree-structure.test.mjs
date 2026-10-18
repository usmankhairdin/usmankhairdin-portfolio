import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import * as THREE from 'three'
import {gltfBufferViews} from './helpers/gltf-buffer-views.mjs'

const asset=JSON.parse(await readFile('public/assets/forest/island-trees.gltf','utf8'))
const binary=await readFile('public/assets/forest/island-trees.bin')
const views=await gltfBufferViews(asset,binary)
const types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array},widths={SCALAR:1,VEC2:2,VEC3:3}
function attribute(index){
  const a=asset.accessors[index],view=views[a.bufferView],Type=types[a.componentType],start=view.byteOffset+(a.byteOffset||0)
  return new THREE.BufferAttribute(new Type(view.buffer.slice(start,start+a.count*widths[a.type]*Type.BYTES_PER_ELEMENT)),widths[a.type])
}
function geometry(part){
  const g=new THREE.BufferGeometry();g.setAttribute('position',attribute(part.attributes.POSITION));g.setIndex(attribute(part.indices));return g
}
function wood(variant,lod){return asset.meshes[variant.meshes[lod]].primitives.filter(p=>!asset.materials[p.material].name.includes('leaves'))}
function horizontalCenter(part,y){
  const g=geometry(part),p=g.attributes.position,index=g.index,points=[]
  for(let i=0;i<index.count;i+=3)for(let k=0;k<3;k++){
    const a=new THREE.Vector3().fromBufferAttribute(p,index.getX(i+k)),b=new THREE.Vector3().fromBufferAttribute(p,index.getX(i+(k+1)%3))
    if((a.y-y)*(b.y-y)<0)points.push(a.lerp(b,(y-a.y)/(b.y-a.y)))
  }
  const center=new THREE.Vector3();points.forEach(p=>center.add(p));return center.divideScalar(points.length)
}

test('every tree LOD has a continuous substantial bark trunk and an embedded irregular root flare',()=>{
  for(const variant of asset.extras.variants)for(let lod=0;lod<4;lod++){
    const support=wood(variant,lod).find(p=>asset.materials[p.material].name.endsWith('-structural-bark'))||wood(variant,lod).at(-1)
    const root=new THREE.Group()
    wood(variant,lod).forEach(part=>root.add(new THREE.Mesh(geometry(part),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}))))
    root.updateMatrixWorld(true)
    for(const y of [.02,.10,.20,.30]){
      const center=horizontalCenter(support,y)
      // A closed substantial core must be solid from any viewing direction;
      // an 18-vertex decimation can leave only a line or a triangular shard.
      for(let i=0;i<8;i++){
        const theta=i*Math.PI/4,origin=new THREE.Vector3(center.x+Math.cos(theta),y,center.z+Math.sin(theta))
        const ray=new THREE.Raycaster(origin,new THREE.Vector3(-Math.cos(theta),0,-Math.sin(theta)))
        const hits=ray.intersectObject(root,true)
        assert.ok(hits.length>=2,`${variant.species} LOD ${lod} has no closed trunk at height ${y} from azimuth ${i}`)
        const nearest=hits[0],opposite=hits.find(h=>h.distance>nearest.distance+.035)
        assert.ok(opposite,`${variant.species} LOD ${lod} trunk is thinner than 3.5 percent of tree height`)
      }
    }
    const vertices=wood(variant,lod).flatMap(part=>Array.from(attribute(part.attributes.POSITION).array))
    const lows=vertices.filter((_,i)=>i%3===1)
    assert.ok(Math.min(...lows)<-.004,'bark flares embed into the real ground instead of sitting on a separate soil cone')
  }
})

test('close leaves retain the native photographed leaf size and source curvature',()=>{
  for(const variant of asset.extras.variants){
    const leaf=asset.meshes[variant.meshes[0]].primitives.find(p=>asset.materials[p.material].name.includes('leaves'))
    const p=attribute(leaf.attributes.POSITION)
    assert.ok(p.count>=210000,'close foliage must retain all native source contours instead of enlarging a sparse sample')
    let largest=0
    for(let i=0;i<p.count;i+=7)for(let k=1;k<7;k++)largest=Math.max(largest,new THREE.Vector3().fromBufferAttribute(p,i).distanceTo(new THREE.Vector3().fromBufferAttribute(p,i+k)))
    const limit=variant.species==='burkea'?.031:.013
    assert.ok(largest<limit,`a native leaf radius of ${largest} must remain at the scanned size rather than the former 3.3x sample enlargement`)
  }
})

test('coarse trees keep the same basal trunk silhouette as close trees',()=>{
  for(const variant of asset.extras.variants){
    const cores=variant.meshes.map((_,lod)=>wood(variant,lod).find(p=>asset.materials[p.material].name.endsWith('-structural-bark')))
    assert.ok(cores.every(Boolean),'all four tiers retain the same organic structural bark mesh')
    for(const core of cores.slice(1))assert.deepEqual(attribute(core.attributes.POSITION).array,attribute(cores[0].attributes.POSITION).array,'LOD changes cannot reduce the foot or girth of the tree')
  }
})

test('young tree crowns begin lower without stretching their canopy into a stick on a stalk',async()=>{
  const shape=await import('../src/rooms/islandTreeShape.js').catch(()=>({}))
  assert.equal(typeof shape.islandTreeLocalPoint,'function')
  const young=shape.islandTreeLocalPoint({x:.1,y:.3,z:.1},0,6),mature=shape.islandTreeLocalPoint({x:.1,y:.3,z:.1},0,30)
  assert.ok(young.y<mature.y-.07,'young forms carry a compact low crown')
  assert.equal(shape.islandTreeLocalPoint({x:0,y:0,z:0},0,6).y,0,'growth profiles remain rooted at the actual terrain contact')
})

test('deformed crown profiles stay inside the shared planting clearance at every detail level',async()=>{
  const { islandTreeLocalPoint }=await import('../src/rooms/islandTreeShape.js')
  for(const variant of asset.extras.variants)for(const mesh of variant.meshes)for(const part of asset.meshes[mesh].primitives){
    const p=attribute(part.attributes.POSITION)
    for(let i=0;i<p.count;i++){
      const point=islandTreeLocalPoint({x:p.getX(i),y:p.getY(i),z:p.getZ(i)},variant.profile,7.5,variant.radialScale)
      assert.ok(Math.hypot(point.x,point.z)<=variant.radius+1e-7,'profile deformation cannot push branches through the adjacent road or house')
      assert.ok(point.y<=1.001,'all crown ages remain inside the conservative frustum bounds')
    }
  }
})
