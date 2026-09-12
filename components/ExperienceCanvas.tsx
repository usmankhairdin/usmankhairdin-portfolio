"use client";
import { useEffect, useRef } from "react";

export function ExperienceCanvas() {
  const signal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => { const element = signal.current; if (!element) return; element.style.setProperty("--travel", `${window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)}`); };
    update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update);
  }, []);
  return <div ref={signal} aria-hidden="true" className="experience-canvas adaptive-signal"><p>LIVE / 06</p><span /><i /><b /><em /><small /></div>;
}
