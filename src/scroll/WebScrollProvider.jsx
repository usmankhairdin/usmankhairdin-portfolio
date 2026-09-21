import { createContext, useContext, useLayoutEffect, useState } from 'react'
import WebScrollController from './WebScrollController.js'
import BackToTop from './BackToTop.jsx'
import './webScroll.css'

const WebScrollContext = createContext(null)

/**
 * Shared scroll shell for the standalone Web Experience (homepage splash, About, Work, projects,
 * Services, For Agencies, Contact and any future normal route). Mount it ONCE above the routes.
 * It owns the single smooth-scroll controller. The visible scrollbar is hidden; orientation is the Back to Top ring.
 */
export function WebScrollProvider({ children }) {
  const [controller] = useState(() => new WebScrollController())

  // Layout effect: the controller (and the html classes that hide the native scrollbar) are in place
  // before the first paint, so there is no scrollbar-gutter shift or initialisation jump.
  useLayoutEffect(() => {
    controller.mount()
    return () => controller.unmount()
  }, [controller])

  return <WebScrollContext.Provider value={controller}>
    {children}
    <BackToTop controller={controller} />
  </WebScrollContext.Provider>
}

/** The shared scroll controller (scrollTo / resetToTop / suspend). Null outside the provider. */
export function useWebScroll() {
  return useContext(WebScrollContext)
}

/**
 * Immersive surfaces (the corridor) call this with `true` while they own the wheel. Web smooth scroll and the
 * custom scrollbar are fully suspended for exactly that time and resume, cleanly, when it turns false or unmounts.
 * A layout effect keeps the hand-off synchronous with the commit that enables the immersive controls.
 */
export function useWebScrollSuspension(active, reason = 'immersive') {
  const controller = useWebScroll()
  useLayoutEffect(() => {
    if (!active || !controller) return undefined
    return controller.suspend(reason)
  }, [controller, active, reason])
}
