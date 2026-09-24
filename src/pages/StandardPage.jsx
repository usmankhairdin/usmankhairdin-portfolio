import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroSignalBackground from '../components/HeroSignalBackground.jsx'
import BrandSignalArtwork from '../components/BrandSignalArtwork.jsx'

export default function StandardPage({eyebrow,title,accent='practice',intro,heroNote,heroAction,heroVisual,children}){
  const composedHero=['work','services','agencies','contact'].includes(accent)

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
