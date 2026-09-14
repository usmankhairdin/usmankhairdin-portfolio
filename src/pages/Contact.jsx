import StandardPage from './StandardPage.jsx'
import ContactForm from '../components/ContactForm.jsx'

export default function Contact(){
  return <StandardPage
    eyebrow="CONTACT"
    title={<>Send the <em>signal.</em></>}
    intro="Share the brief, the kind of support you need and the delivery window. A focused paid pilot is the simplest way to test the working fit."
  >
    <section className="section section--contact-stage"><div className="route-wrap contact-page-grid">
      <div className="contact-page-copy">
        <span className="kicker">DIRECT CONTACT</span>
        <a className="contact-big contact-big--stacked" href="mailto:usman.khairdin@gmail.com">usman.khairdin@gmail.com <span>↗</span></a>
        <p>Lahore, Pakistan · Working with agencies and clients globally.</p>
        <div className="contact-notes contact-notes--premium"><span>UI DESIGN</span><span>FRONTEND</span><span>WHITE-LABEL</span><span>PAID PILOT</span></div>
        <div className="contact-signal" aria-hidden="true"><b>BRIEF</b><i/><b>REVIEW</b><i/><b>START</b></div>
      </div>
      <div className="contact-form-shell"><div className="contact-form-shell__glow" aria-hidden="true"/><ContactForm source="Portfolio contact page" /></div>
    </div></section>
  </StandardPage>
}
