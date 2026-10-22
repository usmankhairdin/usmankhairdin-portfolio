import { projectAsset } from './projects.js'
const capture = (name, alt, path) => ({
 src:projectAsset('carthevia',`ev-${name}.webp`),
 srcSet:`${projectAsset('carthevia',`ev-${name}-1x.webp`)} 960w, ${projectAsset('carthevia',`ev-${name}.webp`)} 1440w`,
 width:1440,height:900,alt,page:`https://www.usmankhairdin.com/portfolio/carthevia/${path}`,
})
export const cartheviaCaseStudy = {
 overview:{
  title:'A connected world for commerce.',
  lead:'Carthevia presents the moving parts of a commerce platform through a warm, tactile identity and a complete multipage website.',
  paragraphs:[
   'The homepage introduces the product with an original interactive scene. Focused platform pages then explain storefronts, checkout, operations, analytics and global commerce through their own visual compositions.',
   'Shared navigation, readable product interfaces and reversible motion keep the journey connected. The static demo is a complete frontend presentation, with illustrative product data and no live commerce backend.',
  ],
  facts:[['FORMAT','Self-initiated commerce website template'],['PLATFORM','Storefronts, checkout and operations'],['SCOPE','Brand direction, UI/UX, original scenes and frontend']],
 },
 chapters:[
  {id:'buying-experience',layout:'top',kicker:'THE BUYING EXPERIENCE',title:'From the storefront to the checkout.',
   intro:'Two product journeys introduce the customer-facing side of commerce, using distinct scenes within the same warm visual system.',
   slots:[{type:'features',items:[
    {image:capture('storefronts','Carthevia storefronts platform introduction','platform/storefronts/'),label:'STOREFRONTS',title:'A considered place for products.',text:'The storefront page introduces the shopping experience through product-led imagery and interface details.'},
    {image:capture('checkout','Carthevia checkout platform introduction','platform/checkout/'),label:'CHECKOUT',title:'A focused path through purchase.',text:'A dedicated checkout story continues the commerce journey with its own interface composition.'},
   ]}]},
  {id:'running-commerce',layout:'top',kicker:'BEHIND THE STOREFRONT',title:'Make the wider product visible.',
   intro:'Operations, analytics and global commerce expand the platform story without repeating the same visual in every section.',
   slots:[{type:'features',items:[
    {image:capture('operations','Carthevia operations platform page','platform/operations/'),label:'OPERATIONS',title:'The everyday work of commerce.',text:'A focused operational view presents the product beyond the buying experience.'},
    {image:capture('analytics','Carthevia analytics platform page','platform/analytics/'),label:'ANALYTICS',title:'A clearer view of activity.',text:'Illustrative product information gives the analytics story a readable interface.'},
    {image:capture('global-commerce','Carthevia global commerce platform page','platform/global-commerce/'),label:'GLOBAL COMMERCE',title:'A wider reach for the platform.',text:'The global commerce page extends the brand through another purpose-built product scene.'},
   ]}]},
 ],
}
