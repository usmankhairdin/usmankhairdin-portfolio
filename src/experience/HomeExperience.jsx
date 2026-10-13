import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Header from '../components/Header.jsx'
import HomeScene from './HomeScene.jsx'
import { JourneyProvider, useJourney } from './JourneyContext.jsx'
import useReducedMotion from './useReducedMotion.js'
import { hintEntrance, setEntranceOpen } from './entranceDoor.js'
import { releaseBootLoader } from '../loader/bootLoader.js'
import { useWebScrollSuspension } from '../scroll/WebScrollProvider.jsx'
import { Link, useNavigationType } from 'react-router-dom'
import { WEB_HOME } from '../routeLoaders.js'
import { takeReturn } from './corridorReturn.js'
import { floorReflection } from './floorReflection.js'
import { markSceneCompiled } from './probeEnv.js'
import { exteriorSign } from './CorridorExterior.jsx'

/*
 * Before the first frame, every shader the building will need is compiled: in view or not
 * (the rooms are hidden until approached), on screen and in the floor's reflection. It is done
 * while the loader is still up, in parallel where the browser can, so nothing stops later.
 */
function SceneCompile({ onCompiled }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let cancelled = false
    const shown = []
    scene.traverse((o) => { if (!o.visible) { shown.push(o); o.visible = true } })
    const previous = gl.getRenderTarget()
    const jobs = []
    try {
      gl.setRenderTarget(floorReflection.rt)
      jobs.push(gl.compileAsync(scene, camera))
      gl.setRenderTarget(null)
      jobs.push(gl.compileAsync(scene, camera))
    } finally {
      gl.setRenderTarget(previous)
      shown.forEach((o) => { o.visible = false })
    }
    Promise.all(jobs).catch(() => {}).then(() => {
      markSceneCompiled(gl)
      if (!cancelled) onCompiled?.()
    })
    return () => { cancelled = true }
  }, [gl, scene, camera, onCompiled])
  return null
}

/* Then the probes capture and the first frames draw; the scene is ready once they have. */
function SceneReadySignal({ onReady }) {
  const frames = useRef(0)
  useFrame(() => { if (++frames.current === 8) onReady?.() })
  return null
}

/*
 * What the mouse is doing, and how to change it, in the same words outside and in: by default
 * the mouse looks around; a click gives the cursor back (to leave the site, use the browser),
 * and a click on the scene takes it up again. `body.looking` says which.
 */
function LookModeLabel({ outside = false }) {
  return <div className={`look-mode${outside ? ' look-mode--outside' : ''}`} aria-live="polite">
    <span className="look-mode__on"><b>Looking around</b> · click or press Esc to get your cursor back</span>
    <span className="look-mode__off">{outside ? <><b>Click the scene to look around</b> · click the door to go in · scroll to walk</> : <><b>Cursor free</b> · click the scene to look around again</>}</span>
    {outside && <span className="look-mode__touch"><b>Drag to look around</b> · swipe to walk · tap the door to go in</span>}
  </div>
}

function ExperienceHud() {
  const { phase, autoMoving, navigationTarget } = useJourney()
  const room = phase === 'room'

  return <>
    <Header immersive />
    <div className="experience-intro">
      <span>THE INTERFACE GALLERY</span>
      <b>Move the mouse to look · scroll to walk</b>
      <small>{
        room
          ? 'Scroll back to step back. Point at a link and click to open it.'
          : 'Doors open as you reach them. Scroll back to step back.'
      }</small>
    </div>

    <div className="experience-mark"><span>BRIEF</span><i></i><span>SYSTEM</span><i></i><span>SURFACE</span></div>

    {autoMoving && navigationTarget && <div className="room-status">WALKING TO {navigationTarget.toUpperCase()}</div>}
    <div className="scroll-hint">SCROLL TO WALK <i></i></div>
    {/* which mode the mouse is in, and how to change it - always on screen */}
    <LookModeLabel />
    {/* the centre dot (a hand over a link) while the mouse is captured for looking */}
    <div className="look-reticle" aria-hidden="true" />
    <div className="link-note" aria-live="polite" />
  </>
}

/*
 * Outside the building: the first screen after the loader. Everything on it is the scene -
 * the building's front, its door, the UKD mark over the door, the Web Experience sign on the
 * plaza (CorridorExterior). Over it there are only two invisible controls, kept exactly over
 * the door and the sign by the camera (useCorridorCamera), so a click, tap or Enter key on
 * either works, and the label that says what the mouse is doing. Scrolling walks in too.
 */
