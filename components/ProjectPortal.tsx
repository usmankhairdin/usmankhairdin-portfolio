"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

const liveMedia = {
  prima: { src: "https://primaapp.com/prima-og-share.jpg?v=20260911b", label: "PRIMA live hospitality platform" },
  bizcare: { src: "https://www.usmankhairdin.com/portfolio/bizcare/images/hero.png", label: "BizCare ICHRA platform" },
  bansar: { src: "https://www.bansarchina.com/wp-content/uploads/slider2/slider1.jpg", label: "Bansar freight forwarding" },
  rantle: { src: "https://www.icrfq.com/ecpic/20161119/20/58/E-500.JPG", label: "Rantle electronic component listing" },
  "bum-life": { src: "https://www.usmankhairdin.com/portfolio/bum.life/images/LaLuttepourlaBouteille.png", label: "Bum.Life Cart Wars" },
  "pnw-leads": { src: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop", label: "PNWLeads service business lead generation" },
} as const;

export function ProjectVisual({ slug }: { slug: string }) {
  const media = liveMedia[slug as keyof typeof liveMedia] ?? liveMedia.prima;
  return <div className={`project-live-visual project-live-${slug}`}>
    <img className="project-live-image" src={media.src} alt={media.label} />
    <span className="project-live-caption">Live project / {slug === "bum-life" ? "Bum.Life" : slug === "pnw-leads" ? "PNWLeads" : slug}</span>
  </div>;
}

export function ProjectPortal({ project, index }: { project: Project; index: number }) {
 const move=(event:React.MouseEvent<HTMLAnchorElement>)=>{const r=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty("--rx",`${((event.clientY-r.top)/r.height-.5)*-9}deg`);event.currentTarget.style.setProperty("--ry",`${((event.clientX-r.left)/r.width-.5)*11}deg`)};
 const leave=(event:React.MouseEvent<HTMLAnchorElement>)=>{event.currentTarget.style.removeProperty("--rx");event.currentTarget.style.removeProperty("--ry")};
 return <Link href={`/work/${project.slug}`} onMouseMove={move} onMouseLeave={leave} className="project-portal" style={{"--accent": project.accent, "--accent2": project.accent2} as React.CSSProperties}>
   <div className="portal-number">0{index + 1}</div><ProjectVisual slug={project.slug} />
   <div className="portal-copy"><p>{project.type} <span>·</span> {project.year}</p><h3>{project.name}</h3><div className="portal-bottom"><span>{project.role}</span><ArrowUpRight size={23}/></div></div>
 </Link>;
}
