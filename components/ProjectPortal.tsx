"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

export function ProjectPortal({ project, index }: { project: Project; index: number }) {
 const move=(event:React.MouseEvent<HTMLAnchorElement>)=>{const r=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty("--rx",`${((event.clientY-r.top)/r.height-.5)*-9}deg`);event.currentTarget.style.setProperty("--ry",`${((event.clientX-r.left)/r.width-.5)*11}deg`)};
 const leave=(event:React.MouseEvent<HTMLAnchorElement>)=>{event.currentTarget.style.removeProperty("--rx");event.currentTarget.style.removeProperty("--ry")};
 return <Link href={`/work/${project.slug}`} onMouseMove={move} onMouseLeave={leave} className="project-portal" style={{"--accent": project.accent, "--accent2": project.accent2} as React.CSSProperties}>
   <div className="portal-number">0{index + 1}</div><div className="portal-art" aria-hidden="true"><div className="window-bar"><b></b><b></b><b></b></div><div className="window-layout"><span></span><div><i></i><i></i><i></i></div></div><div className="orb"></div></div>
   <div className="portal-copy"><p>{project.type} <span>·</span> {project.year}</p><h3>{project.name}</h3><div className="portal-bottom"><span>{project.role}</span><ArrowUpRight size={23}/></div></div>
 </Link>
}
