"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HeroScene() {
 const root = useRef<HTMLDivElement>(null);
 useLayoutEffect(() => { const ctx = gsap.context(() => { const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches; gsap.fromTo(".scene-piece", { opacity: 0, y: 52, rotate: -5 }, { opacity: 1, y: 0, rotate: 0, duration: 1.2, stagger: .12, ease: "power4.out" }); if(!reduce){gsap.to(".cinematic-scene",{scale:.83,rotate:-4,xPercent:8,yPercent:7,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:1.1}});gsap.to(".main-panel",{xPercent:-28,yPercent:-34,rotate:-8,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:1}});gsap.to(".floating-panel",{xPercent:38,yPercent:30,rotate:10,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:.9}})} }, root); return () => ctx.revert(); }, []);
 return <div ref={root} className="hero-scene cinematic-scene" aria-hidden="true"><div className="atelier-image"></div><div className="scene-shade"></div><div className="scene-piece visual-label">ATELIER / 01</div><div className="scene-piece scene-panel main-panel"><div className="panel-top"><span>Interface / direction</span><span>01—24</span></div><div className="panel-chart"><i></i><i></i><i></i><i></i><i></i></div><div className="panel-rows"><span></span><span></span><span></span></div></div><div className="scene-piece scene-panel floating-panel"><small>Move through the work</small><strong>↗</strong><span>Each project is a distinct space.</span></div><div className="scene-piece scene-tag">OPEN / EXPLORE</div></div>
}
