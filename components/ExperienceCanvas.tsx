"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export function ExperienceCanvas() {
  const orbits = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = orbits.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const large = element.querySelector<HTMLElement>(".adaptive-orbit-large");
    const small = element.querySelector<HTMLElement>(".adaptive-orbit-small");
    const stops = [
      // The first stop lands inside the hero's UI × FE instrument; subsequent stops
      // deliberately cross the whole page rather than hovering in one corner.
      { at: 0, x: 72, y: 61, r: 0 },
      { at: .22, x: 79, y: 64, r: 11 },
      { at: .48, x: 50, y: 34, r: -4 },
      { at: .74, x: 18, y: 48, r: 8 },
      { at: 1, x: 82, y: 29, r: -8 },
    ];
    const update = () => {
      const progress = reduce ? 0 : window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const next = stops.find((stop) => stop.at >= progress) ?? stops[stops.length - 1];
      const previous = stops[Math.max(0, stops.indexOf(next) - 1)];
      const local = next.at === previous.at ? 0 : (progress - previous.at) / (next.at - previous.at);
      const eased = local * local * (3 - 2 * local);
      const between = (key: "x" | "y" | "r") => previous[key] + (next[key] - previous[key]) * eased;
      gsap.set(element, { left: `${between("x")}vw`, top: `${between("y")}vh`, rotation: between("r") });
    };
    update();
    if (reduce) return;
    const largeSpin = gsap.to(large, { rotation: 360, duration: 17, ease: "none", repeat: -1 });
    const smallSpin = gsap.to(small, { rotation: -360, duration: 11, ease: "none", repeat: -1 });
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); largeSpin.kill(); smallSpin.kill(); };
  }, []);
  return <div ref={orbits} aria-hidden="true" className="experience-canvas adaptive-orbits"><i className="adaptive-orbit adaptive-orbit-large" /><i className="adaptive-orbit adaptive-orbit-small" /><span className="adaptive-orbit-axis" /><b className="adaptive-orbit-cross">×</b></div>;
}
