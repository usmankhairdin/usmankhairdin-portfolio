import StandardPage from './StandardPage.jsx'

const services = [
  ['01','Website & landing page design','Premium, conversion-aware website and landing-page UI with responsive states and developer-ready structure.'],
  ['02','SaaS / dashboard UI','Product screens, dashboards, CRM/ERP/HRM-style interfaces, workflows and reusable component systems.'],
  ['03','Website redesign','Existing websites reworked for clearer hierarchy, stronger usability, accessibility and modern responsive behaviour.'],
  ['04','Frontend development','Responsive HTML/CSS, TailwindCSS, Bootstrap and React implementation from approved UI or an existing design system.'],
  ['05','Design → React / Tailwind','Figma, Adobe XD or Photoshop designs translated into maintainable responsive frontend code.'],
  ['06','White-label agency production','Overflow UI and frontend delivery behind an agency brand, from a defined brief through client-ready handoff.'],
]

export default function Services(){
  return <StandardPage
    eyebrow="SERVICES"
    title={<>Signal becomes <em>system.</em></>}
    intro="Focused UI design and frontend production for agencies, product teams and selected direct clients."
  >
    <section className="section section--service-stack"><div className="route-wrap service-list service-list--premium">
      {services.map(([n,t,d],index)=><article key={n} style={{'--service-index':index}}><span>{n}</span><h3>{t}</h3><p>{d}</p><i>↗</i></article>)}
    </div></section>

    <section className="section section--soft section--delivery-system">
      <div className="route-wrap split">
        <div><span className="kicker">DELIVERY SYSTEM</span><h2>A clear brief, then focused production.</h2><div className="delivery-schematic" aria-hidden="true"><b>01</b><i/><b>02</b><i/><b>03</b><i/><b>04</b></div></div>
        <div className="agency-steps agency-steps--premium">
          <div><b>01</b><span>Brief, references and required output</span></div>
          <div><b>02</b><span>UI direction / component logic</span></div>
          <div><b>03</b><span>Responsive states and frontend build</span></div>
          <div><b>04</b><span>Async review and client-ready handoff</span></div>
        </div>
      </div>
    </section>

    <section className="section section--tech-stage">
      <div className="route-wrap service-tech">
        <span className="kicker">TOOLS & STACK</span>
        <h2>Figma, Adobe XD or Photoshop — whichever the client wants.</h2>
        <div className="contact-notes contact-notes--premium"><span>HTML5</span><span>CSS3</span><span>TAILWINDCSS</span><span>BOOTSTRAP 3/4/5</span><span>REACT</span><span>WCAG</span><span>RESPONSIVE UI</span></div>
      </div>
    </section>
  </StandardPage>
}
