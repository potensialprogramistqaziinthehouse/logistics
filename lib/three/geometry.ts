import * as THREE from 'three'

/**
 * Creates a SphereGeometry for the globe with the given radius and segment count.
 *
 * Preconditions:
 * - radius > 0
 * - segments >= 16 (minimum for smooth appearance)
 *
 * Postconditions:
 * - Returns a SphereGeometry with widthSegments = segments, heightSegments = segments
 * - UV coordinates are correctly mapped for equirectangular textures
 */
export function createGlobeGeometry(
  radius: number,
  segments: number
): THREE.SphereGeometry {
  if (radius <= 0) {
    throw new RangeError(`createGlobeGeometry: radius must be > 0, got ${radius}`)
  }
  if (segments < 16) {
    throw new RangeError(
      `createGlobeGeometry: segments must be >= 16 for smooth appearance, got ${segments}`
    )
  }

  return new THREE.SphereGeometry(radius, segments, segments)
}

/**
 * Generates a random point on the surface of a sphere with the given radius.
 */
function randomSpherePoint(radius: number): THREE.Vector3 {
  const theta = Math.random() * 2 * Math.PI
  const phi = Math.acos(2 * Math.random() - 1)
  const x = radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.sin(phi) * Math.sin(theta)
  const z = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

/**
 * Builds an array of great-circle arc lines on a sphere surface.
 *
 * Preconditions:
 * - count > 0 && count <= 20
 * - globeRadius > 0
 *
 * Postconditions:
 * - Returns array of exactly `count` THREE.Line objects
 * - Each line follows a great-circle arc between two random surface points
 * - Each line has userData.phaseOffset set to a value in [0, 2π]
 * - Lines use LineDashedMaterial with transparent: true
 */
export function buildRouteLines(
  count: number,
  globeRadius: number
): THREE.Line[] {
  if (count <= 0 || count > 20) {
    throw new RangeError(
      `buildRouteLines: count must be > 0 and <= 20, got ${count}`
    )
  }
  if (globeRadius <= 0) {
    throw new RangeError(
      `buildRouteLines: globeRadius must be > 0, got ${globeRadius}`
    )
  }

  const lines: THREE.Line[] = []

  for (let i = 0; i < count; i++) {
    const start = randomSpherePoint(globeRadius)
    const end = randomSpherePoint(globeRadius)

    // Build intermediate arc points along the great-circle path
    // by slerping between the two surface points
    const arcPoints: THREE.Vector3[] = []
    const segments = 32
    for (let s = 0; s <= segments; s++) {
      const t = s / segments
      const point = new THREE.Vector3().lerpVectors(start, end, t).normalize().multiplyScalar(globeRadius)
      arcPoints.push(point)
    }

    // Use CatmullRomCurve3 to smooth the arc
    const curve = new THREE.CatmullRomCurve3(arcPoints)
    const curvePoints = curve.getPoints(64)

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)

    const material = new THREE.LineDashedMaterial({
      color: 0x4f9eff,
      dashSize: 0.1,
      gapSize: 0.05,
      transparent: true,
      opacity: 0.7,
    })

    const line = new THREE.Line(geometry, material)
    line.computeLineDistances()

    // Assign a staggered phase offset in [0, 2π]
    line.userData.phaseOffset = Math.random() * 2 * Math.PI

    lines.push(line)
  }

  return lines
}
