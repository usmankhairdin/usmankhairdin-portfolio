import assert from 'node:assert/strict'
import {test} from 'node:test'
import * as THREE from 'three'
import {GLASS_Z} from '../src/rooms/cityPlan.js'
import {islandTerrainHeight} from '../src/rooms/islandTerrain.js'
import {islandRenderedTerrainHeight} from '../src/rooms/islandTerrainMesh.js'
const pose=await import('../src/rooms/terrainRoadPose.js').catch(()=>({}))
const grading=await import('../src/rooms/terrainArchitecture.js').catch(()=>({}))

test('tree and road contact heights agree with raycasts against the rendered ground triangles',()=>{
  const geometry=new THREE.PlaneGeometry(60,60,6,6).rotateX(-Math.PI/2).translate(-250,0,GLASS_Z+650)
  const p=geometry.attributes.position
  for(let i=0;i<p.count;i++)p.setY(i,islandTerrainHeight(p.getX(i),p.getZ(i)))
  const material=new THREE.MeshBasicMaterial(),mesh=new THREE.Mesh(geometry,material),ray=new THREE.Raycaster()
  mesh.updateMatrixWorld()
  for(let i=0;i<50;i++){
    const x=-278+(i*13.173)%55,z=GLASS_Z+622+(i*7.819)%55
    ray.set(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0))
    const hit=ray.intersectObject(mesh)[0]
    assert.ok(hit)
    assert.ok(Math.abs(hit.point.y-islandRenderedTerrainHeight(x,z))<1e-4)
  }
  geometry.dispose();material.dispose()
})

test('vehicle frames follow a slope with orthogonal axes and a grounded origin',()=>{
  assert.equal(typeof pose.terrainRoadFrame,'function')
  let rolling=0
  for(let x=-700;x<=900;x+=100)for(let z=-500;z<=1000;z+=100)for(const yaw of [0,.4,1.7,3.1]){
    const f=pose.terrainRoadFrame(x,z,yaw)
    const vectors=[[f.xx,f.xy,f.xz],[f.yx,f.yy,f.yz],[f.zx,f.zy,f.zz]]
    for(const v of vectors)assert.ok(Math.abs(Math.hypot(...v)-1)<1e-10)
    for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)assert.ok(Math.abs(vectors[a].reduce((s,v,i)=>s+v*vectors[b][i],0))<1e-10)
    assert.ok(f.yy>0&&f.height>=0)
    if(Math.abs(f.xy)>.015)rolling++
  }
  assert.ok(rolling>100,'the actual road frame must tilt on the rolling island')
})

test('one terrain grade lifts a complete rigid architecture family and its roof equipment',()=>{
  assert.equal(typeof grading.gradeTerrainArchitecture,'function')
  const base={x:420,z:440,y:0,w:34,d:30,h:30,yaw:.52,anchor:[420,440]}
  const tier={...base,y:30,w:20,d:18,h:12}
  const roof={...base,y:42,w:6,d:5,h:2}
  const result=grading.gradeTerrainArchitecture({boxes:[base,tier],rounds:[],roofs:[roof],beacons:[{...roof,y:44}],settlements:[]})
  const buildings=result.architecture.boxes
  assert.ok(buildings[0].y>0)
  assert.equal(buildings[1].y-buildings[0].y,30)
  assert.equal(result.roofs[0].y-buildings[0].y,42)
  assert.equal(result.beacons[0].y-buildings[0].y,44)
  assert.equal(result.foundations.length,1)
  assert.ok(result.foundations[0].h>0)
  assert.equal(result.foundations[0].y+result.foundations[0].h,buildings[0].y)
})
