import Link from "next/link";

export function SiteFooter() {
 return <footer className="site-footer"><div><p className="eyebrow">Available for agency collaborations</p><h2>Have a brief in mind?</h2><Link className="text-link" href="/contact">Let’s start with a focused paid pilot <span>↗</span></Link></div><div className="footer-meta"><Link href="mailto:usman.khairdin@gmail.com">usman.khairdin@gmail.com</Link><span>Lahore, Pakistan · Working globally</span><span>© {new Date().getFullYear()} Usman Khair Din</span></div></footer>
}