function ExteriorGate({ departing = false, onEnter }) {
  const enteringRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const [doorHover, setDoorHover] = useState(false)

  // Ready again whenever the visitor is back outside.
  useEffect(() => { if (!departing) enteringRef.current = false }, [departing])

  const commitEnter = useCallback((e) => {
    if (enteringRef.current || departing) return
    enteringRef.current = true
    setDoorHover(false)
    // this click is the gesture that lets the corridor take the mouse for looking
    if (e?.pointerType !== 'touch' && e?.detail !== 0 && !window.matchMedia?.('(pointer: coarse)').matches) {
      const ask = document.querySelector('.experience-root canvas')?.requestPointerLock?.()
      if (ask?.catch) ask.catch(() => {})
    }
    onEnter?.()
  }, [departing, onEnter])

  // Hovering the door parts its glass a hand's width, as an automatic door does.
  useEffect(() => {
    if (enteringRef.current) return
    hintEntrance(doorHover && !departing ? 0.08 : 0, { reducedMotion })
  }, [doorHover, departing, reducedMotion])

  // the sign on the plaza brightens while it is pointed at
  const signHover = (on) => { exteriorSign.hover = on ? 1 : 0 }
  useEffect(() => () => { exteriorSign.hover = 0 }, [])

  return <div className={`exterior-gate${departing ? ' exterior-gate--departing' : ''}`}>
    <main id="main-content" className="exterior-gate__main" tabIndex={-1}>
      <h1 className="visually-hidden">Usman Khair Din — The Interface Gallery</h1>
      <button
        type="button"
        className={`entry-door-hotspot${doorHover ? ' is-hovered' : ''}`}
        data-cursor="enter"
        data-cursor-live=""
        aria-label="Walk in through the door"
        onClick={commitEnter}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') setDoorHover(true) }}
        onPointerLeave={() => setDoorHover(false)}
      />
      <Link
        to={WEB_HOME}
        className="exterior-sign-hotspot"
        data-cursor="open"
        data-cursor-live=""
        aria-label="Web Experience — the portfolio as a classic website"
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') signHover(true) }}
        onPointerLeave={() => signHover(false)}
        onFocus={() => signHover(true)}
        onBlur={() => signHover(false)}
      />
      {/* on a narrow screen the sign stands outside the view, so it is named here as well */}
      <Link to={WEB_HOME} className="exterior-web-link">Web Experience <span aria-hidden="true">↗</span></Link>
      <div className="look-reticle" aria-hidden="true" />
      <LookModeLabel outside />
    </main>
  </div>
}

function ExperienceShell() {
  const { experiencePhase, setExperiencePhase } = useJourney()
  const [sceneCompiled, setSceneCompiled] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const onSceneCompiled = useCallback(() => setSceneCompiled(true), [])
  const markSceneReady = useCallback(() => setSceneReady(true), [])
  const gateVisible = experiencePhase === 'gated' || experiencePhase === 'entering'

  // The whole page is the scene now: the wheel always belongs to it, never to Web smooth scroll.
  useWebScrollSuspension(true)
  // A fresh arrival meets a closed door.
  useEffect(() => { if (experiencePhase === 'gated') setEntranceOpen(0) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // First visit: the branded boot loader (index.html) is released as soon as the scene has its assets, never later than the cap.
  useEffect(() => { if (sceneReady) releaseBootLoader() }, [sceneReady])
  useEffect(() => {
    const cap = window.setTimeout(releaseBootLoader, 12000)
    return () => window.clearTimeout(cap)
  }, [])

  return <div className={`experience-root experience-root--${experiencePhase}`}>
    <Canvas
      frameloop={sceneCompiled ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.58, 16.6], fov: 62, near: .05, far: 2400 }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.04 }}
    >
      <Suspense fallback={null}><HomeScene /><SceneCompile onCompiled={onSceneCompiled} /><SceneReadySignal onReady={markSceneReady} /></Suspense>
    </Canvas>

    {experiencePhase === 'inside' && <ExperienceHud />}

    {gateVisible && <ExteriorGate
      departing={experiencePhase === 'entering'}
      onEnter={() => setExperiencePhase('entering')}
    />}
  </div>
}

export default function HomeExperience() {
  // Back from a page that was opened from a room: return straight to that spot, inside.
  const navigationType = useNavigationType()
  const [returning] = useState(() => takeReturn(navigationType))
  return <JourneyProvider initialPhase={returning ? 'inside' : 'gated'}><ExperienceShell /></JourneyProvider>
}
