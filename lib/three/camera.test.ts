import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { lerpCameraToScroll } from './camera'

function makeCamera(z = 5): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  camera.position.set(0, 0, z)
  return camera
}

describe('lerpCameraToScroll', () => {
  it('moves camera.position.z toward the target by lerpFactor', () => {
    const camera = makeCamera(5)
    // target = 5 + (12 - 5) * 0.5 = 8.5
    // new z = 5 + (8.5 - 5) * 0.08 = 5.28
    lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    const target = 5 + (12 - 5) * 0.5
    const expected = 5 + (target - 5) * 0.08
    expect(camera.position.z).toBeCloseTo(expected, 10)
  })

  it('does not overshoot the target when lerpFactor is 1', () => {
    const camera = makeCamera(5)
    lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 1 })
    const target = 5 + (12 - 5) * 0.5
    expect(camera.position.z).toBeCloseTo(target, 10)
  })

  it('at progress=0, target is startZ', () => {
    const camera = makeCamera(3)
    lerpCameraToScroll(camera, 0, { startZ: 5, endZ: 12, lerpFactor: 1 })
    expect(camera.position.z).toBeCloseTo(5, 10)
  })

  it('at progress=1, target is endZ', () => {
    const camera = makeCamera(3)
    lerpCameraToScroll(camera, 1, { startZ: 5, endZ: 12, lerpFactor: 1 })
    expect(camera.position.z).toBeCloseTo(12, 10)
  })

  it('does not mutate camera.position.x or camera.position.y', () => {
    const camera = makeCamera(5)
    camera.position.set(3, 7, 5)
    lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    expect(camera.position.x).toBe(3)
    expect(camera.position.y).toBe(7)
  })

  it('does not mutate camera rotation', () => {
    const camera = makeCamera(5)
    const rx = camera.rotation.x
    const ry = camera.rotation.y
    const rz = camera.rotation.z
    lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    expect(camera.rotation.x).toBe(rx)
    expect(camera.rotation.y).toBe(ry)
    expect(camera.rotation.z).toBe(rz)
  })

  it('converges toward target over multiple calls', () => {
    const camera = makeCamera(5)
    const config = { startZ: 5, endZ: 12, lerpFactor: 0.1 }
    const target = 5 + (12 - 5) * 0.8 // progress = 0.8 → target = 10.6

    for (let i = 0; i < 100; i++) {
      lerpCameraToScroll(camera, 0.8, config)
    }

    // After many iterations, camera z should be very close to target
    expect(Math.abs(camera.position.z - target)).toBeLessThan(0.001)
  })

  it('throws RangeError when progress < 0', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, -0.1, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    ).toThrow(RangeError)
  })

  it('throws RangeError when progress > 1', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 1.1, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    ).toThrow(RangeError)
  })

  it('throws RangeError when startZ >= endZ', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 0.5, { startZ: 12, endZ: 5, lerpFactor: 0.08 })
    ).toThrow(RangeError)
  })

  it('throws RangeError when startZ equals endZ', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 5, lerpFactor: 0.08 })
    ).toThrow(RangeError)
  })

  it('throws RangeError when lerpFactor is 0', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 0 })
    ).toThrow(RangeError)
  })

  it('throws RangeError when lerpFactor > 1', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 1.1 })
    ).toThrow(RangeError)
  })

  it('accepts lerpFactor exactly 1 (boundary)', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 0.5, { startZ: 5, endZ: 12, lerpFactor: 1 })
    ).not.toThrow()
  })

  it('accepts progress exactly 0 and 1 (boundaries)', () => {
    const camera = makeCamera(5)
    expect(() =>
      lerpCameraToScroll(camera, 0, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    ).not.toThrow()
    expect(() =>
      lerpCameraToScroll(camera, 1, { startZ: 5, endZ: 12, lerpFactor: 0.08 })
    ).not.toThrow()
  })
})
