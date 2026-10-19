import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
import * as THREE from 'three'
import {claimSceneClick,sceneClickClaimed,linkAtPoint,registerLink} from '../src/rooms/linkTargets.js'
import {createScreenSession} from '../src/rooms/liveScreenSession.js'

test('a handled 3D action owns its native click across wrapper events',()=>{
  const native={};claimSceneClick({nativeEvent:native})
  assert.equal(sceneClickClaimed(native),true)
  assert.equal(sceneClickClaimed({nativeEvent:native}),true)
  assert.equal(sceneClickClaimed({}),false)
})

test('review-time wall links are picked at their real position and never through a wall',()=>{
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1280/720,.05,100)
  camera.position.z=5
  const board=new THREE.Mesh(new THREE.PlaneGeometry(3,2),new THREE.MeshBasicMaterial())
  scene.add(board);const unregister=registerLink(board,'/work/forma/')
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(4,3),new THREE.MeshBasicMaterial());wall.position.z=1
  try{
    assert.equal(linkAtPoint(scene,camera,640,360,1280,720),'/work/forma/')
    assert.equal(linkAtPoint(scene,camera,0,0,1280,720),null)
    scene.add(wall)
    assert.equal(linkAtPoint(scene,camera,640,360,1280,720),null)
    wall.visible=false
    assert.equal(linkAtPoint(scene,camera,640,360,1280,720),'/work/forma/')
  }finally{unregister();for(const mesh of [board,wall]){mesh.geometry.dispose();mesh.material.dispose()}}
})

test('an eligible LED click reports ownership; an out-of-position click does not',()=>{
  const source=readFileSync('src/rooms/LiveProjectScreens.jsx','utf8')
  const start=source.indexOf('  const activate=useCallback(id=>{'),end=source.indexOf('  },[activeDoor,phase,navigationOpen,session,focus])',start)
  assert.ok(start>=0&&end>start)
  const activate=new Function('session','canActivate','look',`
    const id='forma',activeDoor='work',phase='room',navigationOpen=false,entries={current:new Map([['forma',{canActivate}]])},focus={holding:false};
    const resumeCaptured={},lookCapture={},document={body:{classList:{remove(){}}}},align={current(){}},controls={current(){}};
    const stopFallbackLook=()=>{},setActive=()=>{};
    ${source.slice(start+'  const activate=useCallback(id=>{'.length,end)}
  `)
  const session=createScreenSession()
  const normal={cursorFree:true,locked:false,yaw:.8,pitch:.2,targetYaw:0,targetPitch:0}
  assert.equal(activate(session,()=>true,normal),true,'the click consumer must know this screen accepted the click')
  assert.equal(session.active,'forma')
  assert.equal(normal.targetYaw,0,'LED review must preserve an unfinished straight-walk alignment')
  session.exit()
  assert.notEqual(activate(session,()=>false,normal),true)
  assert.equal(session.active,null)
})

test('a detail link outside an active LED opens on the same click that dismisses review',()=>{
  const source=readFileSync('src/rooms/LiveProjectScreens.jsx','utf8')
  const start=source.indexOf('    const down=e=>{'),end=source.indexOf('\n  },[close,session',start)
  assert.ok(start>=0&&end>start)
  const handlers=new Map(),doc={addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener(){}}
  const session=createScreenSession();session.enter('forma')
  let closed=0;const routes=[]
  const bind=new Function('document','window','session','close','routes','claimSceneClick',`
    const suppressClick={current:false},entries={current:new Map([['forma',{hitReady:true,containsPoint:()=>false}]])};
    const reviewLink={current:e=>e.clientX<700?'/work/forma/':'/work/lunara/'},navigate=route=>routes.push(route),followLink=(route,nav)=>nav(route);
    ${source.slice(start,end)}
  `)
  const cleanup=bind(doc,doc,session,()=>{closed++;session.exit()},routes,claimSceneClick)
  const makeEvent=()=>({button:0,clientX:640,clientY:650,target:{tagName:'DIV',closest:()=>null},preventDefault(){this.prevented=true},stopImmediatePropagation(){}})
  try{
    handlers.get('pointerdown')(makeEvent())
    assert.equal(session.active,'forma','a link must keep the click until release, so a drag cannot navigate')
    handlers.get('click')(makeEvent())
    assert.deepEqual(routes,['/work/forma/']);assert.equal(closed,1);assert.equal(session.active,null)
    session.enter('forma',{explicit:true});routes.length=0
    handlers.get('pointerdown')(makeEvent())
    handlers.get('click')({...makeEvent(),clientX:940})
    assert.deepEqual(routes,[],'dragging from one plaque to another must not open the release plaque')
    assert.equal(session.active,'forma')
  }finally{cleanup()}
})
