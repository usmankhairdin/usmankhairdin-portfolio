import { Html, useTexture } from '@react-three/drei'
import { useRef, useState } from 'react'
import { projects } from '../data/projects.js'
import ContactForm from '../components/ContactForm.jsx'
import ProjectImage from '../components/ProjectImage.jsx'
import { useSurface } from '../experience/surfaces.js'
import { useJourney } from '../experience/JourneyContext.jsx'

function RoomHtml({ spec, y = 1.77, children, className = '' }) {
  const sign = spec.side === 'right' ? 1 : -1
  const { activeDoor, phase } = useJourney()
  const visible = activeDoor === spec.id && phase === 'room'
  if (!visible) return null
  return <Html center position={[sign * 11.17, y, spec.z]} style={{ pointerEvents: 'auto' }}>
    <div className={`room-flat-html ${className}`}>{children}</div>
  </Html>
}

function RoomLabel({ spec, text }) {
  return <RoomHtml spec={spec} y={3.38} className="room-top-label"><span>{text}</span></RoomHtml>
}

function RoomCta({ spec, href, children }) {
  return <RoomHtml spec={spec} y={.205} className="room-bottom-cta">
    <a href={href}><span>{children}</span><b aria-hidden="true">↗</b></a>
  </RoomHtml>
}

function ConnectedPills({ items, className = '' }) {
  return <div className={`connected-pills ${className}`}>
    {items.map((item, i) => <span className="connected-pills__item" key={item}>
      <strong>{item}</strong>
      {i < items.length - 1 && <i aria-hidden="true" />}
    </span>)}
  </div>
}

function AboutRoom({ spec }) {
  return <>
    <RoomLabel spec={spec} text="PRACTICE" />
    <RoomHtml spec={spec} className="room-main room-main--about">
      <h2>One thought from <em>brief</em> to build.</h2>
      <p>Interface direction and frontend implementation stay close enough that the original decisions survive delivery.</p>
      <ConnectedPills items={['16+ YEARS', 'UI × FE', 'ONE OWNER']} />
    </RoomHtml>
    <RoomCta spec={spec} href="/about/">Open the practice</RoomCta>
  </>
}

function ServicesRoom({ spec }) {
  return <>
    <RoomLabel spec={spec} text="SERVICES" />
    <RoomHtml spec={spec} className="room-main room-main--services">
      <h2>Design direction.<br/><em>Production ready.</em></h2>
      <p>Focused support for agencies and product teams, from the interface system through responsive frontend delivery.</p>
      <ConnectedPills items={['UI / UX', 'REACT / TAILWIND', 'FRONTEND']} className="connected-pills--services" />
    </RoomHtml>
    <RoomCta spec={spec} href="/services/">See capabilities</RoomCta>
  </>
}

function WorkCarousel() {
  const [index, setIndex] = useState(0)
  const lock = useRef(0)

  const onWheel = (e) => {
    /* The project wall owns wheel input from first project through last project.
       Reversing the wheel walks all the way back to project one; it never exits the room. */
    e.preventDefault()
    e.stopPropagation()

    const now = performance.now()
    if (now < lock.current || Math.abs(e.deltaY) < 6) return

    const dir = e.deltaY > 0 ? 1 : -1
    const next = Math.max(0, Math.min(projects.length - 1, index + dir))
    lock.current = now + (next === index ? 180 : 460)
    if (next !== index) setIndex(next)
  }

  return <div className="work-wall-gallery" onWheelCapture={onWheel} data-work-gallery="true">
    <div className="work-wall-track" style={{ width: `${projects.length * 100}%`, transform: `translate3d(-${index * (100 / projects.length)}%,0,0)` }}>
      {projects.map((p, i) => <a
        key={p.slug}
        href={`/work/${p.slug}/`}
        className="work-wall-slide"
        style={{ width: `${100 / projects.length}%` }}
        aria-label={`Open ${p.title} project details`}
      >
        <ProjectImage project={p} alt={`${p.title} project preview`} eager />
        <div className="work-wall-copy">
          <span>{String(i + 1).padStart(2, '0')} / {p.category}</span>
          <h3>{p.title}</h3>
          <p>{p.role}</p>
          <b>CLICK TO VIEW PROJECT ↗</b>
        </div>
      </a>)}
    </div>

    <div className="work-wall-osd">
      <span>{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
      <b>SCROLL TO BROWSE</b>
      <div>{projects.map((p, i) => <i key={p.slug} className={i === index ? 'active' : ''} />)}</div>
    </div>
  </div>
}

function WorkRoom({ spec }) {
  return <>
    <RoomLabel spec={spec} text="WORK" />
    <RoomHtml spec={spec} y={1.80} className="room-work-wall"><WorkCarousel /></RoomHtml>
    <RoomCta spec={spec} href="/work/">Open full gallery</RoomCta>
  </>
}

function AgenciesRoom({ spec }) {
  return <>
    <RoomLabel spec={spec} text="FOR AGENCIES" />
    <RoomHtml spec={spec} className="room-main room-main--agencies">
      <h2>More hands.<br/><em>Less complexity.</em></h2>
      <p>White-label UI design and frontend production for digital agencies that need senior overflow capacity.</p>
      <ConnectedPills items={['YOUR AGENCY', 'UI × FE', 'CLIENT READY']} />
    </RoomHtml>
    <RoomCta spec={spec} href="/for-agencies/">See the agency model</RoomCta>
  </>
}

function ContactRoom({ spec }) {
  return <>
    <RoomLabel spec={spec} text="CONTACT" />
    <RoomHtml spec={spec} y={1.78} className="room-contact-experience">
      <div className="contact-room-intro">
        <span>START A CONVERSATION</span>
        <h2>Have a brief?<br/><em>Send the signal.</em></h2>
        <p>Share the project, timeline and the kind of support you need. A focused paid pilot is a simple way to test the fit through real work.</p>
        <a href="mailto:usman.khairdin@gmail.com">usman.khairdin@gmail.com ↗</a>
      </div>

      <div data-room-interactive="true"><ContactForm compact source="Immersive contact room" /></div>
    </RoomHtml>
    <RoomCta spec={spec} href="/contact/">Open contact page</RoomCta>
  </>
}

function ProjectFrame({ src, position, rotation = [0, 0, 0], wide = false }) {
  const tex = useTexture(src)
  const w = wide ? 2.15 : 1.55
  const h = wide ? 1.35 : 1.82
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0, -.055]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[w + .24, h + .24, .14]} />
      <meshStandardMaterial color="#836e58" roughness={.46} metalness={.025} />
    </mesh>
    <mesh position={[0, 0, .004]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[w + .10, h + .10, .05]} />
      <meshStandardMaterial color="#b4976a" roughness={.36} metalness={.16} />
    </mesh>
    <mesh position={[0, 0, .042]} receiveShadow={false}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} roughness={.7} />
    </mesh>
    <mesh position={[0, 0, .059]}>
      <planeGeometry args={[w - .03, h - .03]} />
      <meshPhysicalMaterial color="#fff" transparent opacity={.055} roughness={.07} clearcoat={.85} clearcoatRoughness={.15} />
    </mesh>
  </group>
}

