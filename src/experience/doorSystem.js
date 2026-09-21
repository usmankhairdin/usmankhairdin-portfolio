export const motionEase = (t) => t*t*t*(t*(t*6-15)+10)
export const doorMotionEase = motionEase

export const doorSystem = Object.freeze({
  openAngle: 1.48,
  leaf: Object.freeze({ width: 1.72, height: 2.84, depth: .15 }),
  frame: Object.freeze({ width: 2.20, height: 3.20, depth: .58, jamb: .24, head: .24 }),
  panel: Object.freeze({ width: 1.30, height: .86, insetWidth: 1.18, insetHeight: .72 }),
  handle: Object.freeze({ roseRadius: .055, leverLength: .36, leverRadius: .032 }),
  motion: Object.freeze({
    handlePressAt: .14,
    handlePressDuration: .20,
    handleRecoverAt: .38,
    handleRecoverDuration: .30,
    leafOpenAt: .32,
    leafOpenDuration: 1.22,
    leafCloseAt: .76,
    leafCloseDuration: 1.08,
  }),
  colors: Object.freeze({
    jamb: '#8c765f',
    threshold: '#9b8870',
    leaf: '#74563f',
    panel: '#694c39',
    panelInset: '#775840',
    label: '#4d3729',
    brass: '#c6aa78',
    brassDark: '#b89b6b',
  }),
})
