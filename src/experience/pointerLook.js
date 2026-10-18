// Browser capture is acknowledged by pointerlockchange, never guessed from
// a request. Its lifetime belongs to the Canvas, not a room/phase effect.
export function createPointerLook(element, { document: doc, isAllowed, onChange, onUnavailable }) {
  let active=false, pending=false, unacknowledged=false, blocked=false, disposed=false, releaseReason=null, generation=0
  const detach=()=>{
    doc.removeEventListener('pointerlockchange',change)
    doc.removeEventListener('pointerlockerror',error)
  }
  const error=event=>{
    unacknowledged=false
    if(disposed){detach();return}
    if(!pending||blocked)return
    pending=false;onUnavailable(event)
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
      const wasActive=active;active=false;pending=false
      if(wasActive||releaseReason)onChange(false,releaseReason||(wasActive?'escape':'idle'))
      releaseReason=null
      if(disposed)detach()
    }
  }
  doc.addEventListener('pointerlockchange',change)
  doc.addEventListener('pointerlockerror',error)
  const control={
    request(){
      if(disposed||!isAllowed())return Promise.resolve(false)
      if(doc.pointerLockElement===element){change();return Promise.resolve(true)}
      if(pending)return Promise.resolve(false)
      if(!element.requestPointerLock){onUnavailable(new Error('Pointer Lock unavailable'));return Promise.resolve(false)}
      const token=++generation
      blocked=false;releaseReason=null;pending=true;unacknowledged=true
      let result
      try{result=element.requestPointerLock()}catch(cause){error(cause);return Promise.resolve(false)}
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
        if(token===generation)error(cause)
        if(disposed)detach()
        return false
      })
    },
    release(reason='ui'){
      generation++;blocked=true;pending=false;releaseReason=reason;active=false
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
