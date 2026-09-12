"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export function HeroScene() {
 const root = useRef<HTMLDivElement>(null);
 useLayoutEffect(() => { const ctx = gsap.context(() => { gsap.fromTo(".scene-piece", { opacity: 0, y: 42, rotate: -4 }, { opacity: 1, y: 0, rotate: 0, duration: 1.15, stagger: .1, ease: "power3.out" }); }, root); return () => ctx.revert(); }, []);
 return <div ref={root} className="hero-scene cinematic-scene" aria-hidden="true"><div className="atelier-image"></div><div className="scene-shade"></div><div className="scene-piece visual-label">ATELIER / 01</div><div className="scene-piece scene-panel main-panel"><div className="panel-top"><span>Interface / direction</span><span>01—24</span></div><div className="panel-chart"><i></i><i></i><i></i><i></i><i></i></div><div className="panel-rows"><span></span><span></span><span></span></div></div><div className="scene-piece scene-panel floating-panel"><small>Move through the work</small><strong>↗</strong><span>Each project is a distinct space.</span></div><div className="scene-piece scene-tag">OPEN / EXPLORE</div></div>
}
