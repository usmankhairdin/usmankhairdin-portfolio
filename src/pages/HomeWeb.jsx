import { Link } from 'react-router-dom'
import EditorialPage from '../components/editorial/EditorialPage.jsx'
import { EditorialLink } from '../components/editorial/EditorialEngagement.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import SplashBackdrop from '../components/SplashBackdrop.jsx'
import { hostLabel, projectAsset, projects } from '../data/projects.js'
import '../components/BrowserFrame.css'
import './HomeWeb.css'

/*
 * The marketing homepage (the Web Experience, at /web/), reached from the Corridor's terrace sign. The
 * Corridor is the first experience at '/'; this page is the site as a website: who I am for in a
 * line, real interfaces as the proof, what I do, how the work moves, and the way to start.
 * Every fact here is the site's own (projects.js, Services, Agencies, Contact); the portrait and
 * the biography live on About.
 */

const bySlug = (slug) => projects.find((p) => p.slug === slug)
const PRIMA = bySlug('prima')

// Three live public sites, each with the interface direction and the frontend in my hands. PRIMA's homepage is already the
// hero, so here it shows its hotels page (a case-study capture).
const showcase = (slug) => ({
  src: projectAsset(slug, 'showcase-1x.webp'),
  srcSet: `${projectAsset(slug, 'showcase-1x.webp')} 1440w, ${projectAsset(slug, 'showcase.webp')} 2880w`,
  width: 1440,
  height: 900,
})
const SELECTED = [
  { project: bySlug('bansar'), image: showcase('bansar') },
  {
    project: PRIMA,
    url: 'primaapp.com/hotels',
    image: { src: projectAsset('prima', 'ev-hotels-1x.webp'), srcSet: `${projectAsset('prima', 'ev-hotels-1x.webp')} 960w, ${projectAsset('prima', 'ev-hotels.webp')} 1920w`, width: 1920, height: 1200 },
  },
  { project: bySlug('rantle'), image: showcase('rantle') },
]

// The services, in a line each; the whole of them is on Services.
const CAPABILITIES = [
  { title: 'Product & UI/UX design', line: 'Make complex workflows feel clear.', scope: 'User flows · Responsive screens · Design systems' },
  { title: 'Websites & redesign', line: 'Give your business a clearer presence.', scope: 'Website design · Landing pages · Redesigns' },
  { title: 'Frontend implementation', line: 'Carry approved design into the browser.', scope: 'Design-to-code · Reusable components · Responsive frontend' },
]

const STEPS = [
  { title: 'Brief', text: 'Share the product, page or production gap, plus timing and the kind of support you need.' },
  { title: 'Design direction', text: 'Flows, responsive screens and reusable interface systems, shaped around the people using them.' },
  { title: 'Build & handoff', text: 'Approved interface designs carried into responsive, production-ready frontend components.' },
]

// The hero carries four core tools, drifting in its open space and draggable on a desktop, as the Splash tokens always have.
// Homes are in units of the project composition's height (1000 = its height, from its centre); the rest of the toolkit is on Services.
const HERO_TAGS = {
  figma: { d: [-560, -600], t: [-420, -585], m: [-300, -600] },
  react: { d: [440, 600], t: [420, 590], m: [300, 600] },
  tailwind: { d: [-640, 520], t: [-430, 590], m: null },
  javascript: { d: [760, -600], t: [430, -585], m: null },
}
const HERO_TEXT = ['.home-hero__eyebrow', '.home-hero__title', '.home-hero__lede']

function Browser({ project, image, url, alt, sizes, eager = false, className = '' }) {
  return <span className={`ui-frame home-browser ${className}`} style={{ '--uf-accent': project.accent }}>
    <span className="ui-frame__bar" aria-hidden="true"><i /><i /><i /><span className="ui-frame__url">{url || hostLabel(project.liveUrl)}</span></span>
    <span className="ui-frame__screen">
      <img {...image} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" />
    </span>
  </span>
}

