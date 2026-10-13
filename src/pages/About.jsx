import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import { ActionLink } from '../components/ui/Action.jsx'
import EditorialEngagement from '../components/editorial/EditorialEngagement.jsx'
import useEditorialMotion from '../components/editorial/useEditorialMotion.js'
import GroundedSculpture from '../components/editorial/GroundedSculpture.jsx'
import { useTheme } from '../theme/ThemeProvider.jsx'
import './About.css'

function EditorialLink({ to, children }) {
  return <Link to={to} className="about-editorial__link">
    <span>{children}</span><span aria-hidden="true">↗</span>
  </Link>
}

export default function About() {
  const root = useRef(null)
  const { theme } = useTheme()
  useEditorialMotion(root)
  return <div className="route-page about-editorial" ref={root}>
    <Header />
    <main id="main-content" tabIndex={-1}>
      <section className="about-editorial__hero" aria-labelledby="about-title">
        <HeroSignalBackground measureCopy />
        <svg className="about-editorial__filter-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <filter id="about-sculpture-edge-cleanup" primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="0.0009 0.00135" result="insetAlpha" />
              <feGaussianBlur in="insetAlpha" stdDeviation="0.00022 0.00033" result="cleanAlpha" />
              <feComponentTransfer in="SourceGraphic" result="originalColors">
                <feFuncA type="linear" slope="0" intercept="1" />
              </feComponentTransfer>
              <feComposite in="originalColors" in2="cleanAlpha" operator="in" />
            </filter>
          </defs>
        </svg>
        <div className="about-editorial__wrap about-editorial__hero-layout">
          <div className="about-editorial__hero-copy route-hero__copy">
            <h1 id="about-title">Thoughtfully<br /><span>designed &amp; <em>built.</em></span></h1>
            <p>I’m Usman Khair Din. Product and UI/UX designer, building thoughtful interfaces with responsive frontend.</p>
            <div className="about-editorial__hero-actions">
              <ActionLink to="/work/">Explore my work <span aria-hidden="true">↗</span></ActionLink>
              <EditorialLink to="/contact/">Talk about your project</EditorialLink>
            </div>
          </div>
          <GroundedSculpture
            src={theme === 'dark' ? '/assets/about/ukd-sculpture-soft-shadow.webp' : '/assets/about/ukd-sculpture-soft-shadow-light.webp'}
            maskSrc="/assets/about/ukd-sculpture-soft-shadow.webp"
            className="about-editorial__sculpture"
            surfaceLightOnly
          />
        </div>
      </section>

      <section className="about-editorial__practice" aria-labelledby="about-practice-title">
        <div className="about-editorial__wrap about-editorial__practice-layout">
          <figure className="about-editorial__portrait" data-editorial-reveal>
            <div className="about-editorial__portrait-image">
              <img src="/assets/about/portrait-editorial.webp" alt="Usman Khair Din" width="1122" height="1402" loading="lazy" decoding="async" />
            </div>
          </figure>
          <div className="about-editorial__practice-copy" data-editorial-reveal>
            <h2 id="about-practice-title">Design and<br />development,<br />in the same hands.</h2>
            <div className="about-editorial__body">
              <p>I shape interfaces around the people using them, then carry the design into responsive frontend.</p>
              <p>For 16+ years, my work has spanned business products, websites and agency production. From early direction to the details that reach the browser.</p>
            </div>
            <div className="about-editorial__career" aria-label="Professional experience">
              <div><h3>eWorx International</h3><p>Product Designer <span>2019–present</span></p></div>
              <div><h3>ArhamSoft</h3><p>Senior Web Designer <span>2012–2019</span></p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-editorial__work" data-editorial-loop aria-labelledby="about-work-title">
        <div className="about-editorial__wrap about-editorial__work-layout">
          <div className="about-editorial__work-copy" data-editorial-reveal>
            <h2 id="about-work-title">Good ideas<br />deserve a<br />considered<br /><em>interface.</em></h2>
            <p>Product interfaces, websites and production work. Designed for people, built for the real world.</p>
            <EditorialLink to="/work/prima/">View PRIMA</EditorialLink>
            <span className="about-editorial__work-role">UI direction · Frontend</span>
          </div>
          <div className="about-editorial__work-stage" data-editorial-reveal>
            <Link to="/work/prima/" className="about-editorial__work-preview" aria-label="Explore the PRIMA case study">
              <img src="/assets/projects/prima/showcase.webp" srcSet="/assets/projects/prima/showcase-1x.webp 1440w, /assets/projects/prima/showcase.webp 2880w" sizes="(max-width: 700px) 90vw, 60vw" width="1440" height="900" loading="lazy" decoding="async" alt="PRIMA hospitality platform: the recommendation network homepage" />
            </Link>
          </div>
        </div>
      </section>

      <EditorialEngagement />
    </main>
    <Footer />
  </div>
}
