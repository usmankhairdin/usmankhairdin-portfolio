import { projectAsset } from './projects.js'

const capture = (name, alt, anchor) => ({
  src: projectAsset('meridian', `ev-${name}.webp`),
  srcSet: `${projectAsset('meridian', `ev-${name}-1x.webp`)} 960w, ${projectAsset('meridian', `ev-${name}.webp`)} 1440w`,
  width: 1440, height: 900, alt,
  page: `https://www.usmankhairdin.com/portfolio/meridian/${anchor}`,
})

export const meridianCaseStudy = {
  overview: {
    title: 'A connected world for revenue operations.',
    lead: 'Meridian gives a revenue platform concept a cinematic identity: a photographic Earth, illuminated connections and a product workspace that visitors can explore.',
    paragraphs: [
      'One continuous landing page moves from the global proposition into lead capture, routing, pipeline visibility, workflow and plans. A dark navy palette, mint signals and glass interface layers connect the world outside the product with the decisions inside it.',
      'The React and TypeScript frontend combines a Three.js globe with scroll choreography and practical demonstrations. Market filters and opportunity search update sample pipeline data; workflow and audience tabs reveal their own content, while pricing and FAQ controls complete the product story.',
    ],
    facts: [['FORMAT', 'Single-page revenue operations concept'], ['STACK', 'React · TypeScript · Vite · Three.js · Lenis'], ['SCOPE', 'Product design, cinematic motion and responsive frontend']],
  },
  chapters: [
    {
      id: 'product-context', layout: 'top', kicker: 'FROM SIGNAL TO WORKSPACE',
      title: 'Make a broad platform proposition tangible.',
      intro: 'The capabilities section explains how signals become opportunities, while an interactive workspace gives the concept a concrete operating surface. Its opportunities and revenue figures are sample interface data.',
      slots: [{ type: 'features', items: [
        { image: capture('capabilities', 'Meridian capabilities section explaining lead capture, qualification and pipeline visibility', '#capabilities'), label: 'CAPABILITIES', title: 'Give each signal a direction.', text: 'Focused feature compositions introduce capture, qualification and visibility within the same visual system.' },
        { image: capture('workspace', 'Meridian revenue workspace with market controls, an opportunity search and illustrative pipeline data', '#product'), label: 'PRODUCT WORKSPACE', title: 'Let the interface explain the product.', text: 'Market filters and search update the sample opportunity list and its corresponding pipeline presentation.' },
      ] }],
    },
    {
      id: 'connected-workflows', layout: 'top', kicker: 'WORKFLOW AND REACH',
      title: 'Connect the operating story to a wider world.',
      intro: 'Workflow tabs describe the handoff between teams, followed by a global scene that develops the same connected-world language introduced in the hero.',
      slots: [{ type: 'features', items: [
        { image: capture('workflow', 'Meridian workflow presentation with connected stages and selectable process tabs', '#workflow'), label: 'WORKFLOW', title: 'A clear path through the handoff.', text: 'Selectable stages connect process explanations with a coordinated product demonstration.' },
        { image: capture('global', 'Meridian global reach section with its illuminated Earth and regional connections', '#global'), label: 'GLOBAL REACH', title: 'A globe with a role in the story.', text: 'Photographic Earth textures, geographic connections and controlled motion form a coherent brand scene rather than an unrelated decorative image.' },
      ] }],
    },
    {
      id: 'plans', layout: 'top', kicker: 'THE PRODUCT OFFER',
      title: 'Keep the next step clear.',
      intro: 'A billing toggle changes the illustrative plan amounts. Plan actions open a frontend demonstration, with FAQ answers available below. No real subscription, enquiry delivery or purchase is implied.',
      slots: [{ type: 'media', image: capture('pricing', 'Meridian plans with monthly and yearly billing controls and concept feature comparisons', '#plans'), caption: 'PLANS / INTERACTIVE CONCEPT PRICING' }],
    },
    {
      id: 'responsive', layout: 'aside', kicker: 'RESPONSIVE PRESENTATION',
      title: 'Keep the world readable at every scale.',
      intro: 'The hero, product previews and navigation adapt to a narrower viewport while retaining the same navy, mint and photographic visual language.',
      points: [['Readable product UI', 'Workspace controls and product content reorganize for smaller screens'], ['Motion access', 'Reduced-motion preferences are respected by the experience'], ['Frontend scope', 'Sample data and local interactions demonstrate the concept without claiming a connected CRM or backend']],
      slots: [{ type: 'phones', items: [{ image: { src: projectAsset('meridian', 'mobile.webp'), width: 390, height: 844, alt: 'Meridian responsive mobile homepage with its mint headline, Earth scene and compact navigation', page: 'https://www.usmankhairdin.com/portfolio/meridian/' }, caption: 'RESPONSIVE HOMEPAGE' }] }],
    },
  ],
}
