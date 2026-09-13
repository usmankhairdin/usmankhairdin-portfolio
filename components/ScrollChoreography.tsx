"use client";
import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function ScrollChoreography() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // Section roots own the background layer. Keeping them free of transforms,
      // fades and clips preserves the page-level technical layer's paint order.
      gsap.fromTo(".statement h2", { y: 130, opacity: 0, letterSpacing: "-.15em" }, { y: 0, opacity: 1, letterSpacing: "-.07em", duration: 1.5, ease: "power4.out", scrollTrigger: { trigger: ".statement", start: "top 70%" } });
      gsap.fromTo(".statement p:not(.eyebrow)", { y: 35, opacity: 0 }, { y: 0, opacity: 1, duration: .8, delay: .35, scrollTrigger: { trigger: ".statement", start: "top 70%" } });
      gsap.utils.toArray<HTMLElement>(".transformation article").forEach((item, i) => gsap.fromTo(item, { opacity: 0, x: 220, rotate: i % 2 ? 4 : -4, scale: .84 }, { opacity: 1, x: 0, rotate: 0, scale: 1, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 90%", end: "top 42%", scrub: .75 } }));
      gsap.to(".sticky-label", { y: -120, rotate: -3, ease: "none", scrollTrigger: { trigger: ".transformation", start: "top 85%", end: "bottom 35%", scrub: 1 } });
      gsap.fromTo(".section-heading", { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".selected-work", start: "top 70%" } });
      gsap.utils.toArray<HTMLElement>(".portal-grid .project-portal").forEach((card, i) => gsap.fromTo(card, { opacity: 0, y: 250, rotateY: i === 1 ? 0 : i === 0 ? -22 : 22, rotateX: 12 }, { opacity: 1, y: 0, rotateY: 0, rotateX: 0, duration: 1.35, ease: "power4.out", scrollTrigger: { trigger: card, start: "top 90%" } }));
      gsap.to(".portal-grid", { xPercent: -9, ease: "none", scrollTrigger: { trigger: ".selected-work", start: "top bottom", end: "bottom top", scrub: 1 } });
      gsap.fromTo(".partner-pitch>div:last-child", { x: 160, y: 90, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.3, ease: "power4.out", scrollTrigger: { trigger: ".partner-pitch", start: "top 72%" } });
      gsap.to(".partner-pitch .pitch-visual", { rotate: 10, scale: 1.3, y: -55, ease: "none", scrollTrigger: { trigger: ".partner-pitch", start: "top bottom", end: "bottom top", scrub: 1.1 } });
      gsap.fromTo(".proof-grid div", { y: 95, opacity: 0, rotateX: 25 }, { y: 0, opacity: 1, rotateX: 0, stagger: .17, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".proof", start: "top 72%" } });
      gsap.fromTo(".site-footer>div", { y: 90, opacity: 0 }, { y: 0, opacity: 1, stagger: .16, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".site-footer", start: "top 80%" } });
    });
    return () => ctx.revert();
  }, []);
  return null;
}
