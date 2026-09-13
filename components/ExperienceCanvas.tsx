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
    if (!large || !small) return;
    const desktopStops = [
      // The first stop lands inside the hero's UI × FE instrument; subsequent stops
      // deliberately cross the whole page rather than hovering in one corner.
      // This is the original instrument's centre: directly behind the UI × FE type.
      { at: 0, x: 72, y: 48 },
      { at: .22, x: 79, y: 62 },
      { at: .48, x: 50, y: 36 },
      { at: .74, x: 18, y: 50 },
      { at: 1, x: 82, y: 31 },
    ];
    const leftTo = gsap.quickTo(element, "left", { duration: .78, ease: "power3.out" });
    const topTo = gsap.quickTo(element, "top", { duration: .78, ease: "power3.out" });
    let positioned = false;
    const update = () => {
      const stops = window.innerWidth <= 800
        ? [
            { at: 0, x: 58, y: 54 },
            { at: .22, x: 61, y: 64 },
            { at: .48, x: 50, y: 39 },
            { at: .74, x: 39, y: 54 },
            { at: 1, x: 60, y: 36 },
          ]
        : desktopStops;
      const progress = reduce ? 0 : window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const next = stops.find((stop) => stop.at >= progress) ?? stops[stops.length - 1];
      const previous = stops[Math.max(0, stops.indexOf(next) - 1)];
      const local = next.at === previous.at ? 0 : (progress - previous.at) / (next.at - previous.at);
      const eased = local * local * (3 - 2 * local);
      const between = (key: "x" | "y") => previous[key] + (next[key] - previous[key]) * eased;
      const x = between("x");
      const y = between("y");
      const left = `${x}vw`;
      const top = `${y}vh`;
      if (!positioned) {
        gsap.set(element, { left, top });
        positioned = true;
        return;
      }
      // Smooth to the sampled scroll position instead of setting it per wheel tick.
      leftTo(window.innerWidth * x / 100);
      topTo(window.innerHeight * y / 100);
    };
    update();
    if (reduce) return;
    gsap.set(large, { xPercent: -50, yPercent: -50, rotationX: 65, rotation: 45 });
    gsap.set(small, { xPercent: -50, yPercent: -50, rotationX: 65, rotation: -45 });
    const largeSpin = gsap.to(large, { rotation: "+=360", duration: 16, ease: "none", repeat: -1 });
    const smallSpin = gsap.to(small, { rotation: "-=360", duration: 11, ease: "none", repeat: -1 });
    let frame = 0;
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); largeSpin.kill(); smallSpin.kill(); leftTo.tween?.kill(); topTo.tween?.kill(); };
  }, []);
  return <div ref={orbits} aria-hidden="true" className="experience-canvas adaptive-orbits"><i className="adaptive-orbit adaptive-orbit-large" /><i className="adaptive-orbit adaptive-orbit-small" /></div>;
}
