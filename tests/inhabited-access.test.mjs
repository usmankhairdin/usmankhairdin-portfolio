import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exteriorLayout } from '../src/rooms/exteriorPlan.js'
import { islandBuildingGrade } from '../src/rooms/terrainPlacement.js'
import { islandRenderedTerrainHeight } from '../src/rooms/islandTerrainMesh.js'
import { buildInhabitedSiteGeometry } from '../src/rooms/inhabitedSettlementGeometry.js'
import { inhabitedAccessPlan } from '../src/rooms/inhabitedAccessPlan.js'
import * as THREE from 'three'
import { inhabitedSite } from '../src/rooms/inhabitedSettlementPlan.js'

test('high front garden pads have real access construction down to the rendered ground',()=>{
  let checked=0
  for(const site of exteriorLayout().settlements){
    const grade=islandBuildingGrade(site),c=Math.cos(site.yaw),s=Math.sin(site.yaw),dx=-site.w/2+.35,dz=site.d/2-.5
    const ground=islandRenderedTerrainHeight(site.x+c*dx+s*dz,site.z-s*dx+c*dz)
    if(grade.baseY-ground<.9)continue
    const geometry=buildInhabitedSiteGeometry(site)
    assert.ok([...geometry.attributes.settlementRole.array].includes(13),`${site.id} has no real flight from the ${Math.round((grade.baseY-ground)*100)} cm raised pad`)
    checked++;geometry.dispose()
  }
  assert.ok(checked>15,'the regression covers actual high garden pads rather than a fabricated stair fixture')
})

test('actual stair meshes climb continuously from soil into an unobstructed pad landing',()=>{
  const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0)
  let checked=0
  for(const site of exteriorLayout().settlements){
    const access=inhabitedAccessPlan(site)
    if(!access)continue
    const geometry=buildInhabitedSiteGeometry(site),mesh=new THREE.Mesh(geometry,material),c=Math.cos(site.yaw),s=Math.sin(site.yaw)
    mesh.updateMatrixWorld(true)
    const world=(x,z)=>({x:site.x+c*x+s*z,z:site.z-s*x+c*z})
    const actualTop=step=>{
      const p=world((step.x0+step.x1)/2,(step.z0+step.z1)/2)
      ray.set(new THREE.Vector3(p.x,access.topY+site.h+2,p.z),down)
      const hit=ray.intersectObject(mesh,false)[0]
      assert.ok(hit,'a supported tread is present in the actual generated mesh')
      return hit.point.y
    }
    let previous=actualTop(access.foot)
    for(const x of [access.foot.x0,access.foot.x1])for(const z of [access.foot.z0,access.foot.z1]){
      const p=world(x,z),ground=islandRenderedTerrainHeight(p.x,p.z)
      assert.ok(previous-ground>=.01-1e-5&&previous-ground<.18,'the bottom landing meets actual rendered soil within one normal step')
      assert.ok(access.bottomY<ground-.14,'the flight is embedded rather than hovering over ground')
    }
    for(const step of access.steps){
      const top=actualTop(step)
      assert.ok(Math.abs(top-step.y1)<1e-4,'the tread remains exposed instead of being buried inside the raised foundation')
      assert.ok(top-previous>0&&top-previous<=.176,'each riser has a continuous human-scale height')
      assert.ok(step.x1-step.x0>=.25,'the full-depth tread can hold a foot')
      previous=top
    }
    assert.ok(Math.abs(actualTop(access.landing)-access.topY)<1e-4,'the last landing joins the level house pad')
    const a=world(access.exit[0].x,access.exit[0].z),b=world(access.exit[1].x,access.exit[1].z)
    const direction=new THREE.Vector3(b.x-a.x,0,b.z-a.z),distance=direction.length()
    ray.set(new THREE.Vector3(a.x,access.topY+.75,a.z),direction.normalize());ray.far=distance
    assert.equal(ray.intersectObject(mesh,false).length,0,`${site.id}: the landing opens inward into a clear garden path`)
    ray.far=Infinity
    // A clear passage also needs a continuous floor. A horizontal clearance
    // ray alone misses a narrow open slot at the retaining-slab cutout edge.
    for(let sample=0;sample<=24;sample++){
      const t=sample/24,p=world(access.exit[0].x,access.exit[0].z*(1-t)+access.exit[1].z*t)
      ray.set(new THREE.Vector3(p.x,access.topY+.1,p.z),down)
      const floor=ray.intersectObject(mesh,false)[0]
      // Some garden footpaths have a 7 cm paving course above the pad.
      // It is a normal supported step; an open slot or a lower floor is not.
      assert.ok(floor&&floor.point.y>=access.topY-1e-4&&floor.point.y<=access.topY+.081,`${site.id} has an unsupported gap between stair landing and garden pad: sample ${sample}, floor ${floor?.point.y}, expected ${access.topY}`)
    }
    geometry.dispose();checked++
  }
  material.dispose()
  assert.ok(checked>70)
})

test('a compact school on a real sloping site uses the clear front garden for full-size access treads',()=>{
  const slope=exteriorLayout().settlements.find(site=>{
    const c=Math.cos(site.yaw),s=Math.sin(site.yaw),dx=-site.w/2+.35,dz=site.d/2-.5
    return islandBuildingGrade(site).baseY-islandRenderedTerrainHeight(site.x+c*dx+s*dz,site.z-s*dx+c*dz)>1.4
  })
  assert.ok(slope,'a real sloping neighborhood is available')
  // The accepted 84% school campus variant has a 29.4 m wide site and a
  // 26.3 m playground. Its front strip is clear even when the side gap is too
  // short for a stair flight; no footprint enlargement is allowed.
  const school=inhabitedSite({id:'compact-sloping-school',x:slope.x,z:slope.z,yaw:slope.yaw,w:29.4,d:32.76,density:.6,kind:'school',seed:.4,sourceX:slope.sourceAnchor[0],sourceZ:slope.sourceAnchor[1]})
  const access=inhabitedAccessPlan(school)
  assert.ok(access&&access.rise>.24)
  assert.ok(access.tread>=.25)
  assert.ok(access.steps.every(step=>step.z0>school.d/2-1.35),'the flight remains ahead of the actual school playground')
  const geometry=buildInhabitedSiteGeometry(school)
  geometry.dispose()
})
