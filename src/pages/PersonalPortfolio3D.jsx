import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import { TECH_TAG_MARKS } from '../components/TechTagMarks.jsx'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'
import SectionIntro from '../components/ui/SectionIntro.jsx'
import './PersonalPortfolio3D.css'

const assetRoot = '/assets/case-studies/personal-portfolio-3d'

const images = {
  entry: { src: `${assetRoot}/entry.webp`, width: 1440, height: 900, alt: 'Entry screen for the personal portfolio experience' },
  corridor: { src: `${assetRoot}/corridor.webp`, width: 1440, height: 900, alt: 'Main spatial corridor with room doors, artwork and navigation guidance' },
  navigation: { src: `${assetRoot}/navigation-hud.webp`, width: 1440, height: 900, alt: 'Corridor navigation menu open over the spatial environment' },
  about: { src: `${assetRoot}/about-room.webp`, width: 1440, height: 900, alt: 'About room with identity copy, artwork and furniture' },
  services: { src: `${assetRoot}/services-room.webp`, width: 1440, height: 900, alt: 'Services room with capability index and spatial artwork' },
  work: { src: `${assetRoot}/work-room.webp`, width: 1440, height: 900, alt: 'Work room showing the interactive project gallery' },
  agencies: { src: `${assetRoot}/agencies-room.webp`, width: 1440, height: 900, alt: 'For Agencies room with white-label positioning and installation artwork' },
  contact: { src: `${assetRoot}/contact-room.webp`, width: 1440, height: 900, alt: 'Contact room with the active brief form installed on the front wall' },
  detail: { src: `${assetRoot}/spatial-detail.webp`, width: 520, height: 590, alt: 'Detail of room lighting, material surfaces, artwork and furniture' },
}

