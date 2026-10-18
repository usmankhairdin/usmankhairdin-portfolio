import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { outsideSeen } from './outsideView.js'
import { floorReflection } from './floorReflection.js'
import { createStarPopulation, nightSkyUniforms, prepareNightSkyPass } from './nightSkyUniforms.js'

/*
 * The one night sky over the building: seen from the roof terrace at the front door and through
 * the Contact hall's glass at the far end. A near-black navy sky and the user's
 * Milky Way photograph angled across the side sky, varied fixed stars
 * and one detailed Moon to the right of the galaxy.
 * It is drawn only where it can be seen (outsideView), and after everything solid: it lies at
 * the far plane and writes no depth, so the picture is the same, but the GPU never works out
 * the stars behind a wall.
 */
const skyMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  fog: false,
  uniforms: nightSkyUniforms,
  vertexShader: /* glsl */ `
    uniform mat3 uSkyView;
    varying vec3 vDirection;
    void main() {
      vDirection = position;
      gl_Position = projectionMatrix * vec4(uSkyView * position, 1.0);
      gl_Position.z = gl_Position.w; // on the far plane: behind everything, and only where nothing else is
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vDirection;
    uniform sampler2D uGalaxyMap, uMoonMap;
    uniform vec3 uSkyColor, uGalaxyBlack, uGalaxyDirection, uGalaxyAxis, uGalaxyUp, uMoonDirection;
    uniform vec2 uGalaxyHalfSize, uGalaxyEdge;
    uniform float uGalaxyGain, uGalaxyOpacity, uMoonRadius;
    uniform mat3 uSkyView;
    uniform mat4 uSkyProjection;
    uniform vec4 uMoonDisc;
    uniform bool uMoonVisible;

    // Unresolved, steady points as naked-eye planets appear. Art-directed sky
    // positions, not an ephemeris for the current date.
    vec3 planet(vec3 d, vec3 direction, vec3 tint, float gain) {
      float pixel = max(length(fwidth(d)), 0.00005);
      float r = length(d - normalize(direction)) / pixel;
      return tint * gain * (exp(-r*r*2.8) + 0.035*exp(-r*r*0.2));
    }

    void main() {
      // the pixel's own ray: the sky lies at infinity, with no trace of the sphere's facets
      vec3 d = normalize(vDirection);
      float h = d.y;
      float sky = smoothstep(-0.02, 0.2, h);
      vec3 col = uSkyColor;

      // A finite tangent projection keeps the supplied photo's 3:2 proportions.
      // The doubled source field faces the corridor entrance's outward front: no wrapping,
      // repeated core, or all-sky expansion of its dust clouds.
      float galaxyFacing = dot(d,uGalaxyDirection);
      if (galaxyFacing > 0.0) {
        vec2 uv = .5+vec2(dot(d,uGalaxyAxis),dot(d,uGalaxyUp))/(2.0*galaxyFacing*uGalaxyHalfSize);
        vec2 border = smoothstep(vec2(0.0),uGalaxyEdge,min(uv,1.0-uv));
        // A rounded outer fade also dissolves the dense photographic star
        // field at the corners, so it cannot outline a rotated image panel.
        float roundFade = 1.0-smoothstep(.62,1.10,length((2.0*uv-1.0)*vec2(.90,1.0)));
        float opacity = border.x*border.y*roundFade;
        if (opacity > 0.0) {
          // Keep the same photographic detail through the transition. Blurring
          // colour at the margins makes a hazy image frame; dissolve its actual
          // light instead, with the source dust cloud determining the boundary.
          vec3 photo = max(texture2D(uGalaxyMap,uv).rgb-uGalaxyBlack,vec3(0.0));
          float luminance = dot(photo,vec3(.2126,.7152,.0722));
          // Broad-scale colour isolates the Milky Way cloud from the scattered
          // stars beside it. Individual bright points cannot create their own
          // mask; the scene's shared star population supplies the outer sky.
          // Fixed source-space scale keeps the mask stable as the visitor
          // turns or the viewport changes; only the alpha guide is smoothed.
          vec3 cloud = max(textureLod(uGalaxyMap,uv,7.5).rgb-uGalaxyBlack,vec3(0.0));
          float cloudLight = dot(cloud,vec3(.2126,.7152,.0722));
          float bandDistance = abs(uv.y-(1.07-1.05*uv.x));
          float bandWidth = .11+.035*exp(-pow((uv.x-.42)*5.0,2.0));
          opacity *= exp(-2.0*pow(bandDistance/bandWidth,2.0))*smoothstep(.002,.012,cloudLight);
          // Faint image background dissolves first; bright detail remains
          // resolved rather than smearing across a distance-based blur strip.
          opacity *= luminance/(luminance+.003);
          col += photo * opacity * sky * uGalaxyGain * uGalaxyOpacity;
        }
      }
      col += (planet(d,vec3(-0.38,0.16,-1.0),vec3(1.0,0.96,0.86),2.4)
            + planet(d,vec3(0.75,0.45,-0.9),vec3(1.0,0.89,0.72),1.6)
            + planet(d,vec3(-0.9,0.3,0.1),vec3(1.0,0.7,0.5),0.8)) * sky;

      // One fixed celestial Moon, right of the forward view. Spherical sampling
      // preserves real lunar maria/craters and a softly shaded gibbous limb.
      if (uMoonVisible) {
        vec4 viewClip = uSkyProjection * vec4(uSkyView * d, 1.0);
        vec2 q = (viewClip.xy / viewClip.w - uMoonDisc.xy) / uMoonDisc.zw;
        float r = length(q), aa = max(fwidth(r),0.001);
        col += vec3(0.12,0.14,0.18) * exp(-r*r*0.65) * 0.012;
        if (r < 1.0+aa) {
          vec3 n = normalize(vec3(q,sqrt(max(0.0,1.0-dot(q,q)))));
          vec2 uv = vec2(0.5+atan(n.x,n.z)/6.2831853,0.5+asin(n.y)/3.14159265);
          vec3 surface = texture2D(uMoonMap,uv).rgb;
          float lit = max(dot(n,normalize(vec3(-0.38,0.18,1.0))),0.0);
          vec3 lunar = surface * (0.025 + 2.2*pow(lit,0.65));
          col = mix(col,lunar,1.0-smoothstep(1.0-aa,1.0+aa,r));
        }
      }

      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`,
})

