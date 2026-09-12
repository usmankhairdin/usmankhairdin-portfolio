"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function InterfaceSignal() {
  const group = useRef<THREE.Group>(null);
  const scroll = useRef(0);
  useEffect(() => { const update = () => { const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); scroll.current = window.scrollY / max; }; update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  useFrame((state, delta) => {
    if (!group.current) return;
    const s = scroll.current;
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, -s * 4.7, .035);
    group.current.rotation.y += delta * .13;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, Math.sin(s * 11) * 2.2, .025);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.cos(s * 8) * .8, .025);
    group.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.1) * .035);
  });
  const line = new THREE.Color("#b7ff37");
  return <group ref={group} position={[3.2, .4, 0]}>
    <mesh rotation={[.4, -.4, .2]}><boxGeometry args={[2.2, 1.25, .02]} /><meshBasicMaterial color={line} wireframe transparent opacity={.32} /></mesh>
    <mesh position={[-.45, .24, .1]} rotation={[.4, -.4, .2]}><boxGeometry args={[.75, .18, .04]} /><meshBasicMaterial color="#6889ff" transparent opacity={.78} /></mesh>
    <mesh position={[.26, -.13, .1]} rotation={[.4, -.4, .2]}><boxGeometry args={[.95, .16, .04]} /><meshBasicMaterial color="#ff8d6d" transparent opacity={.72} /></mesh>
    <mesh position={[.04, -.47, .1]} rotation={[.4, -.4, .2]}><boxGeometry args={[1.42, .12, .04]} /><meshBasicMaterial color="#d8ff36" transparent opacity={.64} /></mesh>
    <mesh position={[.85, .77, 0]}><sphereGeometry args={[.13, 16, 16]} /><meshBasicMaterial color="#d8ff36" /></mesh>
  </group>;
}
export function ExperienceCanvas() { return <div aria-hidden="true" className="experience-canvas"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 46 }} gl={{ alpha: true, antialias: true }}><InterfaceSignal /></Canvas></div>; }