export default function HomeWeb() {
  return <EditorialPage className="home-web">
    <section className="home-hero" aria-labelledby="home-title">
      <SplashBackdrop scope=".home-hero" anchor=".home-hero__visual" artZones="box" copyZones={HERO_TEXT} cta=".home-hero__actions" copy=".home-hero__copy" scroller={null} homes={HERO_TAGS} />
      <div className="home-wrap home-hero__layout">
        <div className="home-hero__copy">
          <p className="home-eyebrow home-hero__eyebrow">Usman Khair Din · Product design, UI/UX &amp; frontend</p>
          <h1 id="home-title" className="home-hero__title">From first screen to <em>finished build.</em></h1>
          <p className="home-hero__lede">I design product experiences and responsive interfaces, then carry the approved direction into production-ready frontend implementation.</p>
          <div className="home-hero__actions">
            <ActionLink to="/work/">Explore selected work <span aria-hidden="true">↗</span></ActionLink>
            <EditorialLink to="/contact/">Discuss a project</EditorialLink>
          </div>
        </div>
        <figure className="home-hero__visual">
          <Link to={`/work/${PRIMA.slug}/`} className="home-hero__screens" aria-label={`${PRIMA.title} case study: ${PRIMA.category}, ${PRIMA.role}`}>
            <Browser project={PRIMA} image={showcase(PRIMA.slug)} alt={PRIMA.mediaAlt.hero} sizes="(max-width: 1024px) 92vw, 52vw" eager className="home-hero__desktop" />
            <span className="home-hero__phone">
              <img src={projectAsset(PRIMA.slug, 'mobile.webp')} width="390" height="844" alt={PRIMA.mediaAlt.mobile} decoding="async" />
            </span>
          </Link>
          <figcaption className="home-hero__caption"><b>{PRIMA.title}</b> {PRIMA.category} · {PRIMA.role}</figcaption>
        </figure>
      </div>
    </section>

    <section className="home-section home-work" aria-labelledby="home-work-title">
      <div className="home-wrap">
        <header className="home-section__head" data-editorial-reveal>
          <h2 id="home-work-title">Selected <em>work.</em></h2>
          <div className="home-section__aside">
            <p>Three live public sites where I set the interface direction and built the frontend.</p>
            <EditorialLink to="/work/">See all work</EditorialLink>
          </div>
        </header>
        <div className="home-work__list">
          {SELECTED.map(({ project, image, url }, index) => <article key={project.slug} className={`home-work__item${index === 0 ? ' home-work__item--lead' : ''}`} data-editorial-reveal>
            <Link to={`/work/${project.slug}/`} className="home-work__media" tabIndex={-1} aria-hidden="true">
              <Browser project={project} image={image} url={url} alt="" sizes={index === 0 ? '(max-width: 800px) 92vw, 58vw' : '(max-width: 800px) 92vw, 44vw'} />
            </Link>
            <div className="home-work__text">
              <p className="home-eyebrow">{project.category} · {project.status}</p>
              <h3><Link to={`/work/${project.slug}/`}>{project.title}</Link></h3>
              <p>{project.summary}</p>
              <p className="home-work__role">{project.role}</p>
              <EditorialLink to={`/work/${project.slug}/`}>View case study</EditorialLink>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="home-section home-capabilities" aria-labelledby="home-capabilities-title">
      <div className="home-wrap home-capabilities__layout">
        <header className="home-section__head" data-editorial-reveal>
          <h2 id="home-capabilities-title">Design and development, <em>in the same hands.</em></h2>
          <p>Figma for the design. A component-based frontend for the build.</p>
          <EditorialLink to="/services/">Services in detail</EditorialLink>
        </header>
        <div className="home-capabilities__body">
          <ul className="home-capabilities__list">
            {CAPABILITIES.map((item) => <li key={item.title} data-editorial-reveal>
              <h3>{item.title}</h3>
              <p>{item.line}</p>
              <p className="home-capabilities__scope">{item.scope}</p>
            </li>)}
          </ul>
          <p className="home-capabilities__toolkit" data-editorial-reveal>
            <span>The full toolkit, design and frontend tools first and AI-assisted tools in support, is set out on Services.</span>
            <EditorialLink to="/services/">See the full toolkit</EditorialLink>
          </p>
        </div>
      </div>
    </section>

    <section className="home-section home-process" aria-labelledby="home-process-title">
      <div className="home-wrap">
        <h2 id="home-process-title" data-editorial-reveal>How the work <em>moves.</em></h2>
        <ol className="home-process__steps">
          {STEPS.map((step) => <li key={step.title} data-editorial-reveal>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="home-section home-close" aria-label="Agencies and new projects">
      <div className="home-wrap home-close__layout">
        <div className="home-close__agency" data-editorial-reveal>
          <p className="home-eyebrow">For agencies</p>
          <h2>Working with an <em>agency?</em></h2>
          <p>I work from your brief, within your process, on a defined scope. Bring me in for UI design, frontend, or a focused slice of both.</p>
          <EditorialLink to="/for-agencies/">See the agency model</EditorialLink>
        </div>
        <div className="home-close__contact" data-editorial-reveal>
          <h2>Let’s talk about your next <em>project.</em></h2>
          <p>A clear brief is enough to start.</p>
          <ActionLink to="/contact/">Discuss a project <span aria-hidden="true">↗</span></ActionLink>
        </div>
      </div>
    </section>
  </EditorialPage>
}
