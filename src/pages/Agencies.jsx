import EditorialPage, { EditorialHero } from '../components/editorial/EditorialPage.jsx'
import { EditorialLink } from '../components/editorial/EditorialEngagement.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import './Agencies.css'

const PARTNER_MAILTO = 'mailto:partner@usmankhairdin.com?subject=White-label%20partnership%20enquiry'

const pilotSteps = [
  { title: 'Share a defined brief', detail: 'One project, interface or production need to work through together.' },
  { title: 'Agree the paid pilot', detail: 'Set the scope, timing and output before production begins.' },
  { title: 'Review asynchronously', detail: 'Assess the work, communication and handoff within your process.' },
  { title: 'Explore repeat support', detail: 'Consider the next project together if the fit works for both sides.' },
]

const projectFits = [
  { title: 'Websites & landing pages', detail: 'Design only, frontend only or both, with responsive states considered from the start.' },
  { title: 'SaaS & dashboard UI', detail: 'Dense workflows, responsive application states and a consistent component system.' },
  { title: 'Design-to-code delivery', detail: 'Approved interface designs carried into responsive, production-ready frontend components.' },
]

export default function Agencies() {
  return <EditorialPage className="agencies-editorial">
    <EditorialHero
      id="agencies-title"
      title={<>Your agency.<br /><em>One team.</em></>}
      intro="Senior UI/UX design and frontend build for your client work. Delivered&nbsp;behind the scenes, under your agency&nbsp;name."
      sculpture="/assets/agencies/partnership-sculpture.webp"
      actions={<>
        <ActionLink href={PARTNER_MAILTO}>Discuss a partnership <span aria-hidden="true">↗</span></ActionLink>
        <EditorialLink to="/work/">Explore the work</EditorialLink>
      </>}
    />

    <section className="agencies-editorial__model" aria-labelledby="agencies-model-title">
      <div className="editorial-wrap agencies-editorial__model-layout">
        <div className="agencies-editorial__model-copy" data-editorial-reveal>
          <h2 id="agencies-model-title">Keep the client<br /><em>relationship.</em></h2>
          <p>I work from your brief, within your process, on a defined scope. Bring me in for UI design, frontend, or a focused slice of both.</p>
          <p className="agencies-editorial__model-note">Senior production support that fits behind your agency.</p>
        </div>
        <dl className="agencies-editorial__boundaries" aria-label="White-label delivery responsibilities">
          <div data-editorial-reveal><dt>Your agency leads.</dt><dd>You retain the client relationship, strategy and account.</dd></div>
          <div data-editorial-reveal><dt>I support production.</dt><dd>Product and UI/UX design, responsive frontend or a defined part of the delivery.</dd></div>
          <div data-editorial-reveal><dt>The work carries your name.</dt><dd>Polished, client-ready design or frontend work for you to deliver under your agency.</dd></div>
        </dl>
      </div>
    </section>

    <section className="agencies-editorial__pilot" aria-labelledby="agencies-pilot-title">
      <div className="editorial-wrap agencies-editorial__pilot-layout">
        <div className="agencies-editorial__pilot-copy" data-editorial-reveal>
          <h2 id="agencies-pilot-title">Start with<br />a focused<br /><em>paid pilot.</em></h2>
          <p>A defined piece of work lets us assess quality, communication and handoff before considering repeat support.</p>
        </div>
        <ol className="agencies-editorial__steps" aria-label="Starting a partnership">
          {pilotSteps.map(({ title, detail }) => <li key={title} data-editorial-reveal>
            <h3>{title}</h3><p>{detail}</p>
          </li>)}
        </ol>
      </div>
    </section>

    <section className="agencies-editorial__fit" aria-labelledby="agencies-fit-title">
      <div className="editorial-wrap agencies-editorial__fit-layout">
        <div className="agencies-editorial__fit-copy" data-editorial-reveal>
          <h2 id="agencies-fit-title">Where the<br /><em>work fits.</em></h2>
          <p>A clear production need, with room for considered design and careful implementation.</p>
          <EditorialLink to="/services/">Explore the services</EditorialLink>
        </div>
        <div className="agencies-editorial__fit-list">
          {projectFits.map(({ title, detail }) => <article key={title} data-editorial-reveal>
            <h3>{title}</h3><p>{detail}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="agencies-editorial__close" aria-labelledby="agencies-close-title">
      <div className="editorial-wrap agencies-editorial__close-layout" data-editorial-reveal>
        <div><h2 id="agencies-close-title">Explore a <em>first project.</em></h2><p>Send one defined brief or the production gap you need help with.</p></div>
        <ActionLink href={PARTNER_MAILTO}>Discuss a partnership <span aria-hidden="true">↗</span></ActionLink>
      </div>
    </section>
  </EditorialPage>
}
