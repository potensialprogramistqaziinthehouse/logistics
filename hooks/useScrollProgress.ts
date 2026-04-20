import { useEffect } from 'react'
import { useMotionValue, MotionValue } from 'framer-motion'

/**
 * Pure function to compute scroll progress for a section.
 *
 * Algorithm: raw = (viewportH - rect.top) / (viewportH + sectionH)
 * Clamped to [0, 1].
 *
 * @param scrollY     - Current window.scrollY (unused directly; rect.top already accounts for it)
 * @param sectionTop  - The section's getBoundingClientRect().top (relative to viewport)
 * @param sectionHeight - The section's offsetHeight
 * @param viewportH   - window.innerHeight
 * @returns A value in [0, 1]
 */
export function computeScrollProgress(
  scrollY: number,
  sectionTop: number,
  sectionHeight: number,
  viewportH: number
): number {
  // scrollY is not used directly because sectionTop from getBoundingClientRect
  // is already viewport-relative. We keep the parameter for testability so callers
  // can pass arbitrary values and verify the clamp behaviour.
  void scrollY
  const raw = (viewportH - sectionTop) / (viewportH + sectionHeight)
  return Math.min(1, Math.max(0, raw))
}

/**
 * Hook that tracks scroll progress for a given section ref.
 *
 * Returns a Framer Motion MotionValue<number> in [0, 1]:
 *   - 0 when the section top edge is at the viewport bottom
 *   - 1 when the section bottom edge is at the viewport top
 *
 * Uses a passive scroll event listener and cleans up on unmount.
 */
function useScrollProgress(ref: React.RefObject<HTMLElement>): MotionValue<number> {
  const progress = useMotionValue(0)

  useEffect(() => {
    const handler = () => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const viewportH = window.innerHeight
      const sectionH = ref.current.offsetHeight
      const raw = (viewportH - rect.top) / (viewportH + sectionH)
      progress.set(Math.min(1, Math.max(0, raw)))
    }

    window.addEventListener('scroll', handler, { passive: true })
    // Initialize on mount
    handler()

    return () => window.removeEventListener('scroll', handler)
  }, [ref, progress])

  return progress
}

export default useScrollProgress
