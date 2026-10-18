import { useLayoutEffect, useRef } from 'react'
import './HeroSignalBackground.css'
import {TRACES,TRACE_DUTY} from './heroSignalTraces.js'

// Signal traces: [column, trail length px, travel seconds, delay seconds, flags]. A trace descends the viewport in `travel` seconds (4.6–7.5s) during
// the first 60% of its cycle and rests off screen for the rest. Columns sit on the 72px lines with irregular gaps (2, 1, 2, 2, 1, 2, 1 lines skipped);
// most columns carry two traces on different cycles, so they never fall into step. The delays were searched so that ~9–10 traces are on screen at
// any moment in a 1440px window, spread over the full height (some entering, some mid-way, some leaving), and two traces on one line never overlap.
// flags: m = kept on a phone, w = only on wide screens (beyond the 1440px design width).

/** The original Home atmosphere, shared without copying the Home's tag physics.
 * Home supplies its existing measured copy-mask variables on .splash-bg. Other
 * heroes measure just their own copy; trace data, pitch, paint and timing are identical.
 */
export default function HeroSignalBackground({ measureCopy = false }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    if (!measureCopy) return undefined
    const layer = ref.current
    const hero = layer?.parentElement
    const copy = hero?.querySelector('.route-hero__copy')
    if (!layer || !hero || !copy) return undefined
    let disposed = false
    const measure = () => {
      if (disposed) return
      const box = hero.getBoundingClientRect()
      const text = copy.getBoundingClientRect()
      layer.style.setProperty('--ccx', `${text.left - box.left + text.width / 2}px`)
      layer.style.setProperty('--ccy', `${text.top - box.top + text.height / 2}px`)
      layer.style.setProperty('--crx', `${text.width * .64}px`)
      layer.style.setProperty('--cry', `${text.height * .7}px`)
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(hero)
    resize.observe(copy)
    document.fonts?.ready.then(measure)
    return () => { disposed = true; resize.disconnect() }
  }, [measureCopy])

  return <div ref={ref} className="hero-signal-background" data-hero-signal-background="" aria-hidden="true">
    <div className="hero-signal-background__traces">
      {TRACES.map(([col, len, travel, delay, flags], index) => <i
        key={index}
        className={`sb-trace${flags.includes('m') ? ' sb-trace--m' : ''}${flags.includes('w') ? ' sb-trace--w' : ''}`}
        style={{ '--col': col, '--len': `${len}px`, '--cycle': `${(travel / TRACE_DUTY).toFixed(2)}s`, '--delay': `${delay}s` }}
      />)}
    </div>
  </div>
}
