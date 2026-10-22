import { projectAsset } from './projects.js'

const capture = (name, alt, path) => ({
  src: projectAsset('avenlo', `ev-${name}.webp`),
  srcSet: `${projectAsset('avenlo', `ev-${name}-1x.webp`)} 960w, ${projectAsset('avenlo', `ev-${name}.webp`)} 1440w`,
  width: 1440, height: 900, alt,
  page: `https://www.usmankhairdin.com/portfolio/avenlo/${path}`,
})

export const avenloCaseStudy = {
  overview: {
    title: 'Health coverage, through a clearer website.',
    lead: 'Avenlo brings individual coverage, broker resources and employer benefits into one healthcare website, with a distinct path for each audience.',
    paragraphs: [
      'The blue and violet homepage introduces the brand. Individual journeys use green, broker pages use violet, and employer content uses deeper neutral tones. Navigation and shared controls connect those modules without flattening their differences.',
      'Product information continues into illustrative plan discovery, comparison and account interfaces. The public static demo contains the complete website frontend; a dashboard and live insurance services are outside this release.',
    ],
    facts: [['FORMAT', 'Self-initiated healthcare website template'], ['AUDIENCES', 'Individuals, brokers and employers'], ['SCOPE', 'Brand direction, UI/UX, motion and responsive frontend']],
  },
  chapters: [
    {
      id: 'audiences', layout: 'top', kicker: 'AUDIENCE JOURNEYS',
      title: 'A different starting point for each audience.',
      intro: 'Family coverage, agency work and employer benefits need different introductions. Their pages share an interaction standard while keeping their own content and colour language.',
      slots: [{ type: 'features', items: [
        { image: capture('individuals', 'Avenlo individual coverage landing page with family photography and a green palette', 'for-individuals/'), label: 'INDIVIDUALS', title: 'Coverage for everyday life.', text: 'A family-focused introduction leads toward health products and coverage exploration.' },
        { image: capture('brokers', 'Avenlo broker landing page with violet branding and a quoting interface preview', 'for-brokers/'), label: 'BROKERS', title: 'A connected agency journey.', text: 'Broker resources and quoting demonstrations sit within the agency module.' },
        { image: capture('employers', 'Avenlo employer benefits page with a defined-budget introduction and team photography', 'for-employers/'), label: 'EMPLOYERS', title: 'Benefits with a defined budget.', text: 'Employer content introduces benefits and the ICHRA journey through a separate module.' },
      ] }],
    },
    {
      id: 'coverage', layout: 'top', kicker: 'FROM EXPLANATION TO EXPLORATION',
      title: 'Make the next step easier to understand.',
      intro: 'Health-product information and plan discovery use the same individual-module controls. The interfaces demonstrate filtering, comparison and coverage choices with illustrative data.',
      slots: [{ type: 'features', items: [
        { image: capture('health-insurance', 'Avenlo health insurance page with a medical bag graphic and product introduction', 'for-individuals/health-insurance/'), label: 'PRODUCT INFORMATION', title: 'Start with the coverage.', text: 'A focused product page explains health insurance and provides a route into plan exploration.' },
        { image: capture('plans', 'Avenlo medical plan browser with filters, carrier information and sample prices', 'plans/medical/'), label: 'PLAN DISCOVERY', title: 'Compare the details that matter.', text: 'The sample plan interface brings filters, carrier details and plan amounts into one readable view.' },
      ] }],
    },
  ],
}
