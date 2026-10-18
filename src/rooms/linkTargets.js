/*
 * Things in the rooms that lead somewhere: a page of the site, or an email. With the mouse
 * free they answer the cursor; with the mouse captured for looking, they answer the centre
 * dot. Whichever is pointed at, a small note says where it goes and that a page leaves the
 * corridor - and before leaving, the walker leaves a note of where they stood, so Back
 * returns them to the same spot.
 */
import * as THREE from 'three'

export const linkTargets = new Map()   // mesh -> route
export const linkState = { hovered: null, aimed: null, save: null, left: false }

const PAGES = {
  '/about/': 'the About page',
  '/services/': 'the Services page',
  '/for-agencies/': 'the For Agencies page',
  '/contact/': 'the Contact page',
  '/work/': 'the Work gallery',
  '/web/': 'the Web Experience',
}

export function describeLink(route) {
  if (!route) return ''
  if (route.startsWith('mailto:')) return `Write to ${route.slice(7)} — opens your email, you stay here`
  const page = PAGES[route] || (/^https?:\/\//i.test(route)?'the live project website':route.startsWith('/work/') ? 'the project page' : 'the page')
  return `Opens ${page} — you leave the corridor; Back brings you right here`
}

export function registerLink(mesh, route) {
  if (!mesh || !route) return () => {}
  linkTargets.set(mesh, route)
  return () => {
    linkTargets.delete(mesh)
    if (linkState.hovered === mesh) pointLink('hovered', null)
    if (linkState.aimed === mesh) pointLink('aimed', null)
  }
}

const occluder = new THREE.Raycaster()
const shown = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true }
/**
 * True when a pointer event's ray meets `mesh` before anything else in the scene - so a link
 * behind a wall, a door or another room never answers.
 */
export function inFront(e, mesh) {
  let root = mesh
  while (root.parent) root = root.parent
  occluder.ray.copy(e.ray)
  occluder.near = 0
  occluder.far = e.distance + 0.02
  const hit = occluder.intersectObjects(root.children, true).find((h) => shown(h.object))
  return !hit || hit.object === mesh
}

/* Keeps the pointing state and the note on screen in step with what is pointed at. */
export function pointLink(kind, mesh) {
  linkState[kind] = mesh
  if (typeof document === 'undefined') return
  const current = linkState.aimed || linkState.hovered
  const note = document.querySelector('.link-note')
  if (note) {
    note.textContent = current ? describeLink(linkTargets.get(current)) : ''
    note.classList.toggle('is-visible', Boolean(current))
  }
  document.body.classList.toggle('look-aim', Boolean(linkState.aimed))
  document.body.classList.toggle('link-hover', Boolean(linkState.hovered))
}

/** Follows a link: an email opens in place; a page is left for, after noting where we stood. */
export function followLink(route, navigate) {
  if (!route) return
  if (route.startsWith('mailto:')) {
    window.location.href = route
    return
  }
  linkState.save?.()
  linkState.left = true
  if (document.pointerLockElement) document.exitPointerLock?.()
  pointLink('hovered', null)
  pointLink('aimed', null)
  if(/^https?:\/\//i.test(route)){window.location.assign(route);return}
  navigate(route)
}
