import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exteriorLayout } from '../src/rooms/exteriorPlan.js'
import { settlementRoadAt, settlementDensity } from '../src/rooms/settlementPlan.js'
import { settlementWoodlandWeight } from '../src/rooms/settlementEcology.js'
import { TOWER_TOP } from '../src/rooms/cityPlan.js'

test('homes form actual low-rise neighborhoods rather than a few decorative office boxes', () => {
  const layout=exteriorLayout(),sites=layout.settlements||[]
  const homes=sites.filter(site=>['house','villa','townhouse'].includes(site.settlementKind))
  assert.ok(homes.length>=160,`only ${homes.length} recognizable homes are planned`)
  assert.ok(homes.length>layout.boxes.filter(b=>b.y===0&&b.h!==TOWER_TOP&&!b.settlementKind).length*1.8)
  assert.ok(homes.every(home=>home.storeys>=1&&home.storeys<=3&&home.h<14))
  assert.ok(new Set(homes.map(home=>home.roofShape)).size>=3)
  for(const home of homes){
    assert.ok(layout.boxes.includes(home),'the visible home footprint also protects it from trees and other buildings')
    assert.ok(home.bodyW<home.w&&home.bodyD<home.d,'eaves, porch and steps remain inside the reserved site')
    assert.ok(home.frontDoor&&home.frontDoor.h>=2,'homes have an accessible human scale front door')
  }
})

test('local life has schools, a clinic, shops, markets and community recreation within the settlement', () => {
  const sites=exteriorLayout().settlements||[]
  for(const kind of ['school','clinic','shop','market','court'])assert.ok(sites.some(site=>site.settlementKind===kind),`missing ${kind}`)
  for(const site of sites){
    const c=Math.cos(site.yaw),s=Math.sin(site.yaw)
    for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++){
      const dx=ix*site.w/2,dz=iz*site.d/2
      assert.equal(settlementRoadAt(site.x+c*dx+s*dz,site.z-s*dx+c*dz,1),false)
    }
  }
})

test('dense woodland cores remain unbuilt and offices concentrate toward the compact centre', () => {
  const buildings=exteriorLayout().boxes.filter(b=>b.y===0&&b.h!==TOWER_TOP)
  assert.ok(buildings.every(b=>settlementWoodlandWeight(b.x,b.z)<.8),'green fingers cannot be filled with buildings')
  const offices=buildings.filter(b=>!b.settlementKind)
  assert.ok(offices.length>15,'the island retains a mixed compact urban centre')
  assert.ok(offices.filter(b=>settlementDensity(b.x,b.z)>.77).length/offices.length>.85)
})
