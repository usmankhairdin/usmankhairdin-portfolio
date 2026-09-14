import { useEffect } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function StandardPage({eyebrow,title,accent='practice',intro,children}){
  useEffect(()=>{
    const previous=document.title
    const section=String(eyebrow||'').replace(/\s*\/.*$/,'').trim()
    document.title=section ? `${section} — Usman Khair Din` : 'Usman Khair Din — UI Design & Frontend'
    return ()=>{ document.title=previous }
  },[eyebrow])

  return <div className={`route-page route-page--${accent}`}>
    <Header />
    <main>
      <section className={`route-hero route-hero--${accent}`}>
        <div className="route-hero__scene" aria-hidden="true">
          <i className="route-hero__orb route-hero__orb--a"/><i className="route-hero__orb route-hero__orb--b"/>
          <span className="route-hero__rail route-hero__rail--a"/><span className="route-hero__rail route-hero__rail--b"/>
          <div className="route-hero__ghost"><b>SIGNAL</b><i/><b>SYSTEM</b><i/><b>SURFACE</b></div>
        </div>
        <div className="route-wrap route-hero__content"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div>
      </section>
      {children}
    </main>
    <Footer />
  </div>
}
