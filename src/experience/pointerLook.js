// Browser capture is acknowledged by pointerlockchange, never guessed from
// a request. Its lifetime belongs to the Canvas, not a room/phase effect.
export function createPointerLook(element, { document: doc, isAllowed, onChange, onUnavailable }) {
  let active=false, pending=false, unacknowledged=false, blocked=false, disposed=false, releaseReason=null, generation=0,recapture=false,attempt=null
  const detach=()=>{
    doc.removeEventListener('pointerlockchange',change)
    doc.removeEventListener('pointerlockerror',error)
  }
  const fail=event=>{
    unacknowledged=false
    if(disposed){detach();return}
    if(!pending||blocked)return
    pending=false;onUnavailable(event)
  }
  const error=event=>{
    // Promise-based browsers report the same failure through both channels.
    // Let the rejected promise distinguish unsupported raw input from denial.
    if(attempt?.usesPromise!==false){if(attempt)attempt.eventError=event;return}
    fail(event)
  }
  const change=()=>{
    unacknowledged=false
    if(doc.pointerLockElement===element){
      if(disposed||blocked||!isAllowed()){
        doc.exitPointerLock();return
      }
      pending=false
      if(!active){active=true;onChange(true,'capture')}
    }else{
      const resume=recapture&&!disposed&&isAllowed()
      recapture=false
      const wasActive=active;active=false;pending=false
      if(wasActive||releaseReason)onChange(false,releaseReason||(wasActive?'escape':'idle'))
      releaseReason=null
      if(disposed)detach()
      else if(resume){blocked=false;control.request()}
    }
  }
  doc.addEventListener('pointerlockchange',change)
  doc.addEventListener('pointerlockerror',error)
  const control={
    request(){
      if(disposed||!isAllowed())return Promise.resolve(false)
      // An earlier click can still be waiting for the browser's exit event.
      // Retain the newest click instead of mistaking that old lock for a grant.
      if(blocked&&doc.pointerLockElement===element){recapture=true;return Promise.resolve(false)}
      if(doc.pointerLockElement===element){change();return Promise.resolve(true)}
      if(pending)return Promise.resolve(false)
      if(!element.requestPointerLock){onUnavailable(new Error('Pointer Lock unavailable'));return Promise.resolve(false)}
      const token=++generation
      blocked=false;releaseReason=null;pending=true;unacknowledged=true
      const acquire=raw=>{
        const job={usesPromise:null,eventError:null};attempt=job
        let result
        try{result=raw?element.requestPointerLock({unadjustedMovement:true}):element.requestPointerLock()}
        catch(cause){
          if(raw&&cause?.name==='NotSupportedError'&&token===generation&&!blocked&&!disposed&&isAllowed())return acquire(false)
          fail(cause);return Promise.resolve(false)
        }
        job.usesPromise=typeof result?.then==='function'
        if(!job.usesPromise&&job.eventError)fail(job.eventError)
        return Promise.resolve(result).then(()=>{
          if(disposed||blocked||!isAllowed()){
            if(doc.pointerLockElement===element)doc.exitPointerLock()
            if(disposed&&result)detach()
            return false
          }
          // A cancelled request can settle after a fresh, desired capture.
          // Its stale acknowledgement must not release the current request.
          if(token!==generation)return false
          if(doc.pointerLockElement===element)change()
          return active
        },cause=>{
          if(token===generation&&!disposed&&!blocked&&isAllowed()&&raw&&cause?.name==='NotSupportedError')return acquire(false)
          if(token===generation)fail(cause)
          if(disposed)detach()
          return false
        })
      }
      // Raw device deltas avoid OS acceleration and cursor-warp adjustments.
      // Platforms without that option retain regular pointer capture.
      return acquire(true)
    },
    release(reason='ui'){
      generation++;blocked=true;pending=false;recapture=false;releaseReason=reason;active=false
      onChange(false,reason)
      if(doc.pointerLockElement===element)doc.exitPointerLock()
    },
    dispose(){
      if(disposed)return
      const awaitingGrant=unacknowledged
      control.release('dispose');disposed=true
      // A pending legacy request may grant after unmount. Keep only its
      // acknowledgement guard until it settles, so it cannot trap the cursor.
      if(!awaitingGrant)detach()
    },
  }
  return control
}
