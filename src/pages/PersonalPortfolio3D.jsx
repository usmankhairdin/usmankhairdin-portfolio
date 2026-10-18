import {useSyncExternalStore} from 'react'
import Header from '../components/Header.jsx'
import {prefersWebExperience,subscribeEntryPreference} from '../entryPreference.js'
import Footer from '../components/Footer.jsx'
import CaseStudyNav from '../components/CaseStudyNav.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import { TECH_TAG_MARKS } from '../components/TechTagMarks.jsx'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'
import SectionIntro from '../components/ui/SectionIntro.jsx'
import './PersonalPortfolio3D.css'

const assetRoot = '/assets/case-studies/personal-portfolio-3d'

// Captured from the finished Corridor (1440 x 900; the detail 520 x 590), with its HUD hidden except where it is the subject.
const images = {
  terrace: { src: `${assetRoot}/terrace.webp`, width: 1440, height: 900, alt: 'The roof terrace at night: the building front lit from below, the glass door and the UKD mark above it' },
  corridor: { src: `${assetRoot}/corridor-hall.webp`, width: 1440, height: 900, alt: 'The corridor: travertine walls, a polished chevron floor and glass doors to the rooms, with the Contact door at the far end' },
  navigation: { src: `${assetRoot}/corridor-menu.webp`, width: 1440, height: 900, alt: 'The Corridor menu open over the corridor: Web Experience, About, Work, Services, For Agencies and Contact' },
  about: { src: `${assetRoot}/room-about.webp?v=20261013-portrait`, width: 1440, height: 900, alt: 'About room: a walnut wall of framed niches with experience, the original Usman portrait and a short bio, above a long table' },
  services: { src: `${assetRoot}/room-services.webp`, width: 1440, height: 900, alt: 'Services room: six lit monoliths in an arc, one for each line of work, under brass lettering' },
  work: { src: `${assetRoot}/room-work-current.webp`, width: 1440, height: 900, alt: 'Current Work Room with live project websites framed into its travertine walls' },
  contact: { src: `${assetRoot}/room-contact.webp`, width: 1440, height: 900, alt: 'Contact hall: a glass wall over the night city, a lounge and a desk' },
  link: { src: `${assetRoot}/live-forma-current.webp`, width: 1440, height: 845, alt: 'Forma running inside a Work Room screen, with the website scrolled to its workspace preview' },
  city: { src: `${assetRoot}/city.webp`, width: 1440, height: 900, alt: 'The night city below the tower, seen over the terrace railing, with traffic on the avenues' },
  detail: { src: `${assetRoot}/detail-monolith.webp`, width: 520, height: 590, alt: 'Detail of a Services monolith: printed type, a brass edge light and walnut slats behind' },
}

const stack = [
  ['react', 'React 19'],
  ['router', 'React Router'],
  ['vite', 'Vite'],
  ['javascript', 'JavaScript'],
  ['css3', 'CSS'],
  ['r3f', 'React Three Fiber'],
  ['three', 'Three.js'],
  ['gsap', 'GSAP'],
]

function Capture({ image, eager = false, className = '', label }) {
  return <figure className={`p3d-capture ${className}`}>
    <img
      src={image.src}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
    />
    {label && <figcaption>{label}</figcaption>}
  </figure>
}

function CaseSection({ id, eyebrow, title, intro, children, className = '' }) {
  return <section className={`p3d-section ${className}`} id={id} aria-labelledby={`${id}-title`}>
    <div className="route-wrap">
      <SectionIntro
        className="p3d-section__intro"
        eyebrow={eyebrow}
        title={<span id={`${id}-title`}>{title}</span>}
        intro={intro}
      />
      {children}
    </div>
  </section>
}

function TechTag({ id, children }) {
  return <span className="p3d-tech" data-tech-id={id}>
    {TECH_TAG_MARKS[id] || null}
    {children}
  </span>
}

