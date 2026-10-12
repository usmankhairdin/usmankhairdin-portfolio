import { useRef } from 'react'
import Header from '../Header.jsx'
import Footer from '../Footer.jsx'
import HeroSignalBackground from '../HeroSignalBackground.jsx'
import GroundedSculpture from './GroundedSculpture.jsx'
import useEditorialMotion from './useEditorialMotion.js'
import './EditorialPage.css'

export default function EditorialPage({ className = '', children }) {
  const root = useRef(null)
  useEditorialMotion(root)
  return <div className={`route-page editorial-page ${className}`} ref={root}>
    <Header />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <Footer />
  </div>
}

export function EditorialHero({ id, title, intro, actions, sculpture, visual }) {
  return <section className="editorial-hero" aria-labelledby={id}>
    <HeroSignalBackground measureCopy />
    <div className="editorial-wrap editorial-hero__layout">
      <div className="editorial-hero__copy route-hero__copy">
        <h1 id={id}>{title}</h1>
        <p>{intro}</p>
        {actions && <div className="editorial-hero__actions">{actions}</div>}
      </div>
      {sculpture ? <GroundedSculpture src={sculpture} className="editorial-hero__sculpture" /> : visual}
    </div>
  </section>
}
