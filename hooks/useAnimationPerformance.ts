import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Hook that monitors frame rate and triggers a callback to reduce particle count
 * when performance degrades.
 *
 * Algorithm:
 *   - Each frame, compute FPS from the `delta` value provided by R3F's `useFrame`
 *   - If FPS drops below 30 for 3 consecutive frames, invoke `onReduceParticles`
 *   - After triggering, reset the consecutive-low-fps counter to avoid repeated calls
 *
 * Must be used inside an R3F component (i.e., inside a `<Canvas>` tree) because
 * it relies on `useFrame`.
 *
 * @param onReduceParticles - Callback invoked when sustained low FPS is detected;
 *                            should reduce particle count by 50%
 *
 * Preconditions:
 *   - Called inside a component that is a descendant of an R3F `<Canvas>`
 *   - `onReduceParticles` is a stable callback reference (wrap in useCallback if needed)
 *
 * Postconditions:
 *   - `onReduceParticles` is called at most once per 3-consecutive-low-fps window
 *   - No state updates are triggered from within `useFrame` (avoids React re-renders)
 *
 * Requirements: 21.4
 */
function useAnimationPerformance(onReduceParticles: () => void): void {
  // Track how many consecutive frames have had FPS below 30
  const consecutiveLowFpsFrames = useRef(0)
  // Keep a stable ref to the callback to avoid stale closures
  const onReduceParticlesRef = useRef(onReduceParticles)
  useEffect(() => {
    onReduceParticlesRef.current = onReduceParticles
  })

  useFrame((_state, delta) => {
    // delta is in seconds; FPS = 1 / delta
    // Guard against delta === 0 to avoid division by zero
    if (delta <= 0) return

    const fps = 1 / delta

    if (fps < 30) {
      consecutiveLowFpsFrames.current += 1

      if (consecutiveLowFpsFrames.current >= 3) {
        // Trigger the reduction callback and reset the counter so we don't
        // fire on every subsequent low-fps frame — only on each new 3-frame window.
        onReduceParticlesRef.current()
        consecutiveLowFpsFrames.current = 0
      }
    } else {
      // Reset counter when FPS recovers
      consecutiveLowFpsFrames.current = 0
    }
  })
}

export default useAnimationPerformance
