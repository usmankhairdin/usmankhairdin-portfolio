// The ref changes synchronously with input, before React renders a new frame.
// A dismissed screen stays blocked until the pointer really leaves it.
export function createScreenSession(){
  let active=null,blocked=null,version=0
  return {
    get active(){return active},
    get version(){return version},
    enter(id,{explicit=false}={}){
      if(!id||(!explicit&&id===blocked)||id===active)return false
      active=id;version++;return true
    },
    exit(){
      if(!active)return null
      const previous=active
      blocked=active;active=null;version++;return previous
    },
    leave(id){if(!active&&blocked===id)blocked=null},
    matches(id,token){return active===id&&version===token},
  }
}
