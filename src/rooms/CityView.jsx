import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { floorReflection } from '../experience/floorReflection.js'
import { outsideSeen } from '../experience/outsideView.js'
import {
  AVENUE, BLOCK, BLVD, CITY_Y, GLASS_Z, KIND, MAIN_AVENUE, POLE_HEIGHT, POLE_SPACING, SITE, STREET,
  createTraffic, layoutBuildings, layoutStreetFurniture, placeOf, placeTurning, stepTraffic, underTower, worldZ,
} from './cityPlan.js'

/*
 * The city beyond the Contact hall's glass, at night, seen from 96 m up.
 *
 * The towers are lit as real ones are: behind each window there is a room - ceiling, walls,
 * floor, at depth, drawn by interior mapping - lit warm or cool or not at all, some behind
 * blinds; offices burn floor by floor, flats room by room. Glass reflects the sky; stone and
 * brick take the street's light from below. Shops glow along the pavements.
 * The streets are real streets: asphalt, lane markings, zebra crossings and stop lines, kerbs
 * and pavements, pools of light under the street lamps, trees. On them the traffic actually
 * drives (cityPlan.js): cars, buses and motorbikes in their lanes, queuing at the lights,
 * turning at the junctions, their headlights on the road ahead, tail lights red behind.
 * Everything fades into the warm haze of the city's own light.
 */
const HAZE = 'vec3(0.021, 0.015, 0.012)'
const f = (v) => v.toFixed(3)
// Every material of the city knows where its street is (uGround); the street shader also knows how
// the world maps onto the plan (uPlan: x sign, d sign, origin z) and the building's site.
const GLSL_COMMON = /* glsl */ `
  uniform float uGround;
  // an integer hash of the lattice point: exact on every GPU at any distance (a sine hash
  // loses its precision hundreds of metres out and makes the streets shimmer)
  float h12(vec2 p) {
    uvec2 q = uvec2(ivec2(floor(p * 97.0)) + 4194304) * uvec2(1597334673u, 3812015801u);   // x97 keeps fractional offsets distinct
    uint n = (q.x ^ q.y) * 1597334673u;
    n ^= n >> 16u;
    return float(n) * (1.0 / 4294967295.0);
  }
  float n2(vec2 p) {
    vec2 i = floor(p); vec2 g = fract(p); vec2 u = g * g * (3.0 - 2.0 * g);
    return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), u.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // a square wave (1 on the first "duty" of each period), box-filtered over the pixel: steady at any distance
  float sqInt(float x, float duty) { return floor(x) * duty + min(fract(x), duty); }
  float aaSquare(float x, float duty) {
    float w = max(fwidth(x), 1e-4);
    return (sqInt(x + 0.5 * w, duty) - sqInt(x - 0.5 * w, duty)) / w;
  }
  float aaLine(float d, float w) {
    float aa = max(fwidth(d), 1e-4);
    return (1.0 - smoothstep(w - aa, w + aa, d)) * clamp(w / aa, 0.0, 1.0);
  }
  // what glass shows: the night sky, the city's glow along the horizon, and below it the dark street
  vec3 skyGlass(vec3 r) {
    float h = r.y;
    vec3 c = mix(vec3(0.02, 0.016, 0.013), vec3(0.003, 0.0045, 0.011), smoothstep(0.0, 0.45, h));
    c += vec3(0.07, 0.04, 0.022) * exp(-abs(h) * 9.0);
    return mix(c, vec3(0.006, 0.005, 0.005), smoothstep(0.0, -0.3, h));
  }
  vec3 hazed(vec3 col, vec3 world) {
    float dist = length(world - cameraPosition);
    float low = exp(-max(world.y - uGround, 0.0) / 160.0);
    float k = (1.0 - exp(-dist * 0.00095)) * (0.62 + 0.38 * low);
    return mix(col, ${HAZE}, clamp(k, 0.0, 0.9));
  }`

