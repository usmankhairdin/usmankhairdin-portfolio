"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

/** A restrained line-only responsive component outline that travels through the chapters. */
export function ExperienceCanvas() {
  const field = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = field.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mark = element.querySelector<HTMLElement>(".adaptive-field-mark");
    const trace = element.querySelector<SVGPathElement>(".adaptive-field-trace");
    if (!mark || !trace) return;

    const desktopStops = [
      // The first position is the original UI × FE instrument centre.
      { at: 0, x: 72, y: 48 }, { at: .22, x: 78, y: 61 },
      { at: .48, x: 50, y: 37 }, { at: .74, x: 18, y: 51 },
      { at: 1, x: 82, y: 32 },
    ];
    const xTo = gsap.quickTo(element, "x", { duration: .92, ease: "power3.out" });
    const yTo = gsap.quickTo(element, "y", { duration: .92, ease: "power3.out" });
    let positioned = false;

    const update = () => {
      const stops = window.innerWidth <= 800
        ? [{ at: 0, x: 57, y: 76 }, { at: .22, x: 62, y: 78 }, { at: .48, x: 50, y: 52 }, { at: .74, x: 39, y: 67 }, { at: 1, x: 61, y: 55 }]
        : desktopStops;
      const progress = reduce ? 0 : window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const next = stops.find((stop) => stop.at >= progress) ?? stops[stops.length - 1];
      const previous = stops[Math.max(0, stops.indexOf(next) - 1)];
      const local = next.at === previous.at ? 0 : (progress - previous.at) / (next.at - previous.at);
      const eased = local * local * (3 - 2 * local);
      const x = previous.x + (next.x - previous.x) * eased;
      const y = previous.y + (next.y - previous.y) * eased;
      if (!positioned) {
        gsap.set(element, { xPercent: -50, yPercent: -50, x: window.innerWidth * x / 100, y: window.innerHeight * y / 100 });
        positioned = true;
        return;
      }
      // Transform-only movement keeps the field visible between scroll samples.
      xTo(window.innerWidth * x / 100);
      yTo(window.innerHeight * y / 100);
    };

    update();
    if (reduce) return;
    gsap.set(trace, { strokeDasharray: 380, strokeDashoffset: 380 });
    const traceMotion = gsap.to(trace, { strokeDashoffset: 0, duration: 5.6, ease: "sine.inOut", repeat: -1, yoyo: true });
    const fieldTilt = gsap.to(mark, { rotation: 1.8, duration: 6.5, ease: "sine.inOut", repeat: -1, yoyo: true });
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      traceMotion.kill(); fieldTilt.kill(); xTo.tween?.kill(); yTo.tween?.kill();
    };
  }, []);

  return <div ref={field} aria-hidden="true" className="experience-canvas adaptive-field">
    <svg className="adaptive-field-mark" viewBox="0 0 640 640" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="adaptive-field-grid">
        <rect x="116" y="184" width="408" height="272" rx="28" />
        <path d="M116 260H524M252 260V456M252 338H524" />
        <rect x="282" y="290" width="188" height="18" rx="9" className="adaptive-field-detail" />
        <path d="M282 370H440M282 408H382" className="adaptive-field-detail" />
      </g>
      <path className="adaptive-field-trace" d="M116 260H252V338H524" />
      <g className="adaptive-field-nodes"><circle cx="116" cy="260" r="6" /><circle cx="252" cy="260" r="6" /><circle cx="252" cy="338" r="6" /><circle cx="524" cy="338" r="6" /></g>
    </svg>
  </div>;
}
