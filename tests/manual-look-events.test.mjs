import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { afterEach, test } from 'node:test'
import * as input from '../src/experience/freeLook.js'

// Exercise the camera's actual event wiring without requiring WebGL or a
// browser's optional Pointer Lock implementation.
const source = readFileSync(new URL('../src/experience/useCorridorCamera.js', import.meta.url), 'utf8')
const start = source.indexOf('    const canvas = gl.domElement', source.indexOf('// Desktop uses relative mouse-look'))
const end = source.indexOf('\n  }, [gl, walking, controlsEnabled', start)
const wire = new Function('input', 'window', 'document', 'gl', `
  const {look,lookCapture,lookDragEnd,lookDragStart,lookMove,pauseAutomaticLook,setRelativeLook,setCursorFree,ownsLookPointer}=input
  const walking=true,controlsEnabled=true,liveScreens=null,navigationOpen=false,enabled=true
  const fine=()=>true,cancelAutomaticTravel=()=>{},pointLink=()=>{},follow={current:{on:false}}
  const centerHotspot=()=>null
  ${source.slice(start,end)}
`)

function surface() {
  const handlers = new Map()
  return {
    closest: () => null,
    classList: { toggle() {}, remove() {} },
    setPointerCapture() {},
    addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn) },
    removeEventListener(type, fn) { handlers.get(type)?.delete(fn) },
    send(type, values = {}) {
      const e={pointerType:'mouse',pointerId:1,button:0,buttons:1,clientX:100,clientY:400,target:this,
        preventDefault(){this.defaultPrevented=true},stopImmediatePropagation(){this.stopped=true},...values}
      for (const fn of handlers.get(type) || []) { fn(e); if(e.stopped)break }
      return e
    },
  }
}

afterEach(() => { input.setCursorFree(false); input.lookDragEnd(); input.setRelativeLook(false); input.setLook(0) })

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

test('starting fallback look over the Web sign prevents the browser dragging its link', () => {
  const canvas=surface(),win=surface(),sign=surface()
  sign.closest=()=>sign
  const cleanup=wire(input,win,{body:surface(),pointerLockElement:null}, {domElement:canvas})
  try {
    const down=win.send('pointerdown',{target:sign})
    assert.equal(down.defaultPrevented,true,'native link drag would cancel the mouse-look pointer mid-turn')
    win.send('pointermove',{target:canvas,clientX:1100})
    assert.ok(Math.abs(input.look.yaw+1.25)<1e-10)
  } finally { cleanup() }
})
