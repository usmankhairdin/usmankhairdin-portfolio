import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import './backToTop.css'

const RING_R = 22
const RING_C = 2 * Math.PI * RING_R

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * Back to Top for the Web Experience. A thin progress ring around a quiet arrow: the ring is the page's scroll progress
 * (it replaces the visual orientation the scrollbar used to give). It is a view onto the REAL document scroll and returns
 * through the shared Lenis controller — there is no second scroll engine.
 *
 * It only exists while the Web scroll system is active: never in the corridor (the controller is suspended there), never
 * on a page that does not meaningfully scroll, never at the top. Per-frame progress goes straight to the ring's style
 * through a ref; React only re-renders when the control appears or disappears.
 */
export default function BackToTop({ controller }) {
  const { suspended } = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  const [visible, setVisible] = useState(false)
  const ringRef = useRef(null)

  useEffect(() => {
    if (suspended) { setVisible(false); return undefined }
    const doc = document.documentElement
    let maxScroll = 0
    let shown = false
    let raf = 0

    const measure = () => { maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight) }
    const update = () => {
      raf = 0
      const y = window.scrollY
      const progress = maxScroll > 0 ? clamp(y / maxScroll, 0, 1) : 0
      if (ringRef.current) ringRef.current.style.strokeDashoffset = (RING_C * (1 - progress)).toFixed(2)
      // Meaningful scroll only: a page of at least ~one extra screen, revealed after roughly a fifth of it (px-capped).
      const scrollable = maxScroll >= window.innerHeight * 0.9
      const threshold = clamp(maxScroll * 0.2, 320, 1100)
      const want = scrollable && y > (shown ? threshold * 0.7 : threshold)
      if (want !== shown) { shown = want; setVisible(want) }
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    const onResize = () => { measure(); schedule() }

    measure()
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize)
    observer?.observe(document.body)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      observer?.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [suspended])

  const goTop = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (controller.getSnapshot().status === 'smooth') {
      // The existing Lenis instance does the travel; longer pages get a slightly longer, still soft, glide.
      controller.scrollTo(0, { duration: clamp(0.9 + window.scrollY / 5200, 0.9, 1.7) })
    } else {
      // Touch / reduced motion: no Lenis is running, so the browser's own scroller is the only engine involved.
      window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'auto' : 'smooth' })
    }
  }

  if (suspended) return null

  return <button
    type="button"
    className="back-to-top"
    data-cursor="top"
    data-visible={visible ? 'true' : 'false'}
    aria-label="Back to top"
    tabIndex={visible ? 0 : -1}
    aria-hidden={visible ? undefined : true}
    onClick={goTop}
  >
    <svg className="back-to-top__ring" viewBox="0 0 50 50" aria-hidden="true" focusable="false">
      <circle className="back-to-top__track" cx="25" cy="25" r={RING_R} />
      <circle ref={ringRef} className="back-to-top__progress" cx="25" cy="25" r={RING_R} strokeDasharray={RING_C.toFixed(2)} strokeDashoffset={RING_C.toFixed(2)} />
    </svg>
    <span className="back-to-top__core" aria-hidden="true">
      <svg className="back-to-top__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
    </span>
  </button>
}