export default function PersonalPortfolio3D() {
  const webOnly=useSyncExternalStore(subscribeEntryPreference,prefersWebExperience,()=>false)
  const entryLabel=webOnly?'Explore the Web Experience':'Enter 3D Experience'

  return <div className="route-page p3d-page">
    <Header />
    <main id="main-content" tabIndex="-1">
      <section className="p3d-hero" aria-labelledby="p3d-title">
        <HeroSignalBackground />
        <div className="route-wrap p3d-hero__content">
          <div className="p3d-hero__heading route-heading-copy">
            <span className="kicker">SELF-INITIATED / SPATIAL EXPERIENCE</span>
            <h1 id="p3d-title">The Corridor <em>— 3D Portfolio</em></h1>
            <p>A coastal island setting, a walkable corridor and four rooms that hold the same professional story. Live websites inside the Work Room turn a project gallery into something visitors can explore.</p>
            <div className="p3d-hero__actions">
              <ActionLink to={webOnly?'/web/':'/'}>{entryLabel} <span aria-hidden="true">↗</span></ActionLink>
              <TextCTA href="#concept">Read the case study ↓</TextCTA>
            </div>
          </div>
          <div className="p3d-hero__summary">
            <Capture image={images.navigation} eager className="p3d-hero__preview" label="MENU / A DIRECT ROUTE TO EVERY ROOM" />
          </div>
          <div className="p3d-hero__media">
            <Capture image={images.work} eager />
            <div className="p3d-hero__index" aria-hidden="true"><span>CORRIDOR</span><i /><span>DOOR</span><i /><span>ROOM</span></div>
          </div>
        </div>
      </section>

      <CaseSection
        id="concept"
        eyebrow="CONCEPT / TWO EXPRESSIONS"
        title="Navigation becomes a place."
        intro="The Web Experience supports direct scanning and project access. Its companion turns the same professional story into a place to walk through, without replacing the conventional route."
      >
        <div className="p3d-concept">
          <Capture image={images.corridor} label="THE CORRIDOR / ROOMS AS DESTINATIONS" />
          <div className="p3d-concept__copy">
            <p>The visitor arrives on a roof terrace, facing the door, with the city below. Inside, the corridor is the navigation: glass doors are the destinations, rooms hold the content, and every room links to its page on the Web.</p>
            <dl>
              <div><dt>WEB</dt><dd>Fast scanning, direct routes and detailed project access.</dd></div>
              <div><dt>3D</dt><dd>Atmosphere, room-based storytelling and experiential discovery.</dd></div>
            </dl>
            <TextCTA to="/work/">Explore the selected work →</TextCTA>
          </div>
        </div>
      </CaseSection>

      <CaseSection
        id="navigation"
        eyebrow="SPATIAL NAVIGATION"
        title="A clear route through an unfamiliar interface."
        intro="The wheel walks where you look, the mouse turns the view, and glass doors slide open as you arrive. The menu walks you to any room, or leaves for the Web Experience."
        className="p3d-section--navigation p3d-section--centered"
      >
        <Capture image={images.navigation} className="p3d-navigation" label="MENU + DIRECT ROOM ROUTES" />
        <ol className="p3d-flow" aria-label="Corridor interaction flow">
          <li><span>01</span><strong>Enter</strong><p>Click the door on the terrace.</p></li>
          <li><span>02</span><strong>Look</strong><p>The view follows the mouse automatically; the cursor stays available.</p></li>
          <li><span>03</span><strong>Walk</strong><p>Scroll to walk where you look; doors open as you arrive.</p></li>
          <li><span>04</span><strong>Return</strong><p>Links open the Web pages; Back returns to the same spot.</p></li>
        </ol>
      </CaseSection>

      <CaseSection
        id="rooms"
        eyebrow="ROOMS AS CONTENT"
        title="One architecture. Distinct stories."
        intro="Four rooms open off the corridor, each with its own floor, light and installation: framed niches in About, six service monoliths in Services, a gallery of project screens in Work, and a glass-walled hall over the city for Contact."
        className="p3d-section--rooms p3d-section--centered"
      >
        <div className="p3d-rooms">
          <Capture image={images.about} label="ABOUT / IDENTITY" />
          <Capture image={images.services} label="SERVICES / SIX LINES OF WORK" />
          <Capture image={images.work} label="WORK / PROJECT GALLERY" />
          <Capture image={images.contact} label="CONTACT / THE HALL OVER THE CITY" />
        </div>
      </CaseSection>

      <CaseSection
        id="interaction"
        eyebrow="CAMERA + INTERACTION"
        title="Movement is part of the information architecture."
        intro="Automatic mouse look, a walk that follows the view and proximity doors connect the space. Project screens switch smoothly into a front-facing website review."
      >
        <div className="p3d-interaction">
          <Capture image={images.link} label="LIVE WEBSITE / FORMA IN THE WORK ROOM" />
          <div className="p3d-interaction__notes">
            <article><span>01 / ORIENTATION</span><h3>One continuous movement mode.</h3><p>Mouse look and wheel walking work together without a click-to-look toggle. Approaching a project screen eases the view into alignment.</p></article>
            <article><span>02 / PROJECT SCREENS</span><h3>The website is already running.</h3><p>Live pages load as the Work Room approaches. Scrolling inside a screen holds the room still; one outside click restores walking and the previous viewpoint. A site that blocks embedding keeps its real capture and public link.</p></article>
            <article><span>03 / TRANSITION</span><h3>Doors open as you arrive.</h3><p>Each glass door senses the visitor and slides open, so walking into a room is one continuous move.</p></article>
          </div>
        </div>
      </CaseSection>

      <section className="p3d-material" aria-labelledby="material-title">
        <div className="route-wrap p3d-material__grid">
          <div className="p3d-material__copy">
            <span className="kicker">MATERIAL / LIGHT / DIRECTION</span>
            <h2 id="material-title">Night outside. Warm light within.</h2>
            <p>Travertine, walnut, cobalt felt and brass under each room's own baked light, with a starlit sky and a living city outside. The content stays crisp on printed boards, brass lettering and lit monoliths.</p>
          </div>
          <Capture image={images.detail} label="PRINTED TYPE + BRASS EDGE LIGHT" />
          <div className="p3d-material__ledger" aria-label="Spatial visual system">
            <span>TRAVERTINE</span><span>WALNUT</span><span>COBALT + BRASS</span><span>NIGHT CITY</span>
          </div>
        </div>
      </section>

      <CaseSection
        id="usability"
        eyebrow="RESPONSIVE + USABILITY"
        title="Immersion still needs rules."
        intro="The cursor stays available, walls and furniture bound the walk, and screen review isolates input. Phones and touch tablets enter the lighter Web Experience directly."
        className="p3d-section--usability"
      >
        <div className="p3d-usability">
          <Capture image={images.contact} label="CONTACT / A ROOM WITH A PURPOSE" />
          <div className="p3d-usability__rules">
            <article><b>01</b><h3>A single exit action</h3><p>Click outside a project screen once to leave website review and resume movement.</p></article>
            <article><b>02</b><h3>Bounded movement</h3><p>Walls, furniture and closed doors stop the walk; it slides along them instead of sticking.</p></article>
            <article><b>03</b><h3>The right entry for the device</h3><p>Mobile opens the responsive Web Experience without loading the immersive scene.</p></article>
            <article><b>04</b><h3>Motion preference</h3><p>Reduced-motion mode removes the walking sway and resolves transitions at once.</p></article>
          </div>
        </div>
      </CaseSection>

      <CaseSection
        id="implementation"
        eyebrow="DESIGN + IMPLEMENTATION"
        title="Spatial direction carried into production WebGL."
        intro="The experience was designed and implemented as one system: room architecture, interaction states and content surfaces share reusable infrastructure while each room keeps its own purpose."
        className="p3d-section--implementation p3d-section--centered"
      >
        <div className="p3d-build">
          <article><span>SPATIAL</span><h3>Architecture and scene direction</h3><ul><li>Terrace, corridor and four rooms</li><li>Baked room lighting</li><li>Night sky and city</li><li>Brass lettering and printed boards</li></ul></article>
          <article><span>INTERACTION</span><h3>Journey and navigation states</h3><ul><li>Automatic mouse look and walking</li><li>Live websites in project screens</li><li>Automatic glass doors</li><li>One-click screen exit and viewpoint restoration</li></ul></article>
          <article><span>FRONTEND</span><h3>Reusable production structure</h3><ul><li>React scene composition</li><li>React Three Fiber + Three.js</li><li>Projected website surfaces with occlusion</li><li>Separate mobile Web entry</li></ul></article>
        </div>
        <div className="p3d-stack">
          <span className="kicker">VERIFIED 3D STACK</span>
          <div className="web-tag-group" aria-label="3D production stack tags">{stack.map(([id, label]) => <TechTag id={id} key={label}>{label}</TechTag>)}</div>
        </div>
      </CaseSection>

      <CaseSection
        id="system"
        eyebrow="DESIGN SYSTEM RELATIONSHIP"
        title="Shared identity. Specialized medium."
        intro="Typography relationships, CTA language, brand accent and professional positioning connect both portfolio expressions. Geometry, camera, lighting, room composition and spatial interaction remain purpose-built for the Corridor."
        className="p3d-section--system p3d-section--centered"
      >
        <div className="p3d-system">
          <div><span>SHARED</span><p>Identity, type relationships, action language and core positioning.</p></div>
          <i aria-hidden="true" />
          <div><span>SPECIALIZED</span><p>Scene geometry, materials, camera behavior and room interaction.</p></div>
          <TextCTA to="/design-system/">Explore Design System →</TextCTA>
        </div>
      </CaseSection>

      <section className="p3d-close" aria-labelledby="p3d-close-title">
        <HeroSignalBackground />
        <div className="route-wrap p3d-close__grid">
          <div className="route-heading-copy"><span className="kicker">ENTER THE LIVE SPACE</span><h2 id="p3d-close-title">The journey is the final artifact.</h2><p>Move through the current production Corridor, choose a room and experience the spatial navigation directly.</p></div>
          <div><div><ActionLink to={webOnly?'/web/':'/'}>{entryLabel} <span aria-hidden="true">↗</span></ActionLink><TextCTA to="/contact/">Send a brief →</TextCTA></div><CaseStudyNav current="/work/personal-portfolio-3d/" /></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
