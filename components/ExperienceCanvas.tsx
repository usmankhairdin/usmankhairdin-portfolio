"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function SpatialObjects() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const scroll = useRef(0);
  useEffect(() => { const update = () => { const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1); scroll.current = window.scrollY / max; }; update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  useFrame((state, delta) => { if (!group.current || !ring.current || !core.current) return; const s = scroll.current; group.current.rotation.y += delta * .1; group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, s * 5.2, .035); group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, Math.sin(s * 10) * 1.8, .03); group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, Math.cos(s * 8) * .65, .03); ring.current.rotation.z -= delta * (.3 + s * .9); core.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.6 + s * 9) * .09); });
  return <group ref={group} position={[2.8, .4, 0]}><Float speed={1.4} rotationIntensity={.24} floatIntensity={.55}><mesh ref={ring} rotation={[1.25, 0, .55]}><torusGeometry args={[1.75, .015, 8, 96]} /><meshBasicMaterial color="#d8ff36" transparent opacity={.55} /></mesh><mesh rotation={[.7, .5, -.4]}><torusGeometry args={[1.18, .032, 8, 72]} /><meshBasicMaterial color="#5481ff" transparent opacity={.62} /></mesh><mesh ref={core}><icosahedronGeometry args={[.38, 3]} /><meshBasicMaterial color="#ff865d" wireframe transparent opacity={.8} /></mesh><pointLight color="#7d94ff" intensity={5} distance={8} /></Float></group>;
}
export function ExperienceCanvas() { return <div aria-hidden="true" className="experience-canvas"><Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 7], fov: 46 }} gl={{ alpha: true, antialias: true }}><SpatialObjects /></Canvas></div>; }
