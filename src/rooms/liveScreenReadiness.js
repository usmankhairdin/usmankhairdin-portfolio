export const LIVE_WEBSITE_TIMEOUT_MS = 30000

export function createWebsiteReadiness(ids) {
  const states = new Map(ids.map(id => [id, 'pending']))
  return {
    get complete() { return [...states.values()].every(state => state !== 'pending') },
    status(id) { return states.get(id) },
    settle(id, state) {
      if (states.has(id) && (state === 'live' || state === 'fallback')) states.set(id, state)
    },
  }
}

// Cross-origin iframe load also fires on browser error documents. Pair it
// with a network probe before replacing the capture. Opaque fetch responses
// cannot expose future XFO/CSP policy changes; supported URLs are audited.
export function watchWebsiteLoad(frame, url, { onLive, onFallback, platform = globalThis }) {
  let disposed = false, reachable = false, painted = false, promoted = false, failed = false
  let paint1 = 0, paint2 = 0
  const controller = new AbortController()
  const fallback = () => { if (!disposed && !promoted) onFallback() }
  const timeout = platform.setTimeout(fallback, LIVE_WEBSITE_TIMEOUT_MS)
  const promote = () => {
    if (disposed || failed || promoted || !reachable || !painted) return
    promoted = true; platform.clearTimeout(timeout); onLive()
  }
  const loaded = () => {
    paint1 = platform.requestAnimationFrame(() => {
      paint2 = platform.requestAnimationFrame(() => { painted = true; promote() })
    })
  }
  const error = () => { failed = true; fallback() }
  frame.addEventListener('load', loaded)
  frame.addEventListener('error', error)
  platform.fetch(url, { method: 'HEAD', mode: 'no-cors', credentials: 'omit', cache: 'no-store', signal: controller.signal })
    .then(() => { reachable = true; promote() }, error)
  return () => {
    disposed = true; controller.abort(); platform.clearTimeout(timeout)
    platform.cancelAnimationFrame(paint1); platform.cancelAnimationFrame(paint2)
    frame.removeEventListener('load', loaded); frame.removeEventListener('error', error)
  }
}
