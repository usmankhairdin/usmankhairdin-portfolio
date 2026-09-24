import { Navigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ProjectDetailHero from '../components/ProjectDetailHero.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import { disciplineFor, hostLabel, projects, surfacesFor } from '../data/projects.js'
import { brandFor, brandStyle } from '../data/projectBrands.js'
import { caseStudyFor } from '../data/projectCaseStudies.js'
import '../components/BrowserFrame.css'
import './Project.css'
import './ProjectBrand.css'

// Responsive `sizes` per placement, so each capture is fetched at the width the grid actually gives it (12 columns, 1320px).
const SIZES = {
  aside: '(max-width: 1099px) 92vw, 740px',
  top: '(max-width: 1099px) 92vw, 1256px',
  half: '(max-width: 700px) 92vw, 620px',
  third: '(max-width: 700px) 92vw, 410px',
  phone: '(max-width: 700px) 44vw, 260px',
}
const supportSizes = (count, layout) => (layout === 'aside' ? '(max-width: 700px) 92vw, 360px' : count === 2 ? SIZES.half : SIZES.third)

function Picture({ image, sizes }) {
  return <img src={image.src} srcSet={image.srcSet} sizes={sizes} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" />
}

// One real page capture. `browser` sits in the site's shared browser frame (address bar included); `bare` is a plain framed crop.
function Figure({ image, caption, frame = 'browser', sizes }) {
  return <figure className="cs-figure">
    {frame === 'browser'
      ? <div className="cs-frame ui-frame">
          <div className="ui-frame__bar" aria-hidden="true"><i /><i /><i /><span className="ui-frame__url">{hostLabel(image.page)}</span></div>
          <div className="ui-frame__screen"><Picture image={image} sizes={sizes} /></div>
        </div>
      : <div className="cs-bare"><Picture image={image} sizes={sizes} /></div>}
    {caption && <figcaption><span>{caption}</span></figcaption>}
  </figure>
}


function ProjectCloseGraphic(){
  return <div className="project-close-graphic" aria-hidden="true">
    <svg viewBox="0 0 520 330" role="presentation" focusable="false">
      <defs>
        <linearGradient id="pcgA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#795cff"/><stop offset="1" stopColor="#5368ff"/></linearGradient>
        <linearGradient id="pcgB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2fb4dd"/><stop offset="1" stopColor="#5368ff"/></linearGradient>
        <linearGradient id="pcgC" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8a5c"/><stop offset="1" stopColor="#ff5f9e"/></linearGradient>
      </defs>
      <g className="pcg-grid"><path d="M56 52H468M56 106H468M56 160H468M56 214H468M56 268H468"/><path d="M98 28V300M164 28V300M230 28V300M296 28V300M362 28V300M428 28V300"/></g>
      <g className="pcg-card pcg-card--design"><rect x="66" y="74" width="154" height="126" rx="22" fill="url(#pcgA)"/><rect x="88" y="98" width="54" height="18" rx="9"/><path d="M90 137h104M90 158h76M90 179h90"/></g>
      <g className="pcg-card pcg-card--build"><rect x="198" y="118" width="170" height="138" rx="24" fill="url(#pcgB)"/><path className="pcg-code" d="m232 158-18 18 18 18M334 158l18 18-18 18M285 150l-14 54"/><path d="M236 222h94"/></g>
      <g className="pcg-card pcg-card--ship"><rect x="344" y="66" width="112" height="164" rx="24" fill="url(#pcgC)"/><rect x="362" y="90" width="76" height="54" rx="12"/><path d="M364 169h68M364 190h52M364 211h62"/></g>
      <path className="pcg-flow" d="M112 234 C178 292 306 292 412 240"/>
      <circle className="pcg-runner" r="7"><animateMotion path="M112 234 C178 292 306 292 412 240" dur="8.8s" begin="-4.6s" repeatCount="indefinite"/></circle>
      <g className="pcg-chip pcg-chip--a"><rect x="68" y="224" width="88" height="30" rx="15"/><text x="112" y="244">DESIGN</text></g>
      <g className="pcg-chip pcg-chip--b"><rect x="216" y="272" width="88" height="30" rx="15"/><text x="260" y="292">BUILD</text></g>
      <g className="pcg-chip pcg-chip--c"><rect x="380" y="246" width="76" height="30" rx="15"/><text x="418" y="266">SHIP</text></g>
    </svg>
  </div>
}

function Points({ items }) {
  return <dl className="cs-points">{items.map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
}

// The slots a chapter body is made of (see src/data/projectCaseStudies.js for their shapes).
function Slot({ slot, layout }) {
  switch (slot.type) {
    case 'media':
      return <div className="cs-media">
        <Figure image={slot.image} caption={slot.caption} sizes={SIZES[layout]} />
        {slot.support && <div className="cs-support" style={{ '--n': slot.support.length }}>
          {slot.support.map((cell) => cell.note
            ? <aside className="cs-note" key={cell.note.label}>
                <div className="cs-note__head">
                  <i className="cs-note__signal" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><circle cx="22" cy="22" r="17"/><path d="M14 24h4l3-8 4 14 3-7h4"/></svg></i>
                  <span>{cell.note.label}</span>
                </div>
                <p>{cell.note.text}</p>
              </aside>
            : <Figure key={cell.image.src} image={cell.image} caption={cell.caption} frame="bare" sizes={supportSizes(slot.support.length, layout)} />)}
        </div>}
      </div>
    case 'phones':
      return <div className="cs-phones" style={{ '--n': slot.items.length }}>
        {slot.items.map((item) => <figure className="cs-phone" key={item.image.src}>
          <div className="cs-phone__body"><Picture image={item.image} sizes={SIZES.phone} /></div>
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>)}
      </div>
    case 'cards': {
      const cols = slot.cols || Math.min(slot.items.length, layout === 'aside' ? 3 : 4)
      return <div className={`cs-cards cs-cols-${cols}`} style={{ '--cols': cols }}>
        {slot.items.map((item, index) => <article className="cs-card" key={item.title}>
          <span className="cs-card__n">{slot.numbered ? String(index + 1).padStart(2, '0') : item.label}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>)}
      </div>
    }
    case 'features':
      return <div className={`cs-features cs-cols-${slot.items.length}`} style={{ '--cols': slot.items.length }}>
        {slot.items.map((item) => <article className="cs-feature" key={item.title}>
          <Figure image={item.image} frame="bare" sizes={SIZES.third} />
          <span className="cs-feature__label">{item.label}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>)}
      </div>
    default:
      return null
  }
}

// A chapter is one section: a text column (eyebrow, heading, lead, points) and a body, on the shared 12-column grid.
function Chapter({ chapter, tone, visualIndex = 0 }) {
  const aside = chapter.layout === 'aside'
  // An intro with no companion content beside it (a `top` chapter without points) is a centred editorial header, not half a split.
  const centred = !aside && !chapter.points
  return <section id={chapter.id} className={`section cs-chapter cs-chapter--${tone} cs-ambient cs-ambient--${visualIndex % 6}`} aria-labelledby={`${chapter.id}-title`}>
    <div className="route-wrap">
      <div className={`cs-layout cs-layout--${chapter.layout}${aside ? ` cs-layout--a${chapter.aside || 5}` : ''}`}>
        <header className={`cs-head${centred ? ' cs-head--center' : ''}`}>
          <span className="kicker">{chapter.kicker}</span>
          <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
          {chapter.intro && <p className="cs-lead">{chapter.intro}</p>}
          {chapter.points && <Points items={chapter.points} />}
        </header>
        <div className="cs-body">{chapter.slots.map((slot, index) => <Slot key={`${chapter.id}-${index}`} slot={slot} layout={chapter.layout} />)}</div>
      </div>
    </div>
  </section>
}

export default function Project(){
  const {slug}=useParams()
  const project=projects.find(item=>item.slug===slug)


  if(!project) return <Navigate to="/work/" replace/>

  const brand=brandFor(project)
  const study=caseStudyFor(project)
  // Chapters alternate between the project's two body surfaces; the scope section continues the sequence.
  const toneAt=(index)=>index%2===0?'a':'b'
  const sourceNote=project.sourceNote&&<p className="case-source-note"><strong>SOURCE NOTE</strong>{project.sourceNote}</p>
  const discipline=disciplineFor(project)

  return <div
    className={`route-page project-page case-page case-study case-page--${project.presentation}${brand?' pj-branded':''}`}
    style={{'--accent':project.accent,'--surface':project.surface,'--wk-bg-l':surfacesFor(project).light,'--wk-bg-d':surfacesFor(project).dark,...(brand?brandStyle(brand):{})}}
  >
    <Header/>
    <main id="main-content" tabIndex="-1">
      <ProjectDetailHero project={project}/>

      <section className="section case-context cs-ambient cs-ambient--overview">
        <div className="route-wrap">
          <div className="cs-layout cs-layout--aside cs-layout--a5">
            <header className="cs-head">
              <span className="kicker">PROJECT OVERVIEW</span>
              <h2>{study.overview.title}</h2>
              <p className="cs-lead">{study.overview.lead}</p>
              <div className="project-tags web-tag-group">{project.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
            </header>
            <div className="cs-body">
              <div className="case-context__copy">
                <dl className="case-facts">
                  <div><dt>PROJECT TYPE</dt><dd>{project.category}</dd></div>
                  {study.overview.facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                </dl>
                {study.overview.paragraphs.map((text)=><p key={text}>{text}</p>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {study.chapters.map((chapter,index)=><Chapter key={chapter.id} chapter={chapter} tone={toneAt(index)} visualIndex={index}/>)}

      <section className={`section cs-scope cs-scope--${toneAt(study.chapters.length)} cs-ambient cs-ambient--scope`} aria-labelledby="scope-title">
        <div className="route-wrap">
          <div className="cs-layout cs-layout--aside cs-layout--a5">
            <header className="cs-head">
              <span className="kicker">VERIFIED CONTRIBUTION</span>
              <h2 id="scope-title">{study.contributionTitle||'Scope of the work.'}</h2>
              <p className="cs-lead">{project.contribution}</p>
              {sourceNote}
            </header>
            <div className="cs-body">
              <div className="cs-spec">
                <dl className="cs-spec__grid">
                  <div><dt>{project.contextLabel || 'ROLE / CONTEXT'}</dt><dd>{project.role}</dd></div>
                  {discipline&&<div><dt>DISCIPLINE</dt><dd>{discipline}</dd></div>}
                  <div><dt>STATUS</dt><dd>{project.status}</dd></div>
                  <div><dt>PUBLIC PROJECT</dt><dd><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">{hostLabel(project.liveUrl)} ↗</a></dd></div>
                </dl>
                <div className="case-deliverables cs-spec__list">
                  <span className="kicker">{project.deliverablesLabel || 'DELIVERED'}</span>
                  <div>{project.deliverables.map((item,index)=><p key={item}><b>{String(index+1).padStart(2,'0')}</b>{item}</p>)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--project-close"><div className="route-wrap project-close">
        <div className="project-close__copy">
          <span className="kicker">PRODUCT UI + FRONTEND</span>
          <h2>Need this level of care for your next interface?</h2>
          <div className="project-close__actions"><ActionLink variant="dark" size="cta" href={project.liveUrl} target="_blank" rel="noopener noreferrer">Open public project <span aria-hidden="true">↗</span></ActionLink><ActionLink size="cta" to="/contact/">Send a brief <span aria-hidden="true">↗</span></ActionLink></div>
        </div>
        <ProjectCloseGraphic/>
      </div></section>
    </main>
    <Footer/>
  </div>
}
