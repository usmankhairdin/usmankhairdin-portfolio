"use client";

import Image from "next/image";
import Link from "next/link";
import { Pause, Play, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ribbonProjects = [
  { slug: "prima", name: "PRIMA", detail: "Hospitality", height: 710 },
  { slug: "bizcare", name: "BizCare Benefits", detail: "ICHRA platform", height: 710 },
  { slug: "bansar", name: "Bansar China", detail: "Freight & logistics", height: 620 },
  { slug: "rantle", name: "Rantle", detail: "Electronic components", height: 710 },
  { slug: "bum-life", name: "Bum.Life", detail: "Animated comedy", height: 710 },
  { slug: "pnw-leads", name: "PNWLeads", detail: "Lead generation", height: 710 },
];

export function HeroScene() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    if (!element || !surface) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;
    const start = async () => {
      const current = ++generation;
      cleanup?.();
      cleanup = undefined;
      element.dataset.ribbonReady = "false";
      if (preference.matches) return;
      try {
        const { createProjectRibbon } = await import("./project-ribbon");
        if (disposed || current !== generation) return;
        const stop = await createProjectRibbon(surface, element,
          ribbonProjects.map((project) => `/projects/screens/${project.slug}.webp`),
          () => { if (!disposed && current === generation) element.dataset.ribbonReady = "true"; });
        if (disposed || current !== generation) stop();
        else cleanup = stop;
      } catch {
        // The same real project screens remain usable without WebGL.
        element.dataset.ribbonReady = "false";
      }
    };
    void start();
    preference.addEventListener("change", start);
    return () => { disposed = true; generation++; preference.removeEventListener("change", start); cleanup?.(); };
  }, []);
  return (
    <div ref={root} className="ribbon-scene" data-paused={paused}>
      <div className="ribbon-heading" aria-hidden="true"><span>Selected work</span><span>01 — 06</span></div>
      <div className="ribbon-screens" aria-hidden="true">
        {ribbonProjects.map((project) => (
          <div className={`ribbon-screen ribbon-screen-${project.slug}`} key={project.slug}>
            <Image src={`/projects/screens/${project.slug}.webp`} alt="" width={1248} height={project.height} unoptimized loading="eager" />
          </div>
        ))}
      </div>
      <canvas ref={canvas} className="ribbon-canvas" aria-hidden="true" />
      <nav className="ribbon-index" aria-label="Explore the projects in the ribbon">
        {ribbonProjects.map((project, index) => (
          <Link href={`/work/${project.slug}`} className="ribbon-project" key={project.slug}>
            <span className="ribbon-project-number">0{index + 1}</span>
            <span className="ribbon-project-title">{project.name}<ArrowUpRight size={12} aria-hidden="true" /></span>
            <span className="ribbon-project-detail">{project.detail}</span>
          </Link>
        ))}
      </nav>
      <div className="ribbon-footnote">
        <p>Six different worlds.<br /><span>One considered approach.</span></p>
        <button className="ribbon-pause" type="button" aria-label={paused ? "Resume ribbon motion" : "Pause ribbon motion"} aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
