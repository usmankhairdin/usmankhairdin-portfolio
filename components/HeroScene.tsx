"use client";

import { useEffect, useRef } from "react";

const principles = ["Brief", "Direction", "System", "Build"];

/** A typographic instrument, not a miniature gallery or pretend interface. */
export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const hero = element.closest<HTMLElement>(".cinematic-hero");
      if (!hero) return;
      const progress = Math.min(Math.max(-hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1), 0), 1);
      element.style.setProperty("--instrument-progress", progress.toFixed(3));
      element.style.setProperty("--instrument-yaw", `${((progress - .24) * -15).toFixed(2)}deg`);
      element.style.setProperty("--instrument-pitch", `${((progress - .18) * 7).toFixed(2)}deg`);
      element.style.setProperty("--instrument-ui-x", `${(-progress * 30).toFixed(1)}px`);
      element.style.setProperty("--instrument-ui-y", `${(progress * 10).toFixed(1)}px`);
      element.style.setProperty("--instrument-fe-x", `${(progress * 31).toFixed(1)}px`);
      element.style.setProperty("--instrument-fe-y", `${(-progress * 10).toFixed(1)}px`);
      element.style.setProperty("--instrument-signal-r", `${(-38 + progress * 76).toFixed(1)}deg`);
      frame = 0;
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1) - .5;
      const y = (event.clientY - bounds.top) / Math.max(bounds.height, 1) - .5;
      element.style.setProperty("--instrument-pointer-x", `${(x * 3.2).toFixed(2)}deg`);
      element.style.setProperty("--instrument-pointer-y", `${(y * -2.2).toFixed(2)}deg`);
    };
    const leave = () => {
      element.style.setProperty("--instrument-pointer-x", "0deg");
      element.style.setProperty("--instrument-pointer-y", "0deg");
    };
    update();
    const revealFrame = requestAnimationFrame(() => { element.dataset.ready = "true"; });
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(revealFrame);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={root} className="partner-instrument" aria-label="UI direction and frontend production">
    <div className="instrument-topline" aria-hidden="true"><span>Independent practice</span><span>UI × FE</span></div>
    <div className="instrument-plot" aria-hidden="true">
      <div className="instrument-grid" />
      <div className="instrument-orbit instrument-orbit-one" />
      <div className="instrument-orbit instrument-orbit-two" />
      <div className="instrument-axis instrument-axis-horizontal" />
      <div className="instrument-axis instrument-axis-vertical" />
      <div className="instrument-sweep" />
      <div className="instrument-type type-ui">UI</div>
      <div className="instrument-type type-fe">FE</div>
      <div className="instrument-cross">×</div>
      <div className="instrument-signal"><i /><span /></div>
      {principles.map((principle, index) => <span className={`instrument-principle principle-${index + 1}`} key={principle}>{principle}</span>)}
    </div>
    <div className="instrument-caption"><span>Thoughtful direction</span><span>Responsive production</span></div>
  </div>;
}
