import { useRef } from 'react'
import { Link } from 'react-router-dom'
import EditorialPage from '../components/editorial/EditorialPage.jsx'
import EditorialEngagement, { EditorialLink } from '../components/editorial/EditorialEngagement.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import { featuredProjects, workProjects } from '../data/projects.js'
import WorkProject from './WorkProject.jsx'
import useWorkPresentation from './useWorkPresentation.js'
import { ActionLink } from '../components/ui/Action.jsx'
import './Work.css'

export default function Work(){
 const gallery = useRef(null)
 useWorkPresentation(gallery)
 return <EditorialPage className="route-page--work work-editorial">
  <section className="work-intro" aria-labelledby="work-title">
   <HeroSignalBackground measureCopy />
   <div className="editorial-wrap">
    <div className="work-intro__heading">
     <h1 id="work-title">The work.<br/><em>In full view.</em></h1>
     <div className="work-intro__copy">
      <p>Product interfaces, websites and responsive frontend. Explore the decisions, the context and the finished work.</p>
      <EditorialLink to="/contact/">Discuss a project</EditorialLink>
     </div>
    </div>
    <nav className="work-index" aria-label="Jump to a project">
     <span className="work-index__label">Selected work <b>{workProjects.length}</b></span>
     <div>{workProjects.map(p=><a key={p.slug} href={`#project-${p.slug}`}>{p.title}<span aria-hidden="true">↓</span></a>)}</div>
    </nav>
   </div>
  </section>
  <div ref={gallery} className="work-gallery" aria-label="Selected projects">
   {workProjects.map((project,index)=><WorkProject key={project.slug} project={project} eager={index===0}/>) }
  </div>
  <section className="work-spatial" aria-labelledby="work-spatial-title">
   <div className="editorial-wrap">
    <header><p className="work-eyebrow">ANOTHER WAY TO EXPLORE</p><h2 id="work-spatial-title">The portfolio,<br/><em>as a place.</em></h2></header>
    {featuredProjects.map(project=><article className="work-spatial__project" key={project.href}>
     <Link className="work-spatial__image" to={project.href} aria-label={`View ${project.title} case study`}><img src={project.image} width="1440" height="900" alt={project.imageAlt} loading="lazy" decoding="async"/></Link>
     <div><h3>{project.title}</h3><p>{project.summary}</p><ActionLink to={project.href}>View case study <span aria-hidden="true">↗</span></ActionLink></div>
    </article>)}
   </div>
  </section>
  <EditorialEngagement/>
 </EditorialPage>
}
