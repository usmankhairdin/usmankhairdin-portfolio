export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const blend = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { const x = clamp(t); return x * x * x * (x * (x * 6 - 15) + 10); };

// Visibility may suspend idle work, but never an unfinished scroll response.
// Otherwise a fast reverse can stop while its intermediate pose is offscreen.
export const needsContinuumFrame = (currentScroll, targetScroll, centerY, height, viewportHeight) =>
  currentScroll !== targetScroll || (centerY + height / 2 > -30 && centerY - height / 2 < viewportHeight + 30);

// One closed three-pass Care Weave: three interlaced ribbon layers share one
// control topology and protect the same central chamber through every state.
export const WEAVE_RINGS = 360;
export const WEAVE_SIDES = 32;
export const forms = [
  { rx: 1.34, ry: 1.20, skew: .12, lift: .045, depth: .245, width: .0976, twist: .16, braid: .205, thickness: .0376, rotation: [.38, -.42, -.32], color: '#f3efe3' },
  { rx: 1.43, ry: 1.17, skew: .08, lift: .065, depth: .270, width: .092, twist: -.10, braid: .215, thickness: .0352, rotation: [.14, .18, -.10], color: '#e9efdf' },
  { rx: 1.60, ry: 1.05, skew: -.12, lift: .055, depth: .305, width: .084, twist: .20, braid: .190, thickness: .0328, rotation: [.20, -.18, -.10], color: '#e2eeea' },
  { rx: 1.67, ry: 1.10, skew: .04, lift: .040, depth: .230, width: .0944, twist: .06, braid: .225, thickness: .036, rotation: [.15, .12, -.07], color: '#f0eadd' },
  { rx: 1.31, ry: 1.24, skew: -.06, lift: .055, depth: .260, width: .1056, twist: -.11, braid: .235, thickness: .04, rotation: [.12, -.20, .10], color: '#e4ecdf' },
  { rx: 1.63, ry: 1.08, skew: .10, lift: .055, depth: .280, width: .08, twist: .23, braid: .235, thickness: .0312, rotation: [.25, .15, -.12], color: '#f3eadb' },
];

/**
 * Centre line of the three-pass ribbon. Optional `offset` adds an epicycle so
 * the three loops read as three round, linked circles (used by the still
 * weave); `round` drops the homepage's small vertical asymmetry. Both default
 * off, so the homepage journey geometry is unchanged.
 */
export function weaveCenter(p, u) {
  const angle = 3 * u, interlace = 2 * u, offset = p.offset || 0;
  const radial = p.braid * Math.cos(interlace);
  return [
    (p.rx + radial) * Math.cos(angle) + p.skew * Math.sin(2 * angle) + offset * Math.cos(u),
    (p.ry + radial) * Math.sin(angle) + (p.round ? 0 : .035 * Math.sin(2 * angle + .3)) + offset * Math.sin(u),
    p.depth * Math.sin(interlace) + p.lift * Math.cos(angle),
  ];
}
const normalize = (v) => { const d = Math.hypot(...v); return v.map(x => x / d); };
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const crossSections = new Map();

function convexProfile(sides) {
  if (crossSections.has(sides)) return crossSections.get(sides);
  const profile = new Float64Array((sides + 1) * 2);
  for (let j = 0; j <= sides; j++) {
    const angle = j / sides * Math.PI * 2, c = Math.cos(angle), s = Math.sin(angle);
    // A true ellipse: curvature changes continuously all the way round, so
    // light rolls over the ribbon with no crease between face and edge.
    profile[j * 2] = c;
    profile[j * 2 + 1] = s;
  }
  crossSections.set(sides, profile);
  return profile;
}

export function vesselVertices(p, rings = WEAVE_RINGS, sides = WEAVE_SIDES) {
  const positions = new Float32Array((rings + 1) * (sides + 1) * 3);
  const profile = convexProfile(sides);
  let cursor = 0;
  for (let i = 0; i <= rings; i++) {
    const u = i / rings * Math.PI * 2;
    const angle = 3 * u;
    const c = weaveCenter(p, u), ahead = weaveCenter(p, u + .0001), behind = weaveCenter(p, u - .0001);
    const tangent = normalize(ahead.map((v,j) => v - behind[j]));
    const radial = [Math.cos(angle),Math.sin(angle),0];
    const dot = radial.reduce((sum,v,j) => sum + v*tangent[j],0);
    const n = normalize(radial.map((v,j) => v-dot*tangent[j]));
    const b = cross(tangent,n);
    const twist = p.twist * Math.sin(2 * u + .6) + .055 * Math.sin(angle);
    const width = p.width * (1 + .12 * Math.cos(angle - .4) + .06 * Math.sin(2 * u + .5));
    const thickness = p.thickness * (1 + .08 * Math.cos(angle + .6));
    for (let j = 0; j <= sides; j++) {
      // A convex lens cross-section carries directional highlights across its
      // whole surface, rather than embossing a narrow bevel around a flat face.
      // It stays considerably wider than deep, preserving the woven ribbon.
      const across = width * profile[j * 2];
      const round = thickness * profile[j * 2 + 1];
      const a = across*Math.cos(twist)-round*Math.sin(twist);
      const z = across*Math.sin(twist)+round*Math.cos(twist);
      for (let k = 0; k < 3; k++) positions[cursor++] = c[k]+n[k]*a+b[k]*z;
    }
  }
  // Preserve exact closure at both parameter seams, including the colors and
  // normals that share these duplicate render vertices.
  const stride = (sides + 1) * 3;
  for (let i = 0; i < rings; i++) for (let k = 0; k < 3; k++) positions[i * stride + sides * 3 + k] = positions[i * stride + k];
  for (let k = 0; k < stride; k++) positions[rings * stride + k] = positions[k];
  return positions;
}

