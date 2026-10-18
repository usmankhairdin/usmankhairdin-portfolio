import * as THREE from 'three'

export function canFocusWebsite(mesh,width,camera){
  const local=mesh.worldToLocal(new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld))
  return Math.abs(local.x)<=width*.6&&local.z>=1.1&&local.z<=5.8
}

export function websiteReviewPose(mesh,width,height,camera){
  const center=new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld)
  const normal=new THREE.Vector3(0,0,1).transformDirection(mesh.matrixWorld)
  const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))
  const distance=Math.max(width/(2*tan*camera.aspect*.82),height/(2*tan*.74))
  const position=center.clone().addScaledVector(normal,distance)
  const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(position,center,new THREE.Vector3(0,1,0)))
  return {position,quaternion}
}

// Camera-only viewing: the visitor's physical walking position never changes.
export function createScreenFocus(){
  let camera=null,home=null,transition=null,ready=false
  const move=(pose,duration,returning)=>{
    transition={position:camera.position.clone(),quaternion:camera.quaternion.clone(),to:pose,duration,returning,elapsed:0}
    ready=false
  }
  return {
    get holding(){return home!==null},
    get ready(){return ready},
    enter(view,pose){
      camera=view
      if(!home)home={position:camera.position.clone(),quaternion:camera.quaternion.clone()}
      move(pose,1,false)
    },
    exit(){if(home)move(home,.65,true)},
    step(dt){
      if(!transition)return
      const t=transition
      t.elapsed=Math.min(t.duration,t.elapsed+Math.max(0,dt))
      const fraction=t.elapsed/t.duration,ease=fraction*fraction*(3-2*fraction)
      camera.position.lerpVectors(t.position,t.to.position,ease)
      camera.quaternion.slerpQuaternions(t.quaternion,t.to.quaternion,ease)
      camera.updateMatrixWorld()
      if(fraction===1){
        ready=!t.returning;transition=null
        if(t.returning){home=null;camera=null}
      }
    },
  }
}
