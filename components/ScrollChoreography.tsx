"use client";
import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function ScrollChoreography(){useLayoutEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>(".transformation article").forEach((item)=>gsap.fromTo(item,{opacity:.14,x:90},{opacity:1,x:0,ease:"power3.out",scrollTrigger:{trigger:item,start:"top 82%",end:"top 48%",scrub:.7}}));gsap.fromTo(".portal-grid .project-portal",{opacity:0,y:120},{opacity:1,y:0,duration:1.1,stagger:.16,ease:"power4.out",scrollTrigger:{trigger:".portal-grid",start:"top 78%"}});gsap.to(".partner-pitch .pitch-visual",{rotate:2.5,scale:1.08,ease:"none",scrollTrigger:{trigger:".partner-pitch",start:"top bottom",end:"bottom top",scrub:1}})});return()=>ctx.revert()},[]);return null}
