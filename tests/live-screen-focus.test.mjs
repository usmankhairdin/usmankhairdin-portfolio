import assert from 'node:assert/strict'
import {test} from 'node:test'
import * as THREE from 'three'

const {createScreenFocus,websiteReviewPose,canFocusWebsite}=await import('../src/rooms/liveScreenFocus.js').catch(()=>({}))

test('screen focus takes a full second, holds still, and restores the original walking view',()=>{
  assert.equal(typeof createScreenFocus,'function')
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.set(0,1.58,5)
  const home=camera.position.clone(),homeQ=camera.quaternion.clone(),focus=createScreenFocus()
  focus.enter(camera,{position:new THREE.Vector3(2,1.85,3),quaternion:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),.4)})
  assert.deepEqual(camera.position.toArray(),[0,1.58,5],'hover must not jump the camera')
  focus.step(.5)
  assert.ok(Math.abs(camera.position.x-1)<1e-9)
  assert.equal(focus.ready,false)
  focus.step(.5)
  assert.equal(focus.ready,true)
  const held=camera.position.clone();focus.step(2)
  assert.equal(camera.position.distanceTo(held),0)
  focus.exit();assert.equal(focus.holding,true)
  focus.step(.65)
  assert.ok(camera.position.distanceTo(home)<1e-9)
  assert.ok(camera.quaternion.angleTo(homeQ)<1e-7)
  assert.equal(focus.holding,false)
})

test('review pose centers a rotated physical LED without perspective skew',()=>{
  assert.equal(typeof websiteReviewPose,'function')
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125))
  mesh.position.set(-11.3,1.85,-41);mesh.rotation.y=Math.PI;mesh.updateMatrixWorld()
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  const pose=websiteReviewPose(mesh,3.4,2.125,camera)
  camera.position.copy(pose.position);camera.quaternion.copy(pose.quaternion);camera.updateMatrixWorld()
  const center=mesh.position.clone().project(camera)
  assert.ok(Math.abs(center.x)<1e-9&&Math.abs(center.y)<1e-9)
  const a=new THREE.Vector3(-1.7,-1.0625,0).applyMatrix4(mesh.matrixWorld).project(camera)
  const b=new THREE.Vector3(1.7,-1.0625,0).applyMatrix4(mesh.matrixWorld).project(camera)
  assert.ok(Math.abs(a.y-b.y)<1e-9)
  assert.ok(Math.abs(a.z-b.z)<1e-9)
})

test('hover focus only works in front of the selected LED, never from the doorway or another bay',()=>{
  assert.equal(typeof canFocusWebsite,'function')
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));mesh.position.y=1.85;mesh.updateMatrixWorld()
  const camera=new THREE.PerspectiveCamera()
  for(const [x,z,want] of [[0,5,true],[-1.25,4,true],[1.25,4,true],[-1.5,4,false],[1.5,4,false],[7.3,5,false],[4.8,5,false],[0,9,false],[0,-2,false]]){
    camera.position.set(x,1.58,z);camera.updateMatrixWorld()
    assert.equal(canFocusWebsite(mesh,3.4,camera),want,`station ${x},${z}`)
  }
})
