import StandardPage from './StandardPage.jsx'
import { HeroTitle, sectionHeroes } from '../data/sectionHeroes.jsx'
import { AboutHeroBlueprint, AboutSectionGraphic } from '../components/AboutVisuals.jsx'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'

const hero = sectionHeroes.about

const EXPERIENCE_ICONS={
  product:<><rect x="4" y="5" width="16" height="14" rx="2.5"/><path d="M4 9h16M8 13h4M8 16h7"/></>,
  web:<><path d="M4 6.5h16v12H4zM4 10h16"/><circle cx="7" cy="8.2" r=".7" fill="currentColor" stroke="none"/><circle cx="9.4" cy="8.2" r=".7" fill="currentColor" stroke="none"/><path d="m8 15 2-2 2 2 4-4"/></>,
  independent:<><path d="M5 5h6v6H5zM13 13h6v6h-6zM15 5h4v4M5 15v4h4"/><path d="M11 8h4M16 9v4M8 11v4M9 16h4"/></>,
}
function ExperienceIcon({name}){return <svg className="about-experience-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{EXPERIENCE_ICONS[name]}</svg>}

export default function About(){
  return <StandardPage
    eyebrow={hero.eyebrow}
    accent="about"
    title={<HeroTitle hero={hero}/>}
    intro={hero.intro}
    heroNote={hero.heroNote}
    heroVisual={<AboutHeroBlueprint/>}
    heroAction={<ActionLink className="route-hero__cta" to="/work/">Explore selected work <span>↗</span></ActionLink>}
  >
    <section className="section section--about-signature about-section about-section--process">
      <AboutSectionGraphic variant="process"/>
      <div className="route-wrap split">
        <div className="about-section__intro">
          <span className="kicker">HOW I WORK</span>
          <h2>Design intent should survive the handoff.</h2>
          <p className="about-section__lead">I work across product thinking, interface design and frontend production, so the decisions approved on screen still make sense when the product reaches the browser.</p>
          <div className="signal-track" aria-hidden="true"><span>BRIEF</span><i/><span>SYSTEM</span><i/><span>BUILD</span></div>
        </div>
        <div className="stack about-practice-card">
          <span className="about-card-label">ONE CONTINUOUS PRACTICE</span>
          <p>For direct clients and agency teams, I can own a defined slice of delivery from a written brief through responsive, implementation-ready output.</p>
          <div className="about-continuity" aria-label="Brief, system and build continuity">
            <div><span>01 / BRIEF</span><strong>Clarify intent, hierarchy and the required output.</strong></div>
            <div><span>02 / SYSTEM</span><strong>Turn the direction into reusable components and responsive states.</strong></div>
            <div><span>03 / BUILD</span><strong>Carry the approved detail into a polished production interface.</strong></div>
          </div>
          <TextCTA to="/work/">See selected work ↗</TextCTA>
        </div>
      </div>
    </section>

    <section className="section section--soft section--timeline-premium about-section about-section--experience">
      <AboutSectionGraphic variant="experience"/>
      <div className="route-wrap experience-grid">
        <div className="about-section__intro">
          <span className="kicker">EXPERIENCE</span>
          <h2>16+ years across product design and web production.</h2>
          <p className="about-section__lead">The work has moved from client websites into complex business products, but the core practice has stayed consistent: understand the interface, define the system, and make the final surface hold together.</p>
        </div>
        <div className="timeline-list timeline-list--premium">
          <article>
            <div className="about-experience-card__icon"><ExperienceIcon name="product"/></div>
            <div className="about-experience-card__copy"><span>2019 — PRESENT</span><h3>Product Designer · eWorx International Pvt. Ltd.</h3><p>UI/UX work across internal business products including payroll, agency-management and business-management systems.</p></div>
          </article>
          <article>
            <div className="about-experience-card__icon"><ExperienceIcon name="web"/></div>
            <div className="about-experience-card__copy"><span>2012 — 2019</span><h3>Senior Web Designer · ArhamSoft Pvt. Ltd.</h3><p>Website design and frontend production across client projects, responsive interfaces and production handoff.</p></div>
          </article>
          <article>
            <div className="about-experience-card__icon"><ExperienceIcon name="independent"/></div>
            <div className="about-experience-card__copy"><span>INDEPENDENT PRACTICE</span><h3>White-label UI design & frontend production</h3><p>Selected direct work plus agency overflow support for websites, landing pages, SaaS UI, dashboards and responsive frontend delivery.</p></div>
          </article>
        </div>
      </div>
    </section>

    <section className="section section--toolscape about-section about-section--toolscape">
      <AboutSectionGraphic variant="tools"/>
      <div className="route-wrap tool-grid tool-grid--premium">
        <div><span className="kicker">PRODUCT / DESIGN</span><h3>Figma · Adobe XD · Photoshop</h3><p>Interface direction, flows, responsive states and component thinking shaped around the product rather than a fixed visual template.</p><i aria-hidden="true">01</i></div>
        <div><span className="kicker">FRONTEND / BUILD</span><h3>React · Tailwind CSS · HTML · CSS</h3><p>Responsive frontend production with attention to structure, maintainability, implementation detail and reliable handoff.</p><i aria-hidden="true">02</i></div>
        <div><span className="kicker">UX / QUALITY</span><h3>WCAG · responsive states · design systems</h3><p>Clear hierarchy, semantic structure, usable contrast and interface decisions that continue to work across real states and screen sizes.</p><i aria-hidden="true">03</i></div>
      </div>
    </section>
  </StandardPage>
}
