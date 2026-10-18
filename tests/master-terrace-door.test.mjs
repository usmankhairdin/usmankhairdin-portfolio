import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import { isFree, slide, isOutside } from '../src/experience/walkable.js'

const X=7.5, Z=-65.77, open=id=>id==='contact-terrace'?1:0
test('the open master-room glass door provides a real two-way passage while other windows stay solid',()=>{
  for(const direction of [-1,1]){
    let x=X,z=Z-direction*1.4
    const out=[]
    for(let i=0;i<56;i++){
      assert.equal(slide(x,z,0,direction*.05,open,out),true,`blocked at ${x},${z}`)
      ;[x,z]=out
    }
    assert.ok(Math.abs(z-(Z+direction*1.4))<1e-6)
  }
  for(const x of [-7.5,0,4.5,10.5]) assert.equal(isFree(x,Z,open),false,'fixed panes remain solid')
  assert.equal(isOutside(Z-.02,X),true,'phase changes at the actual glass plane')
})

test('a shut terrace door blocks long steps and keeps the visitor on the room side',()=>{
  const out=[]
  slide(X,Z+1.4,0,-3,()=>0,out)
  assert.ok(out[1]>Z+.36,'cannot tunnel through a shut glass leaf')
})

test('the open glass leaf remains solid when approached sideways on the terrace',()=>{
  assert.equal(isFree(6.71366,-66.42182,open),false,'open leaf is still physical glass')
  const out=[]
  slide(5.5,-66.42182,2.5,0,open,out)
  assert.ok(out[0]<6.4,'sideways movement stops before the outward leaf')
})

test('Contact doorway clipping cannot reuse an incompatible room shader',async()=>{
  const {createRoomMaterials}=await import('../src/rooms/referenceRooms.js')
  const tex=new Proxy({},{get:()=>({map:null,orm:null,normal:null})}),lm={texture:null,intensity:1}
  const about=createRoomMaterials(tex,lm,'about'),contact=createRoomMaterials(tex,lm,'contact')
  assert.notEqual(about.travertine.customProgramCacheKey(),contact.travertine.customProgramCacheKey())
  Object.values(about).concat(Object.values(contact)).forEach(m=>m.dispose())
})

test('the glazed master-room floor keeps its original finish without baked window shadows',async()=>{
  const {createRoomMaterials}=await import('../src/rooms/referenceRooms.js')
  const original=new THREE.Texture(),baked=new THREE.Texture()
  const tex=new Proxy({},{get:()=>({map:original,orm:null,normal:null})})
  const contact=createRoomMaterials(tex,{texture:baked,intensity:3},'contact')
  assert.equal(contact.stone_floor.lightMap,null,'window stripes must not remain baked into the floor')
  assert.equal(contact.stone_floor.map,original,'the existing marble finish is retained')
  assert.equal(contact.stone_floor.roughness,.08,'the original polished finish is retained')
  assert.equal(contact.stone_floor.envMapIntensity,0,'outside glazing cannot project a dark reflection box onto the floor')
  assert.equal(contact.stone_nero.lightMap,baked,'furniture and room finishes retain their lighting')
  Object.values(contact).forEach(m=>m.dispose());original.dispose();baked.dispose()
})

test('the handle depresses before the hinged leaf opens and the occupied threshold holds it open',async()=>{
  const m=await import('../src/experience/terraceDoor.js').catch(()=>({}))
  assert.equal(typeof m.createTerraceDoorState,'function','the door has a shared proximity-driven motion state')
  const s=m.createTerraceDoorState()
  for(let i=0;i<10;i++)m.stepTerraceDoor(s,X,Z+.9,.01)
  const first=m.terraceDoorPose(s.progress)
  assert.ok(first.handle<-.1)
  assert.equal(first.open,0,'handle moves before the door swings')
  for(let i=0;i<300;i++)m.stepTerraceDoor(s,X,Z+.9,.01)
  assert.ok(m.terraceDoorPose(s.progress).open>.99)
  for(let i=0;i<500;i++)m.stepTerraceDoor(s,X,Z-.4,.01)
  assert.ok(m.terraceDoorPose(s.progress).open>.99,'visitor in threshold cannot be trapped')
  for(let i=0;i<500;i++)m.stepTerraceDoor(s,X+10,Z-10,.01)
  assert.deepEqual(m.terraceDoorPose(s.progress),{open:0,angle:0,handle:0})
})

