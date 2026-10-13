import { linkState } from '../rooms/linkTargets.js'

/*
 * Coming back. A visitor who leaves the corridor through a link in a room and then presses
 * Back returns to the very spot they left - standing where they stood, looking where they
 * looked - instead of starting again at the Home page.
 */
const KEY = 'ukd-corridor-return'
const FRESH_MS = 30 * 60 * 1000

export function saveReturn(state) {
  try { window.sessionStorage.setItem(KEY, JSON.stringify({ ...state, t: Date.now() })) } catch { /* private mode */ }
}

let pending = null
/**
 * Reads (once) a saved spot, if this visit is a return to it: Back within the same page
 * session after leaving through a link, or a Back that restored the whole document.
 */
export function takeReturn(navigationType) {
  let saved = null
  try {
    saved = JSON.parse(window.sessionStorage.getItem(KEY) || 'null')
    window.sessionStorage.removeItem(KEY)
  } catch { saved = null }
  if (!saved || Date.now() - saved.t > FRESH_MS) return null
  const documentBack = performance.getEntriesByType?.('navigation')?.[0]?.type === 'back_forward'
  if (!((linkState.left && navigationType === 'POP') || documentBack)) return null
  linkState.left = false
  pending = saved
  return saved
}

/** The spot to restore, handed once to the walker. */
export function consumeReturn() {
  const spot = pending
  pending = null
  return spot
}
