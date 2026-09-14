import { Link } from 'react-router-dom'
import StandardPage from './StandardPage.jsx'
import ProjectImage from '../components/ProjectImage.jsx'
import { projects } from '../data/projects.js'

export default function Work(){
  return <StandardPage
    eyebrow="SELECTED WORK"
    title={<>Real work. <em>Real surfaces.</em></>}
    intro="Six selected projects across hospitality, benefits, logistics, electronics, entertainment and lead generation. Each project opens into a factual case page, with the public project available in a separate tab."
  >
    <section className="section section--work-showcase">
      <div className="route-wrap work-intro-rail" aria-hidden="true">
        <span>SELECTED / 06</span><i/><b>LIVE + PUBLIC PORTFOLIO BUILDS</b><i/><span>UI × FRONTEND</span>
      </div>
      <div className="route-wrap work-grid work-grid--premium">
        {projects.map((p,i)=><article className="project-card project-card--premium" key={p.slug} style={{'--accent':p.accent}}>
          <Link to={`/work/${p.slug}/`} className="project-card__media" aria-label={`View ${p.title} case study`}>
            <ProjectImage project={p} alt={`${p.title} project preview`} eager={i < 2} />
            <span className="project-card__view">View case study <b>↗</b></span>
          </Link>
          <div className="project-card__body">
            <div className="project-card__meta"><span>{p.category}</span><span>{p.status}</span></div>
            <Link to={`/work/${p.slug}/`} className="project-card__title"><h3>{p.title}</h3></Link>
            <p className="project-card__summary">{p.summary}</p>
            <div className="project-card__footer">
              <span>{p.role}</span>
              <div>
                <Link to={`/work/${p.slug}/`}>Case study ↗</Link>
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">Live project ↗</a>
              </div>
            </div>
          </div>
        </article>)}
      </div>
    </section>

    <section className="section section--soft section--evidence-band"><div className="route-wrap split">
      <div><span className="kicker">NO PADDED CASE STUDIES</span><h2>The interface is the proof.</h2></div>
      <div className="stack"><p>Project pages keep the context factual: what the product is, what I worked on, and the live public link when one is available.</p><p>Live links always open in a new tab, so the portfolio stays open while you review the actual project.</p></div>
    </div></section>
  </StandardPage>
}
