import { useRef } from 'react'
import { Link } from 'react-router-dom'
import StandardPage from './StandardPage.jsx'
import { projects } from '../data/projects.js'
import { HeroTitle, sectionHeroes } from '../data/sectionHeroes.jsx'
import ProjectMetaRail from '../components/ProjectMetaRail.jsx'
import { RouteSectionGraphic, WorkHeroBlueprint } from '../components/StandardVisuals.jsx'
import { ProjectCapture } from '../components/ProjectBrowserPreview.jsx'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'
import SectionIntro from '../components/ui/SectionIntro.jsx'
import { disciplineFor, hostLabel, showcaseImage, surfacesFor, toneFor, useShowcaseMotion } from './workShowcase.js'
import '../components/BrowserFrame.css'
import './Work.css'

const hero = sectionHeroes.work

const featuredProjects = [
  {
    title: 'Personal Portfolio — Web',
    href: '/work/personal-portfolio-web/',
    category: 'PRODUCT / WEB EXPERIENCE',
    summary: 'A self-initiated portfolio designed and built to connect product thinking, responsive UI and production frontend work.',
    tags: ['Product Design', 'UI/UX', 'Design System', 'Frontend'],
    image: '/assets/case-studies/personal-portfolio-web/home-light-desktop.webp',
    imageAlt: 'Personal Portfolio Web home experience with the design and build introduction',
  },
  {
    title: 'Personal Portfolio — 3D',
    href: '/work/personal-portfolio-3d/',
    category: 'SPATIAL / 3D EXPERIENCE',
    summary: 'An immersive counterpart that turns the same professional story into navigable rooms and purposeful interaction.',
    tags: ['Spatial Experience', 'Interaction Design', 'WebGL', 'Frontend'],
    image: '/assets/case-studies/personal-portfolio-3d/about-room.webp',
    imageAlt: 'Personal Portfolio 3D About room with spatial typography, artwork and furniture',
  },
]

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
    <section className="wk-featured" aria-labelledby="wk-featured-title">
      <div className="route-wrap">
        <SectionIntro
          className="wk-featured__intro"
          eyebrow="THE PORTFOLIO AS PROJECT"
          title={<span id="wk-featured-title">Featured / Self-Initiated</span>}
          intro="Two connected expressions of the same design and frontend practice, created as independent portfolio projects."
        />
        <div className="wk-featured__list">
          {featuredProjects.map((project) => <article className="wk-featured__item" key={project.href}>
            <div className="wk-featured__copy">
              <span className="wk-featured__category">SELF-INITIATED <span aria-hidden="true">/</span> {project.category}</span>
              <h3><Link to={project.href} data-cursor="view">{project.title}</Link></h3>
              <p>{project.summary}</p>
              <ul className="wk-featured__tags web-tag-group" aria-label="Project disciplines">
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <ActionLink to={project.href} aria-label={`View ${project.title} case study`}>View case study <span aria-hidden="true">↗</span></ActionLink>
            </div>
            <Link className="wk-featured__media" to={project.href} data-cursor="view" aria-label={`View ${project.title} case study`}>
              <img src={project.image} width="1440" height="900" alt={project.imageAlt} loading="lazy" decoding="async" />
            </Link>
          </article>)}
        </div>
      </div>
    </section>

    <section className="wk-selected" aria-labelledby="wk-selected-title">
      <div className="route-wrap">
        <span className="kicker">CLIENT / PRODUCT PROJECTS</span>
        <h2 id="wk-selected-title">Selected Work</h2>
        <p>Six projects presented through real interface captures and clearly stated context.</p>
      </div>
    </section>

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
                <ActionLink to={href} className="route-hero__cta" aria-label={`View ${project.title} case study`}>View case study <span aria-hidden="true">↗</span></ActionLink>
                <TextCTA href={project.liveUrl} target="_blank" rel="noopener noreferrer">Open public project ↗</TextCTA>
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
        <span className="kicker">VERIFIED INTERFACE EVIDENCE</span>
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
          <div><span className="evidence-point__label">LOCAL CAPTURES</span><p>Each selected project uses local interface captures so the design, hierarchy and responsive presentation stay visible without inflated claims.</p></div>
        </article>
        <article className="evidence-point">
          <span className="evidence-point__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="m9 14.5 2 2 4-4.5"/></svg></span>
          <div><span className="evidence-point__label">STATED CONTEXT</span><p>Each case study separates verified contribution from project context and avoids claiming unsupported outcomes.</p></div>
        </article>
        <div className="contact-notes contact-notes--premium evidence-band__tags web-tag-group"><span>LOCAL CAPTURES</span><span>PUBLIC PROJECT LINKS</span><span>SCOPE STATED</span></div>
      </div>
    </div></section>
  </StandardPage>
}
