import * as THREE from 'three'

// Relative device motion has no viewport edge. A steady angular gain keeps
// sensitivity identical after resizing; yaw is unlimited, pitch stops at 88°.
export const MOUSE_RADIANS_PER_PIXEL = .00125
const PITCH_LIMIT = 88 * Math.PI / 180
const SPRING = 16, MAX_TURN = 12
export const look = { yaw:0, pitch:0, targetYaw:0, targetPitch:0, vYaw:0, vPitch:0, locked:false, fallback:false, dragging:false, cursorFree:false, captureUnavailable:false }
export const lookCapture = { request:null, release:null }
const listeners = new Set()
const changed = () => listeners.forEach(fn => fn())
export const subscribeCursorMode = fn => { listeners.add(fn); return () => listeners.delete(fn) }
export const getCursorFree = () => look.cursorFree
export const getLookMode = () => look.cursorFree ? 'free' : look.locked ? 'look' : look.captureUnavailable ? 'drag' : 'ready'

export function setCursorFree(free) {
  if (look.cursorFree === free) return
  look.cursorFree = free
  if (free) lookCapture.release?.('cursor')
  pauseAutomaticLook(); setRelativeLook(false); changed()
}
export function setCaptureUnavailable(unavailable) {
  if (look.captureUnavailable === unavailable) return
  look.captureUnavailable = unavailable; changed()
}
export function setRelativeLook(active) {
  active = active && !look.cursorFree
  if (look.locked === active && !look.fallback) return
  const previous = look.locked
  look.locked = active; look.fallback = false
  if(active)look.dragging=false
  look.targetYaw = look.yaw; look.targetPitch = look.pitch
  look.vYaw = look.vPitch = 0
  if (previous !== active) changed()
}
const drag = { id:null, x:0, y:0, moved:0 }
const turn = (dx,dy) => {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return
  look.targetYaw -= dx * MOUSE_RADIANS_PER_PIXEL
  look.targetPitch = THREE.MathUtils.clamp(look.targetPitch - dy * MOUSE_RADIANS_PER_PIXEL, -PITCH_LIMIT, PITCH_LIMIT)
}
export function lookMove(e) {
  if (look.cursorFree) return
  if (look.locked) {
    turn(e.movementX || 0,e.movementY || 0)
    look.yaw = look.targetYaw; look.pitch = look.targetPitch
    look.vYaw = look.vPitch = 0
    return
  }
  // Touch and unavailable-Pointer-Lock fallback: each drag is a relative
  // stroke. Repositioning with the button up never reverses the prior stroke.
  if (drag.id === null || e.pointerId !== drag.id) return
  if (e.buttons === 0) { lookDragEnd(); return }
  drag.moved += Math.abs(e.clientX-drag.x) + Math.abs(e.clientY-drag.y)
  if (drag.moved > 4) look.dragging = true
  if (look.dragging) turn(e.clientX-drag.x,e.clientY-drag.y)
  drag.x=e.clientX; drag.y=e.clientY
}
export function pauseAutomaticLook() {
  look.targetYaw=look.yaw; look.targetPitch=look.pitch
  look.vYaw=look.vPitch=0
}
export function stopFallbackLook() { setRelativeLook(false); lookDragEnd() }
export function lookDragStart(e) {
  look.dragging=false
  drag.id=e.pointerId; drag.x=e.clientX; drag.y=e.clientY; drag.moved=0
}
export function lookDragEnd() {
  drag.id=null
  // Consume even a delayed browser click belonging to this drag. Only the
  // next pointer-down starts a new click; a timer races embedded browsers.
}
const spring = (x,v,target,dt) => {
  const nv=THREE.MathUtils.clamp(v+(SPRING*SPRING*(target-x)-2*SPRING*v)*dt,-MAX_TURN,MAX_TURN)
  return [x+nv*dt,nv]
}
export function stepLook(dt) {
  if (!Number.isFinite(dt) || dt <= 0) return
  const n=Math.max(1,Math.ceil(dt/(1/120))), h=dt/n
  for(let i=0;i<n;i++) {
    ;[look.yaw,look.vYaw]=spring(look.yaw,look.vYaw,look.targetYaw,h)
    ;[look.pitch,look.vPitch]=spring(look.pitch,look.vPitch,look.targetPitch,h)
  }
}
export function setLook(yaw,pitch=0) {
  look.yaw=look.targetYaw=Number.isFinite(yaw)?yaw:0
  look.pitch=look.targetPitch=THREE.MathUtils.clamp(Number.isFinite(pitch)?pitch:0,-PITCH_LIMIT,PITCH_LIMIT)
  look.vYaw=look.vPitch=0
}
export function steerLook(yaw,dt,rate=3.2) {
  const d=Math.atan2(Math.sin(yaw-look.targetYaw),Math.cos(yaw-look.targetYaw))
  look.targetYaw+=d*(1-Math.exp(-rate*dt))
  look.targetPitch+=(0-look.targetPitch)*(1-Math.exp(-rate*dt))
}
const euler=new THREE.Euler(0,0,0,'YXZ')
export function headQuaternion(q,roll=0,nod=0) {
  return q.setFromEuler(euler.set(look.pitch+nod,look.yaw,roll))
}
export const heading=()=>[-Math.sin(look.yaw),-Math.cos(look.yaw)]
