import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import CaseStudyNav from '../components/CaseStudyNav.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import { TECH_TAG_MARKS } from '../components/TechTagMarks.jsx'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'
import SectionIntro from '../components/ui/SectionIntro.jsx'
import { ProjectCapture } from '../components/ProjectBrowserPreview.jsx'
import { WEB_HOME } from '../routeLoaders.js'
import '../components/BrowserFrame.css'
import './PersonalPortfolioWeb.css'

const assetRoot = '/assets/case-studies/personal-portfolio-web'

// Captures of the current site. Re-captured files keep their names; CAPTURES versions their URLs so browsers fetch them again.
const CAPTURES = '20261013-3'
const shot = (file) => `${assetRoot}/${file}?v=${CAPTURES}`

const images = {
  homeLight: { src: shot('home-light-desktop.webp'), width: 1440, height: 900, alt: 'Web Experience homepage in the light theme: the headline, the two actions and a real PRIMA interface' },
  homeDark: { src: shot('home-dark-desktop.webp'), width: 1440, height: 900, alt: 'Web Experience homepage in the dark theme' },
  about: { src: shot('about-desktop.webp'), width: 1440, height: 900, alt: 'About page hero: Thoughtfully designed and built, beside the UKD sculpture' },
  agencies: { src: shot('agencies-desktop.webp'), width: 1440, height: 900, alt: 'For Agencies page hero: Your agency, one team, beside the linked-rings sculpture' },
  contact: { src: shot('contact-desktop.webp'), width: 1440, height: 900, alt: 'Contact page hero with the envelope sculpture, above the brief form' },
  designSystem: { src: shot('design-system-desktop.webp'), width: 1440, height: 900, alt: 'Implemented portfolio Design System page' },
  prima: { src: `${assetRoot}/project-prima-desktop.webp?v=20261013`, width: 1440, height: 900, alt: 'PRIMA project detail page with shared browser presentation' },
  work: { src: `${assetRoot}/work-project-desktop.webp?v=20261013c`, width: 1440, height: 900, alt: 'Work page project panel showing PRIMA in the shared showcase geometry' },
  tablet: { src: shot('about-tablet.webp'), width: 768, height: 1024, alt: 'About page at a tablet viewport in the dark theme' },
  mobileHome: { src: shot('home-mobile.webp'), width: 390, height: 844, alt: 'Web Experience homepage adapted for a mobile viewport' },
  mobileServices: { src: shot('services-mobile.webp'), width: 390, height: 844, alt: 'Services page adapted for a mobile viewport in the dark theme' },
}

// The homepage top to bottom, shown the way every portfolio item shows its main page: a real full-page capture in a fixed
// browser frame, read by moving the pointer over it.
const WEB_PAGE = {
  slug: 'personal-portfolio-web',
  title: 'Web Experience',
  media: { fullpage: [shot('web-fullpage.webp')] },
  mediaAlt: { hero: 'The Web Experience homepage, top to bottom: the hero with a real PRIMA interface, selected work, capabilities, how the work moves, and the agency and contact routes' },
}

const stack = [
  ['react', 'React 19'],
  ['router', 'React Router'],
  ['vite', 'Vite'],
  ['javascript', 'JavaScript'],
  ['css3', 'CSS + custom properties'],
  ['gsap', 'GSAP'],
  ['lenis', 'Lenis'],
]

function CaptureImage({ image, eager = false }) {
  return <img
    src={image.src}
    width={image.width}
    height={image.height}
    alt={image.alt}
    loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'}
    decoding="async"
  />
}

function BrowserCapture({ image, label = 'usmankhairdin.com', eager = false, className = '' }) {
  return <figure className={`ppw-browser ui-frame ${className}`}>
    <div className="ui-frame__bar" aria-hidden="true"><i /><i /><i /><span className="ui-frame__url">{label}</span></div>
    <div className="ppw-browser__screen ui-frame__screen"><CaptureImage image={image} eager={eager} /></div>
  </figure>
}

function CaseSection({ id, eyebrow, title, intro, children, className = '' }) {
  return <section className={`ppw-section ${className}`} id={id} aria-labelledby={`${id}-title`}>
    <div className="route-wrap">
      <SectionIntro
        className="ppw-section__intro"
        eyebrow={eyebrow}
        title={<span id={`${id}-title`}>{title}</span>}
        intro={intro}
      />
      {children}
    </div>
  </section>
}

function TechTag({ id, children }) {
  return <span className="ppw-tech" data-tech-id={id}>
    {TECH_TAG_MARKS[id] || null}
    {children}
  </span>
}

