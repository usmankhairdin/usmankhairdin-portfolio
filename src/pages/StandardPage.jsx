import { useEffect } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import BrandSignalArtwork from '../components/BrandSignalArtwork.jsx'

export default function StandardPage({eyebrow,title,accent='practice',intro,heroNote,heroAction,heroVisual,children}){
  const composedHero=['work','services','agencies','contact'].includes(accent)
  useEffect(()=>{
    const previous=document.title
    const section=String(eyebrow||'').replace(/\s*\/.*$/,'').trim()
    document.title=section ? `${section} — Usman Khair Din` : 'Usman Khair Din — UI Design & Frontend'
    const description=document.querySelector('meta[name=\"description\"]')
    const canonical=document.querySelector('link[rel=\"canonical\"]')
    const ogTitle=document.querySelector('meta[property=\"og:title\"]')
    const ogDescription=document.querySelector('meta[property=\"og:description\"]')
    const ogUrl=document.querySelector('meta[property=\"og:url\"]')
    const twitterTitle=document.querySelector('meta[name=\"twitter:title\"]')
    const twitterDescription=document.querySelector('meta[name=\"twitter:description\"]')
    const previousDescription=description?.getAttribute('content')
    const previousCanonical=canonical?.getAttribute('href')
    const previousOgTitle=ogTitle?.getAttribute('content')
    const previousOgDescription=ogDescription?.getAttribute('content')
    const previousOgUrl=ogUrl?.getAttribute('content')
    const previousTwitterTitle=twitterTitle?.getAttribute('content')
    const previousTwitterDescription=twitterDescription?.getAttribute('content')
    const url=`https://www.usmankhairdin.com${window.location.pathname}`
    if(description && intro) description.setAttribute('content',String(intro))
    if(canonical) canonical.setAttribute('href',url)
    if(ogTitle) ogTitle.setAttribute('content',document.title)
    if(ogDescription && intro) ogDescription.setAttribute('content',String(intro))
    if(ogUrl) ogUrl.setAttribute('content',url)
    if(twitterTitle) twitterTitle.setAttribute('content',document.title)
    if(twitterDescription && intro) twitterDescription.setAttribute('content',String(intro))
    return ()=>{
      document.title=previous
      if(description && previousDescription) description.setAttribute('content',previousDescription)
      if(canonical && previousCanonical) canonical.setAttribute('href',previousCanonical)
      if(ogTitle && previousOgTitle) ogTitle.setAttribute('content',previousOgTitle)
      if(ogDescription && previousOgDescription) ogDescription.setAttribute('content',previousOgDescription)
      if(ogUrl && previousOgUrl) ogUrl.setAttribute('content',previousOgUrl)
      if(twitterTitle && previousTwitterTitle) twitterTitle.setAttribute('content',previousTwitterTitle)
      if(twitterDescription && previousTwitterDescription) twitterDescription.setAttribute('content',previousTwitterDescription)
    }
  },[eyebrow,intro])

  return <div className={`route-page route-page--viewport route-page--${accent}`}>
    <Header />
    <main id="main-content" tabIndex="-1">
      <section className={`route-hero route-hero--${accent}${composedHero ? ' route-hero--composed' : ''}`}>
        <HeroSignalBackground measureCopy/>
        <div className="route-hero__scene" aria-hidden="true">{!heroVisual && <BrandSignalArtwork variant={accent}/>}</div>
        <div className="route-wrap route-hero__content">
          <div className="route-hero__copy"><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{intro}</p>{heroAction&&<div className="route-hero__actions">{heroAction}</div>}</div>
          {accent === 'about' ? <div className="route-hero__about-visual">
            {heroNote && <aside className="route-hero__ledger" aria-label={heroNote.label}>
              <span>{heroNote.label}</span><strong>{heroNote.value}</strong><p>{heroNote.detail}</p>
            </aside>}
            {heroVisual || <BrandSignalArtwork variant="about"/>}
          </div> : composedHero ? <div className="route-hero__visual">
            {heroNote && <aside className="route-hero__ledger" aria-label={heroNote.label}>
              <span>{heroNote.label}</span><strong>{heroNote.value}</strong><p>{heroNote.detail}</p>
            </aside>}
            {heroVisual || <BrandSignalArtwork variant={accent}/>}
          </div> : heroNote && <aside className="route-hero__ledger" aria-label={heroNote.label}>
            <span>{heroNote.label}</span><strong>{heroNote.value}</strong><p>{heroNote.detail}</p>
          </aside>}
        </div>
      </section>
      {children}
    </main>
    <Footer />
  </div>
}