export function sampleTrack(scroll, keys) {
  if (scroll <= keys[0]) return { from: 0, to: 0, t: 0 };
  for (let i = 1; i < keys.length; i++) {
    if (scroll <= keys[i]) return { from: i-1, to: i, t: smooth((scroll-keys[i-1])/(keys[i]-keys[i-1])) };
  }
  return { from: keys.length-1, to: keys.length-1, t: 0 };
}

/**
 * Locate a scroll value without easing it toward either chapter. The same
 * segment coordinate can be reused for every channel in a frame.
 */
export function locateSplineSegment(scroll, keys) {
  if (!keys.length) throw new RangeError('A spline needs at least one key.');
  if (Number.isNaN(scroll)) throw new RangeError('Scroll must be a number.');
  if (keys.length === 1 || scroll <= keys[0]) return { index: 0, t: 0 };
  const last = keys.length - 1;
  if (scroll >= keys[last]) return { index: last - 1, t: 1 };
  let low = 0, high = last;
  while (high - low > 1) {
    const middle = (low + high) >>> 1;
    if (scroll < keys[middle]) high = middle;
    else low = middle;
  }
  return { index: low, t: (scroll - keys[low]) / (keys[low + 1] - keys[low]) };
}

function endpointSlope(firstSpan, nextSpan, firstDelta, nextDelta) {
  let slope = ((2 * firstSpan + nextSpan) * firstDelta - firstSpan * nextDelta) / (firstSpan + nextSpan);
  if (Math.sign(slope) !== Math.sign(firstDelta)) slope = 0;
  else if (Math.sign(firstDelta) !== Math.sign(nextDelta) && Math.abs(slope) > 3 * Math.abs(firstDelta)) slope = 3 * firstDelta;
  return slope;
}

/**
 * Precompute a nonuniform, shape-preserving cubic Hermite (PCHIP) channel.
 *
 * A knot has one shared tangent, so scrolling through it never changes
 * velocity abruptly. Unlike easing each interval separately, a monotonic
 * chapter boundary does not introduce an artificial stop. Tangents reach
 * zero only where the channel actually reverses direction or is constant.
 * Values outside the measured page range clamp to the endpoint composition.
 *
 * Build on layout changes, then call the returned sampler during rendering.
 * For many channels, locateSplineSegment once and call .atSegment(index, t).
 */
export function buildSpline(keys, values) {
  if (keys.length !== values.length || keys.length === 0) throw new RangeError('Spline keys and values need the same nonzero length.');
  const x = Float64Array.from(keys), y = Float64Array.from(values), count = x.length;
  for (let i = 0; i < count; i++) {
    if (!Number.isFinite(x[i]) || !Number.isFinite(y[i])) throw new RangeError('Spline keys and values must be finite.');
    if (i && x[i] <= x[i - 1]) throw new RangeError('Spline keys must be strictly increasing.');
  }
  const spans = new Float64Array(Math.max(0, count - 1));
  const deltas = new Float64Array(spans.length), tangents = new Float64Array(count);
  for (let i = 0; i < spans.length; i++) {
    spans[i] = x[i + 1] - x[i];
    deltas[i] = (y[i + 1] - y[i]) / spans[i];
  }
  if (count === 2) tangents[0] = tangents[1] = deltas[0];
  else if (count > 2) {
    tangents[0] = endpointSlope(spans[0], spans[1], deltas[0], deltas[1]);
    tangents[count - 1] = endpointSlope(spans[count - 2], spans[count - 3], deltas[count - 2], deltas[count - 3]);
    for (let i = 1; i < count - 1; i++) {
      const before = deltas[i - 1], after = deltas[i];
      if (before === 0 || after === 0 || Math.sign(before) !== Math.sign(after)) continue;
      const weightBefore = 2 * spans[i] + spans[i - 1];
      const weightAfter = spans[i] + 2 * spans[i - 1];
      tangents[i] = (weightBefore + weightAfter) / (weightBefore / before + weightAfter / after);
    }
  }
  const segments = Array.from(spans, (span, i) => {
    const startTangent = span * tangents[i], endTangent = span * tangents[i + 1];
    const difference = y[i + 1] - y[i];
    return {
      a: y[i], b: startTangent,
      c: 3 * difference - 2 * startTangent - endTangent,
      d: -2 * difference + startTangent + endTangent,
      inverseSpan: 1 / span,
    };
  });
  const atSegment = (index, t) => {
    if (count === 1) return y[0];
    const s = segments[index], u = clamp(t);
    return ((s.d * u + s.c) * u + s.b) * u + s.a;
  };
  const sample = scroll => {
    const { index, t } = locateSplineSegment(scroll, x);
    return atSegment(index, t);
  };
  sample.atSegment = atSegment;
  sample.derivative = scroll => {
    if (count === 1 || scroll < x[0] || scroll > x[count - 1]) return 0;
    const { index, t } = locateSplineSegment(scroll, x), s = segments[index];
    return (s.b + t * (2 * s.c + 3 * s.d * t)) * s.inverseSpan;
  };
  sample.segments = segments;
  sample.keys = x;
  sample.tangents = tangents;
  return sample;
}

// Convenience for one-off reads. Animation code should cache buildSpline.
export const sampleContinuous = (scroll, keys, values) => buildSpline(keys, values)(scroll);
