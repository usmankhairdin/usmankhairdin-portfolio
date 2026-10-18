import {islandTerrainGradient} from './islandTerrain.js'
import {islandRenderedTerrainHeight} from './islandTerrainMesh.js'

// A road's plan heading stays continuous while its chassis follows the actual
// land tangent. Keeping all three axes orthogonal avoids shearing the vehicle.
export function terrainRoadFrame(x,z,yaw,out={}){
  const g=islandTerrainGradient(x,z),c=Math.cos(yaw),s=Math.sin(yaw)
  const forwardY=g.x*c-g.z*s,forwardLength=Math.hypot(c,forwardY,s)
  const fx=c/forwardLength,fy=forwardY/forwardLength,fz=-s/forwardLength
  const normalLength=Math.hypot(g.x,1,g.z),nx=-g.x/normalLength,ny=1/normalLength,nz=-g.z/normalLength
  const sx=fy*nz-fz*ny,sy=fz*nx-fx*nz,sz=fx*ny-fy*nx,sideLength=Math.hypot(sx,sy,sz)
  out.xx=fx;out.xy=fy;out.xz=fz
  out.yx=nx;out.yy=ny;out.yz=nz
  out.zx=sx/sideLength;out.zy=sy/sideLength;out.zz=sz/sideLength
  out.height=islandRenderedTerrainHeight(x,z)
  return out
}

export function writeTerrainRoadMatrix(arr,index,x,ground,z,yaw,out={}){
  const f=terrainRoadFrame(x,z,yaw,out),o=index*16
  arr[o]=f.xx;arr[o+1]=f.xy;arr[o+2]=f.xz;arr[o+3]=0
  arr[o+4]=f.yx;arr[o+5]=f.yy;arr[o+6]=f.yz;arr[o+7]=0
  arr[o+8]=f.zx;arr[o+9]=f.zy;arr[o+10]=f.zz;arr[o+11]=0
  arr[o+12]=x;arr[o+13]=ground+f.height;arr[o+14]=z;arr[o+15]=1
  return f
}
