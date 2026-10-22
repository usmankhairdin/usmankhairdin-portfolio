import { projectAsset } from './projects.js'

const capture = (name, alt, anchor = '') => ({
  src: projectAsset('nexora', `ev-${name}.webp`),
  srcSet: `${projectAsset('nexora', `ev-${name}-1x.webp`)} 960w, ${projectAsset('nexora', `ev-${name}.webp`)} 1440w`,
  width: 1440, height: 900, alt,
  page: `https://www.usmankhairdin.com/portfolio/nexora/${anchor}`,
})

export const nexoraCaseStudy = {
  overview: {
    title: 'Give focused work a living visual language.',
    lead: 'Nexora turns a productivity concept into a continuous, nine-chapter product story: plan the day, make room for focus and reflect on progress.',
    paragraphs: [
      'A transparent WebGL canvas runs behind the page. Cyan and violet ink forms a resting orbit at the hero, follows the outer gutters during scrolling and responds to pointer movement. Product interfaces stay legible on distinct surfaces above that motion.',
      'The React, Vite and TypeScript frontend combines workspace previews with browser interactions: a session timer, task choices, monthly and yearly pricing, and an animated FAQ. Dark and warm light themes share the same layouts; reduced-motion preferences release the content without the fluid engine or scroll transforms.',
    ],
    facts: [['FORMAT', 'Single-page productivity concept · Nine chapters'], ['STACK', 'React · Vite · TypeScript · WebGL · GSAP · Lenis'], ['SCOPE', 'Visual direction, motion, responsive UI and frontend interactions']],
  },
  chapters: [
    {
      id: 'product-story', layout: 'top', kicker: 'THE PRODUCT STORY',
      title: 'From an expressive arrival to a readable workspace.',
      intro: 'The fluid scene establishes the identity, while structured product previews make the everyday planning proposition concrete. Tasks, priorities and a daily schedule are illustrative interface content.',
      slots: [{ type: 'features', items: [
        { image: capture('workspace', 'Nexora workspace introduction with its dashboard preview, tasks and daily schedule', '#product'), label: 'WORKSPACE', title: 'A place for the day’s priorities.', text: 'A product overview connects planning, focus and insight through one dashboard composition.' },
        { image: capture('features', 'Nexora feature presentation with focus, planning, insight and collaboration previews', '#features'), label: 'FEATURES', title: 'Show what focused work could feel like.', text: 'Purpose-built interface previews explain the product concept through tangible tasks and controls.' },
      ] }],
    },
    {
      id: 'focus-and-progress', layout: 'top', kicker: 'INTERACTION AND FEEDBACK',
      title: 'Let visitors try a moment of focus.',
      intro: 'The story moves through planning, focus and progress. Its timer runs in the current browser tab; the surrounding dashboards and insights use sample data.',
      slots: [{ type: 'features', items: [
        { image: capture('focus', 'Nexora interactive focus timer with session duration, task selection and start and reset controls', '#focus-demo'), label: 'FOCUS DEMO', title: 'A working session, in the browser.', text: 'Choose a 25- or 50-minute session, select a task, then start, pause, resume or reset the timer.' },
        { image: capture('insights', 'Nexora productivity insights with sample focus activity and an illustrative AI insight', '#insights'), label: 'ILLUSTRATIVE INSIGHTS', title: 'Give progress a readable shape.', text: 'Sample charts and fictional workspace figures demonstrate the interface without claiming measured product outcomes or a live AI service.' },
      ] }],
    },
    {
      id: 'concept-pricing', layout: 'top', kicker: 'CONCEPT PRICING',
      title: 'Make the product offer easy to explore.',
      intro: 'Monthly and yearly controls update the illustrative plan amounts. Every plan leads to the interactive focus demonstration, and the page clearly labels the offer as concept pricing.',
      slots: [{ type: 'media', image: capture('pricing', 'Nexora pricing section with monthly and yearly controls and concept plan cards', '#pricing'), caption: 'CONCEPT PLANS / PRICING TOGGLE' }],
    },
    {
      id: 'responsive', layout: 'aside', kicker: 'RESPONSIVE PRODUCT EXPERIENCE',
      title: 'Keep the story coherent on a smaller screen.',
      intro: 'The page reorganizes its product previews and text into a readable mobile flow. The same frontend includes theme switching, concept pricing controls and expandable FAQ answers.',
      points: [['Themes', 'Dark navy and a warm light alternative, with an explicit preference saved locally'], ['Motion', 'Reduced-motion support disables the fluid engine and scroll transforms'], ['Demo scope', 'Concept plan actions lead to the focus demonstration; no purchase or account operation is implied']],
      slots: [{ type: 'phones', items: [{ image: { src: projectAsset('nexora', 'mobile.webp'), width: 390, height: 844, alt: 'Nexora mobile homepage with its productivity introduction and responsive navigation', page: 'https://www.usmankhairdin.com/portfolio/nexora/' }, caption: 'RESPONSIVE HOMEPAGE' }] }],
    },
  ],
}
