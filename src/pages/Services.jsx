import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import { TECH_TAG_MARKS } from '../components/TechTagMarks.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import EditorialEngagement, { EditorialLink } from '../components/editorial/EditorialEngagement.jsx'
import useEditorialMotion from '../components/editorial/useEditorialMotion.js'
import GroundedSculpture from '../components/editorial/GroundedSculpture.jsx'
import './Services.css'

const services = [
  { title: 'Product & UI/UX design', description: 'Make complex workflows feel clear. Product flows, SaaS dashboards and reusable interface systems shaped around the people using them.', scope: ['User flows', 'Responsive screens', 'Design systems'] },
  { title: 'Websites & redesign', description: 'Give your business a clearer presence. Websites and landing pages with considered content, a distinct visual direction and a straightforward path to enquiry.', scope: ['Website design', 'Landing pages', 'Redesigns'] },
  { title: 'Frontend implementation', description: 'Carry approved design into the browser. Responsive React, Tailwind CSS and HTML/CSS implementation, with careful attention to states, accessibility and interaction.', scope: ['Design-to-code', 'Reusable components', 'Responsive frontend'] },
]
const stackTags = [
  ['figma', 'Figma'], ['react', 'React'], ['tailwind', 'Tailwind CSS'], ['vite', 'Vite'],
  ['html5', 'HTML5'], ['css3', 'CSS3'], ['javascript', 'JavaScript'], ['photoshop', 'Photoshop'],
]
const supportingTags = [
  ['claude', 'Claude'], ['codex', 'Codex'], ['lovable', 'Lovable'], ['bolt', 'Bolt'],
  ['v0', 'v0'], ['builder', 'Builder'], ['more', 'And many more…'],
]

function StackTags({ items, label }) {
  return <ul className="services-editorial__tags web-tag-group" aria-label={label}>
    {items.map(([id, text]) => <li key={id}>{TECH_TAG_MARKS[id]}<span>{text}</span></li>)}
  </ul>
}

export default function Services() {
  const root = useRef(null)
  useEditorialMotion(root)
  // The floor shadow is a separate layer; show it only once the artwork has loaded.
  useEffect(() => {
    const sculpture = root.current?.querySelector('.services-editorial__sculpture')
    const image = sculpture?.querySelector('img')
    if (!image) return undefined
    const reveal = () => { sculpture.dataset.artworkReady = 'true' }
    if (image.complete && image.naturalWidth) reveal()
    else image.addEventListener('load', reveal, { once: true })
    return () => image.removeEventListener('load', reveal)
  }, [])
  return <div className="route-page services-editorial" ref={root}>
    <Header />
    <main id="main-content" tabIndex={-1}>
      <section className="services-editorial__hero" aria-labelledby="services-title">
        <HeroSignalBackground measureCopy />
        <div className="services-editorial__wrap services-editorial__hero-layout">
          <div className="services-editorial__hero-copy route-hero__copy">
            <h1 id="services-title">From UX to<br /><em>production.</em></h1>
            <p>Product &amp; UI/UX design, websites and responsive frontend. One&nbsp;partner, from first screen to finished build.</p>
            <div className="services-editorial__actions">
              <ActionLink to="/contact/">Discuss your project <span aria-hidden="true">↗</span></ActionLink>
              <EditorialLink to="/work/">Explore the work</EditorialLink>
            </div>
          </div>
          <GroundedSculpture src="/assets/services/interface-sculpture.webp" className="services-editorial__sculpture" surfaceLightOnly />
        </div>
      </section>

      <section className="services-editorial__offerings" aria-labelledby="services-offerings-title">
        <div className="services-editorial__wrap services-editorial__offerings-layout">
          <div className="services-editorial__intro" data-editorial-reveal>
            <h2 id="services-offerings-title">The right help,<br />at the <em>right stage.</em></h2>
            <p>A new product, an existing website or an approved design ready to build. Bring me in where you need the work.</p>
            <p className="services-editorial__modes">Design only. Frontend only.<br />Or design and build, together.</p>
          </div>
          <div className="services-editorial__list">
            {services.map(({ title, description, scope }) => <article key={title} data-editorial-reveal>
              <h3>{title}</h3><p>{description}</p>
              <ul aria-label={`${title} includes`}>{scope.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>)}
          </div>
        </div>
      </section>

      <section className="services-editorial__proof" data-editorial-loop aria-labelledby="services-proof-title">
        <div className="services-editorial__wrap services-editorial__proof-layout">
          <div className="services-editorial__proof-copy" data-editorial-reveal>
            <h2 id="services-proof-title">Clarity,<br />carried into<br />the <em>browser.</em></h2>
            <p>Rantle brings product information and sourcing enquiries into one responsive website.</p>
            <EditorialLink to="/work/rantle/">Explore Rantle</EditorialLink>
            <span className="services-editorial__credit">Website design · Frontend</span>
          </div>
          <div className="services-editorial__preview-stage" data-editorial-reveal>
            <Link to="/work/rantle/" className="services-editorial__preview" aria-label="Explore the Rantle case study">
              <img src="/assets/projects/rantle/showcase.webp" srcSet="/assets/projects/rantle/showcase-1x.webp 1440w, /assets/projects/rantle/showcase.webp 2880w" sizes="(max-width: 700px) 90vw, 60vw" width="1440" height="900" loading="lazy" decoding="async" alt="Rantle electronics sourcing website with product navigation and enquiry action" />
            </Link>
          </div>
        </div>
      </section>

      <section className="services-editorial__delivery" aria-labelledby="services-delivery-title">
        <div className="services-editorial__wrap services-editorial__delivery-layout">
          <div className="services-editorial__toolkit" data-editorial-reveal>
            <h2 id="services-delivery-title">Thoughtful tools.<br /><em>Practical delivery.</em></h2>
            <p>Figma for the design. A component-based frontend for the build. The stack follows the brief, not the other way around.</p>
            <StackTags items={stackTags} label="Core design and frontend tools" />
            <p className="services-editorial__support-note">AI-assisted tools support iteration. Design judgment stays human.</p>
            <StackTags items={supportingTags} label="Supporting production tools" />
          </div>
          <div className="services-editorial__delivery-copy" data-editorial-reveal>
            <div><h3>A clear brief</h3><p>Agree the output, references and scope before production begins.</p></div>
            <div><h3>Focused production</h3><p>Review the direction, then work through the screens, components and responsive states.</p></div>
            <div><h3>A considered handoff</h3><p>Async review and organised design files or frontend work, ready for your next step.</p></div>
            <aside><h3>Part of your agency team.</h3><p>Behind-the-scenes design and frontend production, delivered under your brand.</p><EditorialLink to="/for-agencies/">How white-label work fits</EditorialLink></aside>
          </div>
        </div>
      </section>
      <EditorialEngagement />
    </main>
    <Footer />
  </div>
}
