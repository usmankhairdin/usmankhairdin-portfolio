import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import gsap from 'gsap'
import { doors } from '../data/projects.js'
import { useJourney } from './JourneyContext.jsx'
import useReducedMotion from './useReducedMotion.js'
import { motionEase } from './doorSystem.js'
import { LEAD_M, LEAD_TOUCH_M, METERS_PER_PX, WALK, WALK_TOUCH, createMomentumFilter, stepMotion, walkToward } from './walkMotion.js'
import { headQuaternion, heading, look, lookDragEnd, lookDragStart, lookMove, setLook, steerLook, stepLook } from './freeLook.js'
import { START_Z, isOutside, locate, routeTo, slide } from './walkable.js'
import { PLAZA_STAND_Z } from './corridorLayout.js'
import { SIGN } from './CorridorExterior.jsx'
import { doorOpen, resetDoors, updateDoors } from './doorStates.js'
import { ENTRANCE_OPENING } from './EntranceDoor.jsx'
import { followLink, linkState, linkTargets, pointLink } from '../rooms/linkTargets.js'
import { consumeReturn, saveReturn } from './corridorReturn.js'

/*
 * The visitor's body and eyes.
 *
 * The building stands on a tower; the visitor arrives on its roof terrace, facing the door.
 * Terrace and building are one continuous floor: the wheel walks the visitor exactly where the
 * cursor points - across the terrace to its railing, up to the door (it slides open), through it,
 * down the corridor, through a room's door, round a room, and back out again - and they stop
 * the moment the wheel stops, wherever that is. Scrolling back steps back.
 *
 * Looking, game style: the click on the door (or any click on the scene) captures the mouse.
 * The cursor hides, a small dot marks the middle, and the view turns exactly as far as the
 * mouse moves, all the way round; the walk goes where the dot is. A click that is not on a
 * link, or Esc, gives the cursor back; a click on the scene takes it again. Out on the terrace,
 * before any click, the view only leans a little toward the cursor. A touch screen drags.
 */
const EYE = 1.58
const INSIDE_START_Z = 10.1
const DOOR_FACE_Z = START_Z + 0.22  // the entrance portal's outside face
const DOOR_HALF = 1.1               // half the portal's width
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const DOOR_CORNERS = [[-DOOR_HALF, -0.075, DOOR_FACE_Z], [DOOR_HALF, -0.075, DOOR_FACE_Z], [DOOR_HALF, ENTRANCE_OPENING.height - 0.075, DOOR_FACE_Z], [-DOOR_HALF, ENTRANCE_OPENING.height - 0.075, DOOR_FACE_Z]]
// the Web Experience sign on the plaza: the eight corners of its pylon
const SIGN_CORNERS = (() => {
  const c = Math.cos(SIGN.rotY)
  const s = Math.sin(SIGN.rotY)
  const out = []
  for (const lx of [-SIGN.w / 2, SIGN.w / 2]) for (const ly of [0, SIGN.h]) for (const lz of [-SIGN.d / 2, SIGN.d / 2]) out.push([SIGN.x + lx * c + lz * s, -0.075 + ly, SIGN.z - lx * s + lz * c])
  return out
})()
// On the terrace before the mouse is captured, the head leans gently toward the cursor: to the
// cursor's own direction scaled down by half, so about 23 degrees at a side of the screen.
const LEAN = 0.5
const TAN_H = Math.tan((62 * Math.PI) / 360)
const followYaw = (x) => -LEAN * Math.atan(x * TAN_H * (window.innerWidth / Math.max(1, window.innerHeight)))
const followPitch = (y) => -LEAN * Math.atan(y * TAN_H)

