import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { excludeExteriorFromFloorReflection } from '../experience/floorReflection.js'
import { outsideSeen } from '../experience/outsideView.js'
import RealCityBuildings from './RealCityBuildings.jsx'
import InhabitedSettlement from './InhabitedSettlement.jsx'
import IslandTrees from './IslandTrees.jsx'
import IslandAirport from './IslandAirport.jsx'
import { settlementRoadMask, SETTLEMENT_GLSL } from './settlementPlan.js'
import { SETTLEMENT_ECOLOGY_GLSL } from './settlementEcology.js'
import { ISLAND_TERRAIN_GLSL } from './islandTerrain.js'
import { islandRenderedTerrainHeight, ISLAND_TERRAIN_MESH_GLSL, ISLAND_GROUND_SIZE, ISLAND_GROUND_SEGMENTS } from './islandTerrainMesh.js'
import { writeTerrainRoadMatrix } from './terrainRoadPose.js'
import { gradeTerrainArchitecture } from './terrainArchitecture.js'
import { createSettlementTraffic, stepSettlementTraffic, settlementRouteAt } from './settlementTraffic.js'
import { exteriorLayout, islandDistance, EXTERIOR_COAST_GLSL } from './exteriorPlan.js'
import { EXTERIOR_OFFSET, GALLERY_PLOT, galleryPlotContains } from './gallerySite.js'
import CoastalOcean from './CoastalOcean.jsx'
import { COAST_SAND_GLSL } from './coastSurface.js'
import TrafficSignals from './TrafficSignals.jsx'
import { createSettlementSignals, settlementSignalState } from './trafficSignals.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {
  AVENUE, BLOCK, BLVD, CITY_Y, GLASS_Z, KIND, MAIN_AVENUE, POLE_HEIGHT, POLE_SPACING, SITE, STREET,
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
const HAZE = 'vec3(0.007, 0.011, 0.017)'
const f = (v) => v.toFixed(3)
const exteriorEye = { value: new THREE.Vector3() }
// Plan coordinates remain local to the one translated city. Projection still
// uses real world coordinates; lighting, coast masks and haze use the local eye.
function placeExteriorMaterial(material) {
  material.vertexShader = material.vertexShader.replace(/}\s*$/, `vWorld -= vec3(${EXTERIOR_OFFSET.map(f).join(',')});\n}`)
  material.fragmentShader = `uniform vec3 uExteriorEye;\n${material.fragmentShader.replace(/\bcameraPosition\b/g, 'uExteriorEye')}`
  material.uniforms.uExteriorEye = exteriorEye
  return material
}
const beachMap={value:null}
function useBeachMap(){
  const map=useLoader(THREE.TextureLoader,'/assets/environment/beach-diffuse.jpg')
  useMemo(()=>{
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace
    map.anisotropy=8;map.needsUpdate=true;beachMap.value=map
  },[map])
}
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
    ${EXTERIOR_COAST_GLSL}
    ${ISLAND_TERRAIN_GLSL}
    varying vec3 vWorld;
    void main() {
      vec4 w = modelMatrix * vec4(position, 1.0);
      w.y += islandTerrainHeight(w.xz-vec2(${f(EXTERIOR_OFFSET[0])},${f(EXTERIOR_OFFSET[2])}));
      vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vWorld;
    uniform vec3 uPlan;
    uniform vec3 uSite;
    ${GLSL_COMMON}
    #define B ${f(BLOCK)}
    void main() {
      vec2 source = settledSourcePoint(vWorld.xz);
      vec2 p = vec2(uPlan.x * source.x, uPlan.y * (source.y - uPlan.z));
      bool site = abs(p.x) < uSite.x && p.y > uSite.y && p.y < uSite.z;
      float am = floor(p.x / B + 0.5);
      float ax = p.x - am * B;
      float aHalf = settledAvenueHalf(vWorld.xz);
      bool isMain = am == 0.0 && aHalf>10.;
      float aWalk = aHalf<6.5 ? 1.5 : isMain ? ${f(MAIN_AVENUE.walk)} : ${f(AVENUE.walk)};
      float sn = floor((p.y - ${f(BLVD.d)}) / B + 0.5);
      float sz = p.y - (${f(BLVD.d)} + sn * B);
      float sHalf = settledStreetHalf(vWorld.xz);
      bool blvd = sn == 0.0 && sHalf>10.;
      float sWalk = sHalf<6.5 ? 1.5 : blvd ? ${f(BLVD.walk)} : ${f(STREET.walk)};
      bool ave = !site;
      bool avenueExists = settledAvenue(vWorld.xz), streetExists = settledStreet(vWorld.xz);
      vec2 junctionHalf = settledJunctionHalves(vWorld.xz);
      bool crossingStreet = settledCell(vec2(am-1.,sn)).g>.5 || settledCell(vec2(am,sn)).g>.5;
      bool crossingAvenue = settledCell(vec2(am,sn-1.)).r>.5 || settledCell(vec2(am,sn)).r>.5;
      bool onAve = ave && avenueExists && abs(ax) < aHalf;
      bool onSt = !site && streetExists && abs(sz) < sHalf;
      bool road = onAve || onSt;
      bool walk = !road && !site && ((ave && avenueExists && abs(ax) < aHalf + aWalk) || (streetExists && abs(sz) < sHalf + sWalk));

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
        if (onAve && crossingStreet) {
          float into = abs(sz) - junctionHalf.y;
          if (into > 0.8 && into < 4.4) paint = max(paint, aaSquare(ax - 0.5, 0.5) * step(0.6, abs(ax)) * 0.9);
          bool approach = (ax > 0.0 && sz > 0.0) || (ax < 0.0 && sz < 0.0);
          if (approach) paint = max(paint, aaLine(abs(into - 5.1), 0.2) * step(0.3, abs(ax)));
        }
        if (onSt && ave && crossingAvenue) {
          float into = abs(ax) - junctionHalf.x;
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
        float kerbA = ave && avenueExists ? abs(abs(ax) - aHalf) : 1e3;
        float kerbS = streetExists ? abs(abs(sz) - sHalf) : 1e3;
        alb = mix(alb, vec3(0.11, 0.105, 0.1), aaLine(min(kerbA, kerbS), 0.16));
      } else {
        // behind the buildings: yards and the odd car park
        alb = vec3(0.016, 0.022, 0.017) * (0.8 + 0.4 * n2(p * 0.3));
        paint = site ? 0.0 : aaLine(abs(fract(p.x / 2.6) - 0.5) * 2.6, 0.05) * step(0.7, n2(floor(p / 40.0) * 1.7)) * 0.6;
      }

      vec3 light = vec3(0.022, 0.02, 0.024);
      light += site || (!road&&!walk) ? vec3(0.) : plannedStreetLighting(vWorld.xz);
      // the shops along the pavements spill their light onto them
      if (walk) {
        float lineA = ave && avenueExists ? (aHalf + aWalk) - abs(ax) : 1e3;
        float lineS = streetExists ? (sHalf + sWalk) - abs(sz) : 1e3;
        float toShop = min(lineA, lineS);
        float seg = lineA < lineS ? floor(p.y / 11.0) + am * 31.0 : floor(p.x / 11.0) + sn * 17.0;
        light += vec3(1.0, 0.82, 0.6) * 0.42 * exp(-max(toShop, 0.0) / 1.8) * step(0.38, h12(vec2(seg, 3.0)));
      }

      vec3 col = mix(alb, paintCol, paint) * light;
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
      float architectureDistance=length(vWorld-cameraPosition);
      vec3 col = vec3(0.012, 0.012, 0.014) * (0.7 + 0.5 * max(vN.y, 0.0)) + vec3(0.02, 0.014, 0.01) * max(-vN.y, 0.0);
      col=hazed(col,vWorld);
      gl_FragColor = vec4(col, 1.0);
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
    attribute vec3 aVehicle;
    varying vec3 vVehicle;
    varying vec3 vWorld; varying vec3 vN; varying vec3 vLocal; varying vec3 vPaint; varying float vBrake;
    void main() {
      mat4 m = modelMatrix * instanceMatrix;
      vec3 shape=position;
      ${kind===KIND.car?'shape.y+=max(shape.y-.88,0.0)*aVehicle.z*.55;':''}
      vec4 w = m * vec4(shape, 1.0);
      vVehicle=aVehicle;
      vWorld = w.xyz; vN = normalize(mat3(m) * normal); vLocal = position; vPaint = aPaint; vBrake = aBrake;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vVehicle;
    varying vec3 vWorld; varying vec3 vN; varying vec3 vLocal; varying vec3 vPaint; varying float vBrake;
    ${GLSL_COMMON}
    void main() {
      vec3 n = normalize(vN);
      vec3 V = normalize(cameraPosition - vWorld);
      vec3 L = vLocal;
      vec3 headlight=mix(vec3(.76,.87,1.0),vec3(1.0,.79,.48),vVehicle.y)*3.0*vVehicle.x;
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
        if (abs(n.z) > 0.8 && wheelD < ${(w.r * 0.6).toFixed(2)}) {
          float spoke=.5+.5*cos(atan(L.y-${w.r.toFixed(2)},L.x-(${xs[0]}))*10.0);
          col = vec3(.08+.2*spoke) * (0.4 + lamp) + refl * .45;
        }
      }`
      })()}
      ${kind === KIND.car ? `
      bool glass = L.y > 1.0 && L.y < 1.37 && L.x > -1.05 && L.x < 0.95 && n.y < 0.9;
      if (glass) {
        float pillar=1.0-smoothstep(.035,.07,abs(L.x+.1));
        col = mix(vec3(.004,.005,.007)+refl*(.4+fres),vPaint*.05,pillar);
      }
      if(abs(n.z)>.6 && L.y>.4 && L.y<.96){
        float seam=1.0-smoothstep(.008,.018,min(abs(L.x+.12),abs(L.x+.98)));
        col*=1.0-seam*.65;
        float handle=(1.0-smoothstep(.07,.1,abs(L.x+.35)))*(1.0-smoothstep(.012,.026,abs(L.y-.91)));
        col+=vec3(.16)*handle;
      }
      if(abs(L.x)>2.12 && abs(L.z)<.45 && L.y>.38 && L.y<.66)col=vec3(.012)+vec3(.05)*step(.5,fract(L.z*24.0));
      if (L.y < 0.38 && wheelD > 0.35) col = vec3(0.01);
      float lampBand = step(0.58, L.y) * step(L.y, 0.82) * step(0.48, abs(L.z)) * step(abs(L.z), 0.86);
      col = mix(col, headlight, lampBand * step(2.12, L.x));
      col = mix(col, vec3(1.0, 0.04, 0.02) * (1.0 + 2.2 * vBrake), lampBand * step(L.x, -2.12));` : ''}
      ${kind === KIND.bus ? `
      float pillar = step(0.12, abs(fract(L.x / 1.45) - 0.5));
      bool side = L.y > 1.35 && L.y < 2.6 && abs(n.z) > 0.5 && abs(L.x) < 5.6;
      if (side) col = mix(vec3(0.02), vec3(0.95, 0.88, 0.7) * 0.75, pillar) + refl * fres;
      if (L.y < 0.62 && wheelD > 0.52) col = vec3(0.01);
      if (n.y > 0.5) col = vPaint * 0.06 + vec3(0.02);
      if (L.x > 5.95 && L.y > 2.55 && L.y < 2.9 && abs(L.z) < 0.9) col = vec3(1.0, 0.55, 0.1) * 1.4;
      float lampBand = step(0.55, L.y) * step(L.y, 0.85) * step(0.7, abs(L.z)) * step(abs(L.z), 1.15);
      col = mix(col, headlight, lampBand * step(5.95, L.x));
      col = mix(col, vec3(1.0, 0.04, 0.02) * (1.0 + 2.2 * vBrake), lampBand * step(L.x, -5.95));` : ''}
      ${kind === KIND.bike ? `
      if (L.y > 0.95) col = vec3(0.012) + refl * fres;                                       // the rider
      col = mix(col, headlight, step(0.92, L.x) * step(0.55, L.y) * step(L.y, 0.8));
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
  const roofline=body.attributes.position
  for(let i=0;i<roofline.count;i++){
    const y=roofline.getY(i),z=roofline.getZ(i)
    if(y>1.0)roofline.setZ(i,z*(1-(y-1)*.55))
  }
  body.computeVertexNormals()
  const mirrors=[-1,1].map(s=>solid(new RoundedBoxGeometry(.26,.13,.25,2,.04).translate(.63,.99,s*.96)))
  return mergeGeometries([body,...mirrors,...wheels(WHEEL.car)])
}
function busGeometry() {
  return mergeGeometries([solid(new RoundedBoxGeometry(12,2.85,2.5,3,.16).translate(0,0.42+1.425,0)),solid(new RoundedBoxGeometry(2.8,.25,1.8,2,.08).translate(-.7,3.35,0)),...wheels(WHEEL.bus)])
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
      float architectureDistance=length(vWorld-cameraPosition);
      if(architectureDistance>1550.0)discard;
      float keep = exp(-architectureDistance * 0.0007)*(1.0-smoothstep(1050.0,1550.0,architectureDistance));
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
  const up = new THREE.Vector3(0,1,0)
  const a = withInfo ? new Float32Array(Math.max(1, items.length) * 4) : null
  const b = withInfo ? new Float32Array(Math.max(1, items.length) * 4) : null
  items.forEach((it, i) => {
    q.setFromAxisAngle(up,it.yaw || 0)
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
  const layout = exteriorLayout()
  const graded = gradeTerrainArchitecture(layout)
  const { roofs, beacons } = graded
  const { poles } = layout
  const ground = place.uniforms.uGround
  const dark = darkMaterial(ground)
  const points = pointsMaterial(place.time)
  const street = groundMaterial(place.uniforms)
  const settlementMap=new THREE.DataTexture(settlementRoadMask(),32,32,THREE.RGBAFormat)
  settlementMap.magFilter=settlementMap.minFilter=THREE.NearestFilter
  settlementMap.needsUpdate=true
  street.uniforms.uSettlement={value:settlementMap}
  const roofGeo = unitBox()
  const poleGeo = new THREE.BoxGeometry(0.22, 1, 0.22).translate(0, 0.5, 0)
  const meshes = {
    roofs: instancedBlocks(roofGeo, dark, roofs, false),
    foundations: instancedBlocks(roofGeo, dark, graded.foundations, false),
    poles: instancedBlocks(poleGeo, dark, poles.map((p) => ({ x: p.x, z: p.z, y: islandRenderedTerrainHeight(p.x,p.z), w: 1, d: 1, h: POLE_HEIGHT })), false),
  }
  const lights = [
    ...poles.map((p) => ({ x: p.x, y: islandRenderedTerrainHeight(p.x,p.z) + POLE_HEIGHT - 0.2, z: p.z, c: p.warm ? [0.9, 0.56, 0.27] : [0.9, 0.84, 0.74], blink: 0 })),
    ...beacons.map((b, i) => ({ x: b.x, y: b.y, z: b.z, c: [1.4, 0.07, 0.035], blink: 1 + (i % 7) })),
  ]
  const lightGeo = new THREE.BufferGeometry()
  lightGeo.setAttribute('position', new THREE.Float32BufferAttribute(lights.flatMap((l) => [l.x, CITY_Y + l.y, l.z]), 3))
  lightGeo.setAttribute('aColor', new THREE.Float32BufferAttribute(lights.flatMap((l) => l.c), 3))
  lightGeo.setAttribute('aBlink', new THREE.Float32BufferAttribute(lights.map((l) => l.blink), 1))
  meshes.lamps = new THREE.Points(lightGeo, points)
  meshes.lamps.frustumCulled = false
  meshes.lamps.raycast = none
  street.uniforms.uBeach = beachMap
  street.fragmentShader = `uniform sampler2D uBeach; ${EXTERIOR_COAST_GLSL} ${COAST_SAND_GLSL} ${SETTLEMENT_GLSL} ${SETTLEMENT_ECOLOGY_GLSL}\n${street.fragmentShader}`
    .replace('void main() {', 'void main() { if(!cityLand(vWorld.xz)) discard;')
    .replace('vec3 col = mix(alb, paintCol, paint) * light;', `
      vec3 col = mix(alb, paintCol, paint) * light;
      vec3 sand=coastSandColor(uBeach,vWorld.xz);
      float coast=islandDistance(vWorld.xz);
      float clearing=n2(vWorld.xz*.015)+.35*n2(vWorld.xz*.041);
      float inland=1.-smoothstep(-510.,-230.,coast+(clearing-.6)*60.);
      float woodland=max(smoothstep(.22,.84,settlementWoodlandWeight(vWorld.xz)),inland*.48);
      float dune=smoothstep(-365.,-215.,coast+(clearing-.6)*85.);
      dune*=1.-woodland*.94;
      float meadow=smoothstep(.32,.98,n2(vWorld.xz*.007)+.28*n2(vWorld.xz*.027));
      vec3 litter=mix(sand*vec3(.19,.29,.13),sand*vec3(.105,.23,.09),meadow)*(1.+clearing*.22);
      vec3 woodlandFloor=sand*mix(vec3(.105,.18,.08),vec3(.17,.29,.115),meadow)*(.85+clearing*.25);
      litter=mix(litter,woodlandFloor,woodland);
      vec3 natural=mix(litter,sand,dune);
      if(!road&&!walk&&!site)col=natural;
      vec3 terrainNormal=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
      if(terrainNormal.y<0.)terrainNormal=-terrainNormal;
      float terrainShade=.62+.48*max(dot(terrainNormal,normalize(vec3(-.35,.78,.42))),0.);
      col*=terrainShade;
      col=mix(col,sand,smoothstep(-205.,-180.,coast));`)
    .replace('bool site = abs(p.x) < uSite.x && p.y > uSite.y && p.y < uSite.z;', `bool site = vWorld.x > ${f(GALLERY_PLOT.x0)} && vWorld.x < ${f(GALLERY_PLOT.x1)} && vWorld.z > ${f(GALLERY_PLOT.z0)} && vWorld.z < ${f(GALLERY_PLOT.z1)};`)
  ;[dark, points, street].forEach(placeExteriorMaterial)

  return {
    layout,
    architectureLayout: graded.architecture,
    meshes,
    street,
    disposables: [dark, points, street,settlementMap],
    geometries: [roofGeo, poleGeo, lightGeo],
  }
}

function buildTraffic(place, copies = 1) {
  const traffic = createSettlementTraffic()
  const ground = place.uniforms.uGround
  const cap = traffic.count * copies
  const kinds = [
    { geo: carGeometry(), mat: vehicleMaterial(KIND.car, ground) },
    { geo: busGeometry(), mat: vehicleMaterial(KIND.bus, ground) },
    { geo: bikeGeometry(), mat: vehicleMaterial(KIND.bike, ground) },
  ].map(({ geo, mat }) => {
    const paint = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3)
    const brake = new THREE.InstancedBufferAttribute(new Float32Array(cap), 1)
    const vehicle = new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3)
    paint.setUsage(THREE.DynamicDrawUsage)
    brake.setUsage(THREE.DynamicDrawUsage)
    vehicle.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('aPaint', paint)
    geo.setAttribute('aBrake', brake)
    geo.setAttribute('aVehicle',vehicle)
    const mesh = new THREE.InstancedMesh(geo, mat, cap)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = false
    mesh.raycast = none
    mesh.count = 0
    return { mesh, paint, brake, vehicle }
  })
  // the light each vehicle throws on the road: a beam ahead, a red glow behind
  const beamGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0)
  const beamMat = new THREE.MeshBasicMaterial({ map: beamTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 })
  // Project each beam vertex onto the shared land, rather than leaving a flat
  // glowing card hovering over the road when it crests a wooded rise.
  beamMat.onBeforeCompile=shader=>{
    shader.vertexShader=`${EXTERIOR_COAST_GLSL}\n${ISLAND_TERRAIN_GLSL}\n${ISLAND_TERRAIN_MESH_GLSL}\n${shader.vertexShader}`
      .replace('#include <project_vertex>',`
        vec4 mvPosition=vec4(transformed,1.);
        #ifdef USE_INSTANCING
          mvPosition=instanceMatrix*mvPosition;
        #endif
        mvPosition=modelMatrix*mvPosition;
        mvPosition.y=${f(CITY_Y+.04)}+islandRenderedTerrainHeight(mvPosition.xz-vec2(${f(EXTERIOR_OFFSET[0])},${f(EXTERIOR_OFFSET[2])}));
        mvPosition=viewMatrix*mvPosition;
        gl_Position=projectionMatrix*mvPosition;`)
  }
  beamMat.customProgramCacheKey=()=> 'island-terrain-headlight-v1'
  const beams = new THREE.InstancedMesh(beamGeo, beamMat, cap * 2)
  beams.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  beams.setColorAt(0, new THREE.Color(1, 1, 1))
  beams.instanceColor.setUsage(THREE.DynamicDrawUsage)
  beams.frustumCulled = false
  beams.raycast = none
  beams.count = 0
  // head and tail lights as points, so the far streams of traffic still read
  const ptGeo = new THREE.BufferGeometry()
  const ptPos = new THREE.Float32BufferAttribute(new Float32Array(cap * 4 * 3), 3)
  const ptCol = new THREE.Float32BufferAttribute(new Float32Array(cap * 4 * 3), 3)
  ptPos.setUsage(THREE.DynamicDrawUsage)
  ptCol.setUsage(THREE.DynamicDrawUsage)
  ptGeo.setAttribute('position', ptPos)
  ptGeo.setAttribute('aColor', ptCol)
  ptGeo.setAttribute('aBlink', new THREE.Float32BufferAttribute(new Float32Array(cap * 4), 1))
  const pointsMat = pointsMaterial(place.time)
  kinds.forEach(kind => placeExteriorMaterial(kind.mesh.material))
  placeExteriorMaterial(pointsMat)
  const points = new THREE.Points(ptGeo, pointsMat)
  points.frustumCulled = false
  points.raycast = none
  return { traffic, kinds, beams, points, ptPos, ptCol, beamGeo, beamMat, ptGeo, pointsMat }
}

function disposeTraffic(flow) {
  flow.kinds.forEach((kind) => { kind.mesh.geometry.dispose(); kind.mesh.material.dispose() })
  flow.beamGeo.dispose()
  flow.beamMat.dispose()
  flow.ptGeo.dispose()
  flow.pointsMat.dispose()
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

function updateTraffic(flow, step, place, copies = 1) {
    stepSettlementTraffic(flow.traffic, step)
    const counts = [0, 0, 0]
    let beams = 0
    let pts = 0
    const bArr = flow.beams.instanceMatrix.array
    const bCol = flow.beams.instanceColor.array
    const pPos = flow.ptPos.array
    const pCol = flow.ptCol.array
    const roadFrame={}
    const put = (car, at, district = -1) => {
      const k = flow.kinds[car.kind]
      const i = counts[car.kind]++
      const matrix=k.mesh.instanceMatrix.array,matrixAt=i*16
      writeTerrainRoadMatrix(matrix, i, at.x, CITY_Y, at.z, at.yaw,roadFrame)
      k.paint.array[i * 3] = car.paint[0]
      k.paint.array[i * 3 + 1] = car.paint[1]
      k.paint.array[i * 3 + 2] = car.paint[2]
      k.brake.array[i] = car.brake
      const lamps=car.light||[1,.65,.4]
      k.vehicle.array.set(lamps,i*3)
      const c = Math.cos(at.yaw)
      const s = Math.sin(at.yaw)
      const half = car.len / 2
      const wide = car.kind === KIND.bus ? 5 : car.kind === KIND.bike ? 2.2 : 4.2
      // the beam ahead
      writeMatrix(bArr, beams, at.x + c * (half - 0.2), CITY_Y + 0.04, at.z - s * (half - 0.2), at.yaw,(car.kind===KIND.bike?11:15)*(0.75+lamps[0]*.4),wide)
      bCol[beams * 3] = (.42+lamps[1]*.13)*lamps[0]; bCol[beams * 3 + 1] = .49*lamps[0]; bCol[beams * 3 + 2] = (.58-lamps[1]*.28)*lamps[0]
      beams++
      // the red glow behind
      writeMatrix(bArr, beams, at.x - c * (half - 0.2), CITY_Y + 0.04, at.z + s * (half - 0.2), at.yaw + Math.PI, 3.6, wide * 0.7)
      const red = 0.22 + 0.4 * car.brake
      bCol[beams * 3] = red; bCol[beams * 3 + 1] = red * 0.04; bCol[beams * 3 + 2] = red * 0.03
      beams++
      // Two separate headlights/tail lights stay attached through each turn.
      const offsets=car.kind===KIND.bike?[0]:[-1,1]
      const lampWidth=car.kind===KIND.bus?.93:.67
      for(const side of offsets){
        const off=side*lampWidth
        pPos[pts*3]=matrix[matrixAt+12]+matrix[matrixAt]*half+matrix[matrixAt+4]*.7+matrix[matrixAt+8]*off
        pPos[pts*3+1]=matrix[matrixAt+13]+matrix[matrixAt+1]*half+matrix[matrixAt+5]*.7+matrix[matrixAt+9]*off
        pPos[pts*3+2]=matrix[matrixAt+14]+matrix[matrixAt+2]*half+matrix[matrixAt+6]*.7+matrix[matrixAt+10]*off
        pCol[pts*3]=(.76+lamps[1]*.24)*lamps[0];pCol[pts*3+1]=(.87-lamps[1]*.08)*lamps[0];pCol[pts*3+2]=(1-lamps[1]*.52)*lamps[0];pts++
        pPos[pts*3]=matrix[matrixAt+12]-matrix[matrixAt]*half+matrix[matrixAt+4]*.75+matrix[matrixAt+8]*off
        pPos[pts*3+1]=matrix[matrixAt+13]-matrix[matrixAt+1]*half+matrix[matrixAt+5]*.75+matrix[matrixAt+9]*off
        pPos[pts*3+2]=matrix[matrixAt+14]-matrix[matrixAt+2]*half+matrix[matrixAt+6]*.75+matrix[matrixAt+10]*off
        pCol[pts*3]=.9+car.brake*.6;pCol[pts*3+1]=.03;pCol[pts*3+2]=.02;pts++
      }
    }
    const at = place
    for (let district = 0; district < copies; district++) {
      const index = copies === 1 ? -1 : district
      for (const car of flow.traffic.vehicles) put(car, settlementRouteAt(car.route,car.s,at),index)
    }
    flow.kinds.forEach((k, i) => {
      k.mesh.count = counts[i]
      k.mesh.instanceMatrix.needsUpdate = true
      k.paint.needsUpdate = true
      k.brake.needsUpdate = true
      k.vehicle.needsUpdate = true
    })
    flow.beams.count = beams
    flow.beams.instanceMatrix.needsUpdate = true
    flow.beams.instanceColor.needsUpdate = true
    flow.ptGeo.setDrawRange(0, pts)
    flow.ptPos.needsUpdate = true
    flow.ptCol.needsUpdate = true
}

/*
 * The city round the building's tower, seen from the Contact hall's glass and from the roof
 * terrace outside the front door - the same streets and traffic from both. It is drawn only
 * while it can be seen (outsideView); its traffic waits while it is not.
 */
export default function CityView() {
  useBeachMap()
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
  const signals = useMemo(createSettlementSignals, [])
  useEffect(() => () => {
    city.disposables.forEach((m) => m.dispose())
    city.geometries.forEach((g) => g.dispose())
    disposeTraffic(flow)
  }, [city, flow])

  // All surrounding buildings now stay below the terrace. Exclude the complete
  // exterior, including sprite lamps and source fleets, from its floor capture.
  const street = useRef()
  useEffect(()=>excludeExteriorFromFloorReflection(group.current),[])

  const place = useRef({ x: 0, z: 0, yaw: 0 })
  useFrame(({ camera }, dt) => {
    exteriorEye.value.set(camera.position.x - EXTERIOR_OFFSET[0], camera.position.y, camera.position.z - EXTERIOR_OFFSET[2])
    const seen = outsideSeen(camera)
    if (group.current) group.current.visible = seen
    if (!seen) return
    const step = Math.min(dt, 0.05)
    const t = (placeDef.time.value += step)
    updateTraffic(flow, step, place.current)
  }, -1)

  return <group ref={group} position={EXTERIOR_OFFSET}>
    <RealCityBuildings layout={city.architectureLayout} nearDistance={180} />
    <InhabitedSettlement sites={city.layout.settlements} />
    <IslandTrees layout={city.layout} groundY={CITY_Y} />
    <Suspense fallback={null}><IslandAirport /></Suspense>
    <CoastalOcean />
    <TrafficSignals traffic={flow.traffic} signals={signals} ground={CITY_Y} stateAt={settlementSignalState} />
    {/* the streets reach the far plane at the horizon: drawn after the sky, so they keep that last row */}
    <mesh ref={street} material={city.street} rotation={[-Math.PI / 2, 0, 0]} position={[0, CITY_Y, GLASS_Z]} raycast={none} renderOrder={11}>
      <planeGeometry args={[ISLAND_GROUND_SIZE, ISLAND_GROUND_SIZE, ISLAND_GROUND_SEGMENTS, ISLAND_GROUND_SEGMENTS]} />
    </mesh>
    {Object.values(city.meshes).map((m) => <primitive key={m.uuid} object={m} />)}
    {flow.kinds.map((k) => <primitive key={k.mesh.uuid} object={k.mesh} />)}
    <primitive object={flow.beams} />
    <primitive object={flow.points} />
  </group>
}
