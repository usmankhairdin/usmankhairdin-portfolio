import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ProjectImage from '../components/ProjectImage.jsx'
import { projects } from '../data/projects.js'

export default function Project(){
  const {slug}=useParams()
  const p=projects.find(x=>x.slug===slug)||projects[0]

  return <div className="route-page project-page" style={{'--accent':p.accent}}>
    <Header/>
    <main>
      <section className="project-hero"><div className="route-wrap">
        <div className="project-hero__meta"><span className="kicker">{p.category}</span><span>{p.status}</span></div>
        <h1>{p.title}</h1>
        <p>{p.summary}</p>
        <div className="project-hero-actions">
          <a className="pill pill--dark" href={p.liveUrl} target="_blank" rel="noopener noreferrer">View live project ↗</a>
          <Link className="project-back-link" to="/work/">← All selected work</Link>
        </div>
        <div className="project-signal-rail" aria-hidden="true"><span>REAL PROJECT</span><i/><span>UI × FRONTEND</span><i/><span>RESPONSIVE</span></div>
        <div className="browser-shot browser-shot--hero"><div className="browser-shot__bar"><i/><i/><i/><span>{p.liveUrl.replace(/^https?:\/\//,'').replace(/\/$/,'')}</span></div><ProjectImage project={p} variant="wide" eager /></div>
      </div></section>

      <section className="section section--project-role"><div className="route-wrap project-story">
        <div><span className="kicker">MY ROLE</span><h2>{p.role}</h2></div>
        <div><p>{p.contribution}</p><div className="project-tags">{p.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div>
      </div></section>

      <section className="section section--soft section--project-proof"><div className="route-wrap project-proof-grid">
        <div className="project-proof-copy"><span className="kicker">DELIVERED</span><h2>What the work covers.</h2>{p.deliverables.map(item=><p key={item}>↗ {item}</p>)}</div>
        <div className="browser-shot"><div className="browser-shot__bar"><i/><i/><i/><span>Desktop capture</span></div><ProjectImage project={p} /></div>
        <div className="mobile-shot"><ProjectImage project={p} variant="mobile" alt={`${p.title} mobile project capture`} /></div>
      </div></section>

      <section className="section section--project-close"><div className="route-wrap project-close">
        <span className="kicker">NEED A SIMILAR DELIVERY?</span>
        <h2>Send the brief. Start with a focused paid pilot.</h2>
        <div><a className="pill pill--dark" href={p.liveUrl} target="_blank" rel="noopener noreferrer">Open live site ↗</a><Link to="/contact/" className="pill project-contact-pill">Start a project ↗</Link></div>
      </div></section>
    </main>
    <Footer/>
  </div>
}
