import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Header from '../components/Header.jsx'
import HomeScene from './HomeScene.jsx'
import { JourneyProvider, useJourney } from './JourneyContext.jsx'

const clamp01 = (v) => Math.max(0, Math.min(1, v))

function ExperienceHud() {
  const { activeDoor, phase, setPhase, autoMoving, corridorFacing } = useJourney()
  const room = phase === 'room'
  const returning = corridorFacing === 'return' && phase === 'corridor'
  const workRoom = room && activeDoor === 'work'

  return <>
    <Header immersive />
    <div className="experience-intro">
      <span>THE INTERFACE GALLERY</span>
      <b>Scroll to walk · move the mouse to look</b>
      <small>{
        workRoom
          ? 'Scroll over the project wall to browse. Click outside it to return.'
          : room
            ? 'Reverse the mouse wheel to return to the corridor.'
            : returning
              ? 'Continue scrolling to travel back toward the entrance.'
              : 'Approach a door and click to enter.'
      }</small>
    </div>

    <div className="experience-mark"><span>SIGNAL</span><i></i><span>SYSTEM</span><i></i><span>SURFACE</span></div>

    {phase === 'entering' && <div className="room-status">ENTERING {activeDoor?.toUpperCase()}</div>}
    {phase === 'exiting' && <div className="room-status">RETURNING TO CORRIDOR</div>}
    {autoMoving && phase === 'corridor' && <div className="room-status">MOVING TO SELECTED ROOM</div>}
    <div className="scroll-hint">{workRoom ? 'PROJECT SCROLL' : room ? 'SCROLL BACK' : returning ? 'SCROLL RETURN' : 'SCROLL'} <i></i></div>

    {workRoom && <div className="work-exit-zones" aria-label="Click outside the project display to leave the work room">
      <button className="work-exit-zone work-exit-zone--top" onClick={() => setPhase('exiting')} aria-label="Leave work room" />
      <button className="work-exit-zone work-exit-zone--bottom" onClick={() => setPhase('exiting')} aria-label="Leave work room" />
      <button className="work-exit-zone work-exit-zone--left" onClick={() => setPhase('exiting')} aria-label="Leave work room" />
      <button className="work-exit-zone work-exit-zone--right" onClick={() => setPhase('exiting')} aria-label="Leave work room" />
    </div>}
  </>
}

function IntroGate({ returning = false, departing = false, showLoading = false, onLoaded, onEnter }) {
  const [stage, setStage] = useState(showLoading ? 'loading' : 'intro')
  const [loadProgress, setLoadProgress] = useState(showLoading ? 7 : 100)
  const [journeyProgress, setJourneyProgress] = useState(returning ? 1 : 0)
  const enteringRef = useRef(false)

  useEffect(() => {
    if (!showLoading || stage !== 'loading') return
    let raf
    let doneTimer
    const started = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - started) / 1550)
      setLoadProgress(Math.round(7 + t * 93))
      if (t < 1) raf = requestAnimationFrame(tick)
      else doneTimer = window.setTimeout(() => {
        setStage('intro')
        onLoaded?.()
      }, 160)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(doneTimer)
    }
  }, [showLoading, stage, onLoaded])

  const commitEnter = useCallback(() => {
    if (enteringRef.current || departing) return
    enteringRef.current = true
    setJourneyProgress(1)
    window.setTimeout(() => onEnter?.(), 210)
  }, [departing, onEnter])

  useEffect(() => {
    if (stage !== 'intro' || departing) return
    const onWheel = (e) => {
      e.preventDefault()
      const delta = Math.max(-130, Math.min(130, e.deltaY))
      setJourneyProgress((prev) => {
        const next = clamp01(prev + delta * .00185)
        if (next >= .995 && delta > 0) window.setTimeout(commitEnter, 0)
        return next
      })
    }
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        commitEnter()
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [stage, departing, commitEnter])

  if (stage === 'loading') {
    return <div className="entry-gate entry-gate--loading">
      <div className="entry-loading">
        <span>UKD / INTERFACE GALLERY</span>
        <strong>{String(loadProgress).padStart(3, '0')}</strong>
        <div><i style={{ width: `${loadProgress}%` }} /></div>
        <small>Preparing the spatial portfolio</small>
      </div>
    </div>
  }

  // First finish the spatial composition: the portal must arrive at the exact
  // centre and settle before the slab begins to open. The remaining wheel
  // travel opens the door while the portal stays locked in that centred state.
  const CENTER_AT = .72
  const DOOR_START = .80
  const layoutProgress = clamp01(journeyProgress / CENTER_AT)
  const doorOpen = clamp01((journeyProgress - DOOR_START) / (1 - DOOR_START))
  const vars = {
    '--entry-p': layoutProgress,
    '--door-open': doorOpen
  }

  return <div
    className={`entry-gate entry-gate--intro ${departing ? 'entry-gate--departing' : ''} ${returning ? 'entry-gate--returned' : ''}`}
    style={vars}
  >
    <div className="entry-intro-copy">
      <span>USMAN KHAIR DIN / UI × FRONTEND</span>
      <h1>From signal<br/>to <em>surface.</em></h1>
      <p>An interface gallery for selected work, services and white-label agency support.</p>
    </div>

    <div className="entry-portal-wrap" aria-label="Entrance to the interface gallery">
      <div className="entry-portal-frame">
        <button className="entry-door" onClick={commitEnter} aria-label="Enter the interface gallery">
          <span>ENTER</span>
          <i>THE GALLERY</i>
          <b>↗</b>
        </button>
      </div>
    </div>

    <small className="entry-hint">{returning ? 'Scroll back to restore the intro · scroll forward to re-enter' : 'Scroll the mouse wheel to enter'}</small>
  </div>
}

function ExperienceShell() {
  const { experiencePhase, setExperiencePhase } = useJourney()
  const [loaded, setLoaded] = useState(false)
  const sceneEnabled = experiencePhase === 'entering' || experiencePhase === 'inside' || experiencePhase === 'exiting'
  const gateVisible = experiencePhase === 'gated' || experiencePhase === 'entering' || experiencePhase === 'intro-return'
  const returning = experiencePhase === 'intro-return'

  return <div className={`experience-root experience-root--${experiencePhase}`}>
    <Canvas
      shadows="soft"
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.58, 16.6], fov: 62, near: .05, far: 180 }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.04 }}
    >
      <Suspense fallback={null}><HomeScene enabled={sceneEnabled} /></Suspense>
    </Canvas>

    {experiencePhase === 'inside' && <ExperienceHud />}

    {gateVisible && <IntroGate
      key={returning ? 'returned-intro' : 'initial-intro'}
      returning={returning}
      departing={experiencePhase === 'entering'}
      showLoading={!loaded && experiencePhase === 'gated'}
      onLoaded={() => setLoaded(true)}
      onEnter={() => setExperiencePhase('entering')}
    />}
  </div>
}

export default function HomeExperience() {
  return <JourneyProvider><ExperienceShell /></JourneyProvider>
}
