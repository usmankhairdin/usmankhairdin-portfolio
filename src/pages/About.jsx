import StandardPage from './StandardPage.jsx'

export default function About(){
  return <StandardPage
    eyebrow="ABOUT / THE PRACTICE"
    title={<>One thought from <em>brief</em> to build.</>}
    intro="I’m Usman Khair Din, a UX/UI designer and front-end developer with 16+ years of experience across websites, product interfaces and responsive production."
  >
    <section className="section section--about-signature">
      <div className="route-wrap split">
        <div>
          <span className="kicker">HOW I WORK</span>
          <h2>Design decisions that survive implementation.</h2>
          <div className="signal-track" aria-hidden="true"><span>BRIEF</span><i/><span>UI SYSTEM</span><i/><span>BUILD</span></div>
        </div>
        <div className="stack">
          <p>I work across interface direction and frontend implementation, so the idea approved in design stays recognisable when it reaches the browser.</p>
          <p>For agency partners, that means one senior production partner can take a defined slice of delivery from a written brief through responsive, client-ready output.</p>
          <div className="proof-grid proof-grid--premium">
            <div><b>16+</b><span>Years in web, UI and frontend</span></div>
            <div><b>UI × FE</b><span>Design and implementation together</span></div>
            <div><b>ASYNC</b><span>Written, agency-friendly collaboration</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="section section--soft section--timeline-premium">
      <div className="route-wrap experience-grid">
        <div>
          <span className="kicker">EXPERIENCE</span>
          <h2>Long-form product thinking, practical web delivery.</h2>
          <div className="experience-orbit" aria-hidden="true"><span>PRODUCT</span><span>WEB</span><span>FRONTEND</span></div>
        </div>
        <div className="timeline-list timeline-list--premium">
          <article><span>2019 — PRESENT</span><h3>Product Designer · eWorx International Pvt. Ltd.</h3><p>UI/UX work across internal business products including payroll, agency-management and business-management systems.</p></article>
          <article><span>2012 — 2019</span><h3>Senior Web Designer · ArhamSoft Pvt. Ltd.</h3><p>Website design and frontend production across client projects, responsive interfaces and production handoff.</p></article>
          <article><span>INDEPENDENT PRACTICE</span><h3>White-label UI design & frontend production</h3><p>Selected direct work plus agency overflow support for websites, landing pages, SaaS UI, dashboards and responsive frontend delivery.</p></article>
        </div>
      </div>
    </section>

    <section className="section section--toolscape">
      <div className="route-wrap tool-grid tool-grid--premium">
        <div><span className="kicker">DESIGN</span><h3>Figma · Adobe XD · Photoshop</h3><p>I design in the tool the client or agency prefers.</p><i aria-hidden="true">01</i></div>
        <div><span className="kicker">FRONTEND</span><h3>HTML5 · CSS3 · Tailwind · Bootstrap · React</h3><p>Responsive implementation with attention to structure, accessibility and consistency.</p><i aria-hidden="true">02</i></div>
        <div><span className="kicker">UX / QUALITY</span><h3>WCAG · responsive states · design systems</h3><p>Clear hierarchy, semantic structure, usable contrast and implementation-aware UI decisions.</p><i aria-hidden="true">03</i></div>
      </div>
    </section>
  </StandardPage>
}
