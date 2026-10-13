export const motionEase = (t) => t*t*t*(t*(t*6-15)+10)

// The bronze portal every door stands in (the room doors and the entrance alike).
export const doorSystem = Object.freeze({
  frame: Object.freeze({ width: 2.20, height: 3.20, depth: .58, jamb: .24, head: .24 }),
})
