import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exteriorLayout } from '../src/rooms/exteriorPlan.js'
import { buildInhabitedSiteGeometry } from '../src/rooms/inhabitedSettlementGeometry.js'
import { islandTerrainHeight } from '../src/rooms/islandTerrain.js'
import { islandBuildingGrade } from '../src/rooms/terrainPlacement.js'
import { inhabitedAccessPlan } from '../src/rooms/inhabitedAccessPlan.js'

test('complete home architecture fits its reserved oriented footprint with solid roof slopes and inset glazing',()=>{
  // Every site is tested: smaller accepted lots have tighter porch/eave
  // setbacks than the representative full-size villa or school campus.
  for(const site of exteriorLayout().settlements){
    const grade=islandBuildingGrade(site)
    const access=inhabitedAccessPlan(site)
    const geometry=buildInhabitedSiteGeometry(site)
    assert.ok(geometry,`no visible architecture for ${site.settlementKind}`)
    const positions=geometry.attributes.position,normal=geometry.attributes.normal,role=geometry.attributes.settlementRole
    assert.ok(positions.count>200,'homes have physical openings, roof and porch detail beyond one plain box')
    const roles=new Set(role.array)
    if(['house','villa','townhouse'].includes(site.settlementKind)){
      assert.ok(roles.has(4),'at least one stable lit living-room window is visible')
      assert.ok(roles.has(5),'a wooden human-scale front door is visible')
      assert.ok([...normal.array].some((v,i)=>i%3===1&&v>.15&&v<.94),'a sloping solid roof changes the skyline')
    }
    const c=Math.cos(site.yaw),s=Math.sin(site.yaw)
    for(let i=0;i<positions.count;i++){
      const dx=positions.getX(i)-site.x,dz=positions.getZ(i)-site.z,x=c*dx-s*dz,z=s*dx+c*dz
      assert.ok(Math.abs(x)<=site.w/2+.001,`${site.id} escapes its side setback`)
      assert.ok(Math.abs(z)<=site.d/2+.001,`${site.id} escapes its front/rear setback`)
      assert.ok(positions.getY(i)>=Math.min(grade.bottomY,access?.bottomY??Infinity)-.001&&positions.getY(i)<=grade.baseY+site.h+.5,'all architecture is grounded and respects its graded planned height')
    }
    geometry.dispose()
  }
})

test('villa doors and glazing attach to the real L-shaped wall wings',()=>{
  for(const site of exteriorLayout().settlements.filter(site=>site.settlementKind==='villa')){
    const geometry=buildInhabitedSiteGeometry(site),positions=geometry.attributes.position,roles=geometry.attributes.settlementRole
    const c=Math.cos(site.yaw),s=Math.sin(site.yaw),w=site.bodyW,d=site.bodyD
    const wings=[{x:-w*.13,z:-d*.03,w:w*.74,d:d*.94},{x:w*.25,z:d*.15,w:w*.5,d:d*.62}]
    for(let i=0;i<positions.count;i++){
      if(![3,4,5].includes(roles.getX(i)))continue
      const dx=positions.getX(i)-site.x,dz=positions.getZ(i)-site.z,x=c*dx-s*dz,z=s*dx+c*dz
      const distance=Math.min(...wings.map(wing=>Math.hypot(Math.max(0,Math.abs(x-wing.x)-wing.w/2),Math.max(0,Math.abs(z-wing.z)-wing.d/2))))
      assert.ok(distance<=.31,`${site.id} has a floating window or door ${distance.toFixed(3)} m away from its actual wall`)
    }
    geometry.dispose()
  }
})

test('sloped home sites have one level supported foundation instead of floating downhill corners',()=>{
  const sites=exteriorLayout().settlements.filter(site=>islandTerrainHeight(site.x,site.z)>3)
  assert.ok(sites.length>80,'the regression exercises genuinely elevated neighborhoods')
  for(const site of sites){
    const geometry=buildInhabitedSiteGeometry(site),positions=geometry.attributes.position,roles=geometry.attributes.settlementRole
    const support=[]
    for(let i=0;i<positions.count;i++)if(roles.getX(i)===12)support.push([positions.getX(i),positions.getY(i),positions.getZ(i)])
    assert.ok(support.length>=36,`${site.id} needs a solid graded foundation`)
    const bottom=Math.min(...support.map(p=>p[1])),top=Math.max(...support.map(p=>p[1]))
    const c=Math.cos(site.yaw),s=Math.sin(site.yaw)
    for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){
      const dx=ix*site.w/2,dz=iz*site.d/2,ground=islandTerrainHeight(site.x+c*dx+s*dz,site.z-s*dx+c*dz)
      assert.ok(bottom<ground-.14,'the support is embedded below the low side of the lot')
      assert.ok(top>=ground-1e-5,'the rigid floor clears every uphill corner')
    }
    assert.ok(support.every(p=>Math.abs(p[1]-bottom)<1e-5||Math.abs(p[1]-top)<1e-5),'the floor stays level on the slope')
    geometry.dispose()
  }
})
