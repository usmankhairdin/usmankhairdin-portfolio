import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

export function ProjectPortal({ project, index }: { project: Project; index: number }) {
 return <Link href={`/work/${project.slug}`} className="project-portal" style={{"--accent": project.accent, "--accent2": project.accent2} as React.CSSProperties}>
   <div className="portal-number">0{index + 1}</div><div className="portal-art" aria-hidden="true"><div className="window-bar"><b></b><b></b><b></b></div><div className="window-layout"><span></span><div><i></i><i></i><i></i></div></div><div className="orb"></div></div>
   <div className="portal-copy"><p>{project.type} <span>·</span> {project.year}</p><h3>{project.name}</h3><div className="portal-bottom"><span>{project.role}</span><ArrowUpRight size={23}/></div></div>
 </Link>
}
