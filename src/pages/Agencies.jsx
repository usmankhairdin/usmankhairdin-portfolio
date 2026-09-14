import { Link } from 'react-router-dom'
import StandardPage from './StandardPage.jsx'

export default function Agencies(){
  return <StandardPage
    eyebrow="FOR AGENCIES"
    title={<>More hands. <em>Less complexity.</em></>}
    intro="White-label UI design and frontend production for digital agencies that need senior overflow capacity without adding permanent headcount."
  >
    <section className="section section--agency-model"><div className="route-wrap split">
      <div><span className="kicker">THE MODEL</span><h2>Keep the client relationship. Route a defined slice of delivery through me.</h2><div className="agency-flow" aria-hidden="true"><span>YOUR AGENCY</span><i>→</i><span>UI × FE</span><i>→</i><span>CLIENT READY</span></div></div>
      <div className="stack">
        <p>Your agency owns the relationship, strategy and account. I plug into the production layer for the UI, frontend, or both.</p>
        <p>The goal is not to add another agency layer. It is to give your team reliable extra capacity when deadlines, redesigns or product work exceed the internal bandwidth.</p>
        <div className="contact-notes contact-notes--premium"><span>WHITE-LABEL</span><span>ASYNC-FRIENDLY</span><span>UI DESIGN</span><span>FRONTEND</span><span>PAID PILOT</span></div>
      </div>
    </div></section>

    <section className="section section--soft section--agency-process"><div className="route-wrap split">
      <div><span className="kicker">HOW WE START</span><h2>Test the fit on real work, not a large free exercise.</h2></div>
      <div className="agency-steps agency-steps--premium">
        <div><b>01</b><span>Send a defined brief or one production gap</span></div>
        <div><b>02</b><span>Agree a small paid pilot</span></div>
        <div><b>03</b><span>Review the output asynchronously</span></div>
        <div><b>04</b><span>Scale into repeat overflow support if the fit works</span></div>
      </div>
    </div></section>

    <section className="section section--agency-fit"><div className="route-wrap agency-fit-grid agency-fit-grid--premium">
      <div><span className="kicker">GOOD FIT</span><h3>Website / landing-page production</h3><p>Design-only, frontend-only or both.</p><i aria-hidden="true">WEB</i></div>
      <div><span className="kicker">GOOD FIT</span><h3>SaaS & dashboard UI</h3><p>Dense workflows, responsive states and component consistency.</p><i aria-hidden="true">UI</i></div>
      <div><span className="kicker">GOOD FIT</span><h3>Design-to-code delivery</h3><p>Figma, XD or Photoshop translated into responsive production code.</p><i aria-hidden="true">FE</i></div>
      <div className="agency-fit-grid__cta"><span className="kicker">NEXT STEP</span><h3>Start with one paid pilot.</h3><p><Link to="/contact/">Send a brief ↗</Link></p><i aria-hidden="true">GO</i></div>
    </div></section>
  </StandardPage>
}
