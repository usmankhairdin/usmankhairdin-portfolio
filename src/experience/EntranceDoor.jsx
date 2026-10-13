import { entrance } from './entranceDoor.js'
import { doorSystem } from './doorSystem.js'
import DoorAssembly from './DoorAssembly.jsx'

/*
 * The entrance: exactly the door every room has (DoorAssembly), set into the corridor's start
 * wall. The Home page shows this very door - the camera stands outside it and the page frames
 * it - so the door the visitor sees on Home is the door they walk through, with the real
 * corridor behind its glass, and the one that closes behind them on the way out. Its band reads
 * ENTER from outside and EXIT from inside.
 *
 * Local frame: origin on the corridor's centre line at the wall, y = 0 as for the room doors,
 * +z = outside.
 */
const F = doorSystem.frame
// The opening the start wall leaves for the portal: its outer width, and its height up to
// the top of the head (measured from the corridor floor at y = -0.075).
export const ENTRANCE_OPENING = Object.freeze({ width: F.width, height: 1.45 + 1.52 + F.head / 2 + 0.075 })

const openAmount = () => entrance.open

export default function EntranceDoor({ materials }) {
  return <DoorAssembly mats={materials} open={openAmount} label="ENTER" backLabel="EXIT" />
}
