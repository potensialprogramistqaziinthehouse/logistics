import { useEffect } from 'react'
import { useMotionValue, MotionValue } from 'framer-motion'

/**
 * Hook that tracks mouse position and returns normalized coordinates in [-1, 1].
 *
 * Normalization:
 *   x = (mouseX / windowWidth)  * 2 - 1   → -1 (left edge) to +1 (right edge)
 *   y = (mouseY / windowHeight) * 2 - 1   → -1 (top edge)  to +1 (bottom edge)
 *
 * Both values are then multiplied by `strength` (default 1.0).
 *
 * @param strength - Multiplier applied to the normalized values (default: 1.0)
 * @returns `{ x, y }` — Framer Motion MotionValues in range [-strength, strength]
 *
 * Preconditions:
 *   - Called inside a React component (hooks rules apply)
 *   - `strength` is a positive finite number if provided
 *
 * Postconditions:
 *   - Returns normalized x/y values in range [-1, 1] (when strength = 1.0)
 *   - Values update on `mousemove` events on `window`
 *   - Cleans up listener on unmount
 */
function useMouseParallax(
  strength: number = 1.0
): { x: MotionValue<number>; y: MotionValue<number> } {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      // Normalize to [-1, 1] then apply strength multiplier
      const normalizedX = ((event.clientX / window.innerWidth) * 2 - 1) * strength
      const normalizedY = ((event.clientY / window.innerHeight) * 2 - 1) * strength
      x.set(normalizedX)
      y.set(normalizedY)
    }

    window.addEventListener('mousemove', handler)

    return () => window.removeEventListener('mousemove', handler)
  }, [strength, x, y])

  return { x, y }
}

export default useMouseParallax