function Bench({ position }) {
  const wood = useSurface('wood', 2.6, 1, 45)
  return <group position={position}>
    <mesh position={[0, .48, 0]} castShadow={false} receiveShadow={false}><boxGeometry args={[2.5, .22, .72]} /><meshStandardMaterial map={wood} color="#715b49" roughness={.48} /></mesh>
    {[-.92, .92].map((x) => <mesh key={x} position={[x, .22, 0]} castShadow={false}><boxGeometry args={[.12, .48, .58]} /><meshStandardMaterial color="#4a4038" metalness={.08} roughness={.42} /></mesh>)}
  </group>
}

function FloorLamp({ position, accent = '#fff0d2' }) {
  return <group position={position}>
    <mesh position={[0, .045, 0]} castShadow={false}><cylinderGeometry args={[.28, .31, .09, 28]} /><meshStandardMaterial color="#4b4036" roughness={.42} metalness={.18} /></mesh>
    <mesh position={[0, .82, 0]} castShadow={false}><cylinderGeometry args={[.025, .032, 1.56, 18]} /><meshStandardMaterial color="#8e7657" metalness={.5} roughness={.3} /></mesh>
    <mesh position={[0, 1.55, 0]} castShadow={false}><cylinderGeometry args={[.30, .46, .55, 32, 1, true]} /><meshPhysicalMaterial color="#e7d7bd" roughness={.52} transmission={.02} /></mesh>
    <pointLight position={[0, 1.48, 0]} intensity={2.0} distance={4.6} decay={2.0} color={accent} />
  </group>
}

function Vase({ position, accent = '#67765f' }) {
  return <group position={position}>
    <mesh position={[0, .30, 0]} castShadow={false}><cylinderGeometry args={[.22, .31, .60, 28]} /><meshStandardMaterial color="#aa8b68" roughness={.58} /></mesh>
    <mesh position={[0, .71, 0]} castShadow={false}><cylinderGeometry args={[.035, .04, .62, 14]} /><meshStandardMaterial color="#5d704f" roughness={.8} /></mesh>
    <mesh position={[-.16, .94, 0]} rotation={[0, 0, -.5]} castShadow={false}><sphereGeometry args={[.19, 18, 14]} /><meshStandardMaterial color={accent} roughness={.82} /></mesh>
    <mesh position={[.17, 1.02, .02]} rotation={[0, 0, .5]} castShadow={false}><sphereGeometry args={[.20, 18, 14]} /><meshStandardMaterial color="#728365" roughness={.82} /></mesh>
  </group>
}

