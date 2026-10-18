import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exteriorLayout } from '../src/rooms/exteriorPlan.js'
import { islandBuildingGrade } from '../src/rooms/terrainPlacement.js'
import { islandTerrainHeight } from '../src/rooms/islandTerrain.js'
import { GALLERY_PLOT } from '../src/rooms/gallerySite.js'

test('grading supports every rigid rotated ground site while protected gallery elevation stays exact',()=>{
  for(const building of exteriorLayout().boxes.filter(b=>b.y===0)){
    const grade=islandBuildingGrade(building),c=Math.cos(building.yaw||0),s=Math.sin(building.yaw||0)
    assert.ok(Number.isFinite(grade.baseY)&&Number.isFinite(grade.bottomY))
    for(let ix=0;ix<=16;ix++)for(let iz=0;iz<=16;iz++){
      const dx=(ix/16-.5)*building.w,dz=(iz/16-.5)*building.d
      const ground=islandTerrainHeight(building.x+c*dx+s*dz,building.z-s*dx+c*dz)
      assert.ok(grade.baseY>=ground-1e-5,'no terrain penetrates the level floor')
      assert.ok(grade.bottomY<=ground-.14,'the low corner is solidly embedded in the ground')
    }
  }
  const gallery={x:(GALLERY_PLOT.x0+GALLERY_PLOT.x1)/2,z:(GALLERY_PLOT.z0+GALLERY_PLOT.z1)/2,w:GALLERY_PLOT.x1-GALLERY_PLOT.x0,d:GALLERY_PLOT.z1-GALLERY_PLOT.z0,yaw:0}
  assert.deepEqual(islandBuildingGrade(gallery),{baseY:0,bottomY:-.15})
})
