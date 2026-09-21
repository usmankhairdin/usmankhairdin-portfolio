import { useEffect } from 'react'
import { mountTagSwapController } from '../interactions/tagSwapController.js'

// Historical component name retained so App and existing tag groups keep their
// integration. Home's free-drag Splash tokens are a different system, untouched.
export default function HorizontalTagReorderManager() {
  useEffect(() => mountTagSwapController(), [])
  return null
}
