import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { hostLabel } from '../data/projects.js'
import './BrowserFrame.css'
import './ProjectBrowserPreview.css'

/**
 * The project's live page in the site's browser-frame language (the same frame the Work showcase uses), with the interactive
 * preview kept exactly as it was inside the old laptop screen: hovering scrolls the full-page capture up through the page at a steady
 * reading pace; leaving eases it back to the top. Off for coarse pointers and reduced motion (the capture then simply rests at the top).
 *
 * The OUTER frame is fixed (16:10 viewport); the capture's own proportions are handled inside it, never stretched.
 */
export default function ProjectBrowserPreview({ project, eager = false }) {
  const fullpageSource = project.media?.fullpage?.[0] || `/assets/projects/${project.slug}/fullpage.webp`
  const fallbackSource = project.media?.hero?.[0] || project.poster
  const [src, setSrc] = useState(fullpageSource)
  const handleErr = () => { if (src !== fallbackSource) setSrc(fallbackSource) }

  const screenRef = useRef(null)
  const imgRef = useRef(null)
  const tweenRef = useRef(null)
  const maxTravelRef = useRef(0)

  const shouldDisableHover = () => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches
  }
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const updateMetrics = () => {
    if (!screenRef.current || !imgRef.current) return
    const imgH = imgRef.current.getBoundingClientRect().height
    const viewportH = screenRef.current.clientHeight
    const maxTravel = Math.max(0, imgH - viewportH)
    maxTravelRef.current = maxTravel
    const currentY = parseFloat(gsap.getProperty(imgRef.current, 'y')) || 0
    const clampedY = clamp(currentY, -maxTravel, 0)
    if (clampedY !== currentY) gsap.set(imgRef.current, { y: clampedY })
  }

  useEffect(() => {
    const imgEl = imgRef.current
    const screenEl = screenRef.current
    if (!imgEl) return undefined
    const onLoad = () => updateMetrics()
    imgEl.addEventListener('load', onLoad)
    if (imgEl.complete) onLoad()
    const observer = new ResizeObserver(() => updateMetrics())
    if (screenEl) observer.observe(screenEl)
    return () => {
      imgEl.removeEventListener('load', onLoad)
      observer.disconnect()
      if (tweenRef.current) { tweenRef.current.kill(); tweenRef.current = null }
    }
  }, [src])

  const handlePointerEnter = () => {
    if (shouldDisableHover() || !imgRef.current) return
    if (tweenRef.current) tweenRef.current.kill()
    const currentY = parseFloat(gsap.getProperty(imgRef.current, 'y')) || 0
    const remaining = -maxTravelRef.current - currentY
    const duration = clamp(Math.abs(remaining) / 270, 0.35, 14)
    tweenRef.current = gsap.to(imgRef.current, { y: -maxTravelRef.current, duration, ease: 'none', overwrite: 'auto' })
  }

  const handlePointerLeave = () => {
    if (!imgRef.current) return
    if (tweenRef.current) tweenRef.current.kill()
    const currentY = parseFloat(gsap.getProperty(imgRef.current, 'y')) || 0
    const duration = clamp(Math.abs(currentY) / 850, 0.45, 2.2)
    tweenRef.current = gsap.to(imgRef.current, { y: 0, duration, ease: 'power2.out', overwrite: 'auto' })
  }

  return <figure className="pbp">
    <div className="pbp__frame ui-frame">
      <div className="ui-frame__bar" aria-hidden="true"><i /><i /><i /><span className="ui-frame__url">{hostLabel(project.liveUrl)}</span></div>
      <div
        ref={screenRef}
        className="pbp__screen ui-frame__screen"
        data-cursor="scroll"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <img
          ref={imgRef}
          className="pbp__shot"
          src={src}
          alt={project.mediaAlt?.hero || `${project.title} full-page interface desktop capture`}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          onError={handleErr}
        />
      </div>
    </div>
  </figure>
}
