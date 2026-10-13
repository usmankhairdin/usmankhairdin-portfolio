import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useJourney } from '../experience/JourneyContext.jsx'
import { useWebScroll } from '../scroll/WebScrollProvider.jsx'
import { preloadRoute, WEB_HOME } from '../routeLoaders.js'
import useHeaderScrollSurface from '../hooks/useHeaderScrollSurface.js'
import MenuDrawer from './MenuDrawer.jsx'
import ThemeToggle from './ThemeToggle.jsx'

/*
 * The ONE shared navigation system.
 *
 *   web        logo left · Theme + Menu right · fixed above the page · soft surface after scrolling
 *   immersive  Menu right only (no logo)     · fixed HUD (no auto-hide) · drawer is a fixed neutral presentation
 *
 * Same logo, same Menu control, same drawer, same motion language in both. Immersive mode never mounts the Theme control.
 * Web heroes begin behind the transparent header; scrolling adds a soft theme-aware surface without moving the page.
 *
 * In the corridor this component only (a) renders the HUD and (b) reports "menu open" through the existing
 * journey `navigationOpen` flag, which the corridor camera already honours to pause its input. Closing the drawer
 * clears the flag and the corridor continues from exactly where it was. No camera, door or room logic is touched.
 */
const LOGO_SRC = '/assets/ukd-logo.svg'
const RESCUE_URL = 'https://rescue.usmankhairdin.com'
const NAV_DELAY = 340   // ms: lets the drawer start leaving before the route swaps under it

const ITEMS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'about', label: 'About', to: '/about/', door: 'about' },
  { key: 'work', label: 'Work', to: '/work/', door: 'work' },
  { key: 'services', label: 'Services', to: '/services/', door: 'services' },
  // In the corridor, For Agencies is a wall of the Services room.
  { key: 'agencies', label: 'For Agencies', to: '/for-agencies/', door: 'services' },
  { key: 'contact', label: 'Contact', to: '/contact/', door: 'contact' },
]
const CTA = { label: 'Send a brief', to: '/contact/' }
// On the Web, Contact is reached through the CTA in the drawer footer, so it is not repeated in the list. It stays in ITEMS for routing and the current-page state.
// The corridor has no form of its own, so there the CTA leads to the Contact page (Back returns to the same spot), and the
// list keeps Contact: it walks to the Contact hall.
// On the Web, Home is the Web Experience's own homepage, and the last item leads into the Corridor at '/'.
const MENU_ITEMS = [
  ...ITEMS.filter((item) => item.key !== 'contact').map((item) => (item.key === 'home' ? { ...item, to: WEB_HOME } : item)),
  { key: 'corridor', label: '3D Corridor', to: '/' },
]
// In the Corridor, a Home item would only reload the page back out at the entrance, so its place goes to the Web
// Experience. It leaves the way the room links do: the walker's spot is kept, and Back returns them to it.
const CORRIDOR_ITEMS = ITEMS.map((item) => (item.key === 'home' ? { key: 'web', label: 'Web Experience', to: WEB_HOME } : item))

const routeForPath = {
  '/': 'home',
  [WEB_HOME]: 'homeWeb',
  '/work/': 'work',
  '/services/': 'services',
  '/for-agencies/': 'agencies',
  '/about/': 'about',
  '/contact/': 'contact',
}

const activeKeyForPath = (pathname) => {
  if (pathname === '/' || pathname === WEB_HOME) return 'home'
  return ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to))?.key
}

// Leaving the corridor is a document load back to '/'. The boot loader is for arriving (first visit, refresh), not for that.
const skipBootOnce = () => { try { window.sessionStorage.setItem('ukd-skip-boot', '1') } catch { /* private mode: the loader may replay */ } }

const plainClick = (event) => !(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)

