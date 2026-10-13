import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { outsideSeen } from './outsideView.js'
import { floorReflection } from './floorReflection.js'

/*
 * The one night sky over the building: seen from the roof terrace at the front door and through
 * the Contact hall's glass at the far end. Deep blue overhead, the city's warm glow low along the
 * horizon, stars in three depths - most of them blue-white - and, in one part of the sky, the
 * Milky Way rising from the horizon behind the terrace, in the colours a long exposure shows,
 * with a small distant galaxy beside it.
 * It is drawn only where it can be seen (outsideView), and after everything solid: it lies at
 * the far plane and writes no depth, so the picture is the same, but the GPU never works out
 * the stars behind a wall.
 */
const skyMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  fog: false,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec3 vWorld;
    void main() {
      vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_Position.z = gl_Position.w; // on the far plane: behind everything, and only where nothing else is
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld;
    uniform float uTime;
    // an integer hash of the lattice point: exact on every GPU, where sine-based ones break up
    float hash(vec3 p) {
      uvec3 q = uvec3(ivec3(floor(p * 97.0)) + 4194304) * uvec3(1597334673u, 3812015801u, 2798796415u);
      uint n = (q.x ^ q.y ^ q.z) * 1597334673u;
      n ^= n >> 16u;
      return float(n) * (1.0 / 4294967295.0);
    }
    float noise(vec3 p) {
      vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                 mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.07; a *= 0.5; } return v; }

    // one layer of stars: a star in some cells of a grid of the given size, round and sharp at
    // any resolution, its brightness and colour its own
    vec3 stars(vec3 d, float scale, float chance, float gain) {
      vec3 g = d * scale;
      vec3 cell = floor(g);
      float h = hash(cell);
      if (h > chance) return vec3(0.0);
      vec3 at = vec3(hash(cell + 11.0), hash(cell + 23.0), hash(cell + 37.0)) * 0.6 + 0.2;
      float px = length(fwidth(g));
      float dist = length(fract(g) - at);
      float b = pow(hash(cell + 51.0), 3.0);                        // mostly faint, a few bright
      float r = px * (0.55 + 1.2 * b);
      float core = 1.0 - smoothstep(r * 0.4, r, dist);
      float halo = exp(-dist / (px * 2.2)) * 0.25 * b;
      float c = hash(cell + 67.0);
      vec3 tint = c < 0.62 ? vec3(0.72, 0.84, 1.0)                  // blue-white, most of them
        : c < 0.86 ? vec3(1.0, 0.95, 0.88)                           // white
        : c < 0.95 ? vec3(1.0, 0.78, 0.56)                           // warm
        : c < 0.98 ? vec3(0.55, 0.62, 1.0)                           // blue
        : vec3(1.0, 0.45, 0.75);                                     // the odd rose one
      float twinkle = 0.82 + 0.18 * sin(uTime * (1.3 + h * 7.0) + h * 60.0);
      return tint * (core + halo) * (0.25 + 1.6 * b) * gain * twinkle;
    }

    void main() {
      // the pixel's own ray: the sky lies at infinity, with no trace of the sphere's facets
      vec3 d = normalize(vWorld - cameraPosition);
      float h = d.y;
      float sky = smoothstep(-0.02, 0.2, h);
      vec3 col = mix(vec3(0.012, 0.014, 0.024), vec3(0.0016, 0.0022, 0.0055), smoothstep(-0.02, 0.45, h));
      // the city's own light, low along the horizon all round, warmest over the city ahead
      float band = exp(-max(h + 0.015, 0.0) * 14.0);
      float cityDir = 0.35 + 0.65 * smoothstep(0.2, -0.9, d.z);
      col += vec3(0.085, 0.048, 0.026) * band * cityDir;
      col += vec3(0.05, 0.03, 0.02) * band * (1.0 - cityDir);

      // the Milky Way, in one part of the sky: rising from the horizon behind the terrace toward
      // the zenith and fading out there - a narrow river of faint light, warm and bright at its
      // core near the horizon, a dark lane of dust down its length, crowded with stars
      vec3 A = normalize(vec3(0.42, 0.06, 0.9));
      vec3 B = normalize(vec3(-0.25, 0.94, 0.2));
      vec3 Bp = normalize(B - A * dot(A, B));
      vec3 pole = cross(A, Bp);
      float lat = dot(d, pole);
      float lon = atan(dot(d, Bp), dot(d, A));
      float reach = smoothstep(-0.45, -0.1, lon) * smoothstep(1.75, 0.85, lon);
      float coreAt = exp(-pow(lon - 0.22, 2.0) / 0.12);
      float width = 0.06 + 0.07 * coreAt;
      float wob = (fbm(d * 3.0) - 0.5) * 0.06;
      float river = exp(-pow(lat + wob, 2.0) / (2.0 * width * width)) * reach;
      float grain = 0.55 + 0.45 * fbm(d * 26.0) * fbm(d * 7.0 + 4.0) * 2.0;
      // the dust: a soft, ragged lane down one side of the middle, thicker in places, broken in others
      float laneW = 0.022 + 0.018 * fbm(d * 4.0 + 5.0);
      float lane = exp(-pow(lat + wob - 0.015 + (fbm(d * 6.0 + 2.0) - 0.5) * 0.04, 2.0) / (2.0 * laneW * laneW));
      lane *= smoothstep(0.3, 0.6, fbm(d * 5.0 + 7.0)) * (0.6 + 0.4 * fbm(d * 18.0));
      // its colours, as a long exposure shows them: blue-violet starlight, brown-orange dust warmest
      // at the core and along the lane's edges, and here and there a rose glow of hydrogen
      float hue = clamp(coreAt * 0.85 + (fbm(d * 4.5 + 3.0) - 0.45) * 1.8, 0.0, 1.0);
      vec3 glow = mix(vec3(0.05, 0.065, 0.15), vec3(0.17, 0.105, 0.06), hue);
      float rose = smoothstep(0.6, 0.8, fbm(d * 9.0 + 11.0));
      glow += vec3(0.13, 0.03, 0.08) * rose;
      col += glow * river * grain * (1.0 - 0.8 * lane) * sky;
      col += vec3(0.07, 0.04, 0.018) * lane * river * (1.0 - lane) * 2.0 * sky;

      // stars everywhere, three depths of them, crowding into the river
      float crowd = 1.0 + 2.5 * river;
      vec3 st = stars(d, 260.0, 0.003, 1.0)
              + stars(d, 620.0, 0.006 * crowd, 0.55)
              + stars(d, 1400.0, 0.008 * crowd, 0.28);
      // in the river the stars run bluer, crowded into clusters
      st *= mix(vec3(1.0), vec3(0.78, 0.9, 1.25), river);
      col += st * smoothstep(0.02, 0.18, h) * (1.0 - 0.6 * lane * river);

      // far off, a small spiral galaxy: a faint tilted smudge with a warm nucleus
      vec3 g = normalize(vec3(-0.5, 0.55, 0.67));
      if (dot(d, g) > 0.995) {
        vec3 gu = normalize(cross(g, vec3(0.0, 1.0, 0.0)));
        vec3 gv = cross(gu, g);
        vec2 q = vec2(dot(d, gu), dot(d, gv)) / 0.022;
        float c = cos(0.6); float sn = sin(0.6);
        q = vec2(c * q.x - sn * q.y, sn * q.x + c * q.y);
        q.y /= 0.38;
        float r = length(q);
        float arms = 0.6 + 0.4 * cos(2.0 * atan(q.y, q.x) - 6.0 * log(r + 0.05));
        float disc = exp(-r * 3.4) * arms;
        col += (vec3(0.07, 0.09, 0.16) * disc + vec3(0.5, 0.42, 0.32) * exp(-r * r * 70.0)) * smoothstep(1.5, 0.8, r) * sky;
      }

      col = mix(col, vec3(0.004, 0.0045, 0.006), smoothstep(-0.005, -0.12, h));
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
})

const none = () => null

export default function NightSky() {
  const mesh = useRef()
  useFrame(({ camera }, dt) => {
    skyMaterial.uniforms.uTime.value += dt
    if (mesh.current) mesh.current.visible = outsideSeen(camera)
  })
  // No floor mirrors the stars: twinkling points in a polished floor read as flashes underfoot.
  useEffect(() => {
    const sky = mesh.current
    floorReflection.hidden.add(sky)
    return () => floorReflection.hidden.delete(sky)
  }, [])
  return <mesh ref={mesh} material={skyMaterial} frustumCulled={false} renderOrder={10} scale={1200} raycast={none}>
    <sphereGeometry args={[1, 48, 24]} />
  </mesh>
}
