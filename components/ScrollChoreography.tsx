"use client";
import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function ScrollChoreography(){useLayoutEffect(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const ctx=gsap.context(()=>{
 gsap.fromTo(".statement h2",{y:90,opacity:0,clipPath:"inset(0 0 100% 0)"},{y:0,opacity:1,clipPath:"inset(0 0 0% 0)",duration:1.35,ease:"power4.out",scrollTrigger:{trigger:".statement",start:"top 72%"}});
 gsap.fromTo(".statement p:not(.eyebrow)",{y:35,opacity:0},{y:0,opacity:1,duration:.85,delay:.32,ease:"power3.out",scrollTrigger:{trigger:".statement",start:"top 72%"}});
 gsap.utils.toArray<HTMLElement>(".transformation article").forEach((item,i)=>{gsap.fromTo(item,{opacity:.08,x:140,rotate:i%2?1:-1},{opacity:1,x:0,rotate:0,ease:"power3.out",scrollTrigger:{trigger:item,start:"top 88%",end:"top 45%",scrub:.75}})});
 gsap.to(".sticky-label",{y:-95,ease:"none",scrollTrigger:{trigger:".transformation",start:"top 80%",end:"bottom 30%",scrub:1}});
 gsap.fromTo(".section-heading",{y:75,opacity:0},{y:0,opacity:1,duration:1,ease:"power4.out",scrollTrigger:{trigger:".selected-work",start:"top 76%"}});
 gsap.fromTo(".portal-grid .project-portal",{opacity:0,y:170,rotate:(i)=>i===1?0:i===0?-9:9},{opacity:1,y:0,rotate:0,duration:1.35,stagger:.18,ease:"power4.out",scrollTrigger:{trigger:".portal-grid",start:"top 80%"}});
 gsap.to(".portal-grid",{xPercent:-6,ease:"none",scrollTrigger:{trigger:".selected-work",start:"top bottom",end:"bottom top",scrub:1}});
 gsap.fromTo(".partner-pitch>div:last-child",{x:100,opacity:0},{x:0,opacity:1,duration:1.2,ease:"power4.out",scrollTrigger:{trigger:".partner-pitch",start:"top 72%"}});
 gsap.to(".partner-pitch .pitch-visual",{rotate:5,scale:1.15,y:-30,ease:"none",scrollTrigger:{trigger:".partner-pitch",start:"top bottom",end:"bottom top",scrub:1}});
 gsap.fromTo(".proof-grid div",{y:55,opacity:0},{y:0,opacity:1,stagger:.14,duration:.9,ease:"power3.out",scrollTrigger:{trigger:".proof",start:"top 75%"}});
 gsap.fromTo(".site-footer>div",{y:70,opacity:0},{y:0,opacity:1,stagger:.16,duration:1,ease:"power3.out",scrollTrigger:{trigger:".site-footer",start:"top 80%"}});
 });return()=>ctx.revert()},[]);return null}