export default function Header({ immersive = false }) {
  const mode = immersive ? 'immersive' : 'web'
  const journey = useJourney()
  const setJourneyNavigationOpen = journey?.setNavigationOpen
  const webScroll = useWebScroll()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const headerRef = useRef(null)
  const triggerRef = useRef(null)
  const navTimer = useRef(0)

  useHeaderScrollSurface(headerRef, mode === 'web')

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }))
  }, [])

  // Escape closes the drawer and returns focus to the Menu control.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') { event.preventDefault(); close(true) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Corridor: pause the corridor's own input while the drawer is open (existing hook, resumes on close / unmount).
  useEffect(() => {
    setJourneyNavigationOpen?.(open)
    return () => setJourneyNavigationOpen?.(false)
  }, [setJourneyNavigationOpen, open])

  // Web: keep the page still behind the drawer. The shared scroll controller stops Lenis and locks the document, and
  // restores both on release (its own lock counter guarantees no stuck state).
  useEffect(() => {
    if (!open || mode !== 'web' || !webScroll) return undefined
    return webScroll.lock()
  }, [open, mode, webScroll])

  useEffect(() => () => window.clearTimeout(navTimer.current), [])

  const items = useMemo(() => (
    mode === 'web' ? MENU_ITEMS.map((item) => ({ ...item, warm: () => preloadRoute(routeForPath[item.to]) })) : CORRIDOR_ITEMS
  ), [mode])
  const cta = useMemo(() => ({ ...CTA, warm: () => preloadRoute('contact') }), [])

  const activeKey = mode === 'web'
    ? activeKeyForPath(pathname)
    // Inside the corridor the URL is always '/', so selection follows the journey: an item is active only while its room is.
    : (journey?.phase === 'room' ? ITEMS.find((item) => item.door === journey?.activeDoor)?.key : undefined)

  const goWeb = (to, event) => {
    if (!plainClick(event)) return
    event.preventDefault()
    close()
    if (to === pathname) return
    preloadRoute(routeForPath[to])
    window.clearTimeout(navTimer.current)
    navTimer.current = window.setTimeout(() => navigate(to), NAV_DELAY)
  }
  // the corridor's own link module (already loaded there; kept out of the Web pages' bundle)
  const leaveCorridor = (to, event) => {
    if (!plainClick(event)) return
    event.preventDefault()
    close()
    import('../rooms/linkTargets.js').then(({ followLink }) => followLink(to, navigate))
  }
  const goImmersive = (door, event) => {
    if (!plainClick(event)) return
    if (!door) { skipBootOnce(); return }   // an item with no room: a normal document load back to the entrance
    // Compact/coarse Corridor presentations intentionally use the static pages;
    // the 3D room HTML is hidden there, so let the link perform its normal load.
    if (window.matchMedia('(max-width: 650px), (pointer: coarse)').matches) return
    event.preventDefault()
    close()
    journey?.requestDoor(door)
  }
  const onSelect = (item, event) => {
    if (mode === 'web') goWeb(item.to, event)
    else if (item.key === 'web') leaveCorridor(item.to, event)
    else goImmersive(item.door, event)
  }
  const onCta = (event) => {
    if (mode === 'web') { goWeb(CTA.to, event); return }
    leaveCorridor(CTA.to, event)
  }

  // Web: on the homepage the logo is only a mark (you are already home); everywhere else it leads home.
  // The corridor shows no logo over the scene - only the Menu, whose Home item leads back out.
  const logoImg = <img src={LOGO_SRC} width="1362" height="564" alt="" decoding="async" draggable="false" />
  const logo = mode === 'web'
    ? (pathname === WEB_HOME
      ? <span className="site-logo site-logo--current" role="img" aria-label="Usman Khair Din — you are on the home page" aria-current="page" data-trap-skip>{logoImg}</span>
      : <Link to={WEB_HOME} className="site-logo" aria-label="Usman Khair Din — home" data-trap-skip onPointerEnter={() => preloadRoute('homeWeb')} onFocus={() => preloadRoute('homeWeb')} onClick={() => close()}>{logoImg}</Link>)
    : null

  return <div className="site-header-root" data-mode={mode} data-menu-open={open ? 'true' : 'false'} ref={rootRef}>
    {mode === 'web' && <a className="skip-link" href="#main-content" data-trap-skip>Skip to content</a>}
    {/* `topbar` is kept as a class because the Work page measures it to place its sticky stack. The band itself never moves. */}
    <header ref={headerRef} className="topbar site-header" data-hidden="false" data-scrolled="false">
      <div className="site-header__inner">
        {logo}
        <div className="site-header__controls">
          {mode === 'web' && <a
            className="hdr-rescue"
            href={RESCUE_URL}
            aria-label="Visit SaaS UI Rescue (opens in a new tab)"
            target="_blank"
            rel="noopener noreferrer"
          >SaaS UI Rescue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></a>}
          {mode === 'web' && <ThemeToggle />}
          <button
            type="button"
            ref={triggerRef}
            className="hdr-btn hdr-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
          ><span className="hdr-menu__icon" aria-hidden="true"><i /><i /></span></button>
        </div>
      </div>
    </header>
    <MenuDrawer
      id="site-menu"
      open={open}
      mode={mode}
      items={items}
      activeKey={activeKey}
      onClose={() => close(true)}
      onSelect={onSelect}
      cta={cta}
      ctaActive={mode === 'web' && activeKey === 'contact'}
      onCta={onCta}
      containerRef={rootRef}
    />
  </div>
}
