import { useRef, useState } from 'react'
import { projects } from '../data/projects.js'
import { HeroTitle, heroTitleText, sectionHeroes } from '../data/sectionHeroes.jsx'
import ContactForm from '../components/ContactForm.jsx'
import ProjectImage from '../components/ProjectImage.jsx'
import RoomInstallations from './RoomInstallations.jsx'
import SharedRoomEnvironment from './SharedRoomEnvironment.jsx'
import RoomContentSurface from './RoomContentSurface.jsx'
import { ROOM_STAGE_Z } from './roomCoordinates.js'
import { useJourney } from '../experience/JourneyContext.jsx'

/* Every block of room content goes through the one shared anchor in RoomContentSurface,
   so a room is only ever content plus a height on its own wall. */
function RoomLabel({ spec, text }) {
  return <RoomContentSurface spec={spec} y={3.38} className="room-top-label"><span>{text}</span></RoomContentSurface>
}

function RoomCta({ spec, href, children, y = .205, className = '' }) {
  return <RoomContentSurface spec={spec} y={y} className={`room-bottom-cta ${className}`}>
    <a href={href}><span>{children}</span><b aria-hidden="true">↗</b></a>
  </RoomContentSurface>
}

function RoomHeroNote({ hero }) {
  if (!hero.heroNote) return null
  const { label, value, detail } = hero.heroNote
  return <aside className="room-hero-note" aria-label={label}>
    <span>{label}</span>
    <strong>{value}</strong>
    <p>{detail}</p>
  </aside>
}

function RoomHero({ spec, hero, className = '', y = 2.07, eyebrow = true, children }) {
  return <RoomContentSurface spec={spec} y={y} className={`room-main room-main--hero ${className}`}>
    <div className="room-hero__copy">
      {eyebrow && <span className="room-hero__eyebrow">{hero.eyebrow}</span>}
      <h2><HeroTitle hero={hero} /></h2>
      <p>{hero.intro}</p>
      {children}
    </div>
  </RoomContentSurface>
}

function AboutRoom({ spec }) {
  return <>
    <RoomHero spec={spec} hero={sectionHeroes.about} className="room-main--about" />
    <RoomCta spec={spec} href="/about/" y={1.10} className="room-bottom-cta--hero">Open the practice</RoomCta>
  </>
}

// The six service titles, shown in the SERVICES room as a compact capability index.
const serviceIndex = [
  'Website & Landing Page Design',
  'SaaS / Dashboard UI',
  'Website Redesign',
  'Frontend Development',
  'Design → React / Tailwind',
  'White-label Agency Production',
]

function ServicesRoom({ spec }) {
  return <RoomHero spec={spec} hero={sectionHeroes.services} className="room-main--services" y={1.80} eyebrow={false}>
    <ol className="services-index">
      {serviceIndex.map((title, i) => <li key={title}>
        <span>{String(i + 1).padStart(2, '0')}</span>
        <strong>{title}</strong>
      </li>)}
    </ol>
    {/* Fifth element of the same rhythm: the existing CTA pill, kept in the left stack. */}
    <div className="room-bottom-cta room-bottom-cta--services">
      <a href="/services/"><span>Explore all services</span><b aria-hidden="true">↗</b></a>
    </div>
  </RoomHero>
}

function WorkCarousel({ onExit }) {
  const hero = sectionHeroes.work
  const [index, setIndex] = useState(0)
  const lock = useRef(0)
  const backwardBoundary = useRef({ armed: false, lastEventAt: -Infinity })
  const go = (next) => setIndex(Math.max(0, Math.min(projects.length - 1, next)))

  const onWheel = (e) => {
    e.stopPropagation()
    const now = performance.now()
    if (now < lock.current || Math.abs(e.deltaY) < 6) return
    const dir = e.deltaY > 0 ? 1 : -1
    const next = Math.max(0, Math.min(projects.length - 1, index + dir))
    if (next !== index) {
      backwardBoundary.current = { armed: false, lastEventAt: now }
      lock.current = now + 620
      setIndex(next)
      return
    }
    if (dir > 0) {
      backwardBoundary.current = { armed: false, lastEventAt: now }
      lock.current = now + 180
      return
    }

    // Reaching project one consumes the current gesture. Only a later wheel gesture,
    // after the momentum stream has gone quiet, leaves the room. Thus one gesture can
    // never both change a project and exit, and trackpad inertia cannot throw the visitor
    // through the doorway.
    const boundary = backwardBoundary.current
    const newGesture = now - boundary.lastEventAt >= 180
    if (boundary.armed && newGesture) {
      backwardBoundary.current = { armed: false, lastEventAt: now }
      onExit()
      return
    }
    backwardBoundary.current = { armed: true, lastEventAt: now }
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(index + 1) }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(index - 1) }
    if (e.key === 'Home') { e.preventDefault(); go(0) }
    if (e.key === 'End') { e.preventDefault(); go(projects.length - 1) }
  }

  return <div className="work-wall-gallery" onWheelCapture={onWheel} onKeyDown={onKeyDown} data-work-gallery="true" tabIndex="0" aria-label={`${heroTitleText(hero)} Selected project gallery. Use arrow keys or scroll to browse.`}>
    <div className="work-wall-track" style={{ width: `${projects.length * 100}%`, transform: `translate3d(-${index * (100 / projects.length)}%,0,0)` }}>
      {projects.map((p, i) => <a
        key={p.slug}
        href={`/work/${p.slug}/`}
        className="work-wall-slide"
        style={{ width: `${100 / projects.length}%` }}
        aria-label={`Open ${p.title} project details`}
        tabIndex={i === index ? 0 : -1}
      >
        <ProjectImage project={p} variant="gallery" alt={`${p.title} public project interface`} eager={i === index} />
        <div className="work-wall-copy">
          <span>{String(i + 1).padStart(2, '0')} / {p.category}</span>
          <h3>{p.title}</h3>
          <p>{p.role}</p>
          <b>VIEW PROJECT ↗</b>
        </div>
      </a>)}
    </div>

    <div className="work-wall-osd">
      <span>{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
      <b>{heroTitleText(hero).toUpperCase()} · SCROLL / ARROWS</b>
      <div className="work-wall-dots" role="group" aria-label="Choose project">
        {projects.map((p, i) => <button key={p.slug} type="button" className={i === index ? 'active' : ''} aria-label={`Show ${p.title}`} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)} />)}
      </div>
    </div>
  </div>
}