const starMaterial = new THREE.ShaderMaterial({
  uniforms: nightSkyUniforms,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
  vertexShader: /* glsl */ `
    uniform mat3 uSkyView;
    uniform float uTime, uPixelRatio;
    attribute vec3 aColor, aTwinkle;
    attribute float aSize, aBrightness;
    varying vec3 vColor;
    void main() {
      gl_Position = projectionMatrix * vec4(uSkyView * position,1.0);
      gl_Position.z = gl_Position.w;
      gl_PointSize = max(.8,aSize*uPixelRatio);
      float wave = .6*sin(uTime*aTwinkle.y+aTwinkle.z)
        +.4*sin(uTime*aTwinkle.y*1.71+aTwinkle.z*.73);
      float scintillation = 1.0+aTwinkle.x*wave;
      vColor = aColor*aBrightness*scintillation*smoothstep(.025,.15,position.y);
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    void main() {
      float radius = length(gl_PointCoord-vec2(.5))*2.0;
      float aa = max(fwidth(radius),.04);
      float coverage = exp(-radius*radius*4.5)*(1.0-smoothstep(1.0-aa,1.0,radius));
      gl_FragColor = vec4(vColor*coverage,1.0);
      #include <colorspace_fragment>
    }
  `,
})

const none = () => null

export default function NightSky() {
  const group = useRef()
  const stars = useMemo(() => {
    const population = createStarPopulation()
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.BufferAttribute(population.positions,3))
    geometry.setAttribute('aColor',new THREE.BufferAttribute(population.colors,3))
    geometry.setAttribute('aSize',new THREE.BufferAttribute(population.sizes,1))
    geometry.setAttribute('aBrightness',new THREE.BufferAttribute(population.brightness,1))
    geometry.setAttribute('aTwinkle',new THREE.BufferAttribute(population.twinkle,3))
    return geometry
  }, [])
  const maps = useLoader(THREE.TextureLoader,['/assets/sky/milky-way-thilina-6000.jpg','/assets/sky/moon-surface.webp'])
  useEffect(() => {
    maps.forEach(map => { map.colorSpace=THREE.SRGBColorSpace; map.needsUpdate=true })
    maps[0].minFilter=THREE.LinearMipmapLinearFilter
    maps[0].magFilter=THREE.LinearFilter
    maps[0].generateMipmaps=true
    skyMaterial.uniforms.uGalaxyMap.value=maps[0]
    skyMaterial.uniforms.uMoonMap.value=maps[1]
  }, [maps, skyMaterial])
  useFrame(({ camera }, dt) => {
    skyMaterial.uniforms.uTime.value += Math.min(dt,.05)
    if (group.current) group.current.visible = outsideSeen(camera)
  })
  // No floor mirrors the stars: twinkling points in a polished floor read as flashes underfoot.
  useEffect(() => {
    const sky = group.current
    floorReflection.hidden.add(sky)
    return () => floorReflection.hidden.delete(sky)
  }, [])
  useEffect(() => () => stars.dispose(), [stars])
  return <group ref={group}>
    <mesh material={skyMaterial} onBeforeRender={prepareNightSkyPass} frustumCulled={false} renderOrder={10} raycast={none}>
      <sphereGeometry args={[1, 48, 24]} />
    </mesh>
    <points geometry={stars} material={starMaterial} onBeforeRender={prepareNightSkyPass} frustumCulled={false} renderOrder={10.1} raycast={none} />
  </group>
}
