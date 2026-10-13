import { useEffect, useRef } from 'react'
import './SanairaBrandMoment.css'

// Original Care Weave scene from the Sanaira project, mounted only near the viewport.
export default function SanairaBrandMoment() {
  const host = useRef(null)
  useEffect(() => {
    const element = host.current
    let cancelled = false, mounting = false, dispose
    const mount = () => {
      if (mounting || cancelled) return
      mounting = true
      import('./weave-still-scene.js').then(({ mountWeaveStill }) => {
        if (!cancelled) dispose = mountWeaveStill(element, { form: 0, turnSeconds: 44, fill: .8 })
      }).catch(() => { if (!cancelled) element.dataset.status = 'fallback' })
    }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) mount() }, { rootMargin: '160px' })
    observer.observe(element)
    return () => { cancelled = true; observer.disconnect(); dispose?.() }
  }, [])
  return <figure className="sn-brand">
    <div ref={host} className="sn-weave" data-status="pending" aria-hidden="true">
      <img className="sn-weave__image sn-weave__image--light" src="/assets/projects/sanaira/care-weave-still-light.webp" alt="" width="900" height="900" loading="lazy" />
      <img className="sn-weave__image sn-weave__image--dark" src="/assets/projects/sanaira/care-weave-still-dark.webp" alt="" width="900" height="900" loading="lazy" />
      <div className="sn-weave__wordmark">sanaira<span>HEALTH</span></div>
    </div>
    <figcaption>THE CARE WEAVE · 3D BRAND IN MOTION</figcaption>
  </figure>
}
