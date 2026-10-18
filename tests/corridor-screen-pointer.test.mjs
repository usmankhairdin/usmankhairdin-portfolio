import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {afterEach,test} from 'node:test'
import * as THREE from 'three'
import {look,setCursorFree,setRelativeLook} from '../src/experience/freeLook.js'

const source=readFileSync(new URL('../src/experience/HomeExperience.jsx',import.meta.url),'utf8')
const start=source.indexOf('function corridorEvents(store)'),end=source.indexOf('\n/*',start)
assert.ok(start>=0&&end>start)
const makeEvents=new Function('pointerEvents','look','window',source.slice(start,end)+';return corridorEvents;')
const ordinary=()=>({compute(event,state){state.pointer.set(event.clientX/1280*2-1,1-event.clientY/720*2);state.raycaster.setFromCamera(state.pointer,state.camera)}})
const events=makeEvents(ordinary,look,{matchMedia:()=>({matches:false})})({})
afterEach(()=>{setCursorFree(false);setRelativeLook(false)})

for(const side of [-1,1])test(`free/drag pointer clicks the ${side<0?'left':'right'} edge of the physical screen`,()=>{
  setRelativeLook(false)
  const camera=new THREE.PerspectiveCamera(62,1280/720,.05,100)
  camera.position.set(0,1.58,5);camera.updateMatrixWorld()
  const state={camera,pointer:new THREE.Vector2(),raycaster:new THREE.Raycaster()}
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.4,2.125));screen.position.y=1.85;screen.updateMatrixWorld()
  const point=new THREE.Vector3(side*1.5,1.85,0).project(camera)
  events.compute({clientX:(point.x+1)*640,clientY:(1-point.y)*360,pointerType:'mouse'},state)
  const hit=state.raycaster.intersectObject(screen)[0]
  assert.ok(hit&&Math.abs(hit.point.x-side*1.5)<1e-8,'click must use its actual screen position, not the centre dot')
  screen.geometry.dispose();screen.material.dispose()
})

test('captured mouse look retains centre-dot aiming',()=>{
  setRelativeLook(true)
  const camera=new THREE.PerspectiveCamera(62,1280/720,.05,100)
  camera.position.set(0,1.58,5);camera.updateMatrixWorld()
  const state={camera,pointer:new THREE.Vector2(),raycaster:new THREE.Raycaster()}
  events.compute({clientX:100,clientY:100,pointerType:'mouse'},state)
  assert.deepEqual(state.pointer.toArray(),[0,0])
})
