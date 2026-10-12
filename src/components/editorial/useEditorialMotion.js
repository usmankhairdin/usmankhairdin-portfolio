import { useEffect } from 'react'

// Editorial marketing pages share this Web-only reveal/visibility lifecycle.
export default function useEditorialMotion(root) {
  useEffect(() => {
    const page = root.current
    if (!page) return undefined
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Set()
    const seen = new WeakSet()
    const targets = page.querySelectorAll('[data-editorial-reveal]')
    const loops = page.querySelectorAll('[data-editorial-loop]')
    let reveals
    let visibility
    const stop = () => {
      reveals?.disconnect()
      visibility?.disconnect()
      animations.forEach((animation) => animation.cancel())
      animations.clear()
      targets.forEach((node) => node.removeAttribute('data-editorial-waiting'))
      loops.forEach((node) => node.removeAttribute('data-running'))
    }
    const start = () => {
      stop()
      if (preference.matches || !('IntersectionObserver' in window)) return
      reveals = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return
          target.removeAttribute('data-editorial-waiting')
          const animation = target.animate(
            [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 850, easing: 'cubic-bezier(.22,.8,.18,1)', fill: 'none' },
          )
          animations.add(animation)
          animation.onfinish = () => animations.delete(animation)
          seen.add(target)
          reveals.unobserve(target)
        })
      }, { threshold: 0.08 })
      targets.forEach((node) => {
        if (seen.has(node)) return
        node.setAttribute('data-editorial-waiting', '')
        reveals.observe(node)
      })
      visibility = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => { target.dataset.running = String(isIntersecting) })
      })
      loops.forEach((node) => visibility.observe(node))
    }
    const onVisibility = () => { page.dataset.pageVisible = String(!document.hidden) }
    onVisibility()
    start()
    preference.addEventListener('change', start)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      preference.removeEventListener('change', start)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [root])
}
