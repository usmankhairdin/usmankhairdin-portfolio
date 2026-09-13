"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const principles = ["Brief", "Direction", "System", "Build"];

/** The visual is choreographed as one GSAP scene, not a collection of CSS flourishes. */
export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const plot = ".instrument-plot";
      const ui = ".type-ui";
      const fe = ".type-fe";
      const labels = ".instrument-principle";
      const hero = element.closest<HTMLElement>(".cinematic-hero");
      if (!hero) return;

      gsap.set(plot, { transformPerspective: 1500, transformOrigin: "50% 50%" });
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(plot, { autoAlpha: 0, scale: .72, rotationY: -28, duration: 1.35 })
        .from(".instrument-grid", { autoAlpha: 0, scale: 1.18, duration: .9 }, "<.08")
        .from(ui, { autoAlpha: 0, x: -190, skewX: 14, duration: 1.1 }, "<.1")
        .from(fe, { autoAlpha: 0, x: 190, skewX: -14, duration: 1.1 }, "<.04")
        .from(labels, { autoAlpha: 0, y: 16, duration: .45, stagger: .09 }, "<.18");

      gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.05 } })
        .to(plot, { y: -105, rotationY: 28, rotationX: -12, scale: 1.12, ease: "none" }, 0)
        .to(ui, { x: -150, y: 34, rotation: -5, ease: "none" }, 0)
        .to(fe, { x: 150, y: -34, rotation: 5, ease: "none" }, 0)
        .to(labels, { y: (index: number) => index < 2 ? -34 : 34, autoAlpha: .18, ease: "none" }, 0);

      const xTo = gsap.quickTo(plot, "rotationY", { duration: .7, ease: "power3.out" });
      const yTo = gsap.quickTo(plot, "rotationX", { duration: .7, ease: "power3.out" });
      const onMove = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        xTo(((event.clientX - bounds.left) / bounds.width - .5) * 14);
        yTo(-((event.clientY - bounds.top) / bounds.height - .5) * 10);
      };
      const onLeave = () => { xTo(0); yTo(0); };
      element.addEventListener("pointermove", onMove, { passive: true });
      element.addEventListener("pointerleave", onLeave);
      return () => {
        element.removeEventListener("pointermove", onMove);
        element.removeEventListener("pointerleave", onLeave);
      };
    }, element);
    return () => context.revert();
  }, []);

  return <div ref={root} className="partner-instrument" aria-label="UI direction and frontend production">
    <div className="instrument-topline" aria-hidden="true"><span>Independent practice</span><span>UI × FE</span></div>
    <div className="instrument-plot" aria-hidden="true">
      <div className="instrument-grid" />
      <div className="instrument-type type-ui">UI</div>
      <div className="instrument-type type-fe">FE</div>
      {principles.map((principle, index) => <span className={`instrument-principle principle-${index + 1}`} key={principle}>{principle}</span>)}
    </div>
    <div className="instrument-caption"><span>Thoughtful direction</span><span>Responsive production</span></div>
  </div>;
}
