import { doors } from '../data/projects.js'
import RoomShell from './RoomShell.jsx'
export default function Rooms(){return <>{doors.map(d=><RoomShell key={d.id} spec={d}/>)}</>}
