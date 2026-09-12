import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header"><Link className="brand" href="/"><span>U</span> Usman Khair Din</Link><nav aria-label="Primary navigation"><Link href="/work">Work</Link><Link href="/agency-partner">Agency partner</Link><Link href="/services">Services</Link><Link href="/about">About</Link></nav><Link className="header-cta" href="/contact">Start a project <i>↗</i></Link></header>;
}