/* ------------------------------------------------------------------ the streets */
const groundMaterial = (u) => new THREE.ShaderMaterial({
  fog: false,
  uniforms: u,
  vertexShader: /* glsl */ `
    varying vec3 vWorld;
    void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld;
    uniform vec3 uPlan;
    uniform vec3 uSite;
    ${GLSL_COMMON}
    #define B ${f(BLOCK)}
    // one row of street lamps along a kerb: the light they lay on the ground here
    float lampRow(float along, float across, float start) {
      float k = floor((along - start) / ${f(POLE_SPACING)} + 0.5);
      float e = 0.0;
      for (float i = -1.0; i <= 1.0; i += 1.0) {
        float dz = along - (start + (k + i) * ${f(POLE_SPACING)});
        e += ${f(POLE_HEIGHT)} / pow(${f(POLE_HEIGHT * POLE_HEIGHT)} + across * across + dz * dz, 1.5);
      }
      return e * 62.0;
    }
    void main() {
      vec2 p = vec2(uPlan.x * vWorld.x, uPlan.y * (vWorld.z - uPlan.z));   // x across, d out from the building
      bool site = abs(p.x) < uSite.x && p.y > uSite.y && p.y < uSite.z;
      float am = floor(p.x / B + 0.5);
      float ax = p.x - am * B;
      bool isMain = am == 0.0;
      float aHalf = isMain ? ${f(MAIN_AVENUE.half)} : ${f(AVENUE.half)};
      float aWalk = isMain ? ${f(MAIN_AVENUE.walk)} : ${f(AVENUE.walk)};
      float sn = floor((p.y - ${f(BLVD.d)}) / B + 0.5);
      float sz = p.y - (${f(BLVD.d)} + sn * B);
      bool blvd = sn == 0.0;
      float sHalf = blvd ? ${f(BLVD.half)} : ${f(STREET.half)};
      float sWalk = blvd ? ${f(BLVD.walk)} : ${f(STREET.walk)};
      bool ave = !site && (p.y > ${f(BLVD.d)} || p.y < ${f(BLVD.d - BLVD.half)});
      bool onAve = ave && abs(ax) < aHalf;
      bool onSt = !site && abs(sz) < sHalf;
      bool road = onAve || onSt;
      bool walk = !road && !site && ((ave && abs(ax) < aHalf + aWalk) || abs(sz) < sHalf + sWalk);

      vec3 alb;
      float paint = 0.0;
      vec3 paintCol = vec3(0.55);
      if (road) {
        float grain = 0.82 + 0.36 * n2(p * 0.9) * n2(p * 0.13 + 3.0);
        alb = vec3(0.024, 0.024, 0.026) * grain;
        // repaired strips and old patches
        alb *= mix(1.0, 0.82, smoothstep(0.74, 0.86, n2(p * vec2(0.3, 0.13))));
        if (onSt && !onAve) {
          float a = abs(sz);
          if (blvd) {
            // a planted median, lane dashes, edge lines
            if (a < ${f(BLVD.median)}) { alb = vec3(0.012, 0.02, 0.01) * (0.6 + 0.6 * n2(p * 2.0)); paint = aaLine(abs(a - ${f(BLVD.median - 0.12)}), 0.1); }
            else {
              float dash = aaSquare(p.x / 9.0, 0.36);
              paint = max(aaLine(abs(a - ${f(BLVD.median + BLVD.lane)}), 0.06) * dash, aaLine(abs(a - ${f(BLVD.median + BLVD.lane * 2)}), 0.06) * dash);
              paint = max(paint, aaLine(abs(a - ${f(BLVD.median + BLVD.lane * 3 + 0.3)}), 0.07));
            }
          } else {
            float dash = aaSquare(p.x / 8.0, 0.45);
            paint = aaLine(a, 0.06) * dash;                                       // the centre line
            paint = max(paint, aaLine(abs(a - ${f(STREET.lane)}), 0.05));         // the parking lane
            paint = max(paint, aaLine(abs(a - ${f(STREET.lane + 1.2)}), 0.04) * aaSquare(p.x / 6.0, 0.06));
          }
        } else if (onAve && !onSt) {
          float a = abs(ax);
          if (isMain) {
            if (a < 1.2) { alb = vec3(0.012, 0.02, 0.01) * (0.6 + 0.6 * n2(p * 2.0)); paint = aaLine(abs(a - 1.08), 0.1); }
            else {
              float dash = aaSquare(p.y / 9.0, 0.36);
              paint = max(aaLine(abs(a - ${f(1.2 + MAIN_AVENUE.lane)}), 0.06) * dash, aaLine(abs(a - ${f(1.2 + MAIN_AVENUE.lane * 2)}), 0.06) * dash);
              paint = max(paint, aaLine(abs(a - ${f(1.2 + MAIN_AVENUE.lane * 3 + 0.3)}), 0.07));
            }
          } else {
            // a double yellow centre line, a cycle lane, parking at the kerb
            float yellow = aaLine(abs(a - 0.12), 0.05);
            if (yellow > 0.0) { paint = yellow; paintCol = vec3(0.6, 0.42, 0.08); }
            paint = max(paint, aaLine(abs(a - ${f(AVENUE.lane)}), 0.06));
            paint = max(paint, aaLine(abs(a - ${f(AVENUE.lane + 1.6)}), 0.05));
            if (a > ${f(AVENUE.lane)} && a < ${f(AVENUE.lane + 1.6)}) alb = mix(alb, vec3(0.02, 0.05, 0.03), 0.6);
          }
        }
        // zebra crossings at every junction, and the stop lines before them
        if (onAve) {
          float into = abs(sz) - sHalf;
          if (into > 0.8 && into < 4.4) paint = max(paint, aaSquare(ax - 0.5, 0.5) * step(0.6, abs(ax)) * 0.9);
          bool approach = (ax > 0.0 && sz > 0.0) || (ax < 0.0 && sz < 0.0);
          if (approach) paint = max(paint, aaLine(abs(into - 5.1), 0.2) * step(0.3, abs(ax)));
        }
        if (onSt && ave) {
          float into = abs(ax) - aHalf;
          if (into > 0.8 && into < 4.4) paint = max(paint, aaSquare(sz - 0.5, 0.5) * 0.9);
          bool approach = (sz > 0.0 && ax < 0.0) || (sz < 0.0 && ax > 0.0);
          if (approach) paint = max(paint, aaLine(abs(into - 5.1), 0.2));
        }
      } else if (walk) {
        // pavement slabs; the kerb at the road's edge
        vec2 slab = abs(fract(p / 1.2) - 0.5) * 1.2;
        float joint = max(aaLine(0.6 - slab.x, 0.01), aaLine(0.6 - slab.y, 0.01));
        float slabs = 1.0 - smoothstep(0.3, 1.0, fwidth(p.x) / 1.2);       // slab by slab only up close
        alb = vec3(0.07, 0.066, 0.06) * mix(1.0, 0.85 + 0.3 * h12(floor(p / 1.2)), slabs) * (1.0 - 0.45 * joint);
        float kerbA = ave ? abs(abs(ax) - aHalf) : 1e3;
        float kerbS = abs(abs(sz) - sHalf);
        alb = mix(alb, vec3(0.11, 0.105, 0.1), aaLine(min(kerbA, kerbS), 0.16));
      } else {
        // behind the buildings: yards and the odd car park
        alb = vec3(0.016, 0.016, 0.018) * (0.8 + 0.4 * n2(p * 0.3));
        paint = aaLine(abs(fract(p.x / 2.6) - 0.5) * 2.6, 0.05) * step(0.7, n2(floor(p / 40.0) * 1.7)) * 0.6;
      }

      // the street lamps: both kerbs of the nearest avenue and of the nearest street
      vec3 led = vec3(1.0, 0.93, 0.84);
      vec3 sodium = vec3(1.0, 0.7, 0.42);
      vec3 light = vec3(0.022, 0.02, 0.024);
      float avStart = ${f(BLVD.d + BLVD.half + 8)};
      float aveLamps = site ? 0.0 : 1.0;
      light += led * (lampRow(p.y, ax + aHalf + 0.7, avStart) + lampRow(p.y, ax - aHalf - 0.7, avStart + ${f(POLE_SPACING / 2)})) * aveLamps;
      light += (blvd ? led : sodium) * (lampRow(p.x, sz + sHalf + 0.7, -720.0) + lampRow(p.x, sz - sHalf - 0.7, ${f(-720 + POLE_SPACING / 2)})) * (site ? 0.35 : 1.0);
      // the shops along the pavements spill their light onto them
      if (walk) {
        float lineA = ave ? (aHalf + aWalk) - abs(ax) : 1e3;
        float lineS = (sHalf + sWalk) - abs(sz);
        float toShop = min(lineA, lineS);
        float seg = lineA < lineS ? floor(p.y / 11.0) + am * 31.0 : floor(p.x / 11.0) + sn * 17.0;
        light += vec3(1.0, 0.82, 0.6) * 0.42 * exp(-max(toShop, 0.0) / 1.8) * step(0.38, h12(vec2(seg, 3.0)));
      }

      vec3 col = mix(alb, paintCol, paint) * light;
      gl_FragColor = vec4(hazed(col, vWorld), 1.0);
      #include <colorspace_fragment>
    }`,
})

