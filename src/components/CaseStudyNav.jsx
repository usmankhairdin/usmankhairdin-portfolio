import { nextCaseStudy } from '../data/projects.js'
import { TextCTA } from './ui/Action.jsx'
import './CaseStudyNav.css'

// Closing navigation shared by every case-study route: back to the Work index, or on to the next case study in Work order.
export default function CaseStudyNav({ current }) {
  const next = nextCaseStudy(current)
  return <nav className="case-study-nav" aria-label="More case studies">
    <TextCTA to="/work/">← All selected work</TextCTA>
    {next && <TextCTA to={next.href}>Next project: {next.title} →</TextCTA>}
  </nav>
}
