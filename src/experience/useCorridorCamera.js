import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useLiveScreens } from '../rooms/LiveProjectScreens.jsx'
import * as THREE from 'three'
import { doors } from '../data/projects.js'
import { useJourney } from './JourneyContext.jsx'
import useReducedMotion from './useReducedMotion.js'
import { LEAD_M, LEAD_TOUCH_M, METERS_PER_PX, WALK, WALK_TOUCH, createMomentumFilter, stepMotion, walkToward } from './walkMotion.js'
import { headQuaternion, heading, look, lookCapture, lookDragEnd, lookDragStart, lookMove, pauseAutomaticLook, setCaptureUnavailable, setCursorFree, setRelativeLook, setLook, stopFallbackLook, steerLook, stepLook } from './freeLook.js'
import { createPointerLook } from './pointerLook.js'
import { START_Z, isOutside, locate, roofRoute, routeTo, slide } from './walkable.js'
import { PLAZA_STAND_Z } from './corridorLayout.js'
import { SIGN } from './CorridorExterior.jsx'
import { doorOpen, resetDoors, updateDoors } from './doorStates.js'
import { ENTRANCE_OPENING } from './EntranceDoor.jsx'
import { linkState, pointLink } from '../rooms/linkTargets.js'
import { consumeReturn, saveReturn } from './corridorReturn.js'
import { centerHotspot } from './centerHotspot.js'

