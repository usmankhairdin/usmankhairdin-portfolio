import { formeCaseStudy } from './formeCaseStudy.js'
import { meridianCaseStudy } from './meridianCaseStudy.js'
import { nexoraCaseStudy } from './nexoraCaseStudy.js'
import { cartheviaCaseStudy } from './cartheviaCaseStudy.js'
import { avenloCaseStudy } from './avenloCaseStudy.js'
import { projectAsset } from './projects.js'
import { sanairaCaseStudy } from './sanairaCaseStudy.js'
import { formaCaseStudy, veyravaelCaseStudy } from './featuredTemplateCaseStudies.js'

// The active case studies cover independently developed store projects only.
export const CASE_STUDIES = {
 forme: formeCaseStudy, meridian: meridianCaseStudy, nexora: nexoraCaseStudy,
 carthevia: cartheviaCaseStudy, avenlo: avenloCaseStudy, sanaira: sanairaCaseStudy,
 forma: formaCaseStudy, veyravael: veyravaelCaseStudy,
}
export const caseStudyFor = (project) => CASE_STUDIES[project.slug] || {
  overview: { title: `${project.title} in focus.`, lead: project.summary, paragraphs: [], facts: [] },
  chapters: [],
}
