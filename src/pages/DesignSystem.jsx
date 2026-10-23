import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer, { FooterIcon } from '../components/Footer.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import ProjectBrowserPreview from '../components/ProjectBrowserPreview.jsx'
import { TECH_TAG_MARKS } from '../components/TechTagMarks.jsx'
import { projects } from '../data/projects.js'
import { ActionLink, TextCTA } from '../components/ui/Action.jsx'
import SectionIntro from '../components/ui/SectionIntro.jsx'
import { FormField, FormStatus } from '../components/ui/FormPrimitives.jsx'
import MetaActionRow from '../components/ui/MetaActionRow.jsx'
import './DesignSystem.css'

const semanticColors = [
  ['Canvas', '--ds-canvas'],
  ['Surface', '--ds-panel'],
  ['Elevated', '--ds-panel-strong'],
  ['Primary text', '--ds-ink'],
  ['Muted text', '--ds-muted'],
  ['Border', '--ds-line'],
  ['Accent', '--color-accent'],
  ['Focus', '--color-focus'],
  ['Success', '--color-status-success'],
  ['Error', '--color-status-error'],
]

const spacing = [
  ['04', '--space-1'],
  ['08', '--space-2'],
  ['12', '--space-3'],
  ['16', '--space-4'],
  ['24', '--space-6'],
  ['32', '--space-7'],
  ['40', '--space-8'],
  ['56', '--space-9'],
]

const stack = [
  ['react', 'React 19'],
  ['router', 'React Router'],
  ['vite', 'Vite'],
  ['javascript', 'JavaScript'],
  ['css3', 'CSS custom properties'],
  ['gsap', 'GSAP'],
  ['lenis', 'Lenis'],
  ['r3f', 'React Three Fiber'],
  ['three', 'Three.js'],
]

function GuideSection({ id, index, eyebrow, title, intro, className = '', children }) {
  return <section className={`ds-section ${className}`} id={id} aria-labelledby={`${id}-title`}>
    <div className="route-wrap">
      <div className="ds-section__head">
        <span className="ds-section__index" aria-hidden="true">{index}</span>
        <SectionIntro
          className="ds-section__intro"
          eyebrow={eyebrow}
          title={<span id={`${id}-title`}>{title}</span>}
          intro={intro}
        />
      </div>
      {children}
    </div>
  </section>
}

function FormDemo() {
  const [status, setStatus] = useState('')

  return <form
    className="contact-form ds-form-demo"
    onSubmit={(event) => event.preventDefault()}
    aria-label="Non-submitting form component demonstration"
  >
    <FormField label="Project name">
      <input type="text" placeholder="Responsive product UI" />
    </FormField>
    <FormField label="Support needed">
      <select defaultValue="design-build">
        <option value="design-build">Design + frontend</option>
        <option value="design">Product design</option>
        <option value="frontend">Frontend production</option>
      </select>
    </FormField>
    <FormField label="Email" className="ds-form-demo__error">
      <input type="email" defaultValue="name@" aria-invalid="true" aria-describedby="ds-form-error" />
      <small id="ds-form-error">Enter a complete email address.</small>
    </FormField>
    <FormField label="Brief" className="contact-form__message">
      <textarea defaultValue="A labelled, keyboard-ready field using the production form primitive." />
    </FormField>
    <button type="button" onClick={() => setStatus('sent')}>Preview local status <b aria-hidden="true">↗</b></button>
    <FormStatus status={status}>{status ? 'Demonstration state only — nothing was submitted.' : ''}</FormStatus>
  </form>
}

function TechTag({ id, children }) {
  return <span className="ds-tech-tag" data-tech-id={id}>
    {TECH_TAG_MARKS[id] || null}
    {children}
  </span>
}