export default function useCorridorCamera(enabled = true) {
  const { camera, gl, scene, size, invalidate } = useThree()
  const navigate = useNavigate()
  const {
    activeDoor, phase, setPhase, setActiveDoor,
    navigationTarget, setNavigationTarget,
    setAutoMoving, setCorridorFacing,
    experiencePhase, setExperiencePhase, navigationOpen,
  } = useJourney()
  const reducedMotion = useReducedMotion()
  const controlsEnabled = enabled && !navigationOpen

  const pos = useRef({ x: 0, z: PLAZA_STAND_Z })        // arriving on the terrace, facing the door
  const track = useRef({ value: 0, target: 0, vel: 0 })     // metres walked (an odometer)
  const walkInput = useRef('wheel')
  const momentumWeight = useRef(createMomentumFilter())
  const stepState = useRef({ speed: 0, phase: 0 })
  const stepClock = useRef(0)
  const route = useRef(null)
  const touchY = useRef(null)
  const tween = useRef(null)
  const scripted = useRef(null)                               // the walk in or out, driven by a tween
  const where = useRef({ door: null, facing: null })
  const out = useRef([0, 0])
  const corner = useRef(new THREE.Vector3())
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  const ray = useRef(new THREE.Vector3())
  // leaning toward the cursor on the terrace: on or off, and the head's direction when it began
  const follow = useRef({ on: true, active: false, baseYaw: 0, basePitch: 0 })
  const freedAt = useRef(0)
  const raycaster = useRef(new THREE.Raycaster())
  const frameCount = useRef(0)
  const arrived = useRef(false)
  const hotspot = useRef({ el: null, box: '' })
  const signSpot = useRef({ el: null, box: '' })

  const outside = experiencePhase === 'gated'           // on the terrace
  const walking = outside || experiencePhase === 'inside'

  /* ---------------------------------------------------------------- the cursor */
  const fine = () => !window.matchMedia?.('(pointer: coarse)').matches
  useEffect(() => {
    const canvas = gl.domElement
    // the head follows the cursor over the scene, and holds while it is over the page's own controls
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      if (e.target !== canvas && !e.target.closest?.('.entry-door-hotspot, .exterior-sign-hotspot')) return
      pointer.current.x = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1)
      pointer.current.y = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [gl])
  // a fresh arrival faces the door
  useEffect(() => {
    if (!outside || arrived.current) return
    arrived.current = true
    setLook(0, 0)
    pointer.current.x = 0
    pointer.current.y = 0
    follow.current.active = false
  }, [outside])

  // The page's door button and sign link sit exactly over the door and the sign as they stand on screen.
  const placeHotspot = useCallback(() => {
    const W = gl.domElement.clientWidth
    const H = gl.domElement.clientHeight
    camera.updateMatrixWorld()
    const put = (h, selector, corners) => {
      if (!h.el || !h.el.isConnected) h.el = document.querySelector(selector)
      if (!h.el) return
      let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity
      let behind = false
      for (const [x, y, z] of corners) {
        corner.current.set(x, y, z).project(camera)
        if (corner.current.z > 1) behind = true
        const sx = (corner.current.x * 0.5 + 0.5) * W
        const sy = (-corner.current.y * 0.5 + 0.5) * H
        x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy)
      }
      if (behind) { x0 = x1 = y0 = y1 = -10 }
      const box = `${x0.toFixed(0)},${y0.toFixed(0)},${(x1 - x0).toFixed(0)},${(y1 - y0).toFixed(0)}`
      if (box === h.box) return
      h.box = box
      h.el.style.transform = `translate3d(${x0.toFixed(1)}px, ${y0.toFixed(1)}px, 0)`
      h.el.style.width = `${(x1 - x0).toFixed(1)}px`
      h.el.style.height = `${(y1 - y0).toFixed(1)}px`
    }
    put(hotspot.current, '.entry-door-hotspot', DOOR_CORNERS)
    put(signSpot.current, '.exterior-sign-hotspot', SIGN_CORNERS)
  }, [camera, gl])

  /* ---------------------------------------------------------------- walking in */
  useLayoutEffect(() => {
    if (experiencePhase !== 'entering') return undefined
    tween.current?.kill()
    route.current = null
    setNavigationTarget(null)
    setActiveDoor(null)
    setPhase('corridor')
    setAutoMoving(true)
    setCorridorFacing('forward')
    resetDoors()
    // turn the short way round to face down the corridor; the captured mouse takes over inside
    const walk = { p: 0, from: { x: pos.current.x, z: pos.current.z, yaw: Math.atan2(Math.sin(look.yaw), Math.cos(look.yaw)), pitch: look.pitch } }
    scripted.current = walk
    const tw = gsap.to(walk, {
      p: 1, delay: reducedMotion ? 0 : 0.12, duration: reducedMotion ? 0.01 : 3.4, ease: 'sine.inOut',
      onComplete: () => {
        scripted.current = null
        pos.current = { x: 0, z: INSIDE_START_Z }
        track.current = { value: 0, target: 0, vel: 0 }
        setLook(0, 0)
        setAutoMoving(false)
        setExperiencePhase('inside')
      },
    })
    tween.current = tw
    return () => tw.kill()
  }, [experiencePhase, camera, reducedMotion, setActiveDoor, setAutoMoving, setCorridorFacing, setExperiencePhase, setNavigationTarget, setPhase])

  /* One frame of the walk in from a click on the door: where the body is, where the head looks, the step. */
  const walkScripted = useCallback((dt) => {
    const w = scripted.current
    if (!w) return
    const p = w.p
    const f = w.from
    const settle = motionEase(clamp(p * 2.2, 0, 1))
    const x = THREE.MathUtils.lerp(f.x, 0, settle)
    const z = THREE.MathUtils.lerp(f.z, INSIDE_START_Z, p)
    const yaw = f.yaw * (1 - settle)
    const pitch = f.pitch * (1 - settle)
    const moved = Math.hypot(x - pos.current.x, z - pos.current.z)
    pos.current = { x, z }
    setLook(yaw, pitch)
    // the entrance's own sensor: it opens as they come up to it and shuts once they are clear
    updateDoors(x, z, dt)
    stepClock.current += dt
    const s = stepMotion(stepState.current, moved, dt, stepClock.current, reducedMotion)
    const [hx, hz] = heading()
    camera.position.set(x - hz * s.sway, EYE + s.bobY + s.breath, z + hx * s.sway)
    headQuaternion(camera.quaternion, s.roll, s.nod)
  }, [camera, reducedMotion])

  /* ---------------------------------------------------------------- input */
  const applyTravelDelta = useCallback((rawDelta, source = 'wheel') => {
    if (!walking || !controlsEnabled) return false
    const delta = clamp(rawDelta, -240, 240)
    const t = track.current
    walkInput.current = source
    if (route.current) {            // the visitor takes over from a menu walk
      route.current = null
      setNavigationTarget(null)
      setAutoMoving(false)
    }
    // forward the way the head faces; scrolling back steps back a little more slowly
    const lead = source === 'touch' ? LEAD_TOUCH_M : LEAD_M
    const next = t.target + delta * METERS_PER_PX * (delta < 0 ? 0.6 : 1)
    t.target = clamp(next, t.value - lead * 0.6, t.value + lead)
    return true
  }, [walking, controlsEnabled, setNavigationTarget, setAutoMoving])

  useEffect(() => {
    const onWheel = (e) => {
      if (e.defaultPrevented || !walking) return
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 16
      else if (e.deltaMode === 2) dy *= window.innerHeight
      if (applyTravelDelta(clamp(dy, -240, 240) * momentumWeight.current(dy), 'wheel')) e.preventDefault()
    }
    const onTouchStart = (e) => { if (e.touches.length === 1) touchY.current = e.touches[0].clientY }
    const onTouchMove = (e) => {
      if (touchY.current == null || e.touches.length !== 1) return
      const y = e.touches[0].clientY
      const delta = (touchY.current - y) * 1.45
      if (Math.abs(delta) < 1.5) return
      touchY.current = y
      if (applyTravelDelta(delta, 'touch')) e.preventDefault()
    }
    const onTouchEnd = () => { touchY.current = null }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [applyTravelDelta, walking])

  // Looking. A click on the scene captures the mouse (the door's click does too). While captured,
  // a click on a link follows it and any other click frees the mouse, as does Esc. With the mouse
  // free, a plain click on the scene captures it again - never in the same breath as freeing it.
  // A touch, or a pen, drags the view round.
  useEffect(() => {
    const canvas = gl.domElement
    const show = () => document.body.classList.toggle('looking', look.locked)
    const onLockChange = () => {
      const was = look.locked
      look.locked = document.pointerLockElement === canvas
      document.body.classList.toggle('look-locked', look.locked)
      if (was && !look.locked) {
        freedAt.current = performance.now()
        follow.current.on = false            // the cursor is the visitor's own again
      }
      if (!look.locked) pointLink('aimed', null)
      show()
    }
    const onDown = (e) => {
      if (!walking || !controlsEnabled || e.button !== 0) return
      if (look.locked) {
        e.preventDefault()
        const aimed = linkState.aimed
        if (aimed && linkTargets.has(aimed)) followLink(linkTargets.get(aimed), navigate)
        else document.exitPointerLock?.()
        return
      }
      if (e.target === canvas && !linkState.hovered && e.pointerType !== 'mouse') lookDragStart(e)
    }
    const onClick = (e) => {
      if (!walking || !controlsEnabled || look.locked || look.dragging || e.button !== 0) return
      if (e.target !== canvas || linkState.hovered || e.pointerType === 'touch') return
      if (performance.now() - freedAt.current < 900) return
      const ask = canvas.requestPointerLock?.()
      if (ask?.catch) ask.catch(() => {})
    }
    const onMove = (e) => {
      if (!walking || !controlsEnabled) return
      lookMove(e)
    }
    onLockChange()
    document.addEventListener('pointerlockchange', onLockChange)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('click', onClick)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', lookDragEnd, { passive: true })
    window.addEventListener('pointercancel', lookDragEnd, { passive: true })
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('click', onClick)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', lookDragEnd)
      window.removeEventListener('pointercancel', lookDragEnd)
    }
  }, [gl, navigate, walking, controlsEnabled])

  // Before following a link to a page, note where the visitor stands, for Back to return to.
  useEffect(() => {
    linkState.save = () => saveReturn({ x: pos.current.x, z: pos.current.z, yaw: look.yaw, pitch: look.pitch })
    return () => { linkState.save = null }
  }, [])

  // Back from a page: stand where the visitor stood, looking where they looked.
  useLayoutEffect(() => {
    if (experiencePhase !== 'inside') return
    const spot = consumeReturn()
    if (!spot) return
    pos.current = { x: spot.x, z: spot.z }
    track.current = { value: 0, target: 0, vel: 0 }
    setLook(spot.yaw || 0, spot.pitch || 0)
    camera.position.set(spot.x, EYE, spot.z)
    headQuaternion(camera.quaternion)
  }, [experiencePhase, camera])

  useEffect(() => () => {
    if (document.pointerLockElement) document.exitPointerLock?.()
    document.body.classList.remove('look-locked', 'looking', 'look-aim', 'link-hover')
  }, [])
  useEffect(() => { if (navigationOpen && document.pointerLockElement) document.exitPointerLock?.() }, [navigationOpen])

  // A room chosen from the menu: walk there along the corridor, through its door.
  useEffect(() => {
    if (!navigationTarget || experiencePhase !== 'inside') return
    const target = doors.find((d) => d.id === navigationTarget)
    if (!target) { setNavigationTarget(null); return }
    route.current = routeTo(target, pos.current.x, pos.current.z)
    setAutoMoving(true)
  }, [navigationTarget, experiencePhase, setNavigationTarget, setAutoMoving])

  /* ---------------------------------------------------------------- every frame */
  useFrame((_, dt) => {
    const frameDt = Math.min(dt, 0.05)
    if (experiencePhase === 'entering') { walkScripted(frameDt); return }
    if (!walking) return
    // on the terrace, before the mouse is captured, the head leans toward the cursor, starting from where it already looks
    const f = follow.current
    const following = outside && f.on && !look.locked && fine() && controlsEnabled && !route.current
    if (following) {
      if (!f.active) {
        f.baseYaw = look.yaw - followYaw(pointer.current.x)
        f.basePitch = look.pitch - followPitch(pointer.current.y)
      }
      look.targetYaw = f.baseYaw + followYaw(pointer.current.x)
      look.targetPitch = clamp(f.basePitch + followPitch(pointer.current.y), -1.2, 1.2)
    }
    f.active = following
    const t = track.current
    const p = pos.current

    // A menu walk heads for its next waypoint; the head turns toward it as a person's would.
    if (route.current) {
      const [wx, wz] = route.current[0]
      const dx = wx - p.x
      const dz = wz - p.z
      const dist = Math.hypot(dx, dz)
      if (dist < 0.3) {
        route.current.shift()
        if (!route.current.length) {
          route.current = null
          t.target = t.value
          setNavigationTarget(null)
          setAutoMoving(false)
        }
      } else {
        const want = Math.atan2(-dx, -dz)
        steerLook(want, frameDt, 3.6)
        // walk on only as the head comes round to the waypoint - a person turns to face where they
        // are going, then goes - so a waypoint behind or beside them is never circled at speed
        const off = Math.atan2(Math.sin(want - look.yaw), Math.cos(want - look.yaw))
        const ahead = Math.max(0, Math.cos(off))
        t.target = t.value + Math.min(dist, LEAD_M) * ahead * ahead
      }
    }

    stepLook(frameDt)

    // Walk exactly where the cursor points: along the horizontal part of the ray from the eye
    // through the cursor, so whatever is under the cursor stays under it, coming closer. On a
    // touch screen, in a menu walk, or pointing nearly straight up or down, the view's own heading.
    const walkDir = () => {
      if (look.locked || route.current || !fine() || walkInput.current === 'touch') return heading()
      const v = ray.current.set(pointer.current.x, -pointer.current.y, 0.5).unproject(camera).sub(camera.position)
      const flat = Math.hypot(v.x, v.z)
      const [hx, hz] = heading()
      const w = THREE.MathUtils.clamp(flat / v.length() / 0.35, 0, 1)
      const dx = (v.x / Math.max(flat, 1e-6)) * w + hx * (1 - w)
      const dz = (v.z / Math.max(flat, 1e-6)) * w + hz * (1 - w)
      const n = Math.hypot(dx, dz) || 1
      return [dx / n, dz / n]
    }
    // Walk - or step back.
    const before = t.value
    if (reducedMotion) { t.value = t.target; t.vel = 0 } else walkToward(t, walkInput.current === 'touch' ? WALK_TOUCH : WALK, frameDt)
    const step = t.value - before
    let moved = 0
    if (step !== 0) {
      const [hx, hz] = walkDir()
      const free = slide(p.x, p.z, hx * step, hz * step, doorOpen, out.current)
      moved = Math.hypot(out.current[0] - p.x, out.current[1] - p.z)
      p.x = out.current[0]
      p.z = out.current[1]
      if (!free || moved < Math.abs(step) * 0.15) { t.target = t.value; t.vel = Math.sign(t.vel) * Math.min(Math.abs(t.vel), 0.4) }
    }

    updateDoors(p.x, p.z, frameDt)

    // Through the entrance, either way: out onto the terrace, or in from it.
    if (!outside && p.z > START_Z + 0.6) { setExperiencePhase('gated'); return }
    if (outside && !isOutside(p.z)) { setExperiencePhase('inside'); return }

    // Which room the visitor is standing in (for the menu and the hints).
    const door = locate(p.x, p.z)
    if ((door?.id ?? null) !== where.current.door) {
      where.current.door = door?.id ?? null
      setActiveDoor(door?.id ?? null)
      setPhase(door ? 'room' : 'corridor')
    }
    const facing = Math.cos(look.yaw) >= 0 ? 'forward' : 'return'
    if (facing !== where.current.facing) { where.current.facing = facing; setCorridorFacing(facing) }

    // The human step: bob, weight shift, a hint of roll and nod, and breathing when still.
    stepClock.current += frameDt
    const s = stepMotion(stepState.current, moved, frameDt, stepClock.current, reducedMotion)
    const [hx, hz] = heading()
    camera.position.set(p.x - hz * s.sway, EYE + s.bobY + s.breath, p.z + hx * s.sway)
    headQuaternion(camera.quaternion, s.roll, s.nod)
    if (outside) placeHotspot()

    // With the mouse captured, the centre dot finds what it rests on (every few frames).
    if (look.locked && (frameCount.current++ & 3) === 0) {
      raycaster.current.setFromCamera({ x: 0, y: 0 }, camera)
      raycaster.current.far = 22
      const shown = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true }
      const hit = raycaster.current.intersectObjects(scene.children, true).find((h) => shown(h.object))
      const aimed = hit && linkTargets.has(hit.object) ? hit.object : null
      if (aimed !== linkState.aimed) pointLink('aimed', aimed)
    }
  }, -2) // before the floor reflection pass, so the mirror always uses this frame's camera

  // Keep the menu's notion of "here" honest when the visitor leaves the experience.
  useEffect(() => {
    if (experiencePhase === 'inside') return
    where.current = { door: null, facing: null }
    if (activeDoor) setActiveDoor(null)
  }, [experiencePhase, activeDoor, setActiveDoor])
  useEffect(() => { if (phase !== 'room' && phase !== 'corridor') setPhase('corridor') }, [phase, setPhase])
  useEffect(() => { invalidate() }, [size, invalidate])
  // development only: lets a test script see where the walker is
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined
    window.__walker = { pos, route, track, look, follow, pointer }
    return () => { delete window.__walker }
  }, [])

  return { pos }
}
