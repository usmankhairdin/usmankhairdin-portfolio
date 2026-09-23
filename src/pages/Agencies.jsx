import StandardPage from './StandardPage.jsx'
import { HeroTitle, sectionHeroes } from '../data/sectionHeroes.jsx'
import { AgenciesHeroBlueprint, RouteSectionGraphic } from '../components/StandardVisuals.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import SectionIntro from '../components/ui/SectionIntro.jsx'

const hero = {
  ...sectionHeroes.agencies,
  intro: 'Senior product and UI/UX design plus responsive frontend production for agency-led client work, delivered behind the scenes.',
}
const PARTNER_MAILTO = 'mailto:partner@usmankhairdin.com?subject=White-label%20partnership%20enquiry'

const STEP_ICONS = {
  brief: <><path d="M21 3 3 9.5l7.5 4 4 7.5L21 3z"/><path d="m10.5 13.5 4-4"/></>,
  pilot: <><path d="M9.5 4.5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v.5"/><rect x="5" y="4.5" width="14" height="16.5" rx="2.5"/><path d="m8.8 13.2 2.4 2.4 4.1-4.5"/></>,
  review: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></>,
  scale: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
}

function StepIcon({name}){
  return <svg className="agency-step__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{STEP_ICONS[name]}</svg>
}

export default function Agencies(){
  return <StandardPage
    eyebrow={hero.eyebrow}
    accent="agencies"
    title={<HeroTitle hero={hero}/>}
    intro={hero.intro}
    heroNote={hero.heroNote}
    heroVisual={<AgenciesHeroBlueprint/>}
    heroAction={<ActionLink className="route-hero__cta" href={PARTNER_MAILTO}>Discuss a partnership <span>↗</span></ActionLink>}
  >
    <section className="section section--agency-model route-authored-section">
      <RouteSectionGraphic variant="agency-model"/>
      <div className="route-wrap split">
        <SectionIntro
          className="agency-model__main"
          eyebrow="THE MODEL"
          title={<><span className="agency-h2__sentence">Keep the client relationship.</span> <span className="agency-h2__sentence">I take on UI design, frontend, or both.</span></>}
          intro="I work from your brief, within your process, on a defined scope. You receive client-ready UI design or responsive frontend work to deliver under your agency name."
        >
          <div className="agency-flow" aria-hidden="true"><span>YOUR AGENCY</span><i>→</i><span>UI × BUILD</span><i>→</i><span>CLIENT READY</span></div>
        </SectionIntro>
        <div className="stack agency-model__aside agency-surface-card">
          <p className="agency-model__lead">Senior overflow capacity without introducing another visible layer between you and the client.</p>
          <div className="agency-boundary" aria-label="White-label delivery boundaries"><div><span>AGENCY RETAINS</span><strong>Client relationship, strategy and account.</strong></div><div><span>PRODUCTION SUPPORT</span><strong>UI/UX design, responsive frontend or a defined slice of both.</strong></div><div><span>THE OUTPUT</span><strong>Polished, client-ready work under your agency.</strong></div></div>
          <div className="contact-notes contact-notes--premium web-tag-group"><span>WHITE-LABEL</span><span>ASYNC-FRIENDLY</span><span>UI/UX</span><span>FRONTEND</span><span>PAID PILOT</span></div>
        </div>
      </div>
    </section>

    <section className="section section--soft section--agency-process route-authored-section">
      <RouteSectionGraphic variant="agency-process"/>
      <div className="route-wrap split">
        <SectionIntro
          eyebrow="HOW WE START"
          title="Test the fit through a focused paid pilot."
          intro="A defined piece of work lets both sides assess quality, communication and handoff before considering repeat support."
        />
        <div className="agency-steps agency-steps--premium">
          <div><b>01</b><span>Share one defined brief or production need</span><StepIcon name="brief"/></div>
          <div><b>02</b><span>Agree scope, timing and a paid pilot</span><StepIcon name="pilot"/></div>
          <div><b>03</b><span>Review the output asynchronously</span><StepIcon name="review"/></div>
          <div><b>04</b><span>Explore repeat support if the fit works</span><StepIcon name="scale"/></div>
        </div>
      </div>
    </section>

    <section className="section section--agency-fit route-authored-section">
      <RouteSectionGraphic variant="agency-fit"/>
      <div className="route-wrap agency-fit-grid agency-fit-grid--premium">
        <div><span className="kicker">GOOD FIT</span><h3>Website / landing-page production</h3><p>Design-only, frontend-only or both, with responsive states considered from the start.</p><i aria-hidden="true">WEB</i></div>
        <div><span className="kicker">GOOD FIT</span><h3>SaaS & dashboard UI</h3><p>Dense workflows, responsive application states and component consistency.</p><i aria-hidden="true">UI</i></div>
        <div><span className="kicker">GOOD FIT</span><h3>Design-to-code delivery</h3><p>Approved interface designs translated into responsive, production-ready frontend components.</p><i aria-hidden="true">FE</i></div>
        <div className="agency-fit-grid__cta"><span className="kicker">NEXT STEP</span><h3>Explore a first project.</h3><p><a href={PARTNER_MAILTO}>Discuss a partnership ↗</a></p><i aria-hidden="true">GO</i></div>
      </div>
    </section>
  </StandardPage>
}
