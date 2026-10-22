import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Presentation only: no pin, wheel listener, scroll lock or keyboard interception.
export default function useWorkPresentation(root){
 useEffect(()=>{
  if(!root.current)return undefined
  const media=gsap.matchMedia()
  media.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',()=>{
   root.current.querySelectorAll('.work-project').forEach(section=>{
    gsap.fromTo(section.querySelector('.work-project__visual'),{y:28},{y:-20,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:.7,invalidateOnRefresh:true}})
    gsap.fromTo(section.querySelector('h2'),{y:10},{y:-8,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:1}})
   })
  },root)
  return ()=>media.revert()
 },[root])
}
