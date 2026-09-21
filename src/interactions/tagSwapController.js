/**
 * Free-drag collision physics for standalone Web Experience tag groups.
 *
 * Home/Splash intentionally keeps its own bespoke token physics. This
 * controller is only mounted for `.route-page .js-horizontal-reorder` groups.
 *
 * The flex/wrap layout is only the starting arrangement. Once a tag is dragged,
 * every tag owns a free 2D position inside the group. The held tag tracks the
 * pointer continuously; neighbours yield before contact and may push a chain of
 * other tags. Hard collision constraints are solved every animation frame, so
 * tags never pass through or render on top of one another and nothing snaps to
 * row/column slots after drop.
 */
const SELECTOR = '.js-horizontal-reorder'
const FINE = '(hover: hover) and (pointer: fine)'
const MIN_GAP = 8
const TAU_DRAG = 0.026
const KEY_NUDGE = 18
const SOLVER_PASSES = 22
const EPSILON = 0.35

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

function directTags(group) {
  return Array.from(group.children).filter(el => el instanceof HTMLElement && el.matches('span'))
}

function parseGap(value) {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function getGroupGap(group) {
  const style = getComputedStyle(group)
  return Math.max(MIN_GAP, parseGap(style.columnGap), parseGap(style.rowGap))
}

function boxesCollide(a, b, gap) {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 + gap - 0.25 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2 + gap - 0.25
  )
}

function snapshotAttribute(el, name) {
  return el.hasAttribute(name) ? el.getAttribute(name) : null
}

function restoreAttribute(el, name, value) {
  if (value === null) el.removeAttribute(name)
  else el.setAttribute(name, value)
}

