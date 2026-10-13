import { projectAsset } from './projects.js'

const origin = 'https://sanaira.usmankhairdin.com'
const capture = (name, alt, path = '/') => ({
  src: projectAsset('sanaira', `ev-${name}.webp`),
  srcSet: `${projectAsset('sanaira', `ev-${name}-1x.webp`)} 960w, ${projectAsset('sanaira', `ev-${name}.webp`)} 1440w`,
  width: 1440, height: 900, alt, page: origin + path,
})
const phone = (name, alt, path = '/') => ({
  ...capture(name, alt, path),
  srcSet: `${projectAsset('sanaira', `ev-${name}-1x.webp`)} 260w, ${projectAsset('sanaira', `ev-${name}.webp`)} 390w`,
  width: 390, height: 844,
})

// Content verified against Sanaira's public website and companion app on 13 October 2026.
// These are original interface captures and frontend demo workflows, not live insurance services.
export const sanairaCaseStudy = {
  overview: {
    title: 'A complete coverage experience, from website to workspace.',
    lead: 'Sanaira Health brings a healthcare marketing website and a companion application together in one designed frontend package.',
    paragraphs: [
      'The public website introduces coverage through the needs of individuals, brokers and teams. A moving 3D Care Weave connects its homepage chapters, while dedicated pages explain plan choices, comparison, guidance and employer benefits.',
      'The companion Coverage Workspace carries that story into product UI: brokers manage a client book, compare plans, follow enrollment steps and keep documents, messages and renewals connected. Member and employer views present the same records from their own perspective.',
      'Both experiences share a mineral palette, typography, brand object and light/dark treatment. The package uses fictional data and interactive frontend demonstrations rather than a live insurance backend.',
    ],
    facts: [
      ['PACKAGE', 'Healthcare website + companion application'],
      ['AUDIENCES', 'Individuals and families, brokers, employers'],
      ['APPLICATION', 'Broker, member and employer workspaces'],
      ['FORMAT', 'Responsive React frontend template · Public demo'],
    ],
  },
  contributionTitle: 'One product language, across the whole package.',
  chapters: [
    {
      id: 'brand', layout: 'aside', kicker: 'BRAND IN MOTION',
      title: 'The Care Weave, alive in the interface.',
      intro: 'Three linked ribbon passes form Sanaira’s Care Weave. Slow rotation, moving highlights and a soft shadow give the coverage story a physical centre, carrying the brand from the website into the application.',
      points: [
        ['Connected care', 'One continuous ribbon links the ideas of personal care, coverage choices and human guidance.'],
        ['Shared language', 'Sage, teal and sand carry from the website into the application.'],
        ['Considered motion', 'Slow rotation brings the form to life, with a still pose when reduced motion is preferred.'],
      ],
      slots: [{ type: 'sanaira-brand' }],
    },
    {
      id: 'website', layout: 'top', kicker: 'THE WEBSITE',
      title: 'A personal story before a list of plans.',
      intro: 'The homepage moves through needs, guidance, comparison, personal control and the next step. The Care Weave carries small product scenes through that sequence, with a coverage finder as the clear way forward.',
      slots: [{ type: 'media', image: capture('home-light', 'Sanaira light-theme homepage with the Care Weave, coverage preview and Find coverage action'), caption: 'WEBSITE / LIGHT THEME', support: [
        { image: capture('home-dark', 'Sanaira dark-theme homepage with the same Care Weave and coverage-first hierarchy'), caption: 'WEBSITE / DARK THEME' },
        { note: { label: 'THE COMPLETE JOURNEY', text: 'The opening browser above uses the full homepage capture and the portfolio’s existing hover-to-scroll presentation.' } },
      ] }],
    },
    {
      id: 'audiences', layout: 'top', kicker: 'THREE AUDIENCES',
      title: 'Different needs. One connected brand.',
      intro: 'Dedicated routes give each audience its own starting point. The website connects individual coverage choices, broker workflows and employer contribution models to the same application story.',
      slots: [{ type: 'features', items: [
        { image: capture('individuals', 'Sanaira individuals and families page introducing needs-led coverage choices', '/for-individuals/'), label: 'INDIVIDUALS & FAMILIES', title: 'Start with the care people use.', text: 'Doctors, prescriptions, household and budget frame the choice before plans are compared.' },
        { image: capture('broker-site', 'Sanaira Broker Platform page showing the connected workspace', '/for-brokers/platform/'), label: 'BROKERS', title: 'Keep the conversation connected.', text: 'Client context, comparisons, recommendations and follow-up are presented as one continuous record.' },
        { image: capture('teams', 'Sanaira ICHRA Benefits page explaining a fixed employer contribution and individual plan choice', '/for-teams/ichra-benefits/'), label: 'TEAMS', title: 'A contribution, with personal choice.', text: 'The website explains employer allowances and connects them to the team workspace preview.' },
      ] }],
    },
    {
      id: 'discovery', layout: 'aside', kicker: 'COVERAGE DISCOVERY',
      title: 'Seven steps to a clearer shortlist.',
      intro: 'A focused finder asks about the household, snapshot, location, care, budget and preferences before its preview. The plans screen then offers metal-level filters, sorting and comparison controls.',
      points: [
        ['Focused intake', 'One question group at a time, with progress kept in view.'],
        ['Plan discovery', 'Sample plans include monthly price, deductible and yearly-cost context.'],
        ['Clear comparison', 'The comparison page explains doctors, prescriptions and cost trade-offs.'],
      ],
      slots: [{ type: 'media', image: capture('finder', 'Sanaira coverage finder, step one of seven, asking who coverage is for', '/find-coverage/'), caption: 'FINDER / HOUSEHOLD', support: [
        { image: capture('plans', 'Sanaira illustrative plans with metal-level filters, monthly prices and comparison controls', '/plans/'), caption: 'SAMPLE PLAN SHORTLIST' },
        { image: capture('compare', 'Sanaira comparison page explaining total yearly cost beside an application comparison preview', '/for-individuals/compare-plans/'), caption: 'WEBSITE / PLAN COMPARISON' },
      ] }],
    },
    {
      id: 'broker', layout: 'top', kicker: 'THE APPLICATION',
      title: 'A working day, organised around the next action.',
      intro: 'The broker overview brings workload, urgent client items, activity and upcoming renewals together. The client book supports search and filters; a profile keeps household, care needs, documents and related records close.',
      slots: [{ type: 'media', image: capture('broker-app', 'Sanaira broker overview with workload summary, urgent client items and recent activity', '/app/broker/'), caption: 'APPLICATION / BROKER OVERVIEW', support: [
        { image: capture('clients', 'Sanaira searchable client book with coverage, status, renewal and next-step information', '/app/broker/clients/'), caption: 'CLIENT BOOK' },
        { image: capture('client-profile', 'Sanaira client profile for the fictional Ellis household with care details and related quote and enrollment', '/app/broker/clients/ellis/'), caption: 'CONNECTED CLIENT PROFILE' },
      ] }],
    },
    {
      id: 'quotes', layout: 'aside', kicker: 'PLAN DECISIONS',
      title: 'Needs beside plans. A reason behind the recommendation.',
      intro: 'A quote keeps saved care requirements beside a side-by-side plan comparison. Network checks, prescriptions and costs are visible together, with optional cover and a monthly estimate alongside the recommendation.',
      points: [
        ['Compare', 'Plan costs and care fit in one readable table.'],
        ['Consider', 'Supplemental choices update the local demo estimate.'],
        ['Continue', 'The selected quote links onward to its enrollment record.'],
      ],
      slots: [{ type: 'media', image: capture('quote-detail', 'Sanaira Ellis quote with side-by-side plan comparison, care requirements and supplemental-cover estimate', '/app/broker/quotes/q-ellis/'), caption: 'QUOTE / COMPARISON & ESTIMATE', support: [
        { image: capture('quotes', 'Sanaira quotes list showing comparison status, estimated monthly cost and next action', '/app/broker/quotes/'), caption: 'QUOTE PIPELINE' },
      ] }],
    },
    {
      id: 'enrollment', layout: 'top', kicker: 'ENROLLMENT WORKFLOW',
      title: 'Progress, blockers and the next step in one view.',
      intro: 'The enrollment detail presents five stages: information review, identity, documents, approval and carrier response. Checklists, outstanding tasks and related records keep the interface focused on what remains to be done.',
      slots: [{ type: 'media', image: capture('enrollment-detail', 'Sanaira enrollment detail with a five-step workflow, checklists, client approval status and related records', '/app/broker/enrollments/e-ellis/'), caption: 'ENROLLMENT / STEP-BY-STEP RECORD', support: [
        { image: capture('enrollments', 'Sanaira enrollment pipeline showing waiting, blocked, submitted and completed demo records', '/app/broker/enrollments/'), caption: 'ENROLLMENT PIPELINE' },
      ] }],
    },
    {
      id: 'follow-through', layout: 'top', kicker: 'THE RELATIONSHIP CONTINUES',
      title: 'Renewals, documents and conversations stay connected.',
      intro: 'Supporting application screens share the same frame and record language. Each brings its own task into focus while keeping a route back to the household, quote or enrollment it belongs to.',
      slots: [{ type: 'features', items: [
        { image: capture('renewals', 'Sanaira renewal pipeline with upcoming dates, plan changes and follow-up actions', '/app/broker/renewals/'), label: 'RENEWALS', title: 'See what is coming.', text: 'Renewal timing, changes to review and the next follow-up sit beside each household.' },
        { image: capture('documents', 'Sanaira document workspace with requested, received, review and verified states', '/app/broker/documents/'), label: 'DOCUMENTS', title: 'Make missing details visible.', text: 'Status filters and related records organise the fictional document workflow.' },
        { image: capture('messages', 'Sanaira conversation with the Ellis household linked to its enrollment and client profile', '/app/broker/messages/t-ellis/'), label: 'MESSAGES', title: 'Keep context with the conversation.', text: 'A thread links to the relevant profile and enrollment, with a local-only demo reply.' },
      ] }],
    },
    {
      id: 'workspaces', layout: 'top', kicker: 'MEMBER & EMPLOYER VIEWS',
      title: 'The same care story, from each side.',
      intro: 'Members see their chosen plan, application progress, needs and broker messages. Employers see team participation, allowance classes, plan choices and the people who still need a next step.',
      slots: [{ type: 'media', image: capture('member', 'Sanaira member workspace with chosen coverage, application progress and broker messages', '/app/member/'), caption: 'APPLICATION / MEMBER', support: [
        { image: capture('employer', 'Sanaira employer workspace with employee participation, monthly allowances and team follow-up', '/app/employer/'), caption: 'APPLICATION / EMPLOYER' },
        { image: capture('broker-dark', 'Sanaira broker application overview in the dark theme', '/app/broker/'), caption: 'APPLICATION / DARK THEME' },
      ] }],
    },
    {
      id: 'responsive', layout: 'top', kicker: 'RESPONSIVE PRESENTATION',
      title: 'Website and application, carried onto the phone.',
      intro: 'The coverage story, finder and workspaces retain their shared brand at smaller widths. These captures show the actual public frontend at a 390-pixel phone width.',
      slots: [{ type: 'phones', items: [
        { image: phone('m-home', 'Sanaira Health homepage on a phone'), caption: 'WEBSITE' },
        { image: phone('m-finder', 'Sanaira coverage finder on a phone', '/find-coverage/'), caption: 'FINDER' },
        { image: phone('m-broker', 'Sanaira broker overview on a phone', '/app/broker/'), caption: 'BROKER' },
        { image: phone('m-member', 'Sanaira member workspace on a phone', '/app/member/'), caption: 'MEMBER' },
      ] }],
    },
  ],
}
