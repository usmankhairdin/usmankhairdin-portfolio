import {watchWebsiteLoad} from './liveScreenReadiness.js'

// The final iframe nodes start loading with the experience, before WebGL's
// Suspense/compilation gate. They are never reparented when a screen appears.
export function prepareLiveWebsites(projects,parent,readiness,{document=globalThis.document,platform=globalThis}={}){
  const entries=new Map()
  for(const project of projects.filter(p=>p.embedUrl)){
    const element=document.createElement('div'),frame=document.createElement('iframe')
    element.className='live-project-screen';element.style.width='1440px';element.style.height='900px'
    element.style.visibility='hidden';element.style.pointerEvents='none';element.dataset.loadState='pending'
    frame.title=`${project.title} live website`;frame.width=1440;frame.height=900
    frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups')
    frame.referrerPolicy='strict-origin-when-cross-origin';frame.loading='eager';frame.tabIndex=-1
    const website={element,frame,loaded:false}
    const stop=watchWebsiteLoad(frame,project.embedUrl,{
      platform,
      onLive:()=>{website.loaded=true;element.dataset.loadState='live';readiness.settle(project.slug,'live')},
      onFallback:()=>{if(!website.loaded){element.dataset.loadState='fallback';readiness.settle(project.slug,'fallback')}},
    })
    website.dispose=()=>{stop();element.remove()}
    frame.src=project.embedUrl;element.append(frame);parent.append(element);entries.set(project.slug,website)
  }
  return {entries,dispose(){entries.forEach(entry=>entry.dispose());entries.clear()}}
}

export function attachPreparedWebsite(entry,website,matrix){
  entry.object={element:website.element,matrix};entry.frame=website.frame;entry.loaded=website.loaded;entry.hitReady=false
  entry.dispose=()=>{
    if(entry.mesh)entry.mesh.visible=false
    website.element.style.visibility='hidden';website.element.style.pointerEvents='none'
    entry.loaded=false;entry.hitReady=false;entry.object=null;entry.frame=null;entry.dispose=null
  }
}
