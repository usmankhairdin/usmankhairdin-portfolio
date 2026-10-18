import {islandBuildingGrade} from './terrainPlacement.js'

const familyKey=b=>(b.anchor||[b.x,b.z]).join(',')

// A tiered building is one rigid family. Grade the complete ground footprint
// once, then lift walls, setbacks, roof equipment and warning lights together.
export function gradeTerrainArchitecture(layout){
  const boxes=(layout.boxes||[]).filter(b=>!b.settlementKind)
  const rounds=(layout.rounds||[]).filter(b=>!b.settlementKind)
  const grades=new Map(),foundations=[]
  for(const b of [...boxes,...rounds])if(b.y===0&&!grades.has(familyKey(b))){
    const grade=islandBuildingGrade(b)
    grades.set(familyKey(b),grade)
    foundations.push({...b,y:grade.bottomY,h:grade.baseY-grade.bottomY,a:undefined,b:undefined})
  }
  const lift=b=>({...b,y:(b.y||0)+(grades.get(familyKey(b))?.baseY||0)})
  return {
    architecture:{...layout,boxes:boxes.map(lift),rounds:rounds.map(lift)},
    roofs:(layout.roofs||[]).filter(b=>!b.settlementKind).map(lift),
    beacons:(layout.beacons||[]).map(lift),
    foundations,
  }
}