export default function PersonalPortfolioWeb() {

  return <div className="route-page ppw-page">
    <Header />
    <main id="main-content" tabIndex="-1">
      <section className="ppw-hero" aria-labelledby="ppw-title">
        <HeroSignalBackground />
        <div className="route-wrap ppw-hero__content">
          <div className="ppw-hero__heading route-heading-copy">
            <span className="kicker">SELF-INITIATED / PRODUCT DESIGN + FRONTEND</span>
            <h1 id="ppw-title">Personal Portfolio <em>— Web</em></h1>
            <p>A responsive, motion-led portfolio designed and built as one continuous practice—from positioning and interface direction through production-ready frontend.</p>
            <div className="ppw-hero__actions">
              <ActionLink to={WEB_HOME}>View Web Experience <span aria-hidden="true">↗</span></ActionLink>
              <TextCTA href="#overview">Read the case study ↓</TextCTA>
            </div>
          </div>
          <div className="ppw-hero__media">
            <figure className="ppw-browser ui-frame ppw-hero__browser">
              <div className="ui-frame__bar" aria-hidden="true"><i /><i /><i /><span className="ui-frame__url">usmankhairdin.com/web</span></div>
              <ProjectCapture project={WEB_PAGE} eager className="ppw-browser__screen ui-frame__screen" placeholderSource={images.homeLight.src} />
            </figure>
            <figure className="ppw-device ppw-hero__device"><CaptureImage image={images.mobileHome} eager /></figure>
            <div className="ppw-hero__stamp" aria-hidden="true"><span>DESIGN</span><i /><span>BUILD</span><i /><span>SHIP</span></div>
          </div>
        </div>
      </section>

      <CaseSection
        id="overview"
        eyebrow="PROJECT OVERVIEW"
        title="A portfolio built as the product."
        intro="The brief was to make one clear professional story out of product design, UI/UX, interaction and frontend implementation—without presenting a solo practice like a large agency."
        className="ppw-section--overview"
      >
        <div className="ppw-overview">
          <div className="ppw-overview__copy">
            <p>The Web Experience gives selected direct clients a clear view of what can be hired, while giving agency partners a separate white-label pathway. The visual system supports both audiences without changing voice or diluting the work.</p>
            <p>It also acts as the stable editorial layer around the broader portfolio. The immersive Corridor remains a distinct spatial experience; the Web route carries the detailed service, project and contact narrative.</p>
            <p>Its homepage leads with evidence rather than a portrait: a real project interface, three live projects, the capabilities in a line each, how the work moves, and the routes for agencies and new projects.</p>
          </div>
          <dl className="ppw-facts">
            <div><dt>PROJECT</dt><dd>Self-initiated portfolio</dd></div>
            <div><dt>RESPONSIBILITY</dt><dd>Direction, UX, UI, system and build</dd></div>
            <div><dt>AUDIENCE</dt><dd>Direct clients + agency partners</dd></div>
            <div><dt>OUTPUT</dt><dd>Responsive production Web Experience</dd></div>
          </dl>
          <div className="ppw-role-strip web-tag-group" aria-label="Role and contribution">
            {['Product / UI direction', 'UX + interaction design', 'Design system', 'Responsive design', 'Frontend implementation', 'Motion implementation'].map((role) => <span key={role}>{role}</span>)}
          </div>
        </div>
      </CaseSection>

      <CaseSection
        id="direction"
        eyebrow="DESIGN DIRECTION"
        title="Editorial clarity, production discipline."
        intro="The visual language combines a cool responsive grid, deep navy type, restrained blue accents and selective Playfair emphasis. Foreground interfaces stay solid; atmospheric graphics remain quiet."
      >
        <div className="ppw-direction">
          <BrowserCapture image={images.about} label="usmankhairdin.com/about" />
          <div className="ppw-direction__details">
            <article><span>01 / HIERARCHY</span><strong>Large, readable statements establish the offer quickly.</strong></article>
            <article><span>02 / SYSTEM</span><strong>Consistent grids and semantic surfaces connect every route.</strong></article>
            <article><span>03 / WHITE-LABEL</span><strong>A dedicated agency route makes client ownership and delivery scope clear.</strong></article>
          </div>
          <BrowserCapture image={images.agencies} label="usmankhairdin.com/for-agencies" className="ppw-direction__support" />
        </div>
      </CaseSection>

      <CaseSection
        id="system"
        eyebrow="DESIGN SYSTEM"
        title="Production foundations, made explicit."
        intro="The finished interface was audited into semantic tokens and reusable primitives for type, spacing, surfaces, actions, forms, metadata and media presentation. Specialized experiences keep their own behavior without drifting from the shared foundation."
        className="ppw-section--system"
      >
        <div className="ppw-system">
          <BrowserCapture image={images.designSystem} label="usmankhairdin.com/design-system" />
          <div className="ppw-system__copy">
            <div className="ppw-system__tokens" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <ul>
              <li>Semantic Light and Dark roles</li>
              <li>Formalized spacing, type and layout tokens</li>
              <li>Shared actions, form and metadata primitives</li>
              <li>Responsive and reduced-motion behavior</li>
            </ul>
            <TextCTA to="/design-system/">Explore Design System →</TextCTA>
          </div>
        </div>
      </CaseSection>

      <CaseSection
        id="themes"
        eyebrow="LIGHT + DARK"
        title="Two authored modes. One hierarchy."
        intro="Theme switching changes contrast, surfaces and atmosphere without changing the interface structure or making either mode feel secondary."
        className="ppw-section--centered"
      >
        <div className="ppw-theme-pair">
          <article><span>LIGHT / DEFAULT</span><BrowserCapture image={images.homeLight} label="usmankhairdin.com/web" /></article>
          <article><span>DARK</span><BrowserCapture image={images.homeDark} label="usmankhairdin.com/web" /></article>
        </div>
      </CaseSection>

      <CaseSection
        id="responsive"
        eyebrow="RESPONSIVE EXPERIENCE"
        title="Recomposed for the viewport."
        intro="Desktop compositions use the full editorial grid. Tablet and mobile reorder the same content into deliberate reading sequences with touch-safe controls and intact visual hierarchy."
        className="ppw-section--responsive ppw-section--centered"
      >
        <div className="ppw-responsive-stage">
          <BrowserCapture image={images.contact} label="usmankhairdin.com/contact" className="ppw-responsive-stage__desktop" />
          <figure className="ppw-device ppw-device--tablet"><figcaption>TABLET / 768</figcaption><CaptureImage image={images.tablet} /></figure>
          <figure className="ppw-device ppw-device--mobile"><figcaption>MOBILE / 390</figcaption><CaptureImage image={images.mobileServices} /></figure>
        </div>
      </CaseSection>

      <CaseSection
        id="interaction"
        eyebrow="INTERACTION + MOTION"
        title="Motion supports orientation."
        intro="The interaction layer is selective: it helps visitors understand where they are, what is interactive and how the system changes state."
        className="ppw-section--centered"
      >
        <div className="ppw-interaction-grid">
          <article><span>01</span><div className="ppw-cursor-demo" aria-hidden="true"><i /></div><h3>Living Cursor</h3><p>Context changes communicate view, hover and scroll behavior outside the Corridor.</p></article>
          <article><span>02</span><div className="ppw-tag-demo" aria-hidden="true"><i>PRODUCT UI</i><i>FRONTEND</i></div><h3>Structured tags</h3><p>Capability chips keep a clear reading order and a restrained hover response.</p></article>
          <article><span>03</span><div className="ppw-scroll-demo" aria-hidden="true"><i /></div><h3>Project browsing</h3><p>Fixed browser geometry and reversible screenshot travel keep project evidence readable.</p></article>
          <article><span>04</span><div className="ppw-theme-demo" aria-hidden="true"><i /><i /></div><h3>Theme + preference</h3><p>Theme state persists, while reduced motion removes non-essential movement.</p></article>
        </div>
      </CaseSection>

      <CaseSection
        id="work-system"
        eyebrow="WORK + PROJECT BROWSING"
        title="A consistent frame for different work."
        intro="PRIMA established the panel geometry: disciplined copy on the left, real interface evidence on the right and project-specific surfaces around one shared browser system."
        className="ppw-section--work ppw-section--centered"
      >
        <div className="ppw-work-stage">
          <BrowserCapture image={images.work} label="usmankhairdin.com/work" />
          <BrowserCapture image={images.prima} label="usmankhairdin.com/work/prima" />
        </div>
      </CaseSection>

      <CaseSection
        id="implementation"
        eyebrow="DESIGN + FRONTEND IMPLEMENTATION"
        title="One practice, carried through."
        intro="The case study is not a handoff story. Product thinking, visual direction, responsive behavior and the production interface were developed as one connected piece of work."
        className="ppw-section--centered"
      >
        <div className="ppw-delivery">
          <article>
            <span>DESIGN</span>
            <h3>Direction into a usable system.</h3>
            <ul><li>Product and interface direction</li><li>Responsive layouts</li><li>Interaction and motion design</li><li>Visual system and Design System</li></ul>
          </article>
          <article>
            <span>BUILD</span>
            <h3>Approved detail into production UI.</h3>
            <ul><li>Reusable React components</li><li>Responsive frontend implementation</li><li>Theme and motion architecture</li><li>Accessibility-aware interaction</li></ul>
          </article>
        </div>
        <div className="ppw-stack">
          <span className="kicker">WEB EXPERIENCE STACK</span>
          <div className="web-tag-group" aria-label="Web Experience stack tags">{stack.map(([id, label]) => <TechTag id={id} key={label}>{label}</TechTag>)}</div>
          <p>React Three Fiber and Three.js power the separate Corridor experience; they are not presented as the primary Web stack.</p>
        </div>
      </CaseSection>

      <section className="ppw-close" aria-labelledby="ppw-close-title">
        <HeroSignalBackground />
        <div className="route-wrap ppw-close__grid">
          <div className="route-heading-copy"><span className="kicker">THE LIVE RESULT</span><h2 id="ppw-close-title">The case study ends where the experience begins.</h2><p>Explore the production portfolio as a visitor: switch themes, browse the selected work and move between the Web and spatial experiences.</p></div>
          <div><div><ActionLink to={WEB_HOME}>View Web Experience <span aria-hidden="true">↗</span></ActionLink><TextCTA to="/contact/">Send a brief →</TextCTA></div><CaseStudyNav current="/work/personal-portfolio-web/" /></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