export function mountTagSwapController(root = document) {
  const precise = window.matchMedia(FINE)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const groups = new Map()
  let drag = null
  let frame = 0
  let last = 0
  let dead = false
  let resizeObserver = null

  const enabled = () => precise.matches && !reduced.matches

  function boundsFor(gs, item) {
    const halfW = item.w / 2
    const halfH = item.h / 2
    return {
      minX: halfW,
      maxX: Math.max(halfW, gs.group.clientWidth - halfW),
      minY: halfH,
      maxY: Math.max(halfH, gs.group.clientHeight - halfH),
    }
  }

  function clampItem(gs, item) {
    const b = boundsFor(gs, item)
    item.x = clamp(item.x, b.minX, b.maxX)
    item.y = clamp(item.y, b.minY, b.maxY)
  }

  function place(item) {
    const dx = item.x - item.baseX
    const dy = item.y - item.baseY
    item.el.style.translate = `${dx.toFixed(2)}px ${dy.toFixed(2)}px`
  }

  function availableDistance(gs, item, axis, sign) {
    const b = boundsFor(gs, item)
    if (axis === 'x') return sign > 0 ? b.maxX - item.x : item.x - b.minX
    return sign > 0 ? b.maxY - item.y : item.y - b.minY
  }

  function collisionInfo(a, b, gap) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const needX = (a.w + b.w) / 2 + gap - Math.abs(dx)
    const needY = (a.h + b.h) / 2 + gap - Math.abs(dy)
    if (needX <= 0 || needY <= 0) return null
    return { dx, dy, needX, needY }
  }

  function pairSigns(a, b, info, axis) {
    if (axis === 'x') {
      const signA = Math.abs(info.dx) > 0.25 ? Math.sign(info.dx) : (a.signX || 1)
      a.signX = signA
      b.signX = -signA
      return [signA, -signA]
    }
    const signA = Math.abs(info.dy) > 0.25 ? Math.sign(info.dy) : (a.signY || 1)
    a.signY = signA
    b.signY = -signA
    return [signA, -signA]
  }

  function axisOptionFixed(gs, fixed, movable, info, axis) {
    const need = axis === 'x' ? info.needX : info.needY
    const signs = pairSigns(movable, fixed, {
      dx: -info.dx,
      dy: -info.dy,
    }, axis)
    const sign = signs[0]
    const available = availableDistance(gs, movable, axis, sign)
    return {
      axis,
      need,
      sign,
      available,
      viable: available + 0.2 >= need,
      score: need / Math.max(available, 0.001),
    }
  }

  function resolveFixedPair(gs, fixed, movable) {
    const info = collisionInfo(fixed, movable, gs.gap)
    if (!info) return true

    const options = [
      axisOptionFixed(gs, fixed, movable, info, 'x'),
      axisOptionFixed(gs, fixed, movable, info, 'y'),
    ]
    const viable = options.filter(option => option.viable)
    const chosen = (viable.length ? viable : options).sort((a, b) => {
      if (a.viable !== b.viable) return a.viable ? -1 : 1
      if (Math.abs(a.score - b.score) > 0.05) return a.score - b.score
      return a.need - b.need
    })[0]

    const amount = Math.min(chosen.need + 0.35, chosen.available)
    if (chosen.axis === 'x') movable.x += chosen.sign * amount
    else movable.y += chosen.sign * amount
    clampItem(gs, movable)
    return amount + 0.15 >= chosen.need
  }

  function axisOptionShared(gs, a, b, info, axis) {
    const need = axis === 'x' ? info.needX : info.needY
    const [signA, signB] = pairSigns(a, b, info, axis)
    const availA = availableDistance(gs, a, axis, signA)
    const availB = availableDistance(gs, b, axis, signB)
    const total = availA + availB
    return {
      axis,
      need,
      signA,
      signB,
      availA,
      availB,
      total,
      viable: total + 0.2 >= need,
      score: need / Math.max(total, 0.001),
    }
  }

  function resolveSharedPair(gs, a, b) {
    const info = collisionInfo(a, b, gs.gap)
    if (!info) return true

    const options = [
      axisOptionShared(gs, a, b, info, 'x'),
      axisOptionShared(gs, a, b, info, 'y'),
    ]
    const viable = options.filter(option => option.viable)
    const chosen = (viable.length ? viable : options).sort((p, q) => {
      if (p.viable !== q.viable) return p.viable ? -1 : 1
      if (Math.abs(p.score - q.score) > 0.05) return p.score - q.score
      return p.need - q.need
    })[0]

    if (chosen.total <= 0.001) return false
    const amount = Math.min(chosen.need + 0.35, chosen.total)
    let moveA = amount * (chosen.availA / chosen.total)
    let moveB = amount - moveA
    moveA = Math.min(moveA, chosen.availA)
    moveB = Math.min(moveB, chosen.availB)
    const leftover = amount - moveA - moveB
    if (leftover > 0.001) {
      const roomA = chosen.availA - moveA
      const addA = Math.min(leftover, roomA)
      moveA += addA
      moveB += Math.min(leftover - addA, chosen.availB - moveB)
    }

    if (chosen.axis === 'x') {
      a.x += chosen.signA * moveA
      b.x += chosen.signB * moveB
    } else {
      a.y += chosen.signA * moveA
      b.y += chosen.signB * moveB
    }
    clampItem(gs, a)
    clampItem(gs, b)
    return moveA + moveB + 0.15 >= chosen.need
  }

  function collisionPairs(gs) {
    const pairs = []
    for (let i = 0; i < gs.items.length; i += 1) {
      for (let j = i + 1; j < gs.items.length; j += 1) {
        const a = gs.items[i]
        const b = gs.items[j]
        if (boxesCollide(a, b, gs.gap)) pairs.push([a, b])
      }
    }
    return pairs
  }

  function solveCollisions(gs, held) {
    for (let pass = 0; pass < SOLVER_PASSES; pass += 1) {
      let changed = false

      if (held) {
        for (const other of gs.items) {
          if (other === held || !boxesCollide(held, other, gs.gap)) continue
          resolveFixedPair(gs, held, other)
          changed = true
        }
      }

      for (let i = 0; i < gs.items.length; i += 1) {
        const a = gs.items[i]
        if (a === held) continue
        for (let j = i + 1; j < gs.items.length; j += 1) {
          const b = gs.items[j]
          if (b === held || !boxesCollide(a, b, gs.gap)) continue
          resolveSharedPair(gs, a, b)
          changed = true
        }
      }

      for (const item of gs.items) clampItem(gs, item)
      if (!changed || collisionPairs(gs).length === 0) return true
    }
    return collisionPairs(gs).length === 0
  }

  function pointIsValid(gs, item, x, y) {
    const b = boundsFor(gs, item)
    if (x < b.minX - 0.2 || x > b.maxX + 0.2 || y < b.minY - 0.2 || y > b.maxY + 0.2) return false
    const probe = { x, y, w: item.w, h: item.h }
    return !gs.items.some(other => other !== item && boxesCollide(probe, other, gs.gap))
  }

  function nearestValidPoint(gs, item, aroundX, aroundY) {
    if (pointIsValid(gs, item, aroundX, aroundY)) return { x: aroundX, y: aroundY }

    // Dense wrapped rows leave only narrow legal lanes (often just 1–2px of
    // vertical tolerance once the requested gap is included). A coarse radial
    // sampler can miss those lanes entirely, so first test exact separation
    // coordinates derived from the real tag rectangles. This is continuous 2D
    // packing, not a row/column slot model.
    const b = boundsFor(gs, item)
    const xs = new Set([
      clamp(aroundX, b.minX, b.maxX),
      b.minX,
      b.maxX,
    ])
    const ys = new Set([
      clamp(aroundY, b.minY, b.maxY),
      b.minY,
      b.maxY,
    ])

    for (const other of gs.items) {
      if (other === item) continue
      const sepX = (item.w + other.w) / 2 + gs.gap + EPSILON
      const sepY = (item.h + other.h) / 2 + gs.gap + EPSILON
      xs.add(clamp(other.x - sepX, b.minX, b.maxX))
      xs.add(clamp(other.x + sepX, b.minX, b.maxX))
      ys.add(clamp(other.y - sepY, b.minY, b.maxY))
      ys.add(clamp(other.y + sepY, b.minY, b.maxY))
    }

    const candidates = []
    for (const x of xs) {
      for (const y of ys) {
        candidates.push({ x, y, d: Math.hypot(x - aroundX, y - aroundY) })
      }
    }
    candidates.sort((a, b2) => a.d - b2.d)
    for (const point of candidates) {
      if (pointIsValid(gs, item, point.x, point.y)) return { x: point.x, y: point.y }
    }

    // Exact separation coordinates cover the legal lanes created by the current
    // rectangles without an expensive global scan on every pointer frame.
    return null
  }

  function relocateResiduals(gs, held) {
    let attempts = 0
    while (attempts < gs.items.length * 2) {
      const pairs = collisionPairs(gs)
      if (!pairs.length) return true
      const pair = pairs[0]
      const movable = pair[0] === held ? pair[1] : pair[1] === held ? pair[0] : pair[1]
      const target = nearestValidPoint(gs, movable, movable.x, movable.y)
        || nearestValidPoint(gs, movable, movable.baseX, movable.baseY)
      if (!target) return false
      movable.x = target.x
      movable.y = target.y
      attempts += 1
    }
    return collisionPairs(gs).length === 0
  }

  function trySingleRowExchange(currentDrag, desired, snapshot) {
    const { gs, item: held } = currentDrag
    const tallest = Math.max(0, ...gs.items.map(item => item.h))
    if (gs.group.clientHeight > tallest + 2) return false

    const direction = Math.sign(desired.x - held.x)
    if (!direction) return false
    const target = gs.items
      .filter(item => item !== held && (item.x - held.x) * direction > 0)
      .sort((a, b) => Math.abs(a.x - held.x) - Math.abs(b.x - held.x))[0]
    if (!target) return false

    // A one-row group has no vertical passing lane. Once the pointer is pushed
    // past the neighbour's centre, perform the deliberate strong-force exchange
    // the interaction calls for: the neighbour yields into the held tag's old
    // place while the held tag takes the opened position. Normal movement before
    // this point remains continuous and free-form; this is only the no-overlap
    // escape hatch for a physically impossible 1D pass.
    if ((desired.x - target.x) * direction < 0) return false

    restorePositions(snapshot)
    const heldX = held.x
    const targetX = target.x
    held.x = targetX
    target.x = heldX
    clampItem(gs, held)
    clampItem(gs, target)

    let legal = solveCollisions(gs, held)
    if (!legal) legal = relocateResiduals(gs, held) && solveCollisions(gs, held)
    if (!legal) {
      restorePositions(snapshot)
      return false
    }
    return true
  }

  function repackAroundHeld(gs, held, target, snapshot) {
    // Local repulsion is preferred because it reads as a physical nudge. In a
    // dense row there is occasionally no local direction in which the entire
    // chain can resolve. Once pointer pressure builds, use the real free area
    // in the container: keep the held tag at the requested free-form point and
    // relocate only the tags that are actually blocking it (or one another).
    // This is deliberately not a slot/grid reorder; every destination is a
    // collision-free x/y point found inside the current container.
    restorePositions(snapshot)
    held.x = target.x
    held.y = target.y
    clampItem(gs, held)

    const maxMoves = Math.max(8, gs.items.length * 3)
    for (let move = 0; move < maxMoves; move += 1) {
      const pairs = collisionPairs(gs)
      if (!pairs.length) return true

      // Resolve held collisions first so the dragged chip remains responsive.
      const pair = pairs.find(([a, b]) => a === held || b === held) || pairs[0]
      const movable = pair[0] === held ? pair[1] : pair[1] === held ? pair[0] : pair[1]
      const targetPoint = nearestValidPoint(gs, movable, movable.x, movable.y)
        || nearestValidPoint(gs, movable, movable.baseX, movable.baseY)
      if (!targetPoint) return false
      movable.x = targetPoint.x
      movable.y = targetPoint.y
    }
    return collisionPairs(gs).length === 0
  }

  function snapshotPositions(gs) {
    return gs.items.map(item => [item, item.x, item.y])
  }

  function restorePositions(snapshot) {
    for (const [item, x, y] of snapshot) {
      item.x = x
      item.y = y
    }
  }

  function heldCollides(gs, held, x, y) {
    const probe = { x, y, w: held.w, h: held.h }
    return gs.items.some(other => other !== held && boxesCollide(probe, other, gs.gap))
  }

  function safeHeldPoint(gs, held, from, desired) {
    if (!heldCollides(gs, held, desired.x, desired.y)) return desired
    if (heldCollides(gs, held, from.x, from.y)) return from
    let lo = 0
    let hi = 1
    for (let i = 0; i < 14; i += 1) {
      const t = (lo + hi) / 2
      const x = from.x + (desired.x - from.x) * t
      const y = from.y + (desired.y - from.y) * t
      if (heldCollides(gs, held, x, y)) hi = t
      else lo = t
    }
    const t = Math.max(0, lo - 0.003)
    return {
      x: from.x + (desired.x - from.x) * t,
      y: from.y + (desired.y - from.y) * t,
    }
  }

  function applyDragFrame(currentDrag, dt = 0.016) {
    const { gs, item: held } = currentDrag
    if (!gs.group.isConnected) return
    const groupRect = gs.group.getBoundingClientRect()
    const pointerX = currentDrag.clientX - groupRect.left + gs.group.scrollLeft
    const pointerY = currentDrag.clientY - groupRect.top + gs.group.scrollTop
    const b = boundsFor(gs, held)
    const desired = {
      x: clamp(pointerX - currentDrag.grabX, b.minX, b.maxX),
      y: clamp(pointerY - currentDrag.grabY, b.minY, b.maxY),
    }
    const alpha = 1 - Math.exp(-dt / TAU_DRAG)
    const candidate = {
      x: held.x + (desired.x - held.x) * alpha,
      y: held.y + (desired.y - held.y) * alpha,
    }

    const snapshot = snapshotPositions(gs)
    const previousHeld = { x: held.x, y: held.y }
    held.x = candidate.x
    held.y = candidate.y
    clampItem(gs, held)

    let legal = solveCollisions(gs, held)
    if (!legal) legal = relocateResiduals(gs, held) && solveCollisions(gs, held)

    if (!legal) {
      // If a dense row has exhausted local shove room, pointer pressure should
      // displace the blocker into genuinely free 2D space instead of making the
      // held tag look frozen. Keep a small resistance zone first, then repack.
      const pressure = Math.hypot(desired.x - previousHeld.x, desired.y - previousHeld.y)
      if (pressure >= Math.max(14, gs.gap + 4)) {
        legal = trySingleRowExchange(currentDrag, desired, snapshot)
        if (!legal) legal = repackAroundHeld(gs, held, desired, snapshot)
      }
    }

    if (!legal) {
      // Until enough pressure is applied, remain at the last legal point.
      restorePositions(snapshot)
      const safe = safeHeldPoint(gs, held, previousHeld, candidate)
      held.x = safe.x
      held.y = safe.y
    }

    for (const item of gs.items) place(item)
  }

  function step(now) {
    frame = 0
    if (dead || !drag) {
      last = 0
      return
    }
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
    last = now
    applyDragFrame(drag, dt)
    frame = requestAnimationFrame(step)
  }

  function wake() {
    if (!frame && drag && !dead) frame = requestAnimationFrame(step)
  }

  function snapshotItem(el) {
    return {
      translate: el.style.translate,
      draggable: snapshotAttribute(el, 'draggable'),
      cursor: snapshotAttribute(el, 'data-cursor'),
      cursorLive: snapshotAttribute(el, 'data-cursor-live'),
      tabindex: snapshotAttribute(el, 'tabindex'),
      role: snapshotAttribute(el, 'role'),
      ariaLabel: snapshotAttribute(el, 'aria-label'),
      ariaPressed: snapshotAttribute(el, 'aria-pressed'),
    }
  }

  function restoreItem(item) {
    const { el, original } = item
    el.style.translate = original.translate
    restoreAttribute(el, 'draggable', original.draggable)
    restoreAttribute(el, 'data-cursor', original.cursor)
    restoreAttribute(el, 'data-cursor-live', original.cursorLive)
    restoreAttribute(el, 'tabindex', original.tabindex)
    restoreAttribute(el, 'role', original.role)
    restoreAttribute(el, 'aria-label', original.ariaLabel)
    restoreAttribute(el, 'aria-pressed', original.ariaPressed)
    el.classList.remove('is-tag-dragging')
  }

  function decorateItem(el) {
    const item = {
      el,
      original: snapshotItem(el),
      baseX: 0,
      baseY: 0,
      w: 0,
      h: 0,
      x: 0,
      y: 0,
      signX: 1,
      signY: 1,
      measured: false,
    }
    el.dataset.cursor = 'drag'
    el.setAttribute('data-cursor-live', '')
    el.setAttribute('draggable', 'false')
    el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', `${el.textContent.trim()}. Drag freely within this tag group.`)
    el.setAttribute('aria-pressed', 'false')
    return item
  }

  function measureGroup(gs, reset = false) {
    if (!gs.group.isConnected || (drag && drag.gs === gs)) return
    gs.gap = Math.min(getGroupGap(gs.group), 5)
    for (const item of gs.items) {
      item.w = item.el.offsetWidth
      item.h = item.el.offsetHeight
      item.baseX = item.el.offsetLeft + item.w / 2
      item.baseY = item.el.offsetTop + item.h / 2
      if (!item.measured || reset) {
        item.x = item.baseX
        item.y = item.baseY
        item.measured = true
      } else {
        clampItem(gs, item)
      }
      place(item)
    }
  }

  function syncGroup(group) {
    let gs = groups.get(group)
    if (!gs) {
      gs = { group, items: [], gap: MIN_GAP, interacted: false }
      groups.set(group, gs)
      group.classList.add('is-tag-physics')
      resizeObserver?.observe(group)
    }

    const tags = directTags(group)
    const existing = new Map(gs.items.map(item => [item.el, item]))
    const next = []
    let changed = false

    for (const el of tags) {
      let item = existing.get(el)
      if (!item) {
        item = decorateItem(el)
        resizeObserver?.observe(el)
        changed = true
      }
      next.push(item)
      existing.delete(el)
    }

    for (const item of existing.values()) {
      resizeObserver?.unobserve(item.el)
      restoreItem(item)
      changed = true
    }

    gs.items = next
    measureGroup(gs, changed)
    return gs
  }

  function removeGroup(gs) {
    resizeObserver?.unobserve(gs.group)
    for (const item of gs.items) {
      resizeObserver?.unobserve(item.el)
      restoreItem(item)
    }
    gs.group.classList.remove('is-tag-physics', 'is-tag-reordering')
    groups.delete(gs.group)
  }

  function prepare() {
    if (dead) return
    for (const gs of Array.from(groups.values())) {
      if (!gs.group.isConnected) removeGroup(gs)
    }
    if (!enabled()) return
    root.querySelectorAll(SELECTOR).forEach(group => {
      if (!(group instanceof HTMLElement) || !group.closest('.route-page')) return
      syncGroup(group)
    })
  }

  function beginDrag(event, item, gs) {
    if (!item.measured) measureGroup(gs, true)
    gs.interacted = true
    const rect = gs.group.getBoundingClientRect()
    const pointerX = event.clientX - rect.left + gs.group.scrollLeft
    const pointerY = event.clientY - rect.top + gs.group.scrollTop
    drag = {
      gs,
      item,
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      grabX: pointerX - item.x,
      grabY: pointerY - item.y,
      startPositions: snapshotPositions(gs),
    }
    item.el.classList.add('is-tag-dragging')
    gs.group.classList.add('is-tag-reordering')
    item.el.setAttribute('aria-pressed', 'true')
    try { item.el.setPointerCapture(event.pointerId) } catch { /* non-capturable target */ }
    wake()
  }

  function finishDrag(cancel = false) {
    if (!drag) return
    const current = drag
    if (cancel) {
      restorePositions(current.startPositions)
      for (const item of current.gs.items) place(item)
    }
    drag = null
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    last = 0
    const { gs, item, pointerId } = current
    try { item.el.releasePointerCapture(pointerId) } catch { /* already released */ }
    item.el.classList.remove('is-tag-dragging')
    gs.group.classList.remove('is-tag-reordering')
    item.el.setAttribute('aria-pressed', 'false')
  }

  function findItem(target) {
    const el = target instanceof Element ? target.closest(`${SELECTOR} > span`) : null
    const group = el?.parentElement
    const gs = group ? groups.get(group) : null
    const item = gs?.items.find(candidate => candidate.el === el)
    return item && gs ? { item, gs } : null
  }

  const onDown = event => {
    if (event.button !== 0 || !enabled() || drag) return
    const found = findItem(event.target)
    if (!found) return
    event.preventDefault()
    beginDrag(event, found.item, found.gs)
  }

  const onMove = event => {
    if (!drag || event.pointerId !== drag.pointerId) return
    drag.clientX = event.clientX
    drag.clientY = event.clientY
    wake()
  }

  const onUp = event => {
    if (!drag || event.pointerId !== drag.pointerId) return
    drag.clientX = event.clientX
    drag.clientY = event.clientY
    finishDrag(false)
  }

  const onCancel = event => {
    if (drag?.pointerId === event.pointerId) finishDrag(true)
  }

  const onBlur = () => finishDrag(true)

  const onKey = event => {
    if (!event.altKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    const found = findItem(event.target)
    if (!found) return
    event.preventDefault()
    const { item, gs } = found
    gs.interacted = true
    const snapshot = snapshotPositions(gs)
    item.x += event.key === 'ArrowLeft' ? -KEY_NUDGE : event.key === 'ArrowRight' ? KEY_NUDGE : 0
    item.y += event.key === 'ArrowUp' ? -KEY_NUDGE : event.key === 'ArrowDown' ? KEY_NUDGE : 0
    clampItem(gs, item)
    let legal = solveCollisions(gs, item)
    if (!legal) legal = relocateResiduals(gs, item) && solveCollisions(gs, item)
    if (!legal) restorePositions(snapshot)
    for (const tag of gs.items) place(tag)
  }

  function resetEnabledState() {
    finishDrag(true)
    if (enabled()) {
      prepare()
      return
    }
    for (const gs of Array.from(groups.values())) removeGroup(gs)
  }

  resizeObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(entries => {
        if (!enabled()) return
        const touched = new Set()
        for (const entry of entries) {
          const group = entry.target.matches?.(SELECTOR) ? entry.target : entry.target.parentElement
          const gs = group ? groups.get(group) : null
          if (gs) touched.add(gs)
        }
        for (const gs of touched) {
          if (drag?.gs === gs) continue
          measureGroup(gs, true)
        }
      })
    : null

  const observer = new MutationObserver(() => prepare())
  observer.observe(root === document ? document.body : root, { childList: true, subtree: true })
  document.addEventListener('pointerdown', onDown, true)
  document.addEventListener('pointermove', onMove, true)
  document.addEventListener('pointerup', onUp, true)
  document.addEventListener('pointercancel', onCancel, true)
  document.addEventListener('keydown', onKey, true)
  window.addEventListener('blur', onBlur)
  precise.addEventListener?.('change', resetEnabledState)
  reduced.addEventListener?.('change', resetEnabledState)

  prepare()
  document.fonts?.ready?.then(() => {
    if (!dead && !drag) for (const gs of groups.values()) measureGroup(gs, !gs.interacted)
  })

  return () => {
    dead = true
    finishDrag(true)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    observer.disconnect()
    resizeObserver?.disconnect()
    document.removeEventListener('pointerdown', onDown, true)
    document.removeEventListener('pointermove', onMove, true)
    document.removeEventListener('pointerup', onUp, true)
    document.removeEventListener('pointercancel', onCancel, true)
    document.removeEventListener('keydown', onKey, true)
    window.removeEventListener('blur', onBlur)
    precise.removeEventListener?.('change', resetEnabledState)
    reduced.removeEventListener?.('change', resetEnabledState)
    for (const gs of Array.from(groups.values())) removeGroup(gs)
  }
}
