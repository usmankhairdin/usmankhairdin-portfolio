import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './BrowserFrame.css'
import './ProjectBrowserPreview.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * A real full-page project capture inside a fixed browser viewport. Fine pointers
 * scroll it at a steady reading pace; leaving returns it to the top. The local
 * hero/crop remains underneath until the larger capture is decoded, so lazy
 * loading can never present an empty browser frame.
 */
export function ProjectCapture({
  project,
  eager = false,
  className = '',
  placeholderSource,
  placeholderSrcSet,
  placeholderSizes,
}) {
  const sources = Array.from(new Set([
    ...(project.media?.fullpage || []),
    ...(project.media?.hero || []),
    project.poster,
  ].filter(Boolean)))
  const [sourceIndex, setSourceIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const screenRef = useRef(null)
  const imgRef = useRef(null)
  const tweenRef = useRef(null)
  const maxTravelRef = useRef(0)
  const hoveringRef = useRef(false)
  const src = sources[Math.min(sourceIndex, sources.length - 1)]

  const motionDisabled = () => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches
  }

  const killTween = () => {
    tweenRef.current?.kill()
    tweenRef.current = null
  }

  const animateToEnd = () => {
    if (motionDisabled() || !imgRef.current) return
    killTween()
    const currentY = Number.parseFloat(gsap.getProperty(imgRef.current, 'y')) || 0
    const targetY = -maxTravelRef.current
    const duration = clamp(Math.abs(targetY - currentY) / 270, 0.35, 14)
    tweenRef.current = gsap.to(imgRef.current, { y: targetY, duration, ease: 'none', overwrite: 'auto' })
  }

  const returnToTop = (immediate = false) => {
    if (!imgRef.current) return
    killTween()
    const currentY = Number.parseFloat(gsap.getProperty(imgRef.current, 'y')) || 0
    if (immediate) {
      gsap.set(imgRef.current, { y: 0 })
      return
    }
    const duration = clamp(Math.abs(currentY) / 850, 0.45, 2.2)
    tweenRef.current = gsap.to(imgRef.current, { y: 0, duration, ease: 'power2.out', overwrite: 'auto' })
  }

  const updateMetrics = () => {
    if (!screenRef.current || !imgRef.current) return
    const imgH = imgRef.current.getBoundingClientRect().height
    const viewportH = screenRef.current.clientHeight
    const maxTravel = Math.max(0, imgH - viewportH)
    maxTravelRef.current = maxTravel
    const currentY = Number.parseFloat(gsap.getProperty(imgRef.current, 'y')) || 0
    killTween()
    gsap.set(imgRef.current, { y: clamp(currentY, -maxTravel, 0) })
    if (hoveringRef.current && !motionDisabled()) animateToEnd()
  }

  useEffect(() => {
    const imgEl = imgRef.current
    const screenEl = screenRef.current
    if (!imgEl || !screenEl) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)')
    const onPreferenceChange = () => {
      if (reduced.matches || coarse.matches) returnToTop(true)
      else if (hoveringRef.current) animateToEnd()
    }
    const onLoad = () => {
      setLoaded(true)
      updateMetrics()
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateMetrics)

    imgEl.addEventListener('load', onLoad)
    observer?.observe(screenEl)
    reduced.addEventListener?.('change', onPreferenceChange)
    coarse.addEventListener?.('change', onPreferenceChange)
    if (imgEl.complete && imgEl.naturalWidth) onLoad()

    return () => {
      imgEl.removeEventListener('load', onLoad)
      observer?.disconnect()
      reduced.removeEventListener?.('change', onPreferenceChange)
      coarse.removeEventListener?.('change', onPreferenceChange)
      killTween()
    }
  }, [src])

  const handlePointerEnter = () => {
    hoveringRef.current = true
    animateToEnd()
  }
  const handlePointerLeave = () => {
    hoveringRef.current = false
    returnToTop()
  }
  const handleError = () => {
    setLoaded(false)
    setSourceIndex((index) => Math.min(index + 1, sources.length - 1))
  }

  return <span
    ref={screenRef}
    className={`project-capture ${className}${loaded ? ' is-loaded' : ''}`}
    data-cursor="scroll"
    onPointerEnter={handlePointerEnter}
    onPointerLeave={handlePointerLeave}
  >
    {project.poster && <img
      className="project-capture__poster"
      src={project.poster}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />}
    {placeholderSource && <img
      className="project-capture__placeholder"
      src={placeholderSource}
      srcSet={placeholderSrcSet}
      sizes={placeholderSizes}
      alt=""
      aria-hidden="true"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />}
    <img
      ref={imgRef}
      className="project-capture__shot"
      src={src}
      alt={project.mediaAlt?.hero || `${project.title} full-page interface desktop capture`}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onError={handleError}
    />
  </span>
}

/** The detail-page browser shell around the shared interactive capture. */
export default function ProjectBrowserPreview({ project, eager = false }) {
  const placeholderSource = project.media?.hero?.[0] || project.poster

  return <figure className="pbp">
    <div className="pbp__frame ui-frame">
      <ProjectCapture
        key={project.slug}
        project={project}
        eager={eager}
        className="pbp__screen ui-frame__screen"
        placeholderSource={placeholderSource}
      />
    </div>
  </figure>
}
