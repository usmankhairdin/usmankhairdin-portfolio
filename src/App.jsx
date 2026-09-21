import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { routeLoaders } from './routeLoaders.js'
import { WebScrollProvider, useWebScroll } from './scroll/WebScrollProvider.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import CursorLayer from './cursor/CursorLayer.jsx'
import HorizontalTagReorderManager from './components/HorizontalTagReorderManager.jsx'

const HomeExperience = lazy(() => import('./experience/HomeExperience.jsx'))
const Work = lazy(routeLoaders.work)
const Project = lazy(routeLoaders.project)
const About = lazy(routeLoaders.about)
const Services = lazy(routeLoaders.services)
const Agencies = lazy(routeLoaders.agencies)
const Contact = lazy(routeLoaders.contact)

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
    if(navigationType==='POP'){ webScroll?.syncPosition(); return }
    if(webScroll) webScroll.resetToTop()
    else window.scrollTo({top:0,left:0,behavior:'auto'})
    if(pathname!=='/') requestAnimationFrame(()=>document.querySelector('main')?.focus({preventScroll:true}))
  },[pathname,navigationType,webScroll])
  return null
}

export default function App(){
  return <ThemeProvider><WebScrollProvider>
    <RouteEffects/>
    <CursorLayer/>
    <HorizontalTagReorderManager/>
    <Routes>
      <Route path="/" element={<Suspense fallback={<HomeRouteFallback/>}><HomeExperience/></Suspense>}/>
      <Route path="/work/" element={<Suspense fallback={<StandardRouteFallback/>}><Work/></Suspense>}/>
      <Route path="/work/:slug/" element={<Suspense fallback={<StandardRouteFallback/>}><Project/></Suspense>}/>
      <Route path="/about/" element={<Suspense fallback={<StandardRouteFallback/>}><About/></Suspense>}/>
      <Route path="/services/" element={<Suspense fallback={<StandardRouteFallback/>}><Services/></Suspense>}/>
      <Route path="/for-agencies/" element={<Suspense fallback={<StandardRouteFallback/>}><Agencies/></Suspense>}/>
      <Route path="/contact/" element={<Suspense fallback={<StandardRouteFallback/>}><Contact/></Suspense>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </WebScrollProvider></ThemeProvider>
}