/*
 * The visitor's body and eyes.
 *
 * The building stands on a tower; the visitor arrives on its roof terrace, facing the door.
 * Terrace and building are one continuous floor: the wheel walks the visitor exactly where the
 * cursor points - across the terrace to its railing, up to the door (it slides open), through it,
 * down the corridor, through a room's door, round a room, and back out again - and they stop
 * the moment the wheel stops, wherever that is. Scrolling back steps back.
 *
 * Captured relative mouse movement looks around and the wheel walks along that heading.
 * Escape frees the cursor for page controls. Website review pauses
 * both controls until its outside click has returned the original camera pose.
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
  const { camera, gl, size, invalidate } = useThree()
  const {
    activeDoor, phase, setPhase, setActiveDoor,
    navigationTarget, setNavigationTarget,
    setAutoMoving, setCorridorFacing,
    experiencePhase, setExperiencePhase, navigationOpen,
  } = useJourney()
  const reducedMotion = useReducedMotion()
  const liveScreens=useLiveScreens()
  const controlsEnabled = enabled && !navigationOpen && !liveScreens?.active
  const pointerPolicy = useRef(null)
  pointerPolicy.current = { enabled, navigationOpen, session: liveScreens?.session }
  useEffect(() => {
    const canvas = gl.domElement
    const control = createPointerLook(canvas, {
      document,
      isAllowed: () => pointerPolicy.current.enabled && !pointerPolicy.current.navigationOpen && !pointerPolicy.current.session?.active && !look.cursorFree,
      onChange: (active, reason) => {
        setRelativeLook(active)
        if (active) setCaptureUnavailable(false)
        if (!active && reason === 'escape') setCursorFree(true)
      },
      onUnavailable: error => {
        setRelativeLook(false); setCaptureUnavailable(true)
        if (import.meta.env.DEV) console.warn('Mouse capture unavailable:', error?.message || error?.type || 'browser restriction')
      },
    })
    lookCapture.request = () => control.request()
    lookCapture.release = reason => control.release(reason)
    return () => { control.dispose(); lookCapture.request = lookCapture.release = null }
  }, [gl])

  const pos = useRef({ x: 0, z: PLAZA_STAND_Z })        // arriving on the terrace, facing the door
  const track = useRef({ value: 0, target: 0, vel: 0 })     // metres walked (an odometer)
  const walkInput = useRef('wheel')
  const momentumWeight = useRef(createMomentumFilter())
  const stepState = useRef({ speed: 0, phase: 0 })
  const stepClock = useRef(0)
  const route = useRef(null)
  const touchY = useRef(null)
  const where = useRef({ door: null, facing: null })
  const out = useRef([0, 0])
  const corner = useRef(new THREE.Vector3())
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  // leaning toward the cursor on the terrace: on or off, and the head's direction when it began
  const follow = useRef({ on: true, active: false, baseYaw: 0, basePitch: 0 })
  const arrived = useRef(false)
  const hotspot = useRef({ el: null, box: '' })
  const signSpot = useRef({ el: null, box: '' })

  const outside = experiencePhase === 'gated'           // on the terrace
  const entering = experiencePhase === 'entering'
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
      // The facade hides these front-facing controls from the side and rear roof.
      if (behind || pos.current.z < DOOR_FACE_Z) { x0 = x1 = y0 = y1 = -10 }
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
    const approach = roofRoute(pos.current.x, pos.current.z)
    if (!approach.length) {
      setExperiencePhase('gated')
      setAutoMoving(false)
      return undefined
    }
    route.current = [...approach, [0, INSIDE_START_Z]]
    setNavigationTarget(null)
    setActiveDoor(null)
    setPhase('corridor')
    setAutoMoving(true)
    setCorridorFacing('forward')
    resetDoors()
    follow.current.on = false
    track.current.target = track.current.value
  }, [experiencePhase, setActiveDoor, setAutoMoving, setCorridorFacing, setExperiencePhase, setNavigationTarget, setPhase])

  /* ---------------------------------------------------------------- input */
  const applyTravelDelta = useCallback((rawDelta, source = 'wheel') => {
    if (!walking || !controlsEnabled || liveScreens?.session.active || liveScreens?.focus.holding) return false
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
  }, [walking, controlsEnabled, liveScreens?.session, setNavigationTarget, setAutoMoving])

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

  // Desktop uses relative mouse-look and wheel-walk. A review's outside click
  // recaptures within that gesture, then input waits for the return animation.
  useEffect(() => {
    const canvas = gl.domElement
    const paused = () => !walking || !controlsEnabled || liveScreens?.session.active || liveScreens?.focus.holding
    const sceneTarget = e => e.target === canvas || e.target.closest?.('.entry-door-hotspot, .exterior-sign-hotspot')
    const onMove = e => {
      if (paused() || look.cursorFree) return
      if (e.pointerType === 'mouse') {
        if (!fine()) return
        if (document.pointerLockElement === canvas) return
        if (!sceneTarget(e)) {
          lookDragEnd()
          return
        }
      }
      lookMove(e)
    }
    const onRelativeMove = e => {
      if (document.pointerLockElement !== canvas || paused() || look.cursorFree) return
      lookMove(e)
    }
    const onDown = e => {
      look.dragging=false
      if (paused() || look.cursorFree || e.button !== 0 || !sceneTarget(e) || document.pointerLockElement === canvas) return
      // Keep a fallback drag on the same surface when it crosses a DOM door
      // hotspot. Otherwise canvas pointerleave cancels the middle of the turn.
      // A native touch/pen button keeps its own tap target. Mouse look can
      // cross that overlay; native capture mode is handled separately above.
      if(e.target===canvas || e.pointerType==='mouse'){
        try { canvas.setPointerCapture(e.pointerId) } catch { /* cancelled pointer */ }
      }
      lookDragStart(e)
    }
    const onLeave = () => { if (document.pointerLockElement !== canvas) lookDragEnd() }
    const onBlur = () => {
      // Focusing an embedded website also blurs the parent window. This is a
      // review transition, not an instruction to change the visitor's mode.
      if (liveScreens?.session.active || liveScreens?.focus.holding) return
      const captured=document.pointerLockElement===canvas || look.locked
      lookCapture.release?.('blur')
      // An uncaptured browser already has a free OS cursor. A focus change
      // (including a passive iframe's autofocus) must not disable its drag mode.
      if(captured)setCursorFree(true)
      pauseAutomaticLook(); onLeave()
    }
    const onKey = e => {
      if (e.key !== 'Escape' || e.defaultPrevented || paused()) return
      setCursorFree(true)
      e.preventDefault()
    }
    const onSceneClick = e => {
      // Consume the drag's click before it reaches a native door/sign button,
      // as well as the WebGL targets that have their own drag guards.
      if(look.dragging && sceneTarget(e)) { e.preventDefault(); e.stopImmediatePropagation(); return }
      if (!e.isTrusted || e.button !== 0 || !fine() || (e.pointerType && e.pointerType !== 'mouse') || paused() || look.cursorFree || look.dragging || !sceneTarget(e)) return
      const hotspots = [...document.querySelectorAll('.entry-door-hotspot,.exterior-sign-hotspot')]
        .map(element => ({ element, rect: element.getBoundingClientRect() }))
      const target = centerHotspot(hotspots, window.innerWidth, window.innerHeight)
      if (!target) return
      e.preventDefault(); e.stopImmediatePropagation()
      target.click()
      if (target.matches('.entry-door-hotspot')) lookCapture.request?.()
    }
    const onSceneClickComplete = e => {
      if (e.isTrusted && e.button === 0 && fine() && (!e.pointerType || e.pointerType === 'mouse') && !paused() && !look.cursorFree && !look.dragging && !look.captureUnavailable && sceneTarget(e)) lookCapture.request?.()
    }
    if (navigationOpen || !enabled) lookCapture.release?.('menu')
    setRelativeLook(document.pointerLockElement === canvas && !paused())
    document.body.classList.toggle('looking', look.locked)
    document.body.classList.remove('look-locked')
    pointLink('aimed', null)
    follow.current.on = false
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('click', onSceneClick, true)
    window.addEventListener('click', onSceneClickComplete)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('mousemove', onRelativeMove, { passive: true })
    window.addEventListener('pointerup', lookDragEnd, { passive: true })
    window.addEventListener('pointercancel', lookDragEnd, { passive: true })
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onBlur)
    return () => {
      pauseAutomaticLook(); setRelativeLook(false); lookDragEnd()
      document.body.classList.remove('looking', 'look-ready', 'look-locked')
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('click', onSceneClick, true)
      window.removeEventListener('click', onSceneClickComplete)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('mousemove', onRelativeMove)
      window.removeEventListener('pointerup', lookDragEnd)
      window.removeEventListener('pointercancel', lookDragEnd)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onBlur)
    }
  }, [gl, walking, controlsEnabled, liveScreens?.session, liveScreens?.focus])
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
    setCursorFree(false)
    stopFallbackLook()
    if (document.pointerLockElement) document.exitPointerLock?.()
    document.body.classList.remove('look-locked', 'looking', 'look-ready', 'look-aim', 'link-hover')
  }, [])

  // A room chosen from the menu: walk there along the corridor, through its door.
  useEffect(() => {
    if (!navigationTarget || !walking) return
    const target = doors.find((d) => d.id === navigationTarget)
    if (!target) { setNavigationTarget(null); return }
    route.current = routeTo(target, pos.current.x, pos.current.z)
    setAutoMoving(true)
  }, [navigationTarget, walking, setNavigationTarget, setAutoMoving])

  /* ---------------------------------------------------------------- every frame */
  useFrame((_, dt) => {
    const frameDt = Math.min(dt, 0.05)
    if (!walking && !entering) return
    if(liveScreens?.session.active||liveScreens?.focus.holding){
      track.current.target=track.current.value;track.current.vel=0
      return // Hold the exact camera pose, including idle breathing, during website review.
    }
    if (controlsEnabled && fine() && document.pointerLockElement === gl.domElement && !look.locked) setRelativeLook(true)
    document.body.classList.toggle('looking', controlsEnabled && fine() && !look.cursorFree && look.locked)
    document.body.classList.toggle('look-ready', controlsEnabled && fine() && !look.cursorFree && !look.locked)
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
    if (!controlsEnabled) t.target = t.value

    // A menu walk heads for its next waypoint; the head turns toward it as a person's would.
    if (route.current && controlsEnabled) {
      const [wx, wz] = route.current[0]
      const dx = wx - p.x
      const dz = wz - p.z
      const dist = Math.hypot(dx, dz)
      const finalPoint = route.current.length === 1
      const stopAtPoint = entering || finalPoint
      if (dist < (finalPoint ? 0.06 : entering ? 0.025 : 0.25) && (!stopAtPoint || Math.abs(t.vel) < 0.12)) {
        route.current.shift()
        if (!route.current.length) {
          route.current = null
          t.target = t.value
          t.vel = 0
          setNavigationTarget(null)
          setAutoMoving(false)
          if (entering) setExperiencePhase('inside')
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
    headQuaternion(camera.quaternion)
    camera.updateMatrixWorld()

    // The fixed centre dot is the visitor's forward direction in every input
    // mode; an off-centre hidden mouse must never steer walking sideways.
    const walkDir = () => {
      // Entry follows each physically clear roof segment, even while the head turns.
      if (entering && route.current) {
        const [x, z] = route.current[0]
        const distance = Math.hypot(x - p.x, z - p.z) || 1
        return [(x - p.x) / distance, (z - p.z) / distance]
      }
      return heading()
    }
    // Walk - or step back.
    const before = t.value
    walkToward(t, walkInput.current === 'touch' ? WALK_TOUCH : WALK, frameDt)
    let step = t.value - before
    if (entering && route.current) {
      const [x, z] = route.current[0]
      step = Math.sign(step) * Math.min(Math.abs(step), Math.hypot(x - p.x, z - p.z))
    }
    let moved = 0
    if (step !== 0) {
      const [hx, hz] = walkDir()
      const free = slide(p.x, p.z, hx * step, hz * step, doorOpen, out.current)
      moved = Math.hypot(out.current[0] - p.x, out.current[1] - p.z)
      p.x = out.current[0]
      p.z = out.current[1]
      if (!free || moved < Math.abs(step) * 0.15) { t.target = t.value; t.vel = 0 }
    }

    updateDoors(p.x, p.z, frameDt)

    // Through the entrance, either way: out onto the terrace, or in from it.
    const onRoof = isOutside(p.z, p.x)
    if (!entering && !outside && onRoof) setExperiencePhase('gated')
    if (outside && !onRoof) setExperiencePhase('inside')

    // Which room the visitor is standing in (for the menu and the hints).
    const door = onRoof ? null : locate(p.x, p.z)
    if ((door?.id ?? null) !== where.current.door) {
      where.current.door = door?.id ?? null
      setActiveDoor(door?.id ?? null)
      setPhase(door ? 'room' : 'corridor')
    }
    const facing = Math.cos(look.yaw) >= 0 ? 'forward' : 'return'
    if (facing !== where.current.facing) { where.current.facing = facing; setCorridorFacing(facing) }

    // Grounded body motion leaves the visitor's viewing angle steady.
    stepClock.current += frameDt
    const s = stepMotion(stepState.current, moved, frameDt, stepClock.current, reducedMotion)
    const [hx, hz] = heading()
    camera.position.set(p.x - hz * s.sway, EYE + s.bobY + s.breath, p.z + hx * s.sway)
    headQuaternion(camera.quaternion, s.roll, s.nod)
    if (outside) placeHotspot()

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
