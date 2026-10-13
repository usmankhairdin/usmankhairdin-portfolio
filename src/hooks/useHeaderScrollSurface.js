import { useEffect } from 'react'

// The fixed measuring band never leaves the viewport or changes the hero's layout.
// Lenis and ordinary scrolling both update the real window scroll position.
export default function useHeaderScrollSurface(ref, enabled) {
  useEffect(() => {
    const header = ref.current
    if (!header || !enabled) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const next = window.scrollY > 24 ? 'true' : 'false'
      if (header.dataset.scrolled !== next) header.dataset.scrolled = next
      header.dataset.hidden = 'false'
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ref, enabled])
}
