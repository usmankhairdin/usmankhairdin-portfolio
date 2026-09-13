"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

/** A line-only responsive layout field that travels through the editorial chapters. */
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
    const leftTo = gsap.quickTo(element, "left", { duration: .78, ease: "power3.out" });
    const topTo = gsap.quickTo(element, "top", { duration: .78, ease: "power3.out" });
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
        gsap.set(element, { left: `${x}vw`, top: `${y}vh` });
        positioned = true;
        return;
      }
      leftTo(window.innerWidth * x / 100);
      topTo(window.innerHeight * y / 100);
    };

    update();
    if (reduce) return;
    gsap.set(trace, { strokeDasharray: 390, strokeDashoffset: 390 });
    const traceMotion = gsap.to(trace, { strokeDashoffset: 0, duration: 4.8, ease: "sine.inOut", repeat: -1, yoyo: true });
    const fieldTilt = gsap.to(mark, { rotation: 3.5, duration: 5.2, ease: "sine.inOut", repeat: -1, yoyo: true });
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      traceMotion.kill(); fieldTilt.kill(); leftTo.tween?.kill(); topTo.tween?.kill();
    };
  }, []);

  return <div ref={field} aria-hidden="true" className="experience-canvas adaptive-field">
    <svg className="adaptive-field-mark" viewBox="0 0 640 640" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="adaptive-field-grid">
        <path d="M96 174L482 92L551 434L164 516L96 174Z" />
        <path d="M151 162L220 504M205 151L274 493M260 139L329 481M315 127L384 469M370 116L439 458M425 104L494 446" />
        <path d="M110 243L496 161M124 312L510 230M138 381L524 299M152 450L538 368" />
        <path d="M96 174L551 434M482 92L164 516" className="adaptive-field-diagonal" />
      </g>
      <path className="adaptive-field-trace" d="M96 174L205 151L315 127L425 104L482 92L496 161L510 230L524 299L538 368L551 434" />
      <g className="adaptive-field-nodes"><circle cx="96" cy="174" r="7" /><circle cx="482" cy="92" r="7" /><circle cx="551" cy="434" r="7" /><circle cx="164" cy="516" r="7" /></g>
    </svg>
  </div>;
}
