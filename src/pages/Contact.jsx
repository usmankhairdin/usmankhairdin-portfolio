import StandardPage from './StandardPage.jsx'
import ContactForm from '../components/ContactForm.jsx'
import { HeroTitle, sectionHeroes } from '../data/sectionHeroes.jsx'
import { ContactHeroBlueprint, RouteSectionGraphic } from '../components/StandardVisuals.jsx'

const hero = sectionHeroes.contact

function ContactFormArt(){
  return <div className="contact-form-art" aria-hidden="true">
    <svg viewBox="0 0 360 300" role="presentation" focusable="false">
      <path className="contact-form-art__rail" d="M72 222 C122 182 169 194 212 146 C248 106 276 118 308 88"/>
      <g className="contact-form-art__card contact-form-art__card--a"><rect x="56" y="60" width="126" height="78" rx="18"/><path d="M78 86h70M78 106h48"/><circle cx="154" cy="114" r="6"/></g>
      <g className="contact-form-art__card contact-form-art__card--b"><rect x="196" y="132" width="108" height="92" rx="18"/><path d="M218 160h54M218 181h66M218 202h38"/></g>
      <circle className="contact-form-art__node" cx="72" cy="222" r="8"/><circle className="contact-form-art__node contact-form-art__node--open" cx="308" cy="88" r="9"/>
    </svg>
  </div>
}

export default function Contact(){
  return <StandardPage
    eyebrow={hero.eyebrow}
    accent="contact"
    title={<HeroTitle hero={hero}/>}
    intro={hero.intro}
    heroNote={hero.heroNote}
    heroVisual={<ContactHeroBlueprint/>}
    heroAction={<a className="pill pill--primary route-hero__cta" href="#contact-form">Send a brief <span>↗</span></a>}
  >
    <section className="section section--contact-stage route-authored-section">
      <RouteSectionGraphic variant="contact"/>
      <div className="route-wrap contact-page-grid">
        <div className="contact-page-copy route-section-intro">
          <span className="kicker">DIRECT CONTACT</span>
          <h2>Start with the real constraint.</h2>
          <p className="contact-page-copy__lead">A rough scope, live URL, reference, delivery window or even a problem statement is enough. I can help turn that into a clear production starting point.</p>
          <a className="contact-big contact-big--stacked" href="mailto:brief@usmankhairdin.com">brief@usmankhairdin.com <span>↗</span></a>
          <p>Lahore, Pakistan · Working with agencies and clients globally.</p>
          <div className="contact-notes contact-notes--premium js-horizontal-reorder"><span>PRODUCT UI</span><span>FRONTEND</span><span>AI-ASSISTED BUILD</span><span>WHITE-LABEL</span><span>PAID PILOT</span></div>
          <div className="contact-signal" aria-hidden="true"><b>BRIEF</b><i/><b>REVIEW</b><i/><b>START</b></div>
          <aside className="contact-intake-note"><span>USEFUL STARTING POINT</span><p>Share what exists, what needs to change and when you need it. If the brief is still forming, say that — clarity can be part of the first pass.</p></aside>
        </div>
        <div className="contact-form-shell" id="contact-form"><div className="contact-form-shell__glow" aria-hidden="true"/><ContactFormArt/><ContactForm source="Portfolio contact page" /></div>
      </div>
    </section>
  </StandardPage>
}
