import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProjectBrowserPreview from './ProjectBrowserPreview.jsx'
import { disciplineFor, toneFor } from '../data/projects.js'
import './ProjectDetailHero.css'

/**
 * The opening of every project case study: the same composition as that project's Work-showcase panel (content left, the large browser
 * visual right, on the project's own solid surface), translated into a full-height case-study hero that starts behind the floating
 * header. One shared component; each project only supplies its own data. It deliberately leaves out the Work index devices (no
 * "Selected Work" rail, no progress line, no ordinal / count labels).
 */
export default function ProjectDetailHero({ project }) {
  const heroRef = useRef(null)
  const tone = toneFor(project)
  const discipline = disciplineFor(project)

  // A project on a dark surface in the light theme puts the floating header's logo over dark artwork. While that surface is behind
  // the header, ask the header to use its light-logo treatment (the one it already has for the dark theme). Nothing else changes.
  useEffect(() => {
    if (tone !== 'dark') return undefined
    const el = heroRef.current
    const html = document.documentElement
    let observer
    const watch = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) html.setAttribute('data-header-tone', 'dark')
        else html.removeAttribute('data-header-tone')
      }, { rootMargin: `0px 0px ${-Math.max(0, window.innerHeight - 84)}px 0px` })
      observer.observe(el)
    }
    watch()
    window.addEventListener('resize', watch)
    return () => {
      window.removeEventListener('resize', watch)
      observer?.disconnect()
      html.removeAttribute('data-header-tone')
    }
  }, [tone])

  return <section ref={heroRef} className="pdh" data-tone={tone} data-project={project.slug} style={{ '--wk-chars': project.title.length }}>
    <div className="pdh__atmosphere" aria-hidden="true" />
    <div className="pdh__inner">
      <div className="pdh__copy">
        <p className="pdh__meta"><span>{project.category}</span><em>{project.status}</em></p>
        <h1 className="pdh__title">{project.title}</h1>
        <p className="pdh__summary">{project.summary}</p>
        <dl className="pdh__facts">
          <div><dt>{project.contextLabel || 'ROLE / CONTEXT'}</dt><dd>{project.role}</dd></div>
          {discipline && <div><dt>DISCIPLINE</dt><dd>{discipline}</dd></div>}
        </dl>
        <div className="pdh__actions">
          <a className="pill pill--primary route-hero__cta" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Open live project <span aria-hidden="true">↗</span></a>
          <Link className="text-cta" to="/work/">← All selected work</Link>
        </div>
      </div>
      <div className="pdh__visual">
        <ProjectBrowserPreview project={project} eager />
      </div>
    </div>
  </section>
}