/* ------------------------------------------------------------------ the buildings */
// aA: seed, style, storey height, bay width;  aB: lit share, warm share, shops, crown
const facadeMaterial = (round, ground) => new THREE.ShaderMaterial({
  fog: false,
  uniforms: { uTime: { value: 0 }, uGround: ground },
  vertexShader: /* glsl */ `
    attribute vec4 aA;
    attribute vec4 aB;
    varying vec3 vWorld;
    varying vec3 vNormalW;
    varying vec3 vLocal;
    varying float vRadius;
    varying vec2 vSize;
    varying vec4 vA;
    varying vec4 vB;
    void main() {
      mat4 m = modelMatrix * instanceMatrix;
      vSize = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[2].xyz));
      vec4 w = m * vec4(position, 1.0);
      vWorld = w.xyz;
      vNormalW = normalize(mat3(m) * normal);
      vLocal = position;
      vRadius = 0.5 * length(instanceMatrix[0].xyz);
      vA = aA;
      vB = aB;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld;
    varying vec3 vNormalW;
    varying vec3 vLocal;
    varying float vRadius;
    varying vec2 vSize;
    varying vec4 vA;
    varying vec4 vB;
    uniform float uTime;
    ${GLSL_COMMON}
    // a room's light: warm, neutral or cool
    vec3 roomLight(float r, float warmShare, float office) {
      vec3 warm = vec3(1.0, 0.56, 0.26);
      vec3 neutral = vec3(1.0, 0.8, 0.55);
      vec3 cool = vec3(0.66, 0.8, 1.0);
      return r < warmShare ? mix(warm, neutral, fract(r * 7.3) * 0.5) : (fract(r * 3.7) < 0.5 + office * 0.4 ? cool : neutral);
    }
    void main() {
      vec3 n = normalize(vNormalW);
      vec3 V = normalize(cameraPosition - vWorld);
      float seed = vA.x; float style = vA.y; float storey = vA.z; float bay = vA.w;
      float litShare = vB.x; float warmShare = vB.y; float shops = vB.z; float crown = vB.w;
      float v = vWorld.y - uGround;
      vec3 col;
      if (n.y > 0.5) {
        // a roof: membrane and gravel, and the parapet round its edge
        col = vec3(0.007, 0.007, 0.008) * (0.7 + 0.6 * n2(vWorld.xz * 0.5));
        ${round ? '' : `float edge = min((0.5 - abs(vLocal.x)) * vSize.x, (0.5 - abs(vLocal.z)) * vSize.y);
        col += vec3(0.022, 0.02, 0.019) * (1.0 - smoothstep(0.2, 0.42, edge));`}
      } else if (n.y < -0.5) {
        col = vec3(0.0);
      } else {
        vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), n));
        ${round ? 'float u = atan(vLocal.z, vLocal.x) * vRadius;' : 'float u = dot(vWorld, T);'}
        vec3 d = -V;
        float du = dot(d, T);
        float dv = d.y;
        float dw = max(dot(d, -n), 0.02);
        float cx = floor(u / bay);
        float cy = floor(v / storey);
        float fx = fract(u / bay);
        float fy = fract(v / storey);
        float mx = min(fx, 1.0 - fx) * bay;           // metres to the nearest mullion
        float hy = fy * storey;                       // metres above this storey's floor
        bool ground = cy < 0.5 && shops > 0.5;
        float office = (style < 0.5 || (style > 1.5 && style < 2.5)) ? 1.0 : 0.0;
        float glass;
        vec3 wallAlb;
        float transmit;
        if (ground) {
          glass = step(0.14, mx) * step(0.35, hy) * step(hy, storey - 0.7);
          wallAlb = vec3(0.02, 0.019, 0.018);
          transmit = 0.9;
        } else if (style < 0.5) {
          glass = step(0.035, mx) * step(hy, storey - 0.75);
          wallAlb = vec3(0.012, 0.013, 0.015);
          transmit = 0.55;
        } else if (style < 1.5) {
          glass = step(bay * 0.22, mx) * step(0.85, hy) * step(hy, storey - 0.55);
          wallAlb = vec3(0.06, 0.054, 0.047);
          transmit = 0.85;
        } else if (style < 2.5) {
          glass = step(0.13, mx) * step(hy, storey - 0.6);
          wallAlb = vec3(0.012, 0.012, 0.013);
          transmit = 0.42;
        } else {
          glass = step(bay * 0.27, mx) * step(0.9, hy) * step(hy, storey - 0.6);
          wallAlb = vec3(0.045, 0.026, 0.018);
          transmit = 0.88;
        }
        // each building its own finish: concrete, pale render, sandstone, red or dark brick
        float tone = h12(vec2(seed * 41.0, 7.0));
        vec3 tint = tone < 0.25 ? vec3(0.9, 0.92, 0.96) : tone < 0.45 ? vec3(1.35, 1.28, 1.15) : tone < 0.65 ? vec3(1.15, 0.98, 0.78) : tone < 0.85 ? vec3(1.1, 0.72, 0.58) : vec3(0.62, 0.55, 0.52);
        if (style > 0.5 && style < 1.5 || style > 2.5) wallAlb *= tint;
        // the room behind this window, by interior mapping
        vec2 rid = vec2(cx, cy) + seed * 97.0;
        float depth = (ground ? 7.0 : 4.0) + h12(rid + 1.3) * 3.0;
        vec3 o = vec3(fx * bay, hy, 0.0);
        float tx = du > 0.0 ? (bay - o.x) / du : -o.x / min(du, -1e-4);
        float ty = dv > 0.0 ? (storey - o.y) / dv : -o.y / min(dv, -1e-4);
        float tz = depth / dw;
        float t = min(min(tx, ty), tz);
        vec3 hit = o + vec3(du, dv, dw) * t;
        // which rooms are lit: offices go floor by floor, flats room by room
        float floorOn = step(0.5, h12(vec2(cy, seed * 13.0)));
        float r = h12(rid);
        float lit = office > 0.5 ? step(r, litShare * 1.9) * floorOn : step(r, litShare);
        if (ground) lit = step(0.3, h12(vec2(floor(u / (bay * 3.0)), seed * 5.0)));
        vec3 lc = roomLight(h12(rid + 7.1), ground ? 0.5 : warmShare, office);
        float lum = (ground ? 1.25 : (office > 0.5 ? 0.8 : 0.66)) * (0.55 + 0.45 * h12(rid + 2.7));
        float tv = step(0.985, h12(rid + 9.0)) * (1.0 - office);
        lc = mix(lc, vec3(0.45, 0.6, 1.0) * (0.6 + 0.4 * sin(uTime * 9.0 + r * 50.0)), tv);
        vec3 inside;
        if (t == tz) {
          // the back wall, with the shapes of furniture against it
          float shade = 0.5 + 0.2 * step(0.55, n2(hit.xy * vec2(1.2, 2.5) + r * 9.0)) - 0.25 * step(hit.y, 0.9) * step(0.5, h12(rid + floor(hit.x)));
          inside = lc * lum * shade;
        } else if (t == ty && dv > 0.0) {
          // the ceiling, and its light
          float panel = step(abs(hit.x - bay * 0.5), bay * 0.28) * step(abs(hit.z - depth * 0.45), depth * 0.18);
          inside = lc * lum * (0.9 + 1.6 * panel);
        } else if (t == ty) {
          inside = lc * lum * 0.22 * (0.7 + 0.3 * n2(hit.xz * 3.0));
        } else {
          inside = lc * lum * 0.42;
        }
        inside *= 1.0 - 0.45 * clamp(hit.z / depth, 0.0, 1.0);
        inside *= lit;
        inside += vec3(0.004, 0.0045, 0.006) * (1.0 - lit);
        // blinds in some windows, glowing when the room is lit
        float blindOn = step(h12(rid + 4.4), ground ? 0.0 : 0.33);
        float blindTo = storey - 0.6 - (0.3 + 0.7 * h12(rid + 5.5)) * (storey - 1.4);
        float slat = 0.85 + 0.15 * step(0.5, fract(hy / 0.06));
        vec3 blind = mix(vec3(0.012), lc * lum * 0.55 * slat, lit);
        inside = mix(inside, blind, blindOn * step(blindTo, hy));
        float NdV = max(dot(n, V), 0.0);
        float fres = 0.05 + 0.95 * pow(1.0 - NdV, 5.0);
        vec3 refl = skyGlass(reflect(-V, n));
        vec3 pane = inside * transmit + refl * fres;
        // the walls: the street's light from below, the city's glow
        float shiny = office > 0.5 ? 0.5 : 0.05;
        vec3 wallLit = wallAlb * (vec3(0.05, 0.045, 0.045) + vec3(1.0, 0.75, 0.5) * 0.85 * exp(-v / 13.0)) + refl * fres * shiny;
        // a shop's sign over its front
        if (ground && hy > storey - 0.7 && hy < storey - 0.12) {
          float shop = floor(u / (bay * 3.0));
          float across = fract(u / (bay * 3.0));
          float signOn = step(0.72, h12(vec2(shop, seed * 11.0)));
          vec3 hue = mix(0.5 + 0.5 * cos(6.2831 * (h12(vec2(shop, seed)) + vec3(0.0, 0.33, 0.67))), vec3(1.0), 0.35);
          wallLit = mix(wallLit, hue * 0.85, signOn * step(0.22, across) * step(across, 0.78));
        }
        col = mix(wallLit, pane, glass);
        // a landmark's crown: dark glass traced by lines of light
        if (crown > 0.5) {
          float line = 1.0 - smoothstep(0.0, 0.05, abs(fract(v / 4.5) - 0.5));
          float rib = 1.0 - smoothstep(0.0, 0.05, abs(fract(u / 4.0) - 0.5));
          col = vec3(0.006, 0.007, 0.009) + refl * fres;
          col += vec3(1.0, 0.8, 0.55) * (line * 0.5 + rib * 0.16) * (0.85 + 0.15 * sin(uTime * 0.4 + seed * 9.0));
        } else {
          // far off, many windows share a pixel: settle to their average rather than shimmer
          float px = max(fwidth(u) / bay, fwidth(v) / storey);
          float detail = 1.0 - smoothstep(0.35, 0.9, px);
          float share = office > 0.5 ? litShare * 1.25 : litShare;
          vec3 avgPane = vec3(1.0, 0.75, 0.5) * 0.42 * share * transmit + refl * fres;
          float glassShare = style < 0.5 ? 0.78 : style < 1.5 ? 0.3 : style < 2.5 ? 0.7 : 0.25;
          col = mix(mix(wallAlb * 0.06, avgPane, glassShare), col, detail);
        }
      }
      gl_FragColor = vec4(hazed(col, vWorld), 1.0);
      #include <colorspace_fragment>
    }`,
})

