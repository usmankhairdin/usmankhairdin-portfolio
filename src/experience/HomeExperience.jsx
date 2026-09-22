import { Canvas } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Header from '../components/Header.jsx'
import SplashBackdrop from '../components/SplashBackdrop.jsx'
import HomeScene from './HomeScene.jsx'
import { JourneyProvider, useJourney } from './JourneyContext.jsx'
import { releaseBootLoader } from '../loader/bootLoader.js'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { useWebScrollSuspension } from '../scroll/WebScrollProvider.jsx'

function SceneReadySignal({ onReady }) {
  useEffect(() => {
    let raf=requestAnimationFrame(() => onReady?.())
    return () => cancelAnimationFrame(raf)
  }, [onReady])
  return null
}

function ExperienceHud() {
  const { activeDoor, phase, autoMoving, navigationTarget, corridorFacing } = useJourney()
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
          ? 'Scroll over the project wall to browse. Scroll back at the first project to return.'
          : room
            ? 'Reverse the mouse wheel to return to the corridor.'
            : returning
              ? 'Continue scrolling to travel back toward the entrance.'
              : 'Approach a door and click to enter.'
      }</small>
    </div>

    <div className="experience-mark"><span>BRIEF</span><i></i><span>SYSTEM</span><i></i><span>SURFACE</span></div>

    {phase === 'entering' && <div className="room-status">ENTERING {activeDoor?.toUpperCase()}</div>}
    {phase === 'exiting' && <div className="room-status">RETURNING TO CORRIDOR</div>}
    {autoMoving && navigationTarget && phase === 'corridor' && <div className="room-status">MOVING TO SELECTED ROOM</div>}
    <div className="scroll-hint">{workRoom ? 'PROJECT SCROLL' : room ? 'SCROLL BACK' : returning ? 'SCROLL RETURN' : 'SCROLL'} <i></i></div>

  </>
}

function IntroGate({ returning = false, departing = false, onEnter }) {
  const enteringRef = useRef(false)
  // Same portrait in both themes; the dark copy only differs in the colour of the handwritten "Design Build Solve".
  const { theme } = useTheme()
  useEffect(() => { new Image().src = theme === 'dark' ? '/assets/profile-web.png' : '/assets/profile-web-dark.png' }, [theme])

  const commitEnter = useCallback(() => {
    if (enteringRef.current || departing) return
    enteringRef.current = true
    onEnter?.()
  }, [departing, onEnter])

  return <div
    className={`entry-gate entry-gate--intro ${departing ? 'entry-gate--departing' : ''} ${returning ? 'entry-gate--returned' : ''}`}
  >
    <SplashBackdrop />
    <Header />
    <div className="entry-hero">
      <div className="entry-hero-inner">
        <main id="main-content" className="entry-intro-copy" tabIndex={-1}>
          <span className="hero-eyebrow">USMAN KHAIR DIN / PRODUCT DESIGN × FRONTEND × AI BUILD</span>
          <h1 className="hero-headline">
            <span className="hero-line hero-line-1">From signal</span>
            <span className="hero-line hero-line-2">to <em className="hero-surface">surface.</em></span>
          </h1>
          <p className="hero-supporting">I design and build polished digital products — from product UX and interface direction to responsive frontend and AI-assisted full-stack delivery.</p>
          <button type="button" className="entry-gallery-cta" onClick={commitEnter}>
            <span className="entry-gallery-cta__label">Enter the Experience</span>
            <span className="entry-gallery-cta__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path className="cta-portal" d="M14 4.5h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4" />
                <g className="cta-arrow"><path d="M3.5 12h10.6" /><path d="M10.5 8.4 14.1 12l-3.6 3.6" /></g>
              </svg>
            </span>
          </button>
        </main>
        <aside className="entry-portrait" aria-hidden="true">
          <img src={theme === 'dark' ? '/assets/profile-web-dark.png' : '/assets/profile-web.png'} alt="Usman Khair Din" />
        </aside>
      </div>
    </div>
  </div>
}

function ExperienceShell() {
  const { experiencePhase, setExperiencePhase } = useJourney()
  const [sceneReady, setSceneReady] = useState(false)
  const markSceneReady=useCallback(()=>setSceneReady(true),[])
  const sceneEnabled = experiencePhase === 'entering' || experiencePhase === 'inside' || experiencePhase === 'exiting'
  const gateVisible = experiencePhase === 'gated' || experiencePhase === 'entering' || experiencePhase === 'intro-return'
  const returning = experiencePhase === 'intro-return'

  // Hand the wheel to the corridor: Web smooth scroll is suspended for exactly the phases in which the scene runs.
  useWebScrollSuspension(sceneEnabled)

  // First visit: the branded boot loader (index.html) is released as soon as the scene has its assets, never later than the cap.
  useEffect(() => { if (sceneReady) releaseBootLoader() }, [sceneReady])
  useEffect(() => {
    const cap = window.setTimeout(releaseBootLoader, 4200)
    return () => window.clearTimeout(cap)
  }, [])

  return <div className={`experience-root experience-root--${experiencePhase}`}>
    <Canvas
      frameloop={sceneEnabled ? 'always' : 'demand'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.58, 16.6], fov: 62, near: .05, far: 180 }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.04 }}
    >
      <Suspense fallback={null}><HomeScene enabled={sceneEnabled} /><SceneReadySignal onReady={markSceneReady} /></Suspense>
    </Canvas>
    <div id="room-normalization-mask" className="room-normalization-mask" aria-hidden="true" />

    {experiencePhase === 'inside' && <ExperienceHud />}

    {gateVisible && <IntroGate
      key={returning ? 'returned-intro' : 'initial-intro'}
      returning={returning}
      departing={experiencePhase === 'entering'}
      onEnter={() => setExperiencePhase('entering')}
    />}
  </div>
}

export default function HomeExperience() {
  useEffect(()=>{
    const title='Usman Khair Din — White-label UI Design & Frontend Production'
    const description='White-label UI design and frontend production for digital agencies, backed by 16+ years of web, product UI and responsive frontend experience.'
    const url='https://www.usmankhairdin.com/'
    document.title=title
    document.querySelector('meta[name="description"]')?.setAttribute('content',description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',url)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',url)
  },[])
  return <JourneyProvider><ExperienceShell /></JourneyProvider>
}
