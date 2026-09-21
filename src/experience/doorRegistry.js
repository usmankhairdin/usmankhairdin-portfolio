// Every corridor door publishes the two objects the room containment system needs:
// the door root (which owns the opening) and the leaf pivot (which owns how far the
// door has actually swung). Nothing else is shared, and entries are removed on unmount.
const parts = new Map()

export function registerDoorParts(id, value) {
  if (!id) return () => {}
  parts.set(id, value)
  return () => { if (parts.get(id) === value) parts.delete(id) }
}

export const getDoorParts = (id) => (id ? parts.get(id) || null : null)