/* Plant rooms on the roofs, lamp posts, tree trunks: dark, a breath of the city's glow. */
const darkMaterial = (ground) => new THREE.ShaderMaterial({
  fog: false,
  uniforms: { uGround: ground },
  vertexShader: /* glsl */ `
    varying vec3 vWorld; varying vec3 vN;
    void main() { mat4 m = modelMatrix * instanceMatrix; vec4 w = m * vec4(position, 1.0); vWorld = w.xyz; vN = normalize(mat3(m) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld; varying vec3 vN;
    ${GLSL_COMMON}
    void main() {
      vec3 col = vec3(0.012, 0.012, 0.014) * (0.7 + 0.5 * max(vN.y, 0.0)) + vec3(0.02, 0.014, 0.01) * max(-vN.y, 0.0);
      gl_FragColor = vec4(hazed(col, vWorld), 1.0);
      #include <colorspace_fragment>
    }`,
})

/* Street trees: crowns of several lobes of leaves, their edges ragged where the light shows
   through the foliage, lit from below by the street lamps and dark above. */
const treeMaterial = (ground) => new THREE.ShaderMaterial({
  fog: false,
  uniforms: { uGround: ground },
  vertexShader: /* glsl */ `
    varying vec3 vWorld; varying vec3 vN;
    void main() {
      mat4 m = modelMatrix * instanceMatrix;
      vec4 w = m * vec4(position, 1.0);
      vWorld = w.xyz;
      vN = normalize(mat3(m) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld; varying vec3 vN;
    ${GLSL_COMMON}
    float leaves(vec3 p) { return n2(p.xz * 1.0 + p.y * 1.7) * 0.5 + n2(p.xy * 2.3 + p.z) * 0.3 + n2(p.zy * 4.7) * 0.2; }
    void main() {
      vec3 n = normalize(vN);
      vec3 V = normalize(cameraPosition - vWorld);
      float l = leaves(vWorld * 1.6);
      // up close the crown's edge breaks up into clumps of leaves; far off it settles
      float near = 1.0 - smoothstep(0.08, 0.4, fwidth(vWorld.x) * 1.6);
      float edge = 1.0 - abs(dot(n, V));
      if (l < (edge * 1.1 - 0.35) * near) discard;
      vec3 col = mix(vec3(0.004, 0.007, 0.003), vec3(0.012, 0.02, 0.008), l);
      col += vec3(0.05, 0.048, 0.024) * smoothstep(0.2, -0.7, n.y) * l;        // the lamp below
      col += vec3(0.006, 0.008, 0.008) * max(n.y, 0.0);                        // the sky above
      gl_FragColor = vec4(hazed(col, vWorld), 1.0);
      #include <colorspace_fragment>
    }`,
})

