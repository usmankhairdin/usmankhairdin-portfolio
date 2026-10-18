import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { events as pointerEvents } from '@react-three/fiber'
import * as THREE from 'three'
import Header from '../components/Header.jsx'
import HomeScene from './HomeScene.jsx'
import SceneAssetGate from './SceneAssetGate.jsx'
import { JourneyProvider, useJourney } from './JourneyContext.jsx'
import useReducedMotion from './useReducedMotion.js'
import { hintEntrance, setEntranceOpen } from './entranceDoor.js'
import { claimBootLoader, releaseBootLoader } from '../loader/bootLoader.js'
import { useWebScrollSuspension } from '../scroll/WebScrollProvider.jsx'
import { Link, useNavigationType } from 'react-router-dom'
import { WEB_HOME } from '../routeLoaders.js'
import { takeReturn } from './corridorReturn.js'
import { floorReflection } from './floorReflection.js'
import { markSceneCompiled } from './probeEnv.js'
import { exteriorSign } from './CorridorExterior.jsx'
import { compileScenePrograms, deferSceneWarmup } from './sceneWarmup.js'
import { LiveScreensProvider, useLiveScreens } from '../rooms/LiveProjectScreens.jsx'
import { getLookMode, look, lookCapture, setCursorFree, subscribeCursorMode } from './freeLook.js'

function LookModeControl() {
  const mode = useSyncExternalStore(subscribeCursorMode, getLookMode, getLookMode)
  const { navigationOpen } = useJourney()
  if (navigationOpen) return null
  return <button className="look-mode-switch" onClick={() => { if (mode === 'look') setCursorFree(true); else { setCursorFree(false); lookCapture.request?.() } }} aria-label={mode === 'look' ? 'Free the cursor' : 'Start mouse look'}>
    <kbd>{mode === 'look' ? 'Esc' : mode === 'drag' ? 'Drag' : 'Click'}</kbd> {mode === 'look' ? 'Free cursor' : mode === 'free' ? 'Resume look' : 'Look around'}
  </button>
}

function corridorEvents(store) {
  const manager = pointerEvents(store)
  return { ...manager, compute(event, state, previous) {
    if (!look.cursorFree && event.pointerType !== 'touch' && event.pointerType !== 'pen' && !window.matchMedia?.('(pointer: coarse)').matches) {
      state.pointer.set(0, 0)
      state.raycaster.setFromCamera(state.pointer, state.camera)
    } else manager.compute(event, state, previous)
  } }
}

/*
 * Before the first frame, every shader the building will need is compiled: in view or not
 * (the rooms are hidden until approached), on screen and in the floor's reflection. It is done
 * while the loader is still up, in parallel where the browser can, so nothing stops later.
 */
function SceneCompile({ onCompiled }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    let cancelled = false
    const jobs = []
    const cancelWarmup = deferSceneWarmup(() => {
      performance.mark('corridor:compile-start')
      const shown = []
      scene.traverse((o) => { if (!o.visible) { shown.push(o); o.visible = true } })
      const previous = gl.getRenderTarget()
      try {
        gl.setRenderTarget(floorReflection.rt)
        jobs.push(compileScenePrograms(gl, scene, camera))
        gl.setRenderTarget(null)
        jobs.push(compileScenePrograms(gl, scene, camera))
      } finally {
        gl.setRenderTarget(previous)
        shown.forEach((o) => { o.visible = false })
      }
      Promise.all(jobs.map(job => job.ready)).then(() => {
        if (!cancelled) { performance.mark('corridor:compiled'); markSceneCompiled(gl); onCompiled?.() }
      })
    })
    return () => { cancelled = true; cancelWarmup(); jobs.forEach(job => job.cancel()) }
  }, [gl, scene, camera, onCompiled])
  return null
}

/* Then the probes capture and the first frames draw; the scene is ready once they have. */
function SceneReadySignal({ onReady }) {
  const frames = useRef(0)
  const {readiness}=useLiveScreens()
  const signaled=useRef(false)
  useFrame(() => {
    if (++frames.current >= 8 && readiness.complete && !signaled.current) {
      signaled.current=true;performance.mark('corridor:ready');onReady?.()
    }
  })
  return null
}

