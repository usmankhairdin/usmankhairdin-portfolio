/*
 * What the cursor does over what. Everything is resolved from the DOM under the pointer with selectors, so no page
 * component needs to know about the cursor. Pages may opt in or out with data-cursor="view|enter|open|drag|scroll|top|native".
 *
 * Rules are checked in order and the first one whose selector matches the element (or an ancestor) wins.
 * `size` is the outer ring's diameter in px, `label` the text shown inside it, `tone` the fill ('ink' | 'accent').
 * `fill` is how solid the ring becomes (labelled states are solid so the text is always legible).
 * `magnet` = { k, max }: how much of the way to the element's centre the ring is drawn, and the cap in px. Kept small so the
 * pointer always stays under the user's control; the centre dot itself only follows a fraction of it.
 */
const RULES = [
  // Native semantics are preserved: real text/form controls keep the browser's own cursor.
  { kind: 'native', selector: '[data-cursor="native"],input,textarea,select,option,[contenteditable="true"],[contenteditable=""]' },
  { kind: 'top', selector: '[data-cursor="top"]', size: 60, label: 'TOP', tone: 'ink', fill: 0.94, magnet: { k: 0.3, max: 6 } },
  { kind: 'enter', selector: '[data-cursor="enter"],.entry-gallery-cta', size: 72, label: 'ENTER', tone: 'ink', fill: 0.96, magnet: { k: 0.14, max: 10 } },
  { kind: 'view', selector: '[data-cursor="view"],.work-feature__media,.work-feature__title', size: 82, label: 'VIEW', tone: 'ink', fill: 0.94, magnet: { k: 0.08, max: 8 } },
  { kind: 'drag', selector: '[data-cursor="drag"]', size: 72, label: 'DRAG', tone: 'ink', fill: 0.94, magnet: { k: 0.04, max: 4 } },
  { kind: 'scroll', selector: '[data-cursor="scroll"]', size: 72, label: 'SCROLL', tone: 'ink', fill: 0.94, magnet: { k: 0.04, max: 4 } },
  { kind: 'open', selector: '[data-cursor="open"],.pill,.menu-drawer__link,.menu-drawer__cta,.contact-big,a[target="_blank"]', size: 66, label: 'OPEN', tone: 'ink', fill: 0.94, magnet: { k: 0.16, max: 9 } },
  { kind: 'control', selector: '.hdr-btn,.site-logo', size: 50, label: '', tone: 'ink', fill: 0.07, magnet: { k: 0.3, max: 9 } },
  { kind: 'link', selector: 'a[href],button:not(:disabled),[role="button"],summary,label[for],[data-cursor]', size: 44, label: '', tone: 'ink', fill: 0.07, magnet: { k: 0.2, max: 8 } },
]

const IDLE = { kind: 'idle', size: 30, label: '', tone: 'ink', fill: 0, magnet: null, interactive: false }
const IDLE_IMMERSIVE = { kind: 'idle', size: 24, label: '', tone: 'ink', fill: 0, magnet: null, interactive: false }
const HIDDEN = { kind: 'native', size: 0, label: '', tone: 'ink', fill: 0, magnet: null, interactive: false }

/** The corridor variant: same infrastructure, no labels, no fills, a restrained expansion only. */
const immersive = (rule) => ({ kind: rule.kind, size: 40, label: '', tone: 'ink', fill: 0, magnet: { k: 0.1, max: 4 }, interactive: true })

export function resolveTarget(element, mode) {
  if (element instanceof Element) {
    for (const rule of RULES) {
      const hit = element.closest(rule.selector)
      if (!hit) continue
      if (rule.kind === 'native') return { ...HIDDEN, element: hit }
      const config = mode === 'immersive' ? immersive(rule) : { ...rule, interactive: true }
      return { ...config, element: hit }
    }
  }
  return { ...(mode === 'immersive' ? IDLE_IMMERSIVE : IDLE), element: null }
}

/** A corridor door under the pointer: the scene already flags this through the body cursor; no corridor code is involved. */
export const DOOR_HOVER = { kind: 'door', size: 44, label: '', tone: 'ink', fill: 0, magnet: null, interactive: true, element: null }
