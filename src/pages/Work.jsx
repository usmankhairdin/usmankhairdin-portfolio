import { useRef } from 'react'
import { Link } from 'react-router-dom'
import StandardPage from './StandardPage.jsx'
import { projects } from '../data/projects.js'
import { HeroTitle, sectionHeroes } from '../data/sectionHeroes.jsx'
import ProjectMetaRail from '../components/ProjectMetaRail.jsx'
import { RouteSectionGraphic, WorkHeroBlueprint } from '../components/StandardVisuals.jsx'
import { ProjectCapture } from '../components/ProjectBrowserPreview.jsx'
import { disciplineFor, hostLabel, showcaseImage, surfacesFor, toneFor, useShowcaseMotion } from './workShowcase.js'
import '../components/BrowserFrame.css'
import './Work.css'

const hero = sectionHeroes.work

export default function Work(){
  const showcaseRef=useRef(null)
  useShowcaseMotion(showcaseRef)

  return <StandardPage
    eyebrow={hero.eyebrow}
    accent="work"
    title={<HeroTitle hero={hero}/>}
    intro={hero.intro}
    heroNote={hero.heroNote}
    heroVisual={<WorkHeroBlueprint/>}
  >
    <section ref={showcaseRef} className="section--work-showcase wk-showcase" aria-label={`${projects.length} selected projects`} style={{'--wk-n':projects.length}}>
      <div className="wk-pin">
      <div className="wk-stage">
      <div className="wk-track">
      {projects.map((project,index)=>{
        const number=String(index+1).padStart(2,'0')
        const image=showcaseImage(project)
        const surfaces=surfacesFor(project)
        const href=`/work/${project.slug}/`
        return <article
          className="wk-project"
          key={project.slug}
          data-tone={toneFor(project)}
          style={{'--wk-accent':project.accent,'--wk-bg-l':surfaces.light,'--wk-bg-d':surfaces.dark,'--wk-chars':project.title.length,'--wk-i':index}}
        >
          <div className="wk-project__atmosphere" aria-hidden="true"/>
          <span className="wk-project__ghost" aria-hidden="true">{number}</span>

          <div className="wk-project__inner">
            <ProjectMetaRail label="Selected Work" context={project.category} discipline={disciplineFor(project)}/>
            <header className="wk-project__head">
              <p className="wk-project__meta"><em>{project.status}</em></p>
              <h2 className="wk-project__title"><Link to={href} data-cursor="view">{project.title}</Link></h2>
            </header>

            <div className="wk-project__stage">
              <Link to={href} className="wk-frame ui-frame" data-cursor="view" aria-label={`View ${project.title} case study`}>
                <span className="ui-frame__bar" aria-hidden="true"><i/><i/><i/><span className="ui-frame__url">{hostLabel(project.liveUrl)}</span></span>
                <ProjectCapture
                  key={project.slug}
                  project={project}
                  eager={index===0}
                  className="wk-frame__screen ui-frame__screen"
                  placeholderSource={image.src}
                  placeholderSrcSet={image.srcSet}
                  placeholderSizes="(max-width: 1099px) 92vw, 60vw"
                />
              </Link>
              <span className="wk-project__caption">{project.mediaAlt.hero}</span>
            </div>

            <div className="wk-project__body">
              <p className="wk-project__summary">{project.summary}</p>
              <dl className="wk-project__facts">
                <div><dt>{project.contextLabel||'ROLE / CONTEXT'}</dt><dd>{project.role}</dd></div>
                <div><dt>INTERFACE EVIDENCE</dt><dd className="wk-project__evidence">{project.evidenceTitle}</dd></div>
              </dl>
              <div className="wk-project__actions">
                <Link to={href} className="pill pill--primary route-hero__cta" aria-label={`View ${project.title} case study`}>View case study <span aria-hidden="true">↗</span></Link>
                <a href={project.liveUrl} className="text-cta" target="_blank" rel="noopener noreferrer">Open live project ↗</a>
              </div>
            </div>
          </div>
        </article>
      })}
      </div>
      <div className="wk-progress" aria-hidden="true"><b/></div>
      </div>
      </div>
    </section>

    <section className="section section--soft section--evidence-band route-authored-section"><RouteSectionGraphic variant="work-evidence"/><div className="route-wrap split">
      <div className="evidence-band__main">
        <span className="kicker">NO PADDED CASE STUDIES</span>
        <h2>The interface is the proof.</h2>
        <div className="evidence-frame" aria-hidden="true">
          <div className="evidence-frame__bar"><i/><i/><i/><span>PUBLIC PROJECT ↗</span></div>
          <div className="evidence-frame__screen">
            <div className="evidence-frame__hero"><b/><b/></div>
            <div className="evidence-frame__cards"><b/><b/><b/></div>
          </div>
          <span className="evidence-frame__corner evidence-frame__corner--tl"/><span className="evidence-frame__corner evidence-frame__corner--tr"/><span className="evidence-frame__corner evidence-frame__corner--bl"/><span className="evidence-frame__corner evidence-frame__corner--br"/>
          <span className="evidence-frame__stamp">LOCAL CAPTURE</span>
        </div>
      </div>
      <div className="evidence-band__points">
        <article className="evidence-point">
          <span className="evidence-point__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3.2"/></svg></span>
          <div><span className="evidence-point__label">LOCAL CAPTURES</span><p>Every primary image is an optimized local capture of the linked public project. The runtime no longer depends on an external screenshot service to make selected work visible.</p></div>
        </article>
        <article className="evidence-point">
          <span className="evidence-point__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="m9 14.5 2 2 4-4.5"/></svg></span>
          <div><span className="evidence-point__label">STATED CONTEXT</span><p>Project pages state only the context and contribution supported by the current portfolio record, with limitations called out where they matter.</p></div>
        </article>
        <div className="contact-notes contact-notes--premium evidence-band__tags js-horizontal-reorder"><span>LOCAL CAPTURE</span><span>LINKED LIVE PROJECT</span><span>LIMITS STATED</span></div>
      </div>
    </div></section>
  </StandardPage>
}