/* ------------------------------------------------------------------ the traffic */
const vehicleMaterial = (kind, ground) => new THREE.ShaderMaterial({
  fog: false,
  uniforms: { uGround: ground },
  vertexShader: /* glsl */ `
    attribute vec3 aPaint;
    attribute float aBrake;
    varying vec3 vWorld; varying vec3 vN; varying vec3 vLocal; varying vec3 vPaint; varying float vBrake;
    void main() {
      mat4 m = modelMatrix * instanceMatrix;
      vec4 w = m * vec4(position, 1.0);
      vWorld = w.xyz; vN = normalize(mat3(m) * normal); vLocal = position; vPaint = aPaint; vBrake = aBrake;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld; varying vec3 vN; varying vec3 vLocal; varying vec3 vPaint; varying float vBrake;
    ${GLSL_COMMON}
    void main() {
      vec3 n = normalize(vN);
      vec3 V = normalize(cameraPosition - vWorld);
      vec3 L = vLocal;
      // passing under the lamps: the light swells and falls along the street
      float lamp = 0.22 + 0.7 * pow(0.5 + 0.5 * cos(6.2831 * (vWorld.x + vWorld.z) / ${f(POLE_SPACING)}), 3.0);
      float fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
      vec3 refl = skyGlass(reflect(-V, n));
      vec3 col = vPaint * (0.025 + lamp * 0.5 * max(n.y, 0.0) + 0.06 * dot(n.xz, n.xz)) + refl * (0.25 + fres);
      // a wheel: black rubber, its alloy rim catching the light on the side
      ${(() => {
        const w = kind === KIND.car ? WHEEL.car : kind === KIND.bus ? WHEEL.bus : WHEEL.bike
        const xs = w.at.map(([x]) => x.toFixed(2))
        const near = xs.map((x) => `length(vec2(L.x - (${x}), L.y - ${w.r.toFixed(2)}))`)
        const d = near.reduce((a, b) => `min(${a}, ${b})`)
        return `float wheelD = ${d};
      if (wheelD < ${(w.r + 0.01).toFixed(2)} && abs(L.z) > ${(w.at[0][1] ? w.at[0][1] - w.w / 2 - 0.01 : -1).toFixed(2)}) {
        col = vec3(0.012, 0.012, 0.013) * (0.6 + lamp * 0.5);
        if (abs(n.z) > 0.8 && wheelD < ${(w.r * 0.6).toFixed(2)}) col = vec3(0.16, 0.16, 0.17) * (0.4 + lamp) + refl * 0.4;
      }`
      })()}
      ${kind === KIND.car ? `
      bool glass = L.y > 1.0 && L.y < 1.37 && L.x > -1.05 && L.x < 0.95 && n.y < 0.9;
      if (glass) col = vec3(0.004, 0.005, 0.007) + refl * (0.4 + fres);
      if (L.y < 0.38 && wheelD > 0.35) col = vec3(0.01);
      float lampBand = step(0.58, L.y) * step(L.y, 0.82) * step(0.48, abs(L.z)) * step(abs(L.z), 0.86);
      col = mix(col, vec3(1.0, 0.95, 0.84) * 3.0, lampBand * step(2.12, L.x));
      col = mix(col, vec3(1.0, 0.04, 0.02) * (1.0 + 2.2 * vBrake), lampBand * step(L.x, -2.12));` : ''}
      ${kind === KIND.bus ? `
      float pillar = step(0.12, abs(fract(L.x / 1.45) - 0.5));
      bool side = L.y > 1.35 && L.y < 2.6 && abs(n.z) > 0.5 && abs(L.x) < 5.6;
      if (side) col = mix(vec3(0.02), vec3(0.95, 0.88, 0.7) * 0.75, pillar) + refl * fres;
      if (L.y < 0.62 && wheelD > 0.52) col = vec3(0.01);
      if (n.y > 0.5) col = vPaint * 0.06 + vec3(0.02);
      if (L.x > 5.95 && L.y > 2.55 && L.y < 2.9 && abs(L.z) < 0.9) col = vec3(1.0, 0.55, 0.1) * 1.4;
      float lampBand = step(0.55, L.y) * step(L.y, 0.85) * step(0.7, abs(L.z)) * step(abs(L.z), 1.15);
      col = mix(col, vec3(1.0, 0.95, 0.84) * 3.0, lampBand * step(5.95, L.x));
      col = mix(col, vec3(1.0, 0.04, 0.02) * (1.0 + 2.2 * vBrake), lampBand * step(L.x, -5.95));` : ''}
      ${kind === KIND.bike ? `
      if (L.y > 0.95) col = vec3(0.012) + refl * fres;                                       // the rider
      col = mix(col, vec3(1.0, 0.95, 0.84) * 3.0, step(0.92, L.x) * step(0.55, L.y) * step(L.y, 0.8));
      col = mix(col, vec3(1.0, 0.04, 0.02) * (1.0 + 2.2 * vBrake), step(L.x, -0.92) * step(0.55, L.y) * step(L.y, 0.75));` : ''}
      gl_FragColor = vec4(hazed(col, vWorld), 1.0);
      #include <colorspace_fragment>
    }`,
})

