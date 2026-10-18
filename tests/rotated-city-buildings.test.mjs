import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import { buildingDistanceSquared, planRealBuilding, planRealRound, planStructuralCore } from '../src/rooms/realCityBuildingPlan.js'
import { assembleArchitecture, createArchitectureVisibility } from '../src/rooms/realCityFacade.js'

const rigid = (x,z,cx,cz,yaw) => [cx+Math.cos(yaw)*(x-cx)+Math.sin(yaw)*(z-cz),cz-Math.sin(yaw)*(x-cx)+Math.cos(yaw)*(z-cz)]

test('curved-street lots keep their walls, normals, core and roof in one rigid orientation', () => {
  for (const make of [planRealBuilding,planRealRound]) for (const yaw of [.37,-.82,Math.PI/2]) {
    const source={x:18,z:-35,y:0,w:32,d:14,h:25}
    const base=make(source), turned=make({...source,yaw})
    base.faces.forEach((face,i)=>{
      const expected=rigid(face.x,face.z,source.x,source.z,yaw),actual=turned.faces[i]
      assert.ok(Math.hypot(actual.x-expected[0],actual.z-expected[1])<1e-8,'facade moves around its lot centre')
      const normal=rigid(face.normal[0],face.normal[2],0,0,yaw)
      assert.ok(Math.hypot(actual.normal[0]-normal[0],actual.normal[2]-normal[1])<1e-8,'normals turn with the wall')
      assert.ok(Math.abs(actual.yaw-face.yaw-yaw)<1e-8)
    })
    assert.equal(planStructuralCore(turned).yaw,yaw)
  }
  const yaw=.58,plan=assembleArchitecture([{x:0,z:0,y:0,w:28,d:12,h:24,yaw}])
  for(const name of ['core','roof']) {
    const module=plan.modules.find(m=>m.name===name), matrix=new THREE.Matrix4().fromArray(module.entries[0].values)
    const direction=new THREE.Vector3(1,0,0).transformDirection(matrix)
    assert.ok(direction.distanceTo(new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)))<1e-6,`${name} must turn with its facade`)
  }
})

test('rotated footprint distances and frustum bounds include the actual long side', () => {
  const b=planRealBuilding({x:0,z:-100,y:0,w:100,d:8,h:20,yaw:Math.PI/2})
  assert.ok(buildingDistanceSquared(b,{x:0,y:10,z:-52})<1e-8,'eye is over the rotated long footprint')
  assert.ok(Math.abs(buildingDistanceSquared(b,{x:8,y:10,z:-100})-16)<1e-8,'distance measures the rotated short side')
  const camera=new THREE.PerspectiveCamera(60,1,.1,80)
  camera.position.set(0,10,0);camera.updateMatrixWorld()
  const visibility=createArchitectureVisibility([b],new Float64Array([100]))
  visibility.update(camera,new THREE.Matrix4(),180)
  assert.equal(visibility.state[0],1,'front of the long building is in view even when its centre is beyond the far plane')
})
