"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export function HeroScene() {
 const root = useRef<HTMLDivElement>(null);
 const [open, setOpen] = useState(false);
 const router = useRouter();
 const enter = (destination: string) => { setOpen(true); window.setTimeout(() => router.push(destination), 760); };
 useLayoutEffect(() => { const ctx = gsap.context(() => { const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches; gsap.fromTo(".portal-door", { opacity: 0, y: 130, rotateX: 24 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.45, stagger: .16, ease: "power4.out" }); if(!reduce){gsap.to(".portal-hall",{scale:.79,rotate:-5,xPercent:8,yPercent:7,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:1.1}});gsap.to(".door-left",{xPercent:-34,yPercent:-17,rotate:-10,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:1}});gsap.to(".door-center",{yPercent:-26,scale:1.08,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:1}});gsap.to(".door-right",{xPercent:34,yPercent:17,rotate:10,ease:"none",scrollTrigger:{trigger:".cinematic-hero",start:"top top",end:"bottom top",scrub:1}})} }, root); return () => ctx.revert(); }, []);
 return <div ref={root} className={`hero-scene portal-hall ${open ? "portal-open" : ""}`}><div className="hall-glow"></div><p className="hall-index">01 / ENTER</p><button aria-label="Explore selected work" className="portal-door door-left" onClick={()=>enter("/work")}><span>WORK</span><i></i></button><button aria-label="Explore agency partner services" className="portal-door door-center" onClick={()=>enter("/agency-partner")}><span>STUDIO</span><i></i></button><button aria-label="Contact Usman" className="portal-door door-right" onClick={()=>enter("/contact")}><span>CONTACT</span><i></i></button><div className="hall-instruction">{open ? "Entering the space" : "Tap a door to enter"}</div></div>
}
