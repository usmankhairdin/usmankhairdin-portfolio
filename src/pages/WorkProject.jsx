import { Link } from 'react-router-dom'
import { surfacesFor, toneFor, disciplineFor } from '../data/projects.js'
import { showcaseImage } from './workShowcase.js'
import { ProjectCapture } from '../components/ProjectBrowserPreview.jsx'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'

export default function WorkProject({project,eager=false}){
 const surfaces=surfacesFor(project)
 const image=showcaseImage(project)
 const href=`/work/${project.slug}/`
 return <section id={`project-${project.slug}`} className="work-project" data-project={project.slug} data-tone={toneFor(project)}
  style={{'--work-accent':project.accent,'--work-light':surfaces.light,'--work-dark':surfaces.dark}}
  aria-labelledby={`title-${project.slug}`}>
  <div className="work-project__inner">
   <div className="work-project__rail"><span>{project.category}</span><span>{project.status}</span></div>
   <header className="work-project__heading">
    <h2 id={`title-${project.slug}`}><Link to={href}>{project.title}</Link></h2>
    <p>{project.summary}</p>
   </header>
   <figure className="work-project__visual">
    <Link className="work-project__frame ui-frame" to={href} aria-label={`View ${project.title} case study`}>
     <ProjectCapture project={project} eager={eager} className="ui-frame__screen" placeholderSource={image.src} placeholderSrcSet={image.srcSet} placeholderSizes="(max-width:700px) 90vw, 82vw"/>
    </Link>
   </figure>
   <footer className="work-project__footer">
    <div className="work-project__discipline"><span>{project.contextLabel||'ROLE / CONTEXT'}</span><p>{project.role||disciplineFor(project)}</p></div>
    <div className="work-project__actions">
     <TextCTA href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} live website (opens in a new tab)`}>Live website <span aria-hidden="true">↗</span></TextCTA>
     <ActionLink to={href} aria-label={`View case study: ${project.title}`}>View case study <span aria-hidden="true">↗</span></ActionLink>
    </div>
   </footer>
  </div>
 </section>
}