// wheels: a tyre with its axle across the vehicle (z), standing on the road
const WHEEL = {
  car: { r: 0.33, w: 0.22, at: [[-1.38, 0.79], [1.38, 0.79]] },
  bus: { r: 0.5, w: 0.3, at: [[-4.1, 1.1], [-2.7, 1.1], [3.9, 1.1]] },
  bike: { r: 0.32, w: 0.1, at: [[-0.72, 0], [0.72, 0]] },
}
const wheels = ({ r, w, at }) => at.flatMap(([x, z]) => (z ? [-z, z] : [0]).map((zz) => new THREE.CylinderGeometry(r, r, w, 18).rotateX(Math.PI / 2).translate(x, r, zz).toNonIndexed()))
const solid = (g) => (g.index ? g.toNonIndexed() : g)

function carGeometry() {
  const pts = [[-2.25, 0.3], [-2.25, 0.8], [-2.12, 0.94], [-1.55, 1.0], [-1.05, 1.37], [0.25, 1.42], [0.95, 1.0], [1.95, 0.88], [2.22, 0.74], [2.25, 0.3]]
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))
  const body = new THREE.ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 2, curveSegments: 4 })
  body.translate(0, 0, -0.85)
  body.computeVertexNormals()
  return mergeGeometries([body, ...wheels(WHEEL.car)])
}
function busGeometry() {
  return mergeGeometries([solid(new THREE.BoxGeometry(12, 2.85, 2.5).translate(0, 0.42 + 1.425, 0)), ...wheels(WHEEL.bus)])
}
function bikeGeometry() {
  return mergeGeometries([
    solid(new THREE.BoxGeometry(1.5, 0.42, 0.34).translate(0, 0.62, 0)),
    solid(new THREE.BoxGeometry(0.5, 0.7, 0.44).translate(-0.18, 1.2, 0)),
    solid(new THREE.SphereGeometry(0.16, 10, 8).translate(-0.05, 1.68, 0)),
    ...wheels(WHEEL.bike),
  ])
}

let beamMap = null
function beamTexture() {
  if (beamMap) return beamMap
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')
  // a cone of light along +u: brightest just ahead of the lamps, soft at its edges
  const img = g.createImageData(256, 128)
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 256; x++) {
      const u = x / 255
      const v = (y / 127 - 0.5) * 2
      const spread = 0.25 + 0.75 * u
      const across = Math.max(0, 1 - Math.abs(v) / spread)
      const a = Math.pow(across, 1.6) * Math.pow(1 - u, 1.3) * Math.min(1, u * 12)
      const i = (y * 256 + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255
      img.data[i + 3] = Math.round(255 * a)
    }
  }
  g.putImageData(img, 0, 0)
  beamMap = new THREE.CanvasTexture(c)
  return beamMap
}

/* Lights as points - lamp heads, aviation beacons, the traffic's own lamps - that stay visible however far. */
const pointsMaterial = (time) => new THREE.ShaderMaterial({
  fog: false,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uScale: { value: 300 }, uTime: time },
  vertexShader: /* glsl */ `
    attribute vec3 aColor;
    attribute float aBlink;
    uniform float uScale;
    uniform float uTime;
    varying vec3 vColor;
    varying vec3 vWorld;
    void main() {
      vec4 w = modelMatrix * vec4(position, 1.0);
      vWorld = w.xyz;
      vec4 mv = viewMatrix * w;
      float on = aBlink > 0.5 ? pow(0.5 + 0.5 * sin(uTime * 2.2 + aBlink * 3.0), 6.0) * 0.8 + 0.2 : 1.0;
      vColor = aColor * on;
      gl_PointSize = clamp(uScale / -mv.z, 1.2, 5.0);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying vec3 vWorld;
    void main() {
      vec2 q = gl_PointCoord - 0.5;
      float a = smoothstep(0.5, 0.1, length(q));
      float keep = exp(-length(vWorld - cameraPosition) * 0.0007);
      gl_FragColor = vec4(vColor * a * keep, 1.0);
      #include <colorspace_fragment>
    }`,
})

/* ------------------------------------------------------------------ assembly */
const none = () => null
const unitBox = () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)

function instancedBlocks(geometry, material, items, withInfo) {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, items.length))
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const a = withInfo ? new Float32Array(Math.max(1, items.length) * 4) : null
  const b = withInfo ? new Float32Array(Math.max(1, items.length) * 4) : null
  items.forEach((it, i) => {
    m.compose(new THREE.Vector3(it.x, CITY_Y + it.y, it.z), q, new THREE.Vector3(it.w, it.h, it.d))
    mesh.setMatrixAt(i, m)
    if (withInfo) { a.set(it.a, i * 4); b.set(it.b, i * 4) }
  })
  if (withInfo) {
    geometry.setAttribute('aA', new THREE.InstancedBufferAttribute(a, 4))
    geometry.setAttribute('aB', new THREE.InstancedBufferAttribute(b, 4))
  }
  mesh.count = items.length
  mesh.frustumCulled = false
  mesh.raycast = none
  return mesh
}

