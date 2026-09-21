import { useEffect, useRef } from 'react'

/**
 * The ONE shared menu drawer (slides in from the right). Web mode follows the selected theme; immersive mode is a fixed
 * neutral presentation that ignores it. All behaviour (routing, corridor door requests, scroll lock, input pause) is owned
 * by Header and handed in through props — this component only renders and manages focus.
 */
export default function MenuDrawer({ id, open, mode, items, activeKey, onClose, onSelect, cta, ctaActive, onCta, containerRef }) {
  const panelRef = useRef(null)

  // Move focus into the panel when it opens; keep Tab inside the menu (panel + the header controls that stay above it).
  useEffect(() => {
    if (!open) return undefined
    const focusTimer = window.setTimeout(() => panelRef.current?.querySelector('a[href]')?.focus({ preventScroll: true }), 90)
    const onKey = (event) => {
      if (event.key !== 'Tab') return
      const scope = containerRef?.current
      if (!scope) return
      const focusable = [...scope.querySelectorAll('button:not([disabled]), a[href]')].filter((node) => !node.closest('[data-trap-skip]') && node.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(focusTimer); window.removeEventListener('keydown', onKey) }
  }, [open, containerRef])

  return <div className="menu-drawer" data-mode={mode} data-open={open ? 'true' : 'false'} aria-hidden={!open}>
    <div className="menu-drawer__scrim" onClick={onClose} />
    <aside id={id} className="menu-drawer__panel" role="dialog" aria-modal="true" aria-label="Site menu" ref={panelRef} data-lenis-prevent inert={!open}>
      <div className="menu-drawer__inner">
        <p className="menu-drawer__eyebrow" style={{ '--i': 0 }}><span>Index</span><i aria-hidden="true" /><span>{String(items.length).padStart(2, '0')}</span></p>
        <nav className="menu-drawer__nav" aria-label="Primary">
          <ol className="menu-drawer__list">
            {items.map((item, index) => {
              const active = item.key === activeKey
              // The page (or corridor room) you are already in is shown as the selected state only: same look, but not a link.
              if (active) {
                return <li className="menu-drawer__item" style={{ '--i': index + 1 }} key={item.key}>
                  <span className="menu-drawer__link is-active" aria-current="page">
                    <span className="menu-drawer__num" aria-hidden="true" />
                    <span className="menu-drawer__label">{item.label}</span>
                  </span>
                </li>
              }
              return <li className="menu-drawer__item" style={{ '--i': index + 1 }} key={item.key}>
                <a
                  className="menu-drawer__link"
                  href={item.to}
                  onClick={(event) => onSelect(item, event)}
                  onMouseEnter={item.warm}
                  onFocus={item.warm}
                >
                  <span className="menu-drawer__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className="menu-drawer__label">{item.label}</span>
                  <svg className="menu-drawer__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8.5 7H17v8.5" /></svg>
                </a>
              </li>
            })}
          </ol>
        </nav>
        <div className="menu-drawer__foot" style={{ '--i': items.length + 1 }}>
          {ctaActive
            ? <span className="pill pill--primary menu-drawer__cta is-current" aria-current="page">{cta.label}</span>
            : <a className="pill pill--primary menu-drawer__cta" href={cta.to} onClick={onCta} onMouseEnter={cta.warm} onFocus={cta.warm}>{cta.label} <span aria-hidden="true">↗</span></a>}
          <div className="menu-drawer__meta">
            <a href="mailto:brief@usmankhairdin.com">brief@usmankhairdin.com</a>
            <span>Lahore, Pakistan · Working globally</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
}
