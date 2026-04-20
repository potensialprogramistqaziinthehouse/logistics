import { useState, useEffect } from 'react'

/**
 * Hook that detects WebGL2 availability on the client side.
 *
 * Detection strategy:
 *   - Creates a temporary `<canvas>` element
 *   - Attempts to obtain a `webgl2` rendering context
 *   - Returns `true` if the context is successfully created, `false` otherwise
 *
 * SSR-safe: detection runs inside `useEffect` so it only executes in the browser.
 * The initial value is `false` (unavailable) until the effect runs on mount.
 *
 * @returns `{ isAvailable: boolean }` — whether WebGL2 is supported in the current browser
 *
 * Postconditions:
 *   - `isAvailable` is `false` during SSR and before the first render
 *   - `isAvailable` reflects actual WebGL2 support after mount
 *
 * Requirements: 15.1
 */
function useWebGLDetection(): { isAvailable: boolean } {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl2')
      setIsAvailable(context !== null)
    } catch {
      setIsAvailable(false)
    }
  }, [])

  return { isAvailable }
}

export default useWebGLDetection