function buildCity(place) {
  const { boxes, rounds, roofs, beacons } = layoutBuildings()
  const { poles, trees } = layoutStreetFurniture()
  const ground = place.uniforms.uGround
  const dark = darkMaterial(ground)
  const tree = treeMaterial(ground)
  const points = pointsMaterial(place.time)
  const street = groundMaterial(place.uniforms)
  const boxGeo = unitBox()
  const roundGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 1).translate(0, 0.5, 0)
  const boxMat = facadeMaterial(false, ground)
  const roundMat = facadeMaterial(true, ground)
  const roofGeo = unitBox()
  const poleGeo = new THREE.BoxGeometry(0.22, 1, 0.22).translate(0, 0.5, 0)
  // Each lobe of leaves is a ball whose outline stays round to under a pixel even on a 4K
  // screen: the nearest trees, 96 m down, need the finest ball; farther off fewer facets draw
  // the same circle (the canopies were over half the city's triangles).
  const canopyGeo = [3, 2, 1].map((detail) => new THREE.IcosahedronGeometry(1, detail))
  const canopyTier = (t) => {
    const dx = Math.max(0, Math.abs(t.x) - SITE.x)
    const dz = Math.max(0, worldZ(SITE.d1) - t.z, t.z - worldZ(SITE.d0))
    const d = Math.hypot(dx, dz)        // across the plan from the building's footprint
    return d < 100 ? 0 : d < 300 ? 1 : 2
  }
  const lobes = trees.map((t, i) => [0, 1, 2, 3, 4].map((k) => {
    // five lobes of leaves round the crown, each tree its own arrangement
    const a = i * 2.39 + k * 1.37
    const off = k ? t.r * (0.38 + 0.12 * ((i * 7 + k * 3) % 5) / 4) : 0
    const r = t.r * (k ? 0.5 + 0.08 * ((i + k) % 3) : 0.66)
    return { x: t.x + Math.cos(a) * off, z: t.z + Math.sin(a) * off, y: t.h - t.r * 0.3 + (k ? (k % 2 ? -0.18 : 0.12) : 0.25) * t.r, w: r, d: r, h: r * 0.8 }
  }))
  const canopiesOf = (tier) => instancedBlocks(canopyGeo[tier], tree, lobes.filter((_, i) => canopyTier(trees[i]) === tier).flat(), false)
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.2, 1, 8).translate(0, 0.5, 0)
  const meshes = {
    boxes: instancedBlocks(boxGeo, boxMat, boxes, true),
    rounds: instancedBlocks(roundGeo, roundMat, rounds, true),
    roofs: instancedBlocks(roofGeo, dark, roofs, false),
    poles: instancedBlocks(poleGeo, dark, poles.map((p) => ({ x: p.x, z: p.z, y: 0, w: 1, d: 1, h: POLE_HEIGHT })), false),
    trunks: instancedBlocks(trunkGeo, dark, trees.map((t) => ({ x: t.x, z: t.z, y: 0, w: 1, d: 1, h: t.h - t.r * 0.6 })), false),
    canopies: canopiesOf(0),
    canopiesMid: canopiesOf(1),
    canopiesFar: canopiesOf(2),
  }
  const lights = [
    ...poles.map((p) => ({ x: p.x, y: POLE_HEIGHT - 0.2, z: p.z, c: p.warm ? [0.9, 0.56, 0.27] : [0.9, 0.84, 0.74], blink: 0 })),
    ...beacons.map((b, i) => ({ x: b.x, y: b.y, z: b.z, c: [1.4, 0.07, 0.035], blink: 1 + (i % 7) })),
  ]
  const lightGeo = new THREE.BufferGeometry()
  lightGeo.setAttribute('position', new THREE.Float32BufferAttribute(lights.flatMap((l) => [l.x, CITY_Y + l.y, l.z]), 3))
  lightGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(lights.flatMap((l) => l.c), 3))
  lightGeo.setAttribute('aBlink', new THREE.Float32BufferAttribute(lights.map((l) => l.blink), 1))
  meshes.lamps = new THREE.Points(lightGeo, points)
  meshes.lamps.frustumCulled = false
  meshes.lamps.raycast = none
  return {
    meshes,
    street,
    materials: [boxMat, roundMat],
    disposables: [boxMat, roundMat, dark, tree, points, street],
    geometries: [boxGeo, roundGeo, roofGeo, poleGeo, ...canopyGeo, trunkGeo, lightGeo],
  }
}

function buildTraffic(place) {
  const traffic = createTraffic()
  const ground = place.uniforms.uGround
  const cap = traffic.count
  const kinds = [
    { geo: carGeometry(), mat: vehicleMaterial(KIND.car, ground) },
    { geo: busGeometry(), mat: vehicleMaterial(KIND.bus, ground) },
    { geo: bikeGeometry(), mat: vehicleMaterial(KIND.bike, ground) },
  ].map(({ geo, mat }) => {
    const paint = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3)
    const brake = new THREE.InstancedBufferAttribute(new Float32Array(cap), 1)
    paint.setUsage(THREE.DynamicDrawUsage)
    brake.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('aPaint', paint)
    geo.setAttribute('aBrake', brake)
    const mesh = new THREE.InstancedMesh(geo, mat, cap)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = false
    mesh.raycast = none
    mesh.count = 0
    return { mesh, paint, brake }
  })
  // the light each vehicle throws on the road: a beam ahead, a red glow behind
  const beamGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0)
  const beamMat = new THREE.MeshBasicMaterial({ map: beamTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 })
  const beams = new THREE.InstancedMesh(beamGeo, beamMat, cap * 2)
  beams.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  beams.setColorAt(0, new THREE.Color(1, 1, 1))
  beams.instanceColor.setUsage(THREE.DynamicDrawUsage)
  beams.frustumCulled = false
  beams.raycast = none
  beams.count = 0
  // head and tail lights as points, so the far streams of traffic still read
  const ptGeo = new THREE.BufferGeometry()
  const ptPos = new THREE.Float32BufferAttribute(new Float32Array(cap * 2 * 3), 3)
  const ptCol = new THREE.Float32BufferAttribute(new Float32Array(cap * 2 * 3), 3)
  ptPos.setUsage(THREE.DynamicDrawUsage)
  ptCol.setUsage(THREE.DynamicDrawUsage)
  ptGeo.setAttribute('position', ptPos)
  ptGeo.setAttribute('aColor', ptCol)
  ptGeo.setAttribute('aBlink', new THREE.Float32BufferAttribute(new Float32Array(cap * 2), 1))
  const pointsMat = pointsMaterial(place.time)
  const points = new THREE.Points(ptGeo, pointsMat)
  points.frustumCulled = false
  points.raycast = none
  return { traffic, kinds, beams, points, ptPos, ptCol, beamGeo, beamMat, ptGeo, pointsMat }
}

// a turn about y, a stretch along the nose (sx) and across it (sz), and a position
function writeMatrix(arr, i, x, y, z, yaw, sx = 1, sz = 1) {
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  const o = i * 16
  arr[o] = c * sx; arr[o + 1] = 0; arr[o + 2] = -s * sx; arr[o + 3] = 0
  arr[o + 4] = 0; arr[o + 5] = 1; arr[o + 6] = 0; arr[o + 7] = 0
  arr[o + 8] = s * sz; arr[o + 9] = 0; arr[o + 10] = c * sz; arr[o + 11] = 0
  arr[o + 12] = x; arr[o + 13] = y; arr[o + 14] = z; arr[o + 15] = 1
}