test('the swinging door pauses before its leaf would strike a nearby visitor',async()=>{
  const m=await import('../src/experience/terraceDoor.js')
  assert.equal(typeof m.terraceLeafBlocks,'function')
  const state=m.createTerraceDoorState(),x=7.5,z=-66.5
  for(let i=0;i<300;i++){
    m.stepTerraceDoor(state,x,z,.01)
    assert.equal(m.terraceLeafBlocks(x,z,m.terraceDoorPose(state.progress).open),false)
  }
  assert.ok(state.progress<1,'door waits for clearance instead of sweeping through the visitor')
  for(let i=0;i<300;i++)m.stepTerraceDoor(state,X,Z+.9,.01)
  assert.ok(state.progress>.99)
})

test('continuous walking reaches the room and terrace at touch speed without a swing deadlock',async()=>{
  const {doorOpen,resetDoors,updateDoors}=await import('../src/experience/doorStates.js')
  for(const direction of [-1,1]){
    resetDoors()
    let z=Z-direction*8
    const out=[],dt=1/120,target=Z+direction*4
    for(let i=0;i<2400&&direction*(target-z)>.03;i++){
      slide(X,z,0,direction*3.8*dt,doorOpen,out)
      z=out[1]
      updateDoors(X,z,dt)
      assert.equal(isFree(X,z,doorOpen),true,'moving leaf never enters the walker')
    }
    assert.ok(Math.abs(z-target)<.05,`door approach deadlocked from direction ${direction} at ${z}`)
  }
})

test('diagonal approaches wait clear of the swing and pass the terrace door from either side',async()=>{
  const {doorOpen,resetDoors,updateDoors}=await import('../src/experience/doorStates.js')
  for(const offset of [-.8,-.5,.5,.8])for(const direction of [-1,1]){
    resetDoors()
    let x=X+offset,z=Z-direction*4
    const targetZ=Z+direction*2,out=[],dt=1/120
    for(let i=0;i<2400&&Math.hypot(X-x,targetZ-z)>.04;i++){
      const distance=Math.hypot(X-x,targetZ-z),step=Math.min(distance,3.8*dt)
      slide(x,z,(X-x)/distance*step,(targetZ-z)/distance*step,doorOpen,out)
      ;[x,z]=out
      updateDoors(x,z,dt)
      assert.equal(isFree(x,z,doorOpen),true,'the moving leaf cannot occupy the visitor')
    }
    assert.ok(Math.hypot(X-x,targetZ-z)<.05,`diagonal ${offset},${direction} stalled at ${x},${z}`)
  }
})

test('the last part of the outward swing remains clear until the leaf is fully open',async()=>{
  const {terraceApproachBlocks}=await import('../src/experience/terraceDoor.js')
  assert.equal(terraceApproachBlocks(6.4,-66.29,.93),true)
  assert.equal(terraceApproachBlocks(6.4,-66.29,1),false)
})

test('fixed glazing leaves exactly the door opening, with an intact transom and neighboring panes',async()=>{
  const m=await import('../src/experience/terraceDoor.js').catch(()=>({}))
  assert.equal(typeof m.createFacadeGlazingGeometry,'function')
  const geometry=m.createFacadeGlazingGeometry()
  const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}))
  mesh.updateMatrixWorld()
  const hits=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,2),new THREE.Vector3(0,0,-1)).intersectObject(mesh).length
  assert.equal(hits(X,1.5),0,'door is not covered by a second static glass pane')
  assert.ok(hits(X,4)>0,'transom glass stays intact')
  assert.ok(hits(X-1.5,1.5)>0)
  assert.ok(hits(X+1.5,1.5)>0)
  geometry.dispose();mesh.material.dispose()
})
