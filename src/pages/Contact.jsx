import ContactForm from '../components/ContactForm.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import EditorialPage, { EditorialHero } from '../components/editorial/EditorialPage.jsx'
import { EditorialLink } from '../components/editorial/EditorialEngagement.jsx'
import './Contact.css'

export default function Contact() {
  return <EditorialPage className="route-page--contact contact-editorial">
    <EditorialHero
      id="contact-title"
      title={<>Let’s talk about<br /><em>your next project.</em></>}
      intro="A product to shape, a website to rethink or a design ready to build. Send a short brief and I’ll reply by&nbsp;email."
      sculpture="/assets/contact/conversation-sculpture.webp"
      actions={<><ActionLink href="#contact-form">Send a brief <span aria-hidden="true">↗</span></ActionLink><a className="editorial-link" href="mailto:brief@usmankhairdin.com"><span>Prefer email?</span><span aria-hidden="true">↗</span></a></>}
    />
    <section className="contact-editorial__intake" aria-labelledby="contact-intake-title">
      <div className="editorial-wrap contact-editorial__layout">
        <div className="contact-editorial__copy" data-editorial-reveal>
          <h2 id="contact-intake-title">Start with<br /><em>what you have.</em></h2>
          <p>A rough scope, reference or live URL is enough to begin. Share what exists, what needs to change and your timing. Only your name, email and brief are&nbsp;required.</p>
          <a className="contact-editorial__email" href="mailto:brief@usmankhairdin.com">brief@usmankhairdin.com <span aria-hidden="true">↗</span></a>
          <p className="contact-editorial__location">Based in Lahore, Pakistan.<br />Working with clients and agencies globally.</p>
          <div className="contact-editorial__guidance">
            <h3>Coming from an agency?</h3>
            <p>White-label design and frontend production, starting with a focused paid&nbsp;pilot.</p>
            <EditorialLink to="/for-agencies/">Explore the partnership model</EditorialLink>
          </div>
        </div>
        <div className="contact-form-shell" id="contact-form">
          <ContactForm source="Portfolio contact page" />
        </div>
      </div>
    </section>
  </EditorialPage>
}
