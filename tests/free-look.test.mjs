import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import * as THREE from 'three'
import * as input from '../src/experience/freeLook.js'

globalThis.window = { innerWidth: 1330, innerHeight: 871, setTimeout: fn => fn() }
const { look, lookMove, setLook, stepLook } = input

afterEach(() => {
  input.setCursorFree(false)
  input.lookDragEnd()
  input.setRelativeLook?.(false)
  setLook(0)
})

test('relative mouse movement rotates through multiple full turns with fixed client coordinates', () => {
  assert.equal(typeof input.setRelativeLook, 'function')
  input.setRelativeLook(true)
  for (let i = 0; i < 30; i++) lookMove({ clientX: 665, clientY: 435, movementX: 256, movementY: 0 })
  assert.ok(look.yaw < -Math.PI * 2, 'the browser centre cannot cap yaw at a viewport edge')
  const right = look.yaw
  for (let i = 0; i < 60; i++) lookMove({ clientX: 665, clientY: 435, movementX: -256, movementY: 0 })
  assert.ok(look.yaw > Math.PI * 2, 'left rotation also passes a full revolution')
  assert.ok(Math.abs(look.yaw + right) < 1e-10)
})

test('real fast mouse samples larger than 400 pixels are never discarded', () => {
  input.setRelativeLook(true)
  lookMove({ movementX: 900, movementY: 0 })
  assert.ok(look.yaw < -.9)
  const before = look.yaw
  lookMove({ movementX: NaN, movementY: Infinity })
  assert.equal(look.yaw, before)
  assert.ok(Number.isFinite(look.pitch))
})

test('relative sensitivity is independent of window dimensions and stays restrained', () => {
  const turns = []
  for (const [width, height] of [[1200, 800], [2560, 1080], [900, 1200]]) {
    window.innerWidth = width; window.innerHeight = height
    setLook(0); input.setRelativeLook(true)
    lookMove({ movementX: 100, movementY: 50 })
    turns.push([look.yaw, look.pitch])
  }
  assert.deepEqual(turns[0], turns[1]); assert.deepEqual(turns[0], turns[2])
  assert.ok(-turns[0][0] * 180 / Math.PI >= 5 && -turns[0][0] * 180 / Math.PI <= 9)
})

test('looking up and down reaches 88 degrees without flipping or constraining yaw', () => {
  input.setRelativeLook(true)
  for (let i = 0; i < 20; i++) lookMove({ movementX: 200, movementY: -100 })
  assert.ok(look.pitch > 87 * Math.PI / 180 && look.pitch < Math.PI / 2)
  for (let i = 0; i < 40; i++) lookMove({ movementX: 200, movementY: 100 })
  assert.ok(look.pitch < -87 * Math.PI / 180 && look.pitch > -Math.PI / 2)
  assert.ok(look.yaw < -Math.PI * 2)
})

test('stationary mouse input never rotates at any viewport edge or frame rate', () => {
  input.setRelativeLook(true)
  lookMove({ clientX: 0, clientY: 0, movementX: 60, movementY: -20 })
  const stopped = [look.yaw, look.pitch]
  for (let i = 0; i < 300; i++) stepLook(i % 2 ? 1 / 30 : 1 / 120)
  assert.deepEqual([look.yaw, look.pitch], stopped)
})

test('free cursor ignores scene movement and resumes relative input without a pose reset', () => {
  setLook(.7, .3); input.setRelativeLook(true)
  input.setCursorFree(true)
  lookMove({ movementX: 200, movementY: 200 })
  assert.deepEqual([look.yaw, look.pitch], [.7, .3])
  input.setCursorFree(false); input.setRelativeLook(true)
  lookMove({ movementX: 0, movementY: 0, clientX: 0, clientY: 0 })
  assert.deepEqual([look.yaw, look.pitch], [.7, .3])
})

test('uncaptured drag fallback can accumulate full turns across repeated hand lifts', () => {
  for (let stroke = 0; stroke < 8; stroke++) {
    input.lookDragStart({ pointerId: 1, clientX: 100, clientY: 400 })
    lookMove({ pointerId: 1, clientX: 1000, clientY: 400, buttons: 1 })
    input.lookDragEnd()
    for (let i = 0; i < 30; i++) stepLook(1 / 60)
  }
  assert.ok(look.yaw < -Math.PI * 2)
  const before = look.yaw
  lookMove({ pointerId: 1, clientX: 100, clientY: 400, buttons: 0 })
  assert.equal(look.yaw, before, 'returning the mouse with the button up cannot cancel prior turns')
})

test('a released drag remains consumed until a fresh click gesture begins',()=>{
  input.lookDragStart({pointerId:1,clientX:100,clientY:400})
  lookMove({pointerId:1,clientX:900,clientY:400,buttons:1})
  input.lookDragEnd()
  assert.equal(look.dragging,true,'a delayed browser click must not enter a door or website after a look drag')
  input.lookDragStart({pointerId:1,clientX:900,clientY:400})
  assert.equal(look.dragging,false,'a new intentional click works immediately')
})

test('fallback look follows the last mouse sample exactly and does not coast after release',()=>{
  input.lookDragStart({pointerId:1,clientX:100,clientY:400})
  lookMove({pointerId:1,clientX:900,clientY:300,buttons:1})
  assert.ok(Math.abs(look.yaw + 1) < 1e-12)
  assert.ok(Math.abs(look.pitch - .125) < 1e-12)
  input.lookDragEnd()
  const stopped=[look.yaw,look.pitch]
  for(let i=0;i<300;i++)stepLook(i%2?1/30:1/120)
  assert.deepEqual([look.yaw,look.pitch],stopped)
})

test('freeing the cursor ends a fallback gesture before look is resumed',()=>{
  input.lookDragStart({pointerId:1,clientX:100,clientY:400})
  lookMove({pointerId:1,clientX:300,clientY:400,buttons:1})
  input.setCursorFree(true)
  const stopped=look.yaw
  input.setCursorFree(false)
  lookMove({pointerId:1,clientX:1000,clientY:400,buttons:1})
  assert.equal(look.yaw,stopped,'resuming look cannot revive a gesture from before Escape')
})

test('walking direction remains the horizontal centre-camera direction at every yaw and pitch', () => {
  for (const yaw of [-9, -Math.PI, -.5, 0, 1, 8]) for (const pitch of [-1.5, 0, 1.5]) {
    setLook(yaw, pitch)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(input.headQuaternion(new THREE.Quaternion()))
    forward.y = 0; forward.normalize()
    assert.ok(forward.distanceTo(new THREE.Vector3(...[input.heading()[0], 0, input.heading()[1]])) < 1e-10)
  }
})
