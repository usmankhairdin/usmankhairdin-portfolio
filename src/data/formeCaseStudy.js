import { projectAsset } from './projects.js'
const capture=(name,alt,anchor)=>({
 src:projectAsset('forme','ev-'+name+'.webp'),
 srcSet:projectAsset('forme','ev-'+name+'-1x.webp')+' 1440w, '+projectAsset('forme','ev-'+name+'.webp')+' 2880w',
 width:2880,height:1800,alt,page:'https://www.usmankhairdin.com/portfolio/forme/'+anchor,
})
export const formeCaseStudy={
 overview:{
  title:'A renovation story, shaped around everyday life.',
  lead:'FORME gives a fictional renovation studio an editorial identity through tactile materials, expressive serif typography and interactive architectural transformations.',
  paragraphs:[
   'A single continuous page connects the studio approach with six services, four concept transformations, a renovation process and a local enquiry summary. Charcoal, limestone tones and a restrained terracotta accent keep the presentation grounded in the spaces it describes.',
   'React and TypeScript power the responsive interface. Comparison dividers support pointer and keyboard input, project actions carry context into the enquiry, and scroll reveals respect reduced-motion preferences. Architectural imagery is AI-generated visualisation, presented as concept work.',
  ],facts:[['FORMAT','Single-page renovation studio concept'],['STACK','React · TypeScript · Vite · GSAP · Lenis'],['SCOPE','Art direction, interaction design and responsive frontend']],
 },
 chapters:[
  {id:'studio',layout:'top',kicker:'THE STUDIO AND ITS SERVICES',title:'Let the spaces establish the character.',
   intro:'An editorial studio introduction leads into a concise service list. Warm visualisations, generous image proportions and a consistent material language connect both sections.',
   slots:[{type:'features',items:[
    {image:capture('studio','FORME studio introduction and four architectural project images','#studio'),label:'STUDIO',title:'A point of view, made visible.',text:'A photographic sequence introduces kitchens, bathrooms, living spaces and lofts through concept architectural visualisations.'},
    {image:capture('services','FORME renovation services with project enquiry links','#services'),label:'SERVICES',title:'A clear route to the right project.',text:'Six service categories explain the offer; each action carries its service context into the enquiry demonstration.'},
   ]}]},
  {id:'transformations',layout:'aside',kicker:'INTERACTIVE PROJECT STORIES',title:'Same space. A different feeling.',
   intro:'Four concept transformations pair before-and-after controls with a project story, improvements and a coordinated material palette. These are visualisations, rather than claims about completed client renovations.',
   points:[['Direct comparison','Pointer and keyboard controls reveal each transformation'],['Materials in context','Limestone, oak and other finishes connect the images to the project narrative'],['A considered next step','Project actions prefill the local enquiry with the selected space']],
   slots:[{type:'media',image:capture('transformations','FORME kitchen before-and-after comparison with story and material palette','#transformations'),caption:'CONCEPT TRANSFORMATION / OAK AND LIMESTONE KITCHEN'}]},
  {id:'process',layout:'top',kicker:'PROCESS AND CRAFT',title:'Carry the same care through the whole story.',
   intro:'A sequential process explains the renovation journey before a craft section brings the focus back to people, material junctions and detail.',
   slots:[{type:'features',items:[
    {image:capture('process','FORME renovation process with connected stages','#process'),label:'PROCESS',title:'A readable sequence.',text:'The process presents the stages as a connected journey with restrained, coordinated motion.'},
    {image:capture('craft','FORME craft section with oak and limestone imagery','#craft-title'),label:'CRAFT',title:'Materials with a purpose.',text:'A focused image and supporting narrative express care for the work and its small details.'},
   ]}]},
  {id:'responsive',layout:'aside',kicker:'RESPONSIVE AND HONEST',title:'A coherent experience at a smaller scale.',
   intro:'The typography, project comparisons, navigation and enquiry controls adapt to phone screens. The enquiry prepares a local summary; it does not send a message or create a booking.',
   slots:[{type:'phones',items:[{image:{src:projectAsset('forme','mobile.webp'),width:780,height:1688,alt:'FORME responsive renovation studio homepage',page:'https://www.usmankhairdin.com/portfolio/forme/'},caption:'RESPONSIVE HOMEPAGE'}]}]},
 ],
}
