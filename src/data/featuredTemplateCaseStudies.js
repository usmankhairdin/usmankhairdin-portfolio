import {projectAsset} from './projects.js'

const capture=(slug,name,alt,width,height)=>({
  src:projectAsset(slug,`ev-${name}.webp`),
  srcSet:`${projectAsset(slug,`ev-${name}-1x.webp`)} 960w, ${projectAsset(slug,`ev-${name}.webp`)} ${width}w`,
  width,height,alt,page:`https://www.usmankhairdin.com/portfolio/${slug}/`,
})
const phone=(slug,alt)=>({src:projectAsset(slug,'mobile.webp'),width:390,height:844,alt})
const forma=(name,alt,height=900)=>capture('forma',name,alt,1440,height)
const veyra=(name,alt)=>capture('veyravael',name,alt,1280,720)

export const formaCaseStudy={
  overview:{
    title:'A connected product story, from signal to next step.',
    lead:'Forma presents an intelligence workspace through a complete SaaS website, with a distinct visual identity and product illustrations that explain what it does.',
    paragraphs:[
      'The homepage starts with a shared workspace, then builds its story around connecting tools, understanding business signals and acting on useful opportunities. Reversible scroll sequences assemble the product rather than treating it as a static dashboard image.',
      'Six dedicated platform pages give intelligence, analytics, automations, workspace, AI assistant and security their own compositions. Integrations, pricing, editorial content and focused frontend entry flows extend the same design language.',
    ],
    facts:[['FORMAT','Self-initiated SaaS frontend template'],['SYSTEM','Electric blue, violet and pearl; light and dark themes'],['SCOPE','Brand direction, UI/UX, motion and responsive frontend']],
  },
  chapters:[
    {id:'workspace',layout:'top',kicker:'PRODUCT CLARITY',title:'One workspace, several useful perspectives.',
      intro:'Revenue, audience, activity, automation and recommendations belong to the same visual family. Each panel has a clear job, while shared typography and surfaces hold the system together.',
      slots:[{type:'media',image:forma('workspace','Forma’s assembled workspace with revenue, audience, live activity, growth autopilot and recommendation cards'),caption:'HOMEPAGE / THE ASSEMBLED WORKSPACE'}]},
    {id:'workflow',layout:'top',kicker:'CONNECTED STORY',title:'Connect. Understand. Move forward.',
      intro:'The homepage explains the product in three related moments: source tools feed shared context, signals reveal an opportunity, and a workflow gives that opportunity a next step.',
      slots:[{type:'media',image:forma('workflow','Forma’s Connect, Understand and Move Forward product story in its settled responsive composition',1320),caption:'HOMEPAGE / THREE PRODUCT MOMENTS'},
        {type:'cards',items:[{label:'DESIGN',title:'A coherent graphic language',text:'Product UI, connected fibers and app illustrations share the same violet and blue palette.'},{label:'MOTION',title:'An assembly with a purpose',text:'Desktop scroll choreography makes relationships visible; smaller screens retain a readable stacked composition.'},{label:'ENTRY',title:'Focused frontend flows',text:'Get Started, sign-in and recovery demonstrate the interface without claiming live accounts or authentication.'}]}]},
    {id:'integrations',layout:'top',kicker:'A COMPLETE WEBSITE',title:'Beyond the first impression.',
      intro:'A dotted integration globe introduces the connected ecosystem. Pricing provides a calm comparison, with billing controls and clearly stated plan amounts.',
      slots:[{type:'features',items:[{image:forma('integrations','Forma integration globe and connected tool marks',1157),label:'CONNECTED TOOLS',title:'A shared language for the stack',text:'A round, interactive globe connects the app family to the broader workspace story.'},{image:forma('pricing','Forma Starter, Growth and Enterprise pricing comparison',1157),label:'PLANS',title:'Room to start and grow',text:'The plan comparison carries the same hierarchy, surfaces and restrained motion as the rest of the site.'}]}]},
    {id:'responsive',layout:'aside',kicker:'RESPONSIVE DESIGN',title:'The product still reads on a phone.',
      intro:'The header, paired actions and workspace preview recompose for a narrow screen. Product content stays legible instead of shrinking the entire desktop dashboard.',
      slots:[{type:'phones',items:[{image:phone('forma','Forma homepage and responsive workspace preview on a phone'),caption:'RESPONSIVE HOMEPAGE'}]}]},
  ],
}

export const veyravaelCaseStudy={
  overview:{title:'A place-led real-estate experience.',
    lead:'Veyravael gives distinctive properties an editorial setting: considered photography, measured typography and enough space to understand a place before making an enquiry.',
    paragraphs:['The opening landscape establishes the mood. A selected property collection, architectural detail and destination content then build a more specific picture of the offering.','The responsive frontend keeps the photography prominent while preserving useful property information and a clear route to the enquiry interface.'],
    facts:[['FORMAT','Self-initiated real-estate frontend template'],['PRESENTATION','Photography, editorial hierarchy and property collections'],['SCOPE','Brand direction, UI/UX and responsive frontend']],
  },
  chapters:[
    {id:'collection',layout:'top',kicker:'PROPERTY DISCOVERY',title:'A collection with room to breathe.',
      intro:'Property photography leads the collection. Names and concise details sit alongside it, giving each home an identity within a consistent presentation.',
      slots:[{type:'media',image:veyra('collection','Veyravael selected property collection with three architectural photographs'),caption:'SELECTED PROPERTIES / THE COLLECTION'}]},
    {id:'perspective',layout:'top',kicker:'EDITORIAL DIRECTION',title:'The setting matters as much as the building.',
      intro:'Interior photography and destination content extend the story beyond a grid of listings, with a quieter rhythm that suits the brand.',
      slots:[{type:'features',items:[{image:veyra('perspective','Veyravael architectural interior and editorial perspective'),label:'PERSPECTIVE',title:'An architectural point of view',text:'Image and copy work together to communicate the practice’s approach.'},{image:veyra('destinations','Veyravael destination presentation and landscape photography'),label:'DESTINATIONS',title:'Place as part of discovery',text:'The surrounding landscape gives the collection context beyond a property card.'}]}]},
    {id:'enquiry',layout:'aside',kicker:'RESPONSIVE JOURNEY',title:'From interest to a personal conversation.',
      intro:'The mobile composition preserves the landscape-led opening and makes the next action easy to find. The enquiry interface remains a frontend demonstration.',
      slots:[{type:'phones',items:[{image:phone('veyravael','Veyravael Estates homepage on a phone'),caption:'RESPONSIVE HOMEPAGE'}]}]},
  ],
}
