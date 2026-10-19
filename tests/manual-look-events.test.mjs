import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { afterEach, test } from 'node:test'
import * as input from '../src/experience/freeLook.js'
import * as links from '../src/rooms/linkTargets.js'

// Exercise the camera's actual event wiring without requiring WebGL or a
// browser's optional Pointer Lock implementation.
const source = readFileSync(new URL('../src/experience/useCorridorCamera.js', import.meta.url), 'utf8')
const start = source.indexOf('    const canvas = gl.domElement', source.indexOf('// Desktop uses relative mouse-look'))
const end = source.indexOf('\n  }, [gl, walking, controlsEnabled', start)
const buildWire = new Function('input', 'window', 'document', 'gl', 'context', 'links', `
  const {look,lookCapture,lookDragEnd,lookDragStart,lookMove,pauseAutomaticLook,setRelativeLook,setCursorFree,ownsLookPointer}=input
  const walking=true,controlsEnabled=true,liveScreens=context?.screens||null,navigationOpen=false,enabled=true
  const pointerPolicy={current:context?.policy||{}}
  const straightening={current:context?.straightening||false}
  const fine=()=>true,cancelAutomaticTravel=()=>{},pointLink=()=>{},follow={current:{on:false}}
  const centerHotspot=()=>context?.hotspot||null
  const {claimSceneClick,sceneClickClaimed}=links
  const toggleWalkingMode=()=>context?.toggle?.()
  ${source.slice(start,end)}
`)
const wire=(input,win,doc,gl,context)=>buildWire(input,win,doc,gl,context,links)

function surface() {
  const handlers = new Map()
  return {
    closest: () => null,
    classList: { toggle() {}, remove() {} },
    setPointerCapture() {},
    addEventListener(type, fn, options) { if (!handlers.has(type)) handlers.set(type, []); handlers.get(type).push({fn,capture:options===true||options?.capture===true}) },
    removeEventListener(type, fn) { handlers.set(type,(handlers.get(type)||[]).filter(entry=>entry.fn!==fn)) },
    send(type, values = {}) {
      const e={pointerType:'mouse',pointerId:1,button:0,buttons:1,clientX:100,clientY:400,target:this,
        preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){this.stopped=true},...values}
      for(const capture of [true,false]){
        if(!capture&&!e.stopped)e.onTarget?.(e)
        for(const entry of handlers.get(type)||[])if(entry.capture===capture&&!e.stopped)entry.fn(e)
      }
      return e
    },
  }
}

afterEach(() => { input.lookCapture.request=input.lookCapture.release=null; input.setCursorFree(false); input.lookDragEnd(); input.setRelativeLook(false); input.setCaptureUnavailable(false); input.setLook(0) })

test('a held look gesture survives canvas and projected-overlay boundaries without losing direction', () => {
  const canvas=surface(), win=surface(), overlay=surface()
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null}, {domElement:canvas})
  try {
    for (let stroke=0;stroke<5;stroke++) {
      win.send('pointerdown',{target:canvas})
      win.send('pointermove',{target:canvas,clientX:300})
      canvas.send('pointerleave',{clientX:300})
      win.send('pointermove',{target:overlay,clientX:1100})
      win.send('pointerup',{target:overlay,buttons:0,clientX:1100})
    }
    for (let stroke=0;stroke<5;stroke++) {
      win.send('pointerdown',{target:canvas,clientX:1100})
      win.send('pointermove',{target:canvas,clientX:100})
      win.send('pointerup',{target:canvas,buttons:0})
    }
    assert.ok(Math.abs(input.look.yaw)<1e-10,'equal opposite mouse distances must return to the same view')
    const stopped=input.look.yaw
    win.send('pointermove',{target:overlay,clientX:700,buttons:0})
    assert.equal(input.look.yaw,stopped,'repositioning a released pointer cannot turn the camera')
  } finally { cleanup() }
})

test('window blur ends a held fallback look gesture', () => {
  const canvas=surface(),win=surface()
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null}, {domElement:canvas})
  try {
    win.send('pointerdown',{target:canvas})
    win.send('pointermove',{target:canvas,clientX:300})
    win.send('blur')
    const stopped=input.look.yaw
    win.send('pointermove',{target:canvas,clientX:1000})
    assert.equal(input.look.yaw,stopped)
  } finally { cleanup() }
})

test('a Web sign keeps its native click target instead of capturing it on the canvas', () => {
  const canvas=surface(),win=surface(),sign=surface()
  sign.closest=()=>sign
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null}, {domElement:canvas})
  try {
    const down=win.send('pointerdown',{target:sign})
    assert.notEqual(down.defaultPrevented,true,'the real link must keep its first click')
    win.send('pointermove',{target:canvas,clientX:1100})
    assert.ok(Math.abs(input.look.yaw+1.25)<1e-10)
  } finally { cleanup() }
})

