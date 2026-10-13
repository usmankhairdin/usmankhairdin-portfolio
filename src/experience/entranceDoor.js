import gsap from 'gsap'

/*
 * The entrance door has ONE open state, shared by the Home page view of it and the same
 * door in the corridor's start wall. Because both render from this value, the door the
 * visitor opens on Home is the door they walk through, and the one they leave by.
 */
export const entrance = { open: 0 }

const listeners = new Set()
const notify = () => listeners.forEach((fn) => fn(entrance.open))
/** Subscribe to every change of the open value (used to wake on-demand canvases). */
export const onEntranceChange = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

let timeline = null

export function setEntranceOpen(value) {
  timeline?.kill()
  timeline = null
  entrance.open = value
  notify()
}

/** A hint that the door is there to be walked through: it parts a hand's width, or closes again. */
export function hintEntrance(amount, { reducedMotion = false } = {}) {
  timeline?.kill()
  if (reducedMotion) return
  timeline = gsap.timeline().to(entrance, { open: amount, duration: amount > entrance.open ? 0.55 : 0.45, ease: 'power2.out', onUpdate: notify })
}