const stack = [
  ['react', 'React 19'],
  ['router', 'React Router'],
  ['vite', 'Vite'],
  ['javascript', 'JavaScript'],
  ['css3', 'CSS'],
  ['r3f', 'React Three Fiber'],
  ['three', 'Three.js'],
  ['drei', 'Drei'],
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

  return <div className="route-page p3d-page">
    <Header />
    <main id="main-content" tabIndex="-1">
      <section className="p3d-hero" aria-labelledby="p3d-title">
        <HeroSignalBackground />
        <div className="route-wrap p3d-hero__content">
          <div className="p3d-hero__heading">
            <span className="kicker">SELF-INITIATED / SPATIAL EXPERIENCE</span>
            <h1 id="p3d-title">Personal Portfolio <em>— 3D</em></h1>
          </div>
          <div className="p3d-hero__summary">
            <p>An immersive spatial counterpart to the responsive Web portfolio—designed as a working corridor of destinations, rooms and interaction.</p>
            <div className="p3d-hero__actions">
              <ActionLink to="/">Enter 3D Experience <span aria-hidden="true">↗</span></ActionLink>
              <TextCTA href="#concept">Explore the case study ↓</TextCTA>
            </div>
            <Capture image={images.navigation} eager className="p3d-hero__preview" label="CORRIDOR / DIRECT ROOM ACCESS" />
          </div>
          <div className="p3d-hero__media">
            <Capture image={images.corridor} eager />
            <div className="p3d-hero__index" aria-hidden="true"><span>CORRIDOR</span><i /><span>DOOR</span><i /><span>ROOM</span></div>
          </div>
        </div>
      </section>

      <CaseSection
        id="concept"
        eyebrow="CONCEPT / TWO EXPRESSIONS"
        title="Navigation becomes a place."
        intro="The standard Web Experience supports direct scanning and project access. Its companion turns the same professional story into a spatial journey without replacing the conventional route."
      >
        <div className="p3d-concept">
          <Capture image={images.entry} label="01 / RESPONSIVE WEB ENTRY" />
          <div className="p3d-concept__copy">
            <p>The corridor acts as navigation. Doors establish destinations; rooms hold distinct content environments; the return journey keeps the spatial model understandable.</p>
            <dl>
              <div><dt>WEB</dt><dd>Fast scanning, direct routes and detailed project access.</dd></div>
              <div><dt>3D</dt><dd>Atmosphere, room-based storytelling and experiential discovery.</dd></div>
            </dl>
            <TextCTA to="/work/personal-portfolio-web/">View Web Case Study →</TextCTA>
          </div>
        </div>
      </CaseSection>

      <CaseSection
        id="navigation"
        eyebrow="SPATIAL NAVIGATION"
        title="A clear route through an unfamiliar interface."
        intro="Movement, door cues and a persistent HUD keep the environment legible. The menu provides a direct route to each room while preserving the sense of place."
        className="p3d-section--navigation p3d-section--centered"
      >
        <Capture image={images.navigation} className="p3d-navigation" label="HUD + DIRECT ROOM NAVIGATION" />
        <ol className="p3d-flow" aria-label="Corridor interaction flow">
          <li><span>01</span><strong>Enter</strong><p>Begin from the portfolio gate.</p></li>
          <li><span>02</span><strong>Move</strong><p>Scroll to travel and move the pointer to look.</p></li>
          <li><span>03</span><strong>Choose</strong><p>Approach a door and select a destination.</p></li>
          <li><span>04</span><strong>Return</strong><p>Reverse the journey back into the corridor.</p></li>
        </ol>
      </CaseSection>

      <CaseSection
        id="rooms"
        eyebrow="ROOMS AS CONTENT"
        title="One architecture. Distinct stories."
        intro="Each destination shares the same physical room shell and front-wall logic, then changes its content, artwork and functional installation to suit the subject."
        className="p3d-section--rooms p3d-section--centered"
      >
        <div className="p3d-rooms">
          <Capture image={images.about} label="ABOUT / IDENTITY" />
          <Capture image={images.services} label="SERVICES / CAPABILITY INDEX" />
          <Capture image={images.agencies} label="AGENCIES / WHITE-LABEL MODEL" />
          <Capture image={images.work} label="WORK / PROJECT DISCOVERY" />
        </div>
      </CaseSection>

      <CaseSection
        id="interaction"
        eyebrow="CAMERA + INTERACTION"
        title="Movement is part of the information architecture."
        intro="A controlled camera, native pointer and clear phase changes connect walking, selecting a door, entering a room and returning to the corridor."
      >
        <div className="p3d-interaction">
          <Capture image={images.corridor} label="CONTROLLED CORRIDOR CAMERA" />
          <div className="p3d-interaction__notes">
            <article><span>01 / ORIENTATION</span><h3>Guidance stays in view.</h3><p>Instructions, movement status and room-specific hints explain the next available action.</p></article>
            <article><span>02 / TRANSITION</span><h3>Doors connect states.</h3><p>Camera and door choreography turn route selection into an understandable spatial transition.</p></article>
            <article><span>03 / SPECIAL CASE</span><h3>Work becomes browsable.</h3><p>The Work room adds scroll and keyboard controls to its project wall without changing the broader journey.</p></article>
          </div>
        </div>
      </CaseSection>

      <section className="p3d-material" aria-labelledby="material-title">
        <div className="route-wrap p3d-material__grid">
          <div className="p3d-material__copy">
            <span className="kicker">MATERIAL / LIGHT / DIRECTION</span>
            <h2 id="material-title">Warm space. Precise content.</h2>
            <p>Plaster walls, dark timber, controlled pools of light and restrained blue accents create atmosphere without reducing the readability of the content installed in each room.</p>
          </div>
          <Capture image={images.detail} label="LIGHT + OBJECT COMPOSITION" />
          <div className="p3d-material__ledger" aria-label="Spatial visual system">
            <span>WARM NEUTRALS</span><span>DARK TIMBER</span><span>BLUE SIGNAL</span><span>FOCUSED LIGHT</span>
          </div>
        </div>
      </section>

      <CaseSection
        id="usability"
        eyebrow="RESPONSIVE + USABILITY"
        title="Immersion still needs rules."
        intro="The scene stays viewport-bound, camera states remain controlled and the HUD adapts as space narrows. Reduced-motion preferences shorten spatial transitions and remove non-essential camera movement."
        className="p3d-section--usability"
      >
        <div className="p3d-usability">
          <Capture image={images.contact} label="READABLE CONTENT + FUNCTIONAL FORM" />
          <div className="p3d-usability__rules">
            <article><b>01</b><h3>Readable installation</h3><p>Content is composed against a consistent usable front-wall area.</p></article>
            <article><b>02</b><h3>Bounded movement</h3><p>Camera limits and authored transitions protect orientation.</p></article>
            <article><b>03</b><h3>Input clarity</h3><p>Native pointer, HUD copy and keyboard support cover distinct tasks.</p></article>
            <article><b>04</b><h3>Motion preference</h3><p>Reduced-motion mode resolves transitions quickly and removes parallax.</p></article>
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
          <article><span>SPATIAL</span><h3>Architecture and scene direction</h3><ul><li>Shared room shell</li><li>Camera composition</li><li>Lighting and materials</li><li>Room installations</li></ul></article>
          <article><span>INTERACTION</span><h3>Journey and navigation states</h3><ul><li>Scroll movement</li><li>Door and room transitions</li><li>Native pointer feedback</li><li>HUD and direct navigation</li></ul></article>
          <article><span>FRONTEND</span><h3>Reusable production structure</h3><ul><li>React scene composition</li><li>WebGL integration</li><li>DOM content surfaces</li><li>Responsive UI overlays</li></ul></article>
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
          <div><span className="kicker">ENTER THE LIVE SPACE</span><h2 id="p3d-close-title">The journey is the final artifact.</h2></div>
          <div><p>Move through the current production Corridor, choose a room and experience the spatial navigation directly.</p><div><ActionLink to="/">Enter 3D Experience <span aria-hidden="true">↗</span></ActionLink><TextCTA to="/contact/">Start a conversation →</TextCTA></div></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
