import { Link } from 'react-router-dom'
import StandardPage from './StandardPage.jsx'
import { HeroTitle, sectionHeroes } from '../data/sectionHeroes.jsx'
import { RouteSectionGraphic, ServicesHeroBlueprint } from '../components/StandardVisuals.jsx'
import { TECH_TAG_MARKS } from '../components/TechTagMarks.jsx'

const hero = sectionHeroes.services

const stackTags = [
  ['react','React',1],['figma','Figma',1],['tailwind','Tailwind CSS',1],['vite','Vite',1],
  ['html5','HTML5',1],['css3','CSS3',1],['javascript','JavaScript',1],['photoshop','Photoshop',1],
  ['claude','Claude',2],['codex','Codex',2],['lovable','Lovable',2],['bolt','Bolt',2],['v0','v0',2],['builder','Builder',2],
  ['more','And many more ...',3],
]

function ServiceTechVisual(){
  return <div className="service-tech-visual" aria-hidden="true">
    <svg viewBox="0 0 420 340" role="presentation" focusable="false">
      <defs>
        <linearGradient id="serviceTechAccent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7d5cff"/><stop offset=".58" stopColor="#5368ff"/><stop offset="1" stopColor="#2fb4dd"/></linearGradient>
      </defs>
      <g className="stv-grid">
        <path d="M42 62H378M42 112H378M42 162H378M42 212H378M42 262H378"/>
        <path d="M82 32V300M142 32V300M202 32V300M262 32V300M322 32V300"/>
      </g>
      <g className="stv-panel stv-panel--design">
        <rect x="54" y="62" width="124" height="104" rx="18"/>
        <circle cx="82" cy="90" r="9"/><circle cx="104" cy="90" r="9"/><circle cx="82" cy="112" r="9"/><circle cx="104" cy="112" r="9"/><path d="M126 86h30M126 107h22M76 143h78"/>
      </g>
      <g className="stv-panel stv-panel--code">
        <rect x="142" y="126" width="150" height="116" rx="20"/>
        <path className="stv-code" stroke="url(#serviceTechAccent)" d="m170 160-18 17 18 17M264 160l18 17-18 17M214 153l-12 50"/>
        <path d="M188 218h74"/>
      </g>
      <g className="stv-panel stv-panel--preview">
        <rect x="268" y="78" width="104" height="156" rx="20"/>
        <rect className="stv-preview-fill" x="284" y="100" width="72" height="48" rx="10"/>
        <path d="M286 172h66M286 191h52M286 210h62"/>
      </g>
      <path className="stv-flow" d="M104 218 C148 276 244 282 330 238"/>
      <circle className="stv-flow-dot" r="7"><animateMotion path="M104 218 C148 276 244 282 330 238" dur="8.5s" begin="-4.2s" repeatCount="indefinite"/></circle>
      <g className="stv-badges"><rect x="52" y="254" width="66" height="26" rx="13"/><rect x="126" y="276" width="82" height="26" rx="13"/><rect x="300" y="258" width="70" height="26" rx="13"/></g>
      <text x="85" y="271">DESIGN</text><text x="167" y="293">BUILD</text><text x="335" y="275">SHIP</text>
    </svg>
  </div>
}

const services = [
  ['01','Product UX & interface design','Flows, responsive product screens and reusable UI systems shaped around the real workflow.','PRODUCT'],
  ['02','Websites & landing pages','High-clarity marketing sites and landing pages designed for responsive production and conversion.','WEB'],
  ['03','SaaS / dashboard systems','Dense dashboards, CRM/ERP/HRM-style interfaces and component-led application states.','SYSTEM'],
  ['04','Frontend implementation','Responsive React, Tailwind CSS, HTML/CSS and Bootstrap implementation from approved design direction.','BUILD'],
  ['05','AI-assisted full-stack builds','Modern web products assembled with AI-assisted development workflows while keeping UX, structure and production quality under control.','AI BUILD'],
  ['06','White-label agency production','Senior overflow support behind your agency brand — design, frontend or a defined slice of both.','AGENCY'],
]

export default function Services(){
  return <StandardPage
    eyebrow={hero.eyebrow}
    accent="services"
    title={<HeroTitle hero={hero}/>}
    intro={hero.intro}
    heroNote={hero.heroNote}
    heroVisual={<ServicesHeroBlueprint/>}
    heroAction={<Link className="pill pill--primary route-hero__cta" to="/contact/">Start a paid pilot <span>↗</span></Link>}
  >
    <section className="section section--service-stack route-authored-section">
      <RouteSectionGraphic variant="services-grid"/>
      <div className="route-wrap service-list service-list--premium">
        {services.map(([n,t,d,signal],index)=><article key={n} style={{'--service-index':index}}><span>{n}</span><h2>{t}</h2><p>{d}</p><i aria-hidden="true">{signal}</i></article>)}
      </div>
    </section>

    <section className="section section--soft section--delivery-system route-authored-section">
      <RouteSectionGraphic variant="delivery"/>
      <div className="route-wrap split">
        <div className="route-section-intro"><span className="kicker">DELIVERY SYSTEM</span><h2>A clear brief, then focused production.</h2><p>Start with the output that matters. The process stays compact enough for direct work and structured enough to plug into an agency workflow.</p><div className="delivery-modes js-horizontal-reorder"><span>DESIGN ONLY</span><span>FRONTEND ONLY</span><span>DESIGN + BUILD</span></div></div>
        <div className="agency-steps agency-steps--premium">
          <div><b>01</b><span>Brief, references and required output</span></div>
          <div><b>02</b><span>Interface direction and reusable system logic</span></div>
          <div><b>03</b><span>Responsive states and implementation</span></div>
          <div><b>04</b><span>Async review and client-ready handoff</span></div>
        </div>
      </div>
    </section>

    <section className="section section--tech-stage route-authored-section">
      <RouteSectionGraphic variant="stack"/>
      <div className="route-wrap service-tech">
        <div className="service-tech__copy">
          <span className="kicker">TOOLS & STACK</span>
          <h2>Design tools stay flexible. The build stack stays practical.</h2>
          <p className="service-tech__lead">Figma and Photoshop sit alongside React, Vite, Tailwind CSS, HTML, CSS and JavaScript, with modern AI-assisted build tools used where they genuinely speed up production.</p>
          <div className="contact-notes contact-notes--premium service-tech__tags js-horizontal-reorder">{stackTags.map(([id,label,tier])=><span key={id} className={`service-tech-tag service-tech-tag--t${tier}`} data-tech-id={id}>{TECH_TAG_MARKS[id]}{label}</span>)}</div>
          <Link className="pill pill--primary page-cta" to="/contact/">Start a paid pilot <span>↗</span></Link>
        </div>
        <ServiceTechVisual/>
      </div>
    </section>
  </StandardPage>
}
