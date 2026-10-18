import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'

const screen=await import('../src/rooms/liveScreenGeometry.js').catch(()=>({}))

test('the full website viewport matches LED corners through the rotated room frame',()=>{
  assert.equal(typeof screen.websiteProjection,'function')
  const room=new THREE.Group();room.position.z=-36;room.rotation.y=Math.PI
  const led=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));led.position.set(11.3,2.35,-4.909)
  room.add(led);room.updateMatrixWorld(true)
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.set(-10,1.58,-36);camera.lookAt(led.getWorldPosition(new THREE.Vector3()));camera.updateMatrixWorld()
  const matrix=screen.websiteProjection(led.matrixWorld,3.4,2.125,camera,1280,800)
  for(const [x,y] of [[-1,-1],[-1,1],[1,-1],[1,1]]){
    const pixel=new THREE.Vector3((x+1)*720,(1-y)*450,0).applyMatrix4(matrix)
    const corner=new THREE.Vector3(x*1.7,y*1.0625,0).applyMatrix4(led.matrixWorld).project(camera)
    corner.set((corner.x*.5+.5)*1280,(.5-corner.y*.5)*800,0)
    assert.ok(pixel.distanceTo(corner)<1e-10)
  }
})

test('live websites cannot show from behind a screen or outside the active Work Room',()=>{
  assert.equal(typeof screen.canShowWebsite,'function')
  const led=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));led.updateMatrixWorld()
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.set(0,0,5);camera.lookAt(0,0,0);camera.updateMatrixWorld()
  assert.equal(screen.canShowWebsite(led,camera,true),true)
  assert.equal(screen.canShowWebsite(led,camera,false),false)
  camera.position.z=-5;camera.lookAt(0,0,0);camera.updateMatrixWorld()
  assert.equal(screen.canShowWebsite(led,camera,true),false)
  camera.position.z=30;camera.lookAt(0,0,0);camera.updateMatrixWorld()
  assert.equal(screen.canShowWebsite(led,camera,true),false)
  camera.position.z=5;camera.lookAt(0,0,10);camera.updateMatrixWorld()
  assert.equal(screen.canShowWebsite(led,camera,true),false)
})

test('a screen crossing the camera plane keeps front-facing browser pixels visible',()=>{
  const led=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));led.updateMatrixWorld()
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.set(-1,0,.3);camera.lookAt(0,0,0);camera.updateMatrixWorld()
  assert.equal(screen.canShowWebsite(led,camera,true),true)
  const matrix=screen.websiteProjection(led.matrixWorld,3.4,2.125,camera,1280,800)
  const center=new THREE.Vector4(720,450,0,1).applyMatrix4(matrix)
  const behindCorner=new THREE.Vector4(0,0,0,1).applyMatrix4(matrix)
  assert.ok(center.w>0,'the physically visible screen center must have positive CSS W')
  assert.ok(behindCorner.w<0,'the corner behind the camera remains clipped')
})

test('an opaque gate blocks website hit targets even inside the iframe rectangle',()=>{
  assert.equal(typeof screen.websiteHitRegions,'function')
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));mesh.updateMatrixWorld()
  const camera=new THREE.PerspectiveCamera(62,1.5,.05,2400)
  camera.position.z=5;camera.lookAt(0,0,0);camera.updateMatrixWorld()
  const pixels=new Uint8Array(600*400*4)
  // The right half of the LED is covered by an opaque room gate. Its WebGL
  // alpha stays255; the visible LED's alpha aperture is zero on the left.
  for(let y=0;y<400;y++)for(let x=300;x<600;x++)pixels[(y*600+x)*4+3]=255
  const regions=screen.websiteHitRegions(mesh.matrixWorld,3.4,2.125,camera,pixels,{x:0,y:0,width:600,height:400,bufferWidth:600,bufferHeight:400})
  assert.ok(regions.length>0)
  assert.ok(regions.every(r=>r.x+r.width<=720),'covered pixels must not be clickable through a gate')
  assert.ok(regions.reduce((a,r)=>a+r.width*r.height,0)>1440*900*.4,'the visible half remains usable')
})

test('an unobstructed LED keeps a straight border instead of raster stair steps',()=>{
  assert.equal(typeof screen.websiteClipPath,'function')
  const regions=Array.from({length:90},(_,i)=>({x:0,y:i*10,width:1440,height:10}))
  assert.equal(screen.websiteClipPath(regions,144,90),'inset(0)')
})

test('real occlusion at an outside edge is preserved rather than filled as bezel',()=>{
  const regions=Array.from({length:90},(_,i)=>({x:20,y:i*10,width:1420,height:10}))
  assert.notEqual(screen.websiteClipPath(regions,144,90),'inset(0)')
  const room=new THREE.Group();room.userData.websiteOcclusionScope=true
  const led=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125)),gate=new THREE.Mesh(new THREE.BoxGeometry(.4,3,.1))
  gate.position.set(-1.3,0,1);room.add(led,gate);room.updateMatrixWorld(true)
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.z=5;camera.lookAt(0,0,0);camera.updateMatrixWorld()
  const open=screen.websiteBoundaryVisibility(led,camera)
  assert.equal(open(new THREE.Vector3(-1.6,0,0)),false)
  assert.equal(open(new THREE.Vector3(0,0,0)),true)
})

test('an occluded LED clip has one continuous outline without seams between rows',()=>{
  assert.equal(typeof screen.websiteClipPath,'function')
  const regions=Array.from({length:90},(_,i)=>({x:0,y:i*10,width:720,height:10}))
  const clip=screen.websiteClipPath(regions,144,90)
  assert.equal((clip.match(/M/g)||[]).length,1)
  assert.match(clip,/720/)
  assert.doesNotMatch(clip,/1440/,'the covered half must remain outside the outline')
})

test('a level LED uses a native affine iframe transform without changing its corners',()=>{
  assert.equal(typeof screen.websiteTransform,'function')
  const led=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));led.updateMatrixWorld()
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.set(0,-.7,5);camera.lookAt(0,-.7,0);camera.updateMatrixWorld()
  const matrix=screen.websiteProjection(led.matrixWorld,3.4,2.125,camera,1280,800)
  const css=screen.websiteTransform(matrix)
  assert.ok(css.startsWith('matrix('))
  const [a,b,c,d,tx,ty]=css.slice(7,-1).split(',').map(Number)
  const pixel=new THREE.Vector3(1440,900,0).applyMatrix4(matrix)
  assert.ok(Math.abs(a*1440+c*900+tx-pixel.x)<1e-8)
  assert.ok(Math.abs(b*1440+d*900+ty-pixel.y)<1e-8)
  camera.lookAt(0,0,0);camera.updateMatrixWorld()
  assert.ok(screen.websiteTransform(screen.websiteProjection(led.matrixWorld,3.4,2.125,camera,1280,800)).startsWith('matrix3d('))
})

test('a click inside the perspective LED is not mistaken for an outside click while it loads',()=>{
  assert.equal(typeof screen.websiteContainsPoint,'function')
  const camera=new THREE.PerspectiveCamera(62,1.6,.05,2400)
  camera.position.set(-1,-.7,5);camera.lookAt(0,0,0);camera.updateMatrixWorld()
  const matrix=screen.websiteProjection(new THREE.Matrix4(),3.4,2.125,camera,1280,800)
  const center=new THREE.Vector3(720,450,0).applyMatrix4(matrix)
  assert.equal(screen.websiteContainsPoint(matrix,center.x,center.y),true)
  assert.equal(screen.websiteContainsPoint(matrix,0,799),false)
})
