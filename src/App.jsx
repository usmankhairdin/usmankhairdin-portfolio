import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { routeLoaders } from './routeLoaders.js'
import { WebScrollProvider, useWebScroll } from './scroll/WebScrollProvider.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import CursorLayer from './cursor/CursorLayer.jsx'

const HomeExperience = lazy(routeLoaders.home)
const Work = lazy(routeLoaders.work)
const Project = lazy(routeLoaders.project)
const About = lazy(routeLoaders.about)
const Services = lazy(routeLoaders.services)
const Agencies = lazy(routeLoaders.agencies)
const Contact = lazy(routeLoaders.contact)
const DesignSystem = lazy(routeLoaders.designSystem)
const PersonalPortfolioWeb = lazy(routeLoaders.personalPortfolioWeb)
const PersonalPortfolio3D = lazy(routeLoaders.personalPortfolio3d)

function HomeRouteFallback(){
  return <div className="home-route-fallback" aria-label="Loading interface gallery" aria-busy="true" />
}

function StandardRouteFallback(){
  return <div className="standard-route-fallback" aria-label="Loading page" aria-busy="true" />
}

function RouteEffects(){
  const { pathname }=useLocation()
  const navigationType=useNavigationType()
  const webScroll=useWebScroll()
  useEffect(()=>{
    if(navigationType==='POP') webScroll?.syncPosition()
    else if(webScroll) webScroll.resetToTop()
    else window.scrollTo({top:0,left:0,behavior:'auto'})

    if(pathname==='/') return undefined
    let frame=0
    let attempts=0
    const focusMain=()=>{
      const main=document.querySelector('main')
      if(main){ main.focus({preventScroll:true}); return }
      if(attempts++<60) frame=requestAnimationFrame(focusMain)
    }
    frame=requestAnimationFrame(focusMain)
    return()=>cancelAnimationFrame(frame)
  },[pathname,navigationType,webScroll])
  return null
}

export default function App(){
  return <ThemeProvider><WebScrollProvider>
    <RouteEffects/>
    <CursorLayer/>
    <Routes>
      <Route path="/" element={<Suspense fallback={<HomeRouteFallback/>}><HomeExperience/></Suspense>}/>
      <Route path="/work/" element={<Suspense fallback={<StandardRouteFallback/>}><Work/></Suspense>}/>
      <Route path="/work/personal-portfolio-web/" element={<Suspense fallback={<StandardRouteFallback/>}><PersonalPortfolioWeb/></Suspense>}/>
      <Route path="/work/personal-portfolio-3d/" element={<Suspense fallback={<StandardRouteFallback/>}><PersonalPortfolio3D/></Suspense>}/>
      <Route path="/work/:slug/" element={<Suspense fallback={<StandardRouteFallback/>}><Project/></Suspense>}/>
      <Route path="/about/" element={<Suspense fallback={<StandardRouteFallback/>}><About/></Suspense>}/>
      <Route path="/services/" element={<Suspense fallback={<StandardRouteFallback/>}><Services/></Suspense>}/>
      <Route path="/for-agencies/" element={<Suspense fallback={<StandardRouteFallback/>}><Agencies/></Suspense>}/>
      <Route path="/contact/" element={<Suspense fallback={<StandardRouteFallback/>}><Contact/></Suspense>}/>
      <Route path="/design-system/" element={<Suspense fallback={<StandardRouteFallback/>}><DesignSystem/></Suspense>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </WebScrollProvider></ThemeProvider>
}
