import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { createGlobeGeometry, buildRouteLines } from './geometry'

describe('createGlobeGeometry', () => {
  it('returns a SphereGeometry instance', () => {
    const geo = createGlobeGeometry(2, 64)
    expect(geo).toBeInstanceOf(THREE.SphereGeometry)
  })

  it('sets widthSegments and heightSegments to the given segments value', () => {
    const geo = createGlobeGeometry(2, 32)
    const params = geo.parameters
    expect(params.widthSegments).toBe(32)
    expect(params.heightSegments).toBe(32)
  })

  it('sets the radius correctly', () => {
    const geo = createGlobeGeometry(5, 16)
    expect(geo.parameters.radius).toBe(5)
  })

  it('accepts the minimum allowed segments (16)', () => {
    expect(() => createGlobeGeometry(1, 16)).not.toThrow()
  })

  it('throws RangeError when radius is 0', () => {
    expect(() => createGlobeGeometry(0, 32)).toThrow(RangeError)
  })

  it('throws RangeError when radius is negative', () => {
    expect(() => createGlobeGeometry(-1, 32)).toThrow(RangeError)
  })

  it('throws RangeError when segments is below 16', () => {
    expect(() => createGlobeGeometry(2, 15)).toThrow(RangeError)
  })

  it('throws RangeError when segments is 0', () => {
    expect(() => createGlobeGeometry(2, 0)).toThrow(RangeError)
  })
})

describe('buildRouteLines', () => {
  it('returns the correct number of lines', () => {
    const lines = buildRouteLines(8, 2)
    expect(lines).toHaveLength(8)
  })

  it('returns exactly 1 line when count is 1', () => {
    const lines = buildRouteLines(1, 2)
    expect(lines).toHaveLength(1)
  })

  it('returns exactly 20 lines when count is 20', () => {
    const lines = buildRouteLines(20, 2)
    expect(lines).toHaveLength(20)
  })

  it('each line is a THREE.Line instance', () => {
    const lines = buildRouteLines(4, 2)
    for (const line of lines) {
      expect(line).toBeInstanceOf(THREE.Line)
    }
  })

  it('each line uses LineDashedMaterial', () => {
    const lines = buildRouteLines(4, 2)
    for (const line of lines) {
      expect(line.material).toBeInstanceOf(THREE.LineDashedMaterial)
    }
  })

  it('each line material has transparent: true', () => {
    const lines = buildRouteLines(4, 2)
    for (const line of lines) {
      const mat = line.material as THREE.LineDashedMaterial
      expect(mat.transparent).toBe(true)
    }
  })

  it('each line has userData.phaseOffset in [0, 2π]', () => {
    const lines = buildRouteLines(8, 2)
    for (const line of lines) {
      expect(line.userData.phaseOffset).toBeGreaterThanOrEqual(0)
      expect(line.userData.phaseOffset).toBeLessThanOrEqual(2 * Math.PI)
    }
  })

  it('throws RangeError when count is 0', () => {
    expect(() => buildRouteLines(0, 2)).toThrow(RangeError)
  })

  it('throws RangeError when count exceeds 20', () => {
    expect(() => buildRouteLines(21, 2)).toThrow(RangeError)
  })

  it('throws RangeError when globeRadius is 0', () => {
    expect(() => buildRouteLines(5, 0)).toThrow(RangeError)
  })

  it('throws RangeError when globeRadius is negative', () => {
    expect(() => buildRouteLines(5, -1)).toThrow(RangeError)
  })
})
