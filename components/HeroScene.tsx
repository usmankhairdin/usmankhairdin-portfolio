"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.fromTo(".hero-surface", { opacity: 0, scale: .62, rotate: -15 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.6, stagger: .14, ease: "power4.out" });
      gsap.fromTo(".hero-line", { scaleX: 0 }, { scaleX: 1, duration: 1.15, stagger: .1, ease: "power3.out", delay: .3 });
      if (!reduce) {
        gsap.to(".interface-world", { yPercent: -23, scale: 1.2, rotate: -7, ease: "none", scrollTrigger: { trigger: ".cinematic-hero", start: "top top", end: "bottom top", scrub: 1.1 } });
        gsap.to(".hero-surface-a", { xPercent: -22, yPercent: -30, rotate: -12, ease: "none", scrollTrigger: { trigger: ".cinematic-hero", start: "top top", end: "bottom top", scrub: 1 } });
        gsap.to(".hero-surface-b", { xPercent: 30, yPercent: 27, rotate: 12, ease: "none", scrollTrigger: { trigger: ".cinematic-hero", start: "top top", end: "bottom top", scrub: 1 } });
      }
    }, element);
    const move = (event: PointerEvent) => { const rect = element.getBoundingClientRect(); element.style.setProperty("--mx", `${(event.clientX - rect.left) / rect.width - .5}`); element.style.setProperty("--my", `${(event.clientY - rect.top) / rect.height - .5}`); };
    element.addEventListener("pointermove", move);
    return () => { element.removeEventListener("pointermove", move); ctx.revert(); };
  }, []);
  return <div ref={root} aria-hidden="true" className="hero-scene interface-world">
    <div className="hero-noise" /><div className="hero-aurora" />
    <span className="hero-line hero-line-a" /><span className="hero-line hero-line-b" /><span className="hero-line hero-line-c" />
    <div className="hero-surface hero-surface-a"><div className="surface-bar"><i /><i /><i /><b>PROJECT / 01</b></div><div className="surface-layout"><span /><main><i /><i /><i /></main></div></div>
    <div className="hero-surface hero-surface-b"><p>UI SYSTEM</p><strong>16<span>+</span></strong><small>years of<br />digital craft</small></div>
    <div className="hero-surface hero-surface-c"><p>DESIGN → BUILD</p><div className="surface-steps"><i /><i /><i /></div><b>LIVE / 2026</b></div>
    <div className="world-caption"><span>01</span><span>INTERFACE<br />IN MOTION</span></div>
  </div>;
}
