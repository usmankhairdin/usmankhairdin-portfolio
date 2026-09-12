"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

function ProjectVisual({ slug }: { slug: string }) {
  if (slug === "prima") return <div className="project-visual prima-visual"><span>PRIMA</span><div className="prima-table"><i /><i /><i /><b>TABLE FOR 2</b></div><small>MIAMI · NEW YORK · IBIZA</small></div>;
  if (slug === "bizcare") return <div className="project-visual bizcare-visual"><span>ICHRA</span><div className="benefit-card"><b>EMPLOYEE BENEFITS</b><i /><i /><i /></div><small>ENROLLMENT / ADMINISTRATION</small></div>;
  if (slug === "bansar") return <div className="project-visual bansar-visual"><span>SHENZHEN</span><div className="route"><i /><b>GLOBAL FREIGHT</b><i /></div><small>SEA · AIR · RAIL</small></div>;
  if (slug === "rantle") return <div className="project-visual rantle-visual"><span>RANTLE</span><div className="chip"><i /><i /><i /><i /></div><small>COMPONENTS / SOURCING</small></div>;
  if (slug === "bum-life") return <div className="project-visual bum-life-visual"><span>THE MADNESS</span><div className="coin">B</div><small>COMMUNITY / WEB3</small></div>;
  return <div className="project-visual pnw-visual"><span>PNW LEADS</span><div className="lead-flow"><i /><i /><i /><b>QUALIFIED</b></div><small>SERVICE BUSINESS GROWTH</small></div>;
}

export function ProjectPortal({ project, index }: { project: Project; index: number }) {
 const move=(event:React.MouseEvent<HTMLAnchorElement>)=>{const r=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty("--rx",`${((event.clientY-r.top)/r.height-.5)*-9}deg`);event.currentTarget.style.setProperty("--ry",`${((event.clientX-r.left)/r.width-.5)*11}deg`)};
 const leave=(event:React.MouseEvent<HTMLAnchorElement>)=>{event.currentTarget.style.removeProperty("--rx");event.currentTarget.style.removeProperty("--ry")};
 return <Link href={`/work/${project.slug}`} onMouseMove={move} onMouseLeave={leave} className="project-portal" style={{"--accent": project.accent, "--accent2": project.accent2} as React.CSSProperties}>
   <div className="portal-number">0{index + 1}</div><ProjectVisual slug={project.slug} />
   <div className="portal-copy"><p>{project.type} <span>·</span> {project.year}</p><h3>{project.name}</h3><div className="portal-bottom"><span>{project.role}</span><ArrowUpRight size={23}/></div></div>
 </Link>;
}