test('a free-cursor Work LED click reaches the screen before any attempt to recapture the mouse',()=>{
  const canvas=surface(),win=surface(),session={active:null},screens={session,focus:{holding:false}}
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null},{domElement:canvas},{screens,policy:{activeDoor:'work',phase:'room'}})
  let requests=0
  input.lookCapture.request=()=>requests++
  input.setCursorFree(true)
  try{
    win.send('pointerdown',{target:canvas});win.send('pointerup',{target:canvas,buttons:0})
    win.send('click',{target:canvas,buttons:0,isTrusted:true,onTarget(){session.active='forma'}})
    assert.equal(session.active,'forma','the physical LED must receive the first click')
    assert.equal(requests,0,'website review owns the pointer after that click')
  }finally{cleanup()}
})

test('a native Web Experience banner receives its first click without a mode change',()=>{
  const canvas=surface(),win=surface()
  const sign=surface();sign.closest=selector=>selector.includes('exterior-sign')||selector.includes('a,')?sign:null
  let requests=0,activations=0,toggles=0
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null,querySelectorAll:()=>[]},{domElement:canvas},{toggle:()=>toggles++},links)
  input.lookCapture.request=()=>requests++
  input.setCursorFree(true)
  try{
    win.send('pointerdown',{target:sign});win.send('pointerup',{target:sign,buttons:0})
    win.send('click',{target:sign,buttons:0,isTrusted:true,onTarget(){activations++}})
    assert.equal(activations,1);assert.equal(requests,0);assert.equal(toggles,0)
  }finally{cleanup()}
})

test('a click anywhere on a non-link scene surface toggles once in either mode',()=>{
  for(const normal of [true,false]){
    const canvas=surface(),win=surface();let toggles=0
    const cleanup=wire(input,win,{body:surface(),pointerLockElement:null,querySelectorAll:()=>[]},{domElement:canvas},{toggle:()=>toggles++},links)
    input.setCursorFree(normal);input.setCaptureUnavailable(true)
    try{
      win.send('pointerdown',{target:canvas});win.send('pointerup',{target:canvas,buttons:0})
      win.send('click',{target:canvas,buttons:0,isTrusted:true})
      assert.equal(toggles,1,'walls, floors and other non-link geometry all use the same click')
    }finally{cleanup()}
  }
})

test('a handled room link never toggles either walking mode after it navigates',()=>{
  for(const normal of [true,false]){
    const canvas=surface(),win=surface();let toggles=0,visits=0
    const cleanup=wire(input,win,{body:surface(),pointerLockElement:null,querySelectorAll:()=>[]},{domElement:canvas},{toggle:()=>toggles++})
    input.setCursorFree(normal);input.setCaptureUnavailable(true)
    try{
      win.send('click',{target:canvas,buttons:0,isTrusted:true,onTarget(event){links.claimSceneClick({nativeEvent:event});visits++}})
      assert.equal(visits,1);assert.equal(toggles,0)
    }finally{cleanup()}
  }
})

test('a captured centre-dot Web banner navigates once without requiring Escape',()=>{
  const canvas=surface(),win=surface();let visits=0,toggles=0
  const sign={getBoundingClientRect(){return{}},matches:selector=>selector==='.exterior-sign-hotspot',click(){visits++}}
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:canvas,querySelectorAll:()=>[sign]},{domElement:canvas},{hotspot:sign,toggle:()=>toggles++})
  input.setCursorFree(false);input.setRelativeLook(true)
  try{
    win.send('click',{target:canvas,buttons:0,isTrusted:true})
    assert.equal(visits,1);assert.equal(toggles,0)
  }finally{cleanup()}
})

test('menu/review input cleanup and window blur do not erase an unfinished normal heading',()=>{
  const canvas=surface(),win=surface()
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null},{domElement:canvas},{straightening:true})
  input.setCursorFree(true);input.setLook(.8,.2);input.look.targetYaw=0;input.look.targetPitch=0
  win.send('blur')
  assert.equal(input.look.targetYaw,0,'blur must not lock normal walk to a diagonal intermediate angle')
  cleanup()
  assert.equal(input.look.targetYaw,0,'a pause must retain the selected straight direction')
})

test('dragging in normal mode cannot turn its release into a mode-toggle click',()=>{
  const canvas=surface(),win=surface();let toggles=0
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null},{domElement:canvas},{toggle:()=>toggles++})
  input.setCursorFree(true)
  try{
    win.send('pointerdown',{target:canvas,clientX:200})
    win.send('pointermove',{target:canvas,clientX:900})
    win.send('pointerup',{target:canvas,clientX:900,buttons:0})
    win.send('click',{target:canvas,clientX:900,buttons:0,isTrusted:true})
    assert.equal(toggles,0,'a drag is not a click, even when mouse-look is paused')
    win.send('pointerdown',{target:canvas,clientX:900})
    win.send('pointerup',{target:canvas,clientX:900,buttons:0})
    win.send('click',{target:canvas,clientX:900,buttons:0,isTrusted:true})
    assert.equal(toggles,1,'the next deliberate click must work immediately')
  }finally{cleanup()}
})