export default function DesignSystem() {
  const featuredProject = projects.find((project) => project.slug === 'forme')


  return <div className="route-page design-system-page">
    <Header />
    <main id="main-content" tabIndex="-1">
      <section className="ds-hero" aria-labelledby="ds-title">
        <HeroSignalBackground />
        <div className="route-wrap ds-hero__grid">
          <div className="ds-hero__copy">
            <span className="kicker">DESIGN SYSTEM / IMPLEMENTED 2026</span>
            <h1 id="ds-title">The system behind the <em>portfolio.</em></h1>
            <p>Production foundations, components and interaction rules used across the current Web Experience.</p>
            <div className="ds-hero__actions">
              <ActionLink href="#foundations">Explore the system <span aria-hidden="true">↓</span></ActionLink>
              <TextCTA to="/work/">See it in the work ↗</TextCTA>
            </div>
          </div>
          <div className="ds-hero__principles" aria-label="Design system principles">
            {[
              ['01', 'System before decoration'],
              ['02', 'Responsive by default'],
              ['03', 'Motion with purpose'],
              ['04', 'Specialize with intent'],
            ].map(([number, principle]) => <div key={number}><span>{number}</span><strong>{principle}</strong></div>)}
          </div>
        </div>
      </section>

      <GuideSection
        id="foundations"
        index="01"
        eyebrow="FOUNDATIONS"
        title="One foundation. Clear roles."
        intro="The page uses the same semantic palette, type families, spacing rhythm and responsive containers as the production routes."
      >
        <div className="ds-foundations">
          <div className="ds-foundations__colors" aria-label="Semantic color roles">
            {semanticColors.map(([label, token]) => <div className="ds-swatch" key={token}>
              <i style={{ '--swatch': `var(${token})` }} aria-hidden="true" />
              <span><strong>{label}</strong><code>{token}</code></span>
            </div>)}
          </div>
          <div className="ds-foundations__type">
            <article className="ds-type-role ds-type-role--section">
              <span>SECTION HEADING</span>
              <strong>Production foundations</strong>
            </article>
            <article className="ds-type-role ds-type-role--card">
              <span>CARD HEADING</span>
              <strong>Responsive by design</strong>
            </article>
            <article className="ds-type-role ds-type-role--body">
              <span>BODY</span>
              <p>Manrope carries interface and narrative copy. DM Mono handles labels and metadata. <em>Playfair Display Italic</em> adds restrained editorial emphasis.</p>
            </article>
          </div>
          <div className="ds-foundations__layout">
            <div className="ds-grid-diagram" aria-label="Twelve-column production grid">
              {Array.from({ length: 12 }, (_, index) => <i key={index} aria-hidden="true" />)}
              <span>12 columns · 1320px standard container · responsive gutters</span>
            </div>
            <div className="ds-space-scale" aria-label="Core spacing rhythm">
              {spacing.map(([label, token]) => <div key={token}><span>{label}</span><i style={{ width: `var(${token})` }} /><code>{token}</code></div>)}
            </div>
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="components"
        index="02"
        eyebrow="SURFACES + COMPONENTS"
        title="Real treatments, shown together."
        intro="Borders, radii, shadows and actions are the same production tokens and components used throughout the Web Experience."
        className="ds-section--centered"
      >
        <div className="ds-component-grid">
          <article className="ds-surface-card ds-surface-card--quiet">
            <span>FROSTED SURFACE</span>
            <strong>Quiet separation</strong>
            <p>Subtle blue-tinted borders and low-elevation shadows preserve hierarchy without over-boxing content.</p>
          </article>
          <article className="ds-surface-card ds-surface-card--raised">
            <span>ELEVATED PANEL</span>
            <strong>Focused content</strong>
            <p>The same radius and surface logic supports cards, panels and structured information.</p>
          </article>
          <article className="ds-action-card">
            <span>ACTIONS</span>
            <div>
              <ActionLink to="/contact/">Start a conversation <span aria-hidden="true">↗</span></ActionLink>
              <TextCTA to="/work/">View selected work ↗</TextCTA>
            </div>
            <dl><div><dt>Control radius</dt><dd>13px</dd></div><div><dt>Card radius</dt><dd>24px</dd></div><div><dt>Transition</dt><dd>280ms</dd></div></dl>
          </article>
        </div>
      </GuideSection>

      <GuideSection
        id="forms"
        index="03"
        eyebrow="FORMS + FEEDBACK"
        title="Clear input, visible state."
        intro="The demonstration reuses production form primitives and feedback styling. It is intentionally local and sends no data."
      >
        <div className="ds-form-layout">
          <div className="ds-form-notes">
            {[
              ['LABELS', 'Every field keeps a persistent, associated label.'],
              ['FOCUS', 'Keyboard focus uses the shared visible focus treatment.'],
              ['FEEDBACK', 'Errors and status remain clear without layout ambiguity.'],
            ].map(([label, copy]) => <div key={label}><span>{label}</span><p>{copy}</p></div>)}
          </div>
          <FormDemo />
        </div>
      </GuideSection>

      <GuideSection
        id="tags-meta"
        index="04"
        eyebrow="TAGS + ICONS + META"
        title="Compact information, consistent behavior."
        intro="Production chips, brand marks and icon-led metadata share the same alignment, spacing and interaction language."
        className="ds-section--centered"
      >
        <div className="ds-meta-grid">
          <div className="ds-tag-panel">
            <div className="contact-notes web-tag-group" aria-label="Capability tags">
              {['Product UI', 'Responsive design', 'React frontend', 'Design systems', 'Accessibility-aware'].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <div className="ds-tech-row">
              <div className="ds-tech-row__tags web-tag-group" aria-label="Technology tags">
                <TechTag id="react">React</TechTag>
                <TechTag id="vite">Vite</TechTag>
                <TechTag id="javascript">JavaScript</TechTag>
                <TechTag id="css3">CSS</TechTag>
              </div>
            </div>
          </div>
          <div className="ds-meta-panel footer-meta" aria-label="Icon and metadata patterns">
            <MetaActionRow icon={<FooterIcon name="mail" />} href="mailto:brief@usmankhairdin.com" ariaLabel="Email brief@usmankhairdin.com">brief@usmankhairdin.com</MetaActionRow>
            <MetaActionRow icon={<FooterIcon name="linkedin" />} href="https://pk.linkedin.com/in/usmankhairdin1" external ariaLabel="LinkedIn profile">LinkedIn · Profile</MetaActionRow>
            <MetaActionRow icon={<FooterIcon name="experience" />}>16+ years · Design + frontend</MetaActionRow>
            <MetaActionRow icon={<FooterIcon name="location" />}>Lahore, Pakistan · Working globally</MetaActionRow>
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="media"
        index="05"
        eyebrow="MEDIA + PROJECT PRESENTATION"
        title="One disciplined project frame."
        intro="FORME demonstrates the shared presentation: a real capture, fixed browser geometry, clipped overflow and reversible pointer-led scrolling."
        className="ds-section--centered"
      >
        <div className="ds-media-grid">
          <div className="ds-media-notes">
            {['Real project capture', 'Starts at the top', 'Preserves image ratio', 'Pointer scrolls and resets'].map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}
          </div>
          {featuredProject && <ProjectBrowserPreview project={featuredProject} eager />}
        </div>
      </GuideSection>

      <GuideSection
        id="themes-motion"
        index="06"
        eyebrow="THEMES + MOTION"
        title="Shared structure, authored contrast."
        intro="Light and dark modes preserve semantic hierarchy. Motion uses a small timing set and respects reduced-motion preferences."
        className="ds-section--centered"
      >
        <div className="ds-theme-motion-grid">
          <article className="ds-theme-sample ds-theme-sample--light">
            <span>LIGHT / DEFAULT</span>
            <strong>Cool canvas</strong>
            <p>Frosted white surfaces, blue-tinted lines and deep navy text.</p>
            <i aria-hidden="true" />
          </article>
          <article className="ds-theme-sample ds-theme-sample--dark">
            <span>DARK</span>
            <strong>Deep surface</strong>
            <p>Layered navy panels, restrained borders and high-contrast type.</p>
            <i aria-hidden="true" />
          </article>
          <article className="ds-motion-sample">
            <span>MOTION</span>
            <div aria-hidden="true"><i /></div>
            <dl><div><dt>Control</dt><dd>200ms</dd></div><div><dt>Standard</dt><dd>280ms</dd></div><div><dt>Panel</dt><dd>880ms</dd></div></dl>
            <p>Purposeful transitions support orientation. Reduced motion removes non-essential travel.</p>
          </article>
        </div>
      </GuideSection>

      <GuideSection
        id="responsive-accessibility"
        index="07"
        eyebrow="RESPONSIVE + ACCESSIBILITY"
        title="Designed to adapt, built to remain usable."
        intro="Layouts recompose instead of merely shrinking, while semantic controls, focus visibility and contrast remain part of the base system."
        className="ds-section--centered"
      >
        <div className="ds-quality-grid">
          {[
            ['DESKTOP', 'Multi-column compositions use shared containers.'],
            ['MOBILE', 'Content stacks in authored reading order.'],
            ['TYPE', 'Readable line length and fluid production roles.'],
            ['INPUT', 'Touch and coarse pointers keep essential access.'],
            ['FOCUS', 'Interactive elements retain visible keyboard focus.'],
            ['MOTION', 'Reduced-motion preferences remove excess travel.'],
          ].map(([label, copy]) => <article key={label}><span>{label}</span><p>{copy}</p></article>)}
        </div>
        <div className="ds-focus-row">
          <span>SEMANTIC CONTROLS / ACCESSIBLE NAMES / THEME-AWARE CONTRAST</span>
          <ActionLink to="/contact/">Keyboard-ready action <span aria-hidden="true">↗</span></ActionLink>
        </div>
      </GuideSection>

      <GuideSection
        id="specialized"
        index="08"
        eyebrow="SPECIALIZED SYSTEMS + STACK"
        title="Shared foundation, intentional exceptions."
        intro="The core system stays consistent while Home, Work and Corridor retain the specialized behavior their experiences require."
      >
        <div className="ds-system-cards">
          <article><span>HOME</span><strong>Real project evidence + drifting tool tags</strong><p>A tailored opening experience built on the shared Web foundation.</p></article>
          <article><span>WORK</span><strong>Shared project-frame geometry</strong><p>Consistent panels with real screenshots and controlled choreography.</p></article>
          <article><span>CORRIDOR</span><strong>Spatial interface + game-style look</strong><p>React Three Fiber, camera, materials and lighting remain a distinct system.</p></article>
        </div>
        <div className="ds-stack" aria-label="Production technology stack">
          <span className="kicker">ACTUAL PRODUCTION STACK</span>
          <div className="web-tag-group" aria-label="Production stack tags">{stack.map(([id, label]) => <TechTag id={id} key={label}>{label}</TechTag>)}</div>
        </div>
      </GuideSection>

      <section className="ds-close" aria-labelledby="ds-close-title">
        <div className="route-wrap ds-close__grid">
          <div className="route-heading-copy"><span className="kicker">SYSTEM IN PRACTICE</span><h2 id="ds-close-title">Built to support the work, not compete with it.</h2><p>The design system keeps the portfolio coherent while preserving the identity and interaction needs of each experience.</p></div>
          <div><div><ActionLink to="/work/">Explore the work <span aria-hidden="true">↗</span></ActionLink><TextCTA to="/contact/">Start a conversation ↗</TextCTA></div></div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
}