function WorkRoom({ spec, onExit }) {
  return <>
    <RoomContentSurface spec={spec} y={1.80} className="room-work-wall"><WorkCarousel onExit={onExit} /></RoomContentSurface>
    <RoomCta spec={spec} href="/work/" y={.195} className="room-bottom-cta--work">Open full gallery</RoomCta>
  </>
}

function AgenciesRoom({ spec }) {
  return <>
    <RoomHero spec={spec} hero={sectionHeroes.agencies} className="room-main--agencies" />
    <RoomCta spec={spec} href="/for-agencies/" y={1.10} className="room-bottom-cta--hero">See the agency model</RoomCta>
  </>
}

function ContactRoom({ spec }) {
  const hero = sectionHeroes.contact
  return <>
    <RoomContentSurface spec={spec} y={1.80} className="room-contact-experience">
      <div className="contact-room-intro">
        <h2><HeroTitle hero={hero} /></h2>
        <p>Share the brief, the kind of support you need and the delivery window.<br />A focused paid pilot is the simplest way to test the working fit.</p>
        {/* The info block and the email line are one composed sign-off group so the blue */}
        {/* line, the block and the email stay left-aligned as a single composition.      */}
        <div className="contact-room-signoff">
          <RoomHeroNote hero={hero} />
          <a href="mailto:brief@usmankhairdin.com">brief@usmankhairdin.com ↗</a>
        </div>
      </div>

      <div data-room-interactive="true"><ContactForm immersive source="Immersive contact room" /></div>
    </RoomContentSurface>
  </>
}

// One canonical floor-lamp placement: the CONTACT-room position is the source of truth
// and every room that shows the lamp uses these exact values so they cannot drift apart.
const LAMP_POSITION = [9.70, 0, ROOM_STAGE_Z + 2.85]

function FloorLamp({ position }) {
  return <group position={position}>
    <mesh position={[0, .045, 0]}><cylinderGeometry args={[.28, .31, .09, 28]} /><meshStandardMaterial color="#4b4036" roughness={.42} metalness={.18} /></mesh>
    <mesh position={[0, .82, 0]}><cylinderGeometry args={[.025, .032, 1.56, 18]} /><meshStandardMaterial color="#8e7657" metalness={.5} roughness={.3} /></mesh>
    <mesh position={[0, 1.55, 0]}><cylinderGeometry args={[.30, .46, .55, 32, 1, true]} /><meshPhysicalMaterial color="#e7d7bd" roughness={.52} transmission={.02} /></mesh>
  </group>
}

export default function RoomShell({ spec }) {
  const { activeDoor, phase, setPhase } = useJourney()
  const roomActive = activeDoor === spec.id && phase !== 'corridor'
  const txt = <>
    {spec.id === 'about' && <AboutRoom spec={spec} />}
    {spec.id === 'services' && <ServicesRoom spec={spec} />}
      {spec.id === 'work' && <WorkRoom spec={spec} onExit={() => setPhase('exiting')} />}
    {spec.id === 'agencies' && <AgenciesRoom spec={spec} />}
    {spec.id === 'contact' && <ContactRoom spec={spec} />}
  </>

  const visual = <>
    {/* The WORK room keeps only the portfolio showcase as its visual focus: no side      */}
    {/* installation art, no bench and no picture-light glow on the right-hand wall. The   */}
    {/* floor lamp is the exact CONTACT-room FloorLamp component, reused unchanged.        */}
    {spec.id !== 'work' && <RoomInstallations roomId={spec.id} animate={roomActive} />}
    {spec.id === 'work' && <FloorLamp position={LAMP_POSITION} />}
    {spec.id === 'contact' && <FloorLamp position={LAMP_POSITION} />}
  </>

  return <SharedRoomEnvironment spec={spec} active={roomActive} content={txt} visual={visual} showPictureLight={spec.id !== 'contact' && spec.id !== 'work'} />
}
