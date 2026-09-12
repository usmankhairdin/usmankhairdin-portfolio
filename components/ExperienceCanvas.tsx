"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const vertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragment = `uniform vec3 uOnDark;uniform vec3 uOnLight;uniform float uOpacity;uniform vec2 uBands[4];uniform float uCount;varying vec2 vUv;void main(){float y=1.0-(gl_FragCoord.y/float(textureSize));float dark=0.0;for(int i=0;i<4;i++){if(float(i)<uCount){dark+=smoothstep(uBands[i].x-.016,uBands[i].x+.016,y)*(1.0-smoothstep(uBands[i].y-.016,uBands[i].y+.016,y));}}vec3 color=mix(uOnLight,uOnDark,clamp(dark,0.0,1.0));gl_FragColor=vec4(color,uOpacity);}`;

function AdaptiveMaterial({ onDark, onLight, opacity }: { onDark: string; onLight: string; opacity: number }) {
  const material = useMemo(() => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexShader: vertex, fragmentShader: fragment.replace("float(textureSize)", "resolution.y"), uniforms: { uOnDark: { value: new THREE.Color(onDark) }, uOnLight: { value: new THREE.Color(onLight) }, uOpacity: { value: opacity }, resolution: { value: new THREE.Vector2(1, 1) }, uBands: { value: [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()] }, uCount: { value: 0 } } }), [onDark, onLight, opacity]);
  useFrame(({ size }) => { const bands = [".statement", ".site-footer"].map(selector => document.querySelector(selector)?.getBoundingClientRect()).filter(Boolean) as DOMRect[]; material.uniforms.resolution.value.set(size.width, size.height); material.uniforms.uCount.value = bands.length; bands.forEach((rect, index) => material.uniforms.uBands.value[index].set(Math.max(0, rect.top / window.innerHeight), Math.min(1, rect.bottom / window.innerHeight))); });
  return <primitive object={material} attach="material" />;
}

function InterfaceSignal() {
  const group = useRef<THREE.Group>(null); const scroll = useRef(0);
  useEffect(() => { const update = () => { const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); scroll.current = window.scrollY / max; }; update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  useFrame((state, delta) => { if (!group.current) return; const s = scroll.current; group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -s * 4.7, .035); group.current.rotation.y += delta * .13; group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, Math.sin(s * 11) * 2.2, .025); group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.cos(s * 8) * .8, .025); group.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.1) * .035); });
  return <group ref={group} position={[3.2, .4, 0]}><mesh rotation={[.4, -.4, .2]}><boxGeometry args={[2.2, 1.25, .02]} /><AdaptiveMaterial onDark="#d8ff36" onLight="#112342" opacity={.58} /></mesh><mesh position={[-.45, .24, .1]} rotation={[.4, -.4, .2]}><boxGeometry args={[.75, .18, .04]} /><AdaptiveMaterial onDark="#6689ff" onLight="#264ca5" opacity={.9} /></mesh><mesh position={[.26, -.13, .1]} rotation={[.4, -.4, .2]}><boxGeometry args={[.95, .16, .04]} /><AdaptiveMaterial onDark="#ff8d6d" onLight="#aa3c29" opacity={.86} /></mesh><mesh position={[.04, -.47, .1]} rotation={[.4, -.4, .2]}><boxGeometry args={[1.42, .12, .04]} /><AdaptiveMaterial onDark="#d8ff36" onLight="#2f6534" opacity={.8} /></mesh><mesh position={[.85, .77, 0]}><sphereGeometry args={[.13, 16, 16]} /><AdaptiveMaterial onDark="#d8ff36" onLight="#152d4d" opacity={1} /></mesh></group>;
}
export function ExperienceCanvas() { return <div aria-hidden="true" className="experience-canvas"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 46 }} gl={{ alpha: true, antialias: true }}><InterfaceSignal /></Canvas></div>; }
