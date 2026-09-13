"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SiteHeader({ className = "" }: { className?: string }) {
  const header = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const element = header.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from(element, { y: -30, autoAlpha: 0, duration: .85, delay: .08, ease: "power3.out" });
      const syncBottomState = () => {
        const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 6;
        element.classList.toggle("is-at-bottom", atBottom);
      };
      const trigger = ScrollTrigger.create({
        start: "top -64",
        onToggle: (trigger) => element.classList.toggle("is-scrolled", trigger.isActive),
        onUpdate: syncBottomState,
      });
      syncBottomState();
      window.addEventListener("resize", syncBottomState);
      return () => { trigger.kill(); window.removeEventListener("resize", syncBottomState); };
    }, element);
    return () => context.revert();
  }, []);

  return <header ref={header} className={`site-header ${className}`}><Link className="brand" href="/"><span>U</span> Usman Khair Din</Link><nav aria-label="Primary navigation"><Link href="/work">Work</Link><Link href="/agency-partner">Agency partner</Link><Link href="/services">Services</Link><Link href="/about">About</Link></nav><Link className="header-cta" href="/contact">Start a project <i>↗</i></Link></header>;
}