/*
 * The city round the building's tower, seen from the Contact hall's glass and from the roof
 * terrace outside the front door - the same streets and traffic from both. It is drawn only
 * while it can be seen (outsideView); its traffic waits while it is not.
 */
export default function CityView() {
  const group = useRef()
  const placeDef = useMemo(() => ({
    time: { value: 0 },
    uniforms: {
      uGround: { value: CITY_Y },
      uPlan: { value: new THREE.Vector3(1, -1, GLASS_Z) },
      uSite: { value: new THREE.Vector3(SITE.x, SITE.d0, SITE.d1) },
    },
  }), [])
  const city = useMemo(() => buildCity(placeDef), [placeDef])
  const flow = useMemo(() => buildTraffic(placeDef), [placeDef])
  useEffect(() => () => {
    city.disposables.forEach((m) => m.dispose())
    city.geometries.forEach((g) => g.dispose())
    flow.kinds.forEach((k) => { k.mesh.geometry.dispose(); k.mesh.material.dispose() })
    flow.beamGeo.dispose()
    flow.beamMat.dispose()
    flow.ptGeo.dispose()
    flow.pointsMat.dispose()
  }, [city, flow])

  // The floors' reflection is cut at the floor plane, so what lies wholly below it - the streets,
  // their trees, lamp posts and traffic, 96 m down - never shows in it: it is not drawn for it.
  // (The towers stay: the tallest rise past the terrace and their tops can catch in its pavers.)
  const street = useRef()
  useEffect(() => {
    const below = [street.current, city.meshes.canopies, city.meshes.canopiesMid, city.meshes.canopiesFar, city.meshes.trunks, city.meshes.poles, ...flow.kinds.map((k) => k.mesh), flow.beams, flow.points].filter(Boolean)
    below.forEach((o) => floorReflection.hidden.add(o))
    return () => below.forEach((o) => floorReflection.hidden.delete(o))
  }, [city, flow])

  const place = useRef({ x: 0, z: 0, yaw: 0 })
  useFrame(({ camera }, dt) => {
    const seen = outsideSeen(camera)
    if (group.current) group.current.visible = seen
    if (!seen) return
    const step = Math.min(dt, 0.05)
    const t = (placeDef.time.value += step)
    city.materials.forEach((m) => { m.uniforms.uTime.value = t })
    stepTraffic(flow.traffic, step)
    const counts = [0, 0, 0]
    let beams = 0
    let pts = 0
    const bArr = flow.beams.instanceMatrix.array
    const bCol = flow.beams.instanceColor.array
    const pPos = flow.ptPos.array
    const pCol = flow.ptCol.array
    const put = (car, at) => {
      if (underTower(at.x, at.z)) return
      const k = flow.kinds[car.kind]
      const i = counts[car.kind]++
      writeMatrix(k.mesh.instanceMatrix.array, i, at.x, CITY_Y, at.z, at.yaw)
      k.paint.array[i * 3] = car.paint[0]
      k.paint.array[i * 3 + 1] = car.paint[1]
      k.paint.array[i * 3 + 2] = car.paint[2]
      k.brake.array[i] = car.brake
      const c = Math.cos(at.yaw)
      const s = Math.sin(at.yaw)
      const half = car.len / 2
      const wide = car.kind === KIND.bus ? 5 : car.kind === KIND.bike ? 2.2 : 4.2
      // the beam ahead
      writeMatrix(bArr, beams, at.x + c * (half - 0.2), CITY_Y + 0.04, at.z - s * (half - 0.2), at.yaw, car.kind === KIND.bike ? 11 : 15, wide)
      bCol[beams * 3] = 0.55; bCol[beams * 3 + 1] = 0.5; bCol[beams * 3 + 2] = 0.42
      beams++
      // the red glow behind
      writeMatrix(bArr, beams, at.x - c * (half - 0.2), CITY_Y + 0.04, at.z + s * (half - 0.2), at.yaw + Math.PI, 3.6, wide * 0.7)
      const red = 0.22 + 0.4 * car.brake
      bCol[beams * 3] = red; bCol[beams * 3 + 1] = red * 0.04; bCol[beams * 3 + 2] = red * 0.03
      beams++
      // the lamps themselves, as points, for the distance
      pPos[pts * 3] = at.x + c * half; pPos[pts * 3 + 1] = CITY_Y + 0.7; pPos[pts * 3 + 2] = at.z - s * half
      pCol[pts * 3] = 1.0; pCol[pts * 3 + 1] = 0.93; pCol[pts * 3 + 2] = 0.8
      pts++
      pPos[pts * 3] = at.x - c * half; pPos[pts * 3 + 1] = CITY_Y + 0.75; pPos[pts * 3 + 2] = at.z + s * half
      pCol[pts * 3] = 0.9 + car.brake * 0.6; pCol[pts * 3 + 1] = 0.03; pCol[pts * 3 + 2] = 0.02
      pts++
    }
    const at = place.current
    for (const lane of flow.traffic.lanes) for (const car of lane.vehicles) put(car, placeOf(lane, car, at))
    for (const turn of flow.traffic.turning) put(turn.car, placeTurning(turn, at))
    flow.kinds.forEach((k, i) => {
      k.mesh.count = counts[i]
      k.mesh.instanceMatrix.needsUpdate = true
      k.paint.needsUpdate = true
      k.brake.needsUpdate = true
    })
    flow.beams.count = beams
    flow.beams.instanceMatrix.needsUpdate = true
    flow.beams.instanceColor.needsUpdate = true
    flow.ptGeo.setDrawRange(0, pts)
    flow.ptPos.needsUpdate = true
    flow.ptCol.needsUpdate = true
  })

  return <group ref={group}>
    {/* the streets reach the far plane at the horizon: drawn after the sky, so they keep that last row */}
    <mesh ref={street} material={city.street} rotation={[-Math.PI / 2, 0, 0]} position={[0, CITY_Y, GLASS_Z - 2000]} raycast={none} renderOrder={11}>
      <planeGeometry args={[9000, 9000, 200, 200]} />
    </mesh>
    {Object.values(city.meshes).map((m) => <primitive key={m.uuid} object={m} />)}
    {flow.kinds.map((k) => <primitive key={k.mesh.uuid} object={k.mesh} />)}
    <primitive object={flow.beams} />
    <primitive object={flow.points} />
  </group>
}
