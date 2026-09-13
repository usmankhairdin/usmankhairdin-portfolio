"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

/** A line-only delivery blueprint: brief → system → responsive frontend build. */
export function ExperienceCanvas() {
  const field = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = field.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mark = element.querySelector<HTMLElement>(".adaptive-field-mark");
    const trace = element.querySelector<SVGPathElement>(".adaptive-blueprint-trace");
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
      } else {
        // Transform-only movement keeps the field visible between scroll samples.
        xTo(window.innerWidth * x / 100);
        yTo(window.innerHeight * y / 100);
      }

      const centerX = window.innerWidth * x / 100;
      const centerY = window.innerHeight * y / 100;
      const section = document.elementFromPoint(centerX, centerY)?.closest<HTMLElement>(".cinematic-hero, .statement, .site-footer");
      element.dataset.surface = section ? "dark" : "light";
    };

    update();
    if (reduce) return;
    gsap.set(trace, { strokeDasharray: 610, strokeDashoffset: 610 });
    const traceMotion = gsap.to(trace, { strokeDashoffset: 0, duration: 6.2, ease: "sine.inOut", repeat: -1, yoyo: true });
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
      <g className="adaptive-blueprint-lines">
        <path d="M86 204H204L282 320H354" />
        <path d="M86 436H204L282 320" />
        <path d="M354 320H426" />
        <rect x="426" y="202" width="142" height="236" rx="20" />
        <path d="M426 258H568M468 258V438M426 332H568" />
        <path d="M494 284H540M494 360H540M494 388H524" className="adaptive-blueprint-detail" />
      </g>
      <path className="adaptive-blueprint-trace" d="M86 204H204L282 320H426M86 436H204L282 320" />
      <g className="adaptive-blueprint-nodes"><circle cx="86" cy="204" r="7" /><circle cx="86" cy="436" r="7" /><circle cx="282" cy="320" r="8" /><circle cx="426" cy="320" r="7" /></g>
      <g className="adaptive-blueprint-labels"><text x="86" y="180">UI DIRECTION</text><text x="86" y="468">FRONTEND BUILD</text><text x="302" y="300">SYSTEM</text><text x="438" y="184">RESPONSIVE</text></g>
    </svg>
  </div>;
}
