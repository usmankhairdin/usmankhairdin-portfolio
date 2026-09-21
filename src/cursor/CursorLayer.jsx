import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useWebScroll } from '../scroll/WebScrollProvider.jsx'
import { createCursor } from './cursorEngine.js'
import './cursor.css'

/**
 * The ONE shared cursor layer (mounted once, above the routes). Desktop / precise pointers only — it stays inert on touch.
 * It never touches the corridor: it only reads the shared scroll controller's existing "suspended" state (the corridor
 * suspends Web scroll while it owns the wheel) to switch to its simplified immersive presentation.
 */
export default function CursorLayer() {
  const controller = useWebScroll()
  const rootRef = useRef(null)
  const engineRef = useRef(null)
  const { suspended } = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)

  useEffect(() => {
    const engine = createCursor(rootRef.current)
    engineRef.current = engine
    return () => { engine.destroy(); engineRef.current = null }
  }, [])

  useEffect(() => { engineRef.current?.setMode(suspended ? 'immersive' : 'web') }, [suspended])

  return <div className="ukd-cursor" data-mode="web" data-tone="ink" data-state="idle" aria-hidden="true" ref={rootRef}>
    <div className="ukd-cursor__ring">
      <svg className="ukd-cursor__svg" viewBox="-50 -50 100 100" focusable="false"><path className="ukd-cursor__path" /></svg>
    </div>
    <span className="ukd-cursor__label" />
    <div className="ukd-cursor__dot" />
  </div>
}