function RoomDetails({ spec, sign }) {
  const offset = { about: 0, services: 1, work: 2, agencies: 3, contact: 4 }[spec.id] || 0

  if (spec.id === 'work') return <>
    <ProjectFrame src={projects[0].poster} position={[sign * 6.0, 1.82, spec.z - 4.02]} wide />
    <ProjectFrame src={projects[1].poster} position={[sign * 8.55, 1.82, spec.z - 4.02]} wide />
    <ProjectFrame src={projects[2].poster} position={[sign * 7.25, 1.82, spec.z + 4.02]} rotation={[0, Math.PI, 0]} wide />
  </>

  return <>
    <ProjectFrame src={projects[offset % projects.length].poster} position={[sign * 6.15, 1.84, spec.z - 4.02]} wide={spec.id === 'services'} />
    <ProjectFrame src={projects[(offset + 1) % projects.length].poster} position={[sign * 8.75, 1.78, spec.z + 4.02]} rotation={[0, Math.PI, 0]} />
  </>
}

export default function RoomShell({ spec }) {
  const sign = spec.side === 'right' ? 1 : -1
  const cx = sign * 7.4

  // All rooms intentionally share one architectural material/color treatment.
  const wall = useSurface('plaster', 3.2, 3.2, 60 + spec.id.length)
  const floor = useSurface('wood', 7, 7, 70 + spec.id.length)
  const rug = useSurface('carpet', 2, 3, 80 + spec.id.length)
  const ceiling = useSurface('plaster', 3, 3, 90 + spec.id.length)

  const wallColor = '#f6efe4'
  const sideColor = '#eee6d9'
  const trimColor = '#c9bdae'

  const txt = <>
    {spec.id === 'about' && <AboutRoom spec={spec} />}
    {spec.id === 'services' && <ServicesRoom spec={spec} />}
    {spec.id === 'work' && <WorkRoom spec={spec} />}
    {spec.id === 'agencies' && <AgenciesRoom spec={spec} />}
    {spec.id === 'contact' && <ContactRoom spec={spec} />}
  </>

  return <group>
    <mesh position={[cx, -.075, spec.z]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[8, .15, 8.4]} />
      <meshStandardMaterial map={floor} color="#8c725b" roughness={.70} bumpMap={floor} bumpScale={.010} />
    </mesh>
    <mesh position={[cx, .012, spec.z]} receiveShadow={false} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.8, 2.95]} />
      <meshStandardMaterial map={rug} color="#8d8175" roughness={1} />
    </mesh>
    <mesh position={[cx, 3.62, spec.z]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[8, .16, 8.4]} />
      <meshStandardMaterial map={ceiling} color="#f3ece0" roughness={.94} bumpMap={ceiling} bumpScale={.004} />
    </mesh>

    <mesh position={[sign * 11.38, 1.8, spec.z]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[.18, 3.6, 8.4]} />
      <meshStandardMaterial map={wall} color={wallColor} roughness={.93} bumpMap={wall} bumpScale={.006} />
    </mesh>
    <mesh position={[cx, 1.8, spec.z - 4.12]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[8, 3.6, .18]} />
      <meshStandardMaterial map={wall} color={sideColor} roughness={.93} bumpMap={wall} bumpScale={.006} />
    </mesh>
    <mesh position={[cx, 1.8, spec.z + 4.12]} receiveShadow={false} castShadow={false}>
      <boxGeometry args={[8, 3.6, .18]} />
      <meshStandardMaterial map={wall} color={sideColor} roughness={.93} bumpMap={wall} bumpScale={.006} />
    </mesh>

    {/* Continuous, no-ripple room trim. */}
    <mesh position={[sign * 11.27, .39, spec.z]} castShadow={false} receiveShadow={false}><boxGeometry args={[.10, .12, 8.18]} /><meshStandardMaterial color={trimColor} roughness={.68} /></mesh>
    <mesh position={[sign * 11.27, 3.22, spec.z]} castShadow={false} receiveShadow={false}><boxGeometry args={[.08, .09, 8.18]} /><meshStandardMaterial color={trimColor} roughness={.68} /></mesh>
    {[spec.z - 4.02, spec.z + 4.02].map((z) => <mesh key={z} position={[cx, .39, z]} castShadow={false} receiveShadow={false}><boxGeometry args={[7.8, .12, .10]} /><meshStandardMaterial color={trimColor} roughness={.68} /></mesh>)}

    <pointLight position={[sign * 8.55, 2.50, spec.z]} intensity={4.0} distance={8.8} decay={1.8} color="#fff0dc" />
    <pointLight position={[sign * 7.2, 3.12, spec.z - 1.7]} intensity={1.15} distance={6.5} decay={2} color={spec.accent} />
    <pointLight position={[sign * 5.25, 2.15, spec.z + .25]} intensity={1.05} distance={9} decay={1.9} color="#fff1dc" />

    <RoomDetails spec={spec} sign={sign} />
    <Bench position={[sign * 7.15, .02, spec.z + 2.35]} />
    <FloorLamp position={[sign * 9.70, .02, spec.z - 2.85]} accent={spec.accent} />
    <Vase position={[sign * 5.30, .02, spec.z + 2.80]} />
    {txt}
  </group>
}
