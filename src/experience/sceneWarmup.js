// StrictMode disposes the first effect setup immediately. Start compilation on
// the next task so that setup never leaves Three polling disposed materials.
export function deferSceneWarmup(run, schedule = setTimeout, cancel = clearTimeout) {
  let cancelled = false
  const timer = schedule(() => { if (!cancelled) run() }, 0)
  return () => { cancelled = true; cancel(timer) }
}

// Unlike Three's uncancellable compileAsync polling, this job can stop when
// React replaces the scene. A disposed material may have no currentProgram.
export function compileScenePrograms(renderer, scene, camera, schedule=setTimeout, cancel=clearTimeout) {
  const pending=new Set(renderer.compile(scene,camera))
  let timer,done=false,finish
  const ready=new Promise(resolve=>{finish=resolve})
  const stop=completed=>{
    if(done)return
    done=true
    if(timer!==undefined)cancel(timer)
    finish(completed)
  }
  const poll=()=>{
    if(done)return
    for(const material of pending){
      const program=renderer.properties.get(material)?.currentProgram
      if(!program||program.isReady())pending.delete(material)
    }
    if(pending.size)timer=schedule(poll,10)
    else stop(true)
  }
  poll()
  return {ready,cancel:()=>stop(false)}
}
