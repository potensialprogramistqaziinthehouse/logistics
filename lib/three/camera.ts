import * as THREE from 'three'

/**
 * Moves the camera's z-position toward the scroll-driven target using linear interpolation.
 *
 * Preconditions:
 * - progress is in [0, 1]
 * - config.startZ < config.endZ
 * - config.lerpFactor is in (0, 1]
 *
 * Postconditions:
 * - camera.position.z moves toward lerp(startZ, endZ, progress) by lerpFactor each call
 * - No other camera properties are mutated
 */
export function lerpCameraToScroll(
  camera: THREE.PerspectiveCamera,
  progress: number,
  config: { startZ: number; endZ: number; lerpFactor: number }
): void {
  const { startZ, endZ, lerpFactor } = config

  if (progress < 0 || progress > 1) {
    throw new RangeError(
      `lerpCameraToScroll: progress must be in [0, 1], got ${progress}`
    )
  }
  if (startZ >= endZ) {
    throw new RangeError(
      `lerpCameraToScroll: startZ must be < endZ, got startZ=${startZ}, endZ=${endZ}`
    )
  }
  if (lerpFactor <= 0 || lerpFactor > 1) {
    throw new RangeError(
      `lerpCameraToScroll: lerpFactor must be in (0, 1], got ${lerpFactor}`
    )
  }

  // Compute the scroll-driven target z position
  const target = startZ + (endZ - startZ) * progress

  // Lerp camera z toward target
  camera.position.z = camera.position.z + (target - camera.position.z) * lerpFactor
}