function ExperienceHud() {
  const { autoMoving, navigationTarget } = useJourney()

  return <>
    <Header immersive />
    <div className="experience-mark"><span>BRIEF</span><i></i><span>SYSTEM</span><i></i><span>SURFACE</span></div>

    {autoMoving && navigationTarget && <div className="room-status">WALKING TO {navigationTarget.toUpperCase()}</div>}
    <div className="link-note" aria-live="polite" />
  </>
}

/*
 * Outside the building: the first screen after the loader. Everything on it is the scene -
 * the building's front, its door, the UKD mark over the door, the Web Experience sign on the
 * plaza (CorridorExterior). Over it there are only two invisible controls, kept exactly over
 * the door and the sign by the camera (useCorridorCamera), so a click, tap or Enter key on
 * the sign opens Web Experience; clicking the door only enables mouse look.
 * The visitor crosses the doorway using the wheel, with no scripted entrance walk.
 */
function ExteriorGate() {
  const reducedMotion = useReducedMotion()
  const [doorHover, setDoorHover] = useState(false)

  const enableLook = useCallback(() => {
    setDoorHover(false)
    setCursorFree(false)
    lookCapture.request?.()
  }, [])

  // Hovering the door parts its glass a hand's width, as an automatic door does.
  useEffect(() => {
    hintEntrance(doorHover ? 0.08 : 0, { reducedMotion })
  }, [doorHover, reducedMotion])

  // the sign on the plaza brightens while it is pointed at
  const signHover = (on) => { exteriorSign.hover = on ? 1 : 0 }
  useEffect(() => () => { exteriorSign.hover = 0 }, [])

  return <div className="exterior-gate">
    <main id="main-content" className="exterior-gate__main" tabIndex={-1}>
      <h1 className="visually-hidden">Usman Khair Din — The Interface Gallery</h1>
      <button
        type="button"
        className={`entry-door-hotspot${doorHover ? ' is-hovered' : ''}`}
        data-cursor="enter"
        data-cursor-live=""
        aria-label="Enable mouse look"
        onClick={enableLook}
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
      <div className="exterior-sky-credit">
        <a href="https://www.pexels.com/photo/36833549/" target="_blank" rel="noreferrer">Sky: Thilina Alagiyawanna / Pexels</a>
        {' · '}<a href="https://sketchfab.com/3d-models/bell-206-jetranger-d2f7ba1d671549d4b26aaf834139a1dd" target="_blank" rel="noreferrer" title="Bell 206 JetRanger by terran4627; geometry prepared and materials adapted for this scene">Helicopter: terran4627</a>
        {' · '}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
      </div>
    </main>
  </div>
}

function ExperienceShell() {
  const { experiencePhase } = useJourney()
  const [sceneCompiled, setSceneCompiled] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const onSceneCompiled = useCallback(() => setSceneCompiled(true), [])
  const markSceneReady = useCallback(() => setSceneReady(true), [])
  const gateVisible = experiencePhase === 'gated'

  // The whole page is the scene now: the wheel always belongs to it, never to Web smooth scroll.
  useWebScrollSuspension(true)
  // A fresh arrival meets a closed door.
  useEffect(() => { if (experiencePhase === 'gated') setEntranceOpen(0) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep boot visible through scene compilation and every live website load.
  useEffect(claimBootLoader, [])
  useEffect(() => { if (sceneReady) releaseBootLoader() }, [sceneReady])

  return <div className={`experience-root experience-root--${experiencePhase}`}>
    <LiveScreensProvider><Canvas
      events={corridorEvents}
      className="experience-canvas"
      style={{zIndex:1}}
      frameloop={sceneCompiled ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.58, 16.6], fov: 62, near: .05, far: 2400 }}
      gl={{ alpha:true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.04 }}
    >
      <Suspense fallback={null}><SceneAssetGate><HomeScene /><SceneCompile onCompiled={onSceneCompiled} /><SceneReadySignal onReady={markSceneReady} /></SceneAssetGate></Suspense>
    </Canvas></LiveScreensProvider>

    <div className="look-reticle" aria-hidden="true" />
    <LookModeControl />
    {experiencePhase === 'inside' && <ExperienceHud />}

    {gateVisible && <ExteriorGate />}
  </div>
}

export default function HomeExperience() {
  // Back from a page that was opened from a room: return straight to that spot, inside.
  const navigationType = useNavigationType()
  const [returning] = useState(() => takeReturn(navigationType))
  return <JourneyProvider initialPhase={returning ? 'inside' : 'gated'}><ExperienceShell /></JourneyProvider>
}
