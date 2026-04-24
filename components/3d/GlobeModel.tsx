'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { buildRouteLines } from '@/lib/three/geometry'
import { lerpCameraToScroll } from '@/lib/three/camera'
import {
  globeVertexShader,
  globeFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from '@/lib/three/shaders/globe.glsl'

interface GlobeModelProps {
  scrollProgress: MotionValue<number>
  mouseX?: MotionValue<number>
  mouseY?: MotionValue<number>
  rotationSpeed?: number
  routeCount?: number
  markerCount?: number
  /** X offset so the globe sits left of centre. Default -2.5 */
  positionX?: number
}

function animateRouteLines(lines: THREE.Line[], time: number): void {
  for (const line of lines) {
    const material = line.material as THREE.LineDashedMaterial & { dashOffset: number }
    material.dashOffset = -(time * 0.5)
    const phase: number = line.userData.phaseOffset ?? 0
    material.opacity = 0.3 + 0.4 * Math.sin(time * 1.2 + phase)
  }
}

function generateMarkerData(markerCount: number) {
  const positions: THREE.Vector3[] = []
  const phaseOffsets: number[] = []
  for (let i = 0; i < markerCount; i++) {
    const theta = Math.random() * 2 * Math.PI
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 2
    positions.push(new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ))
    phaseOffsets.push((i / markerCount) * 2 * Math.PI)
  }
  return { positions, phaseOffsets }
}

// ─── Inner component that loads the texture (inside Suspense) ────────────────

function EarthSphere({
  uniforms,
  globeRef,
}: {
  uniforms: Record<string, THREE.IUniform>
  globeRef: React.RefObject<THREE.Mesh | null>
}) {
  // Earth texture served from public/
  const texture = useTexture('/earth.jpg')

  useEffect(() => {
    uniforms.uTexture.value = texture
    uniforms.uHasTexture.value = true
  }, [texture, uniforms])

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={globeVertexShader}
        fragmentShader={globeFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

// ─── Fallback sphere (no texture) ────────────────────────────────────────────

function EarthSphereFallback({
  uniforms,
  globeRef,
}: {
  uniforms: Record<string, THREE.IUniform>
  globeRef: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={globeVertexShader}
        fragmentShader={globeFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  )
}

// ─── Main GlobeModel ──────────────────────────────────────────────────────────

import { Suspense } from 'react'

export function GlobeModel({
  scrollProgress,
  mouseX,
  mouseY,
  rotationSpeed = 0.002,
  routeCount = 8,
  markerCount = 12,
  positionX = -2.5,
}: GlobeModelProps) {
  const globeRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const routeLinesRef = useRef<THREE.Line[]>([])

  const uniforms = useMemo(
    () => ({
      uTexture:    { value: new THREE.Texture() },
      uHasTexture: { value: false },
      uTime:       { value: 0 },
      uOpacity:    { value: 1 },
    }),
    []
  )

  const atmosphereUniforms = useMemo(() => ({}), [])

  useEffect(() => {
    const lines = buildRouteLines(routeCount, 2)
    routeLinesRef.current = lines
    const group = groupRef.current
    if (group) lines.forEach(l => group.add(l))
    return () => {
      if (group) {
        lines.forEach(l => {
          group.remove(l)
          l.geometry.dispose()
          ;(l.material as THREE.Material).dispose()
        })
      }
      routeLinesRef.current = []
    }
  }, [routeCount])

  const markerData = useMemo(() => generateMarkerData(markerCount), [markerCount])

  useFrame(({ clock, camera }, delta) => {
    if (!globeRef.current) return
    const globe = globeRef.current
    const time = clock.getElapsedTime()
    const progress = scrollProgress.get()

    globe.rotation.y += rotationSpeed * delta * 60

    const mx = mouseX ? mouseX.get() : 0
    const my = mouseY ? mouseY.get() : 0
    globe.rotation.x += (my * 0.15 - globe.rotation.x) * 0.05
    globe.rotation.z += (mx * 0.08 - globe.rotation.z) * 0.05

    lerpCameraToScroll(camera as THREE.PerspectiveCamera, progress, {
      startZ: 5,
      endZ: 12,
      lerpFactor: 0.08,
    })

    const material = globe.material as THREE.ShaderMaterial
    material.uniforms.uOpacity.value = progress > 0.7
      ? Math.max(0, 1 - (progress - 0.7) / 0.3)
      : 1
    material.uniforms.uTime.value = time

    animateRouteLines(routeLinesRef.current, time)
  })

  return (
    <group ref={groupRef} position={[positionX, 0, 0]}>
      {/* Earth sphere — tries to load texture, falls back to procedural */}
      <Suspense fallback={<EarthSphereFallback uniforms={uniforms} globeRef={globeRef} />}>
        <EarthSphere uniforms={uniforms} globeRef={globeRef} />
      </Suspense>

      {/* Atmosphere glow shell (slightly larger sphere) */}
      <mesh>
        <sphereGeometry args={[2.15, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Pulsing location markers */}
      {markerData.positions.map((pos, i) => (
        <PulsingMarker key={i} position={pos} phaseOffset={markerData.phaseOffsets[i]} />
      ))}
    </group>
  )
}

// ─── Pulsing Marker ───────────────────────────────────────────────────────────

function PulsingMarker({ position, phaseOffset }: { position: THREE.Vector3; phaseOffset: number }) {
  const markerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!markerRef.current) return
    const scale = Math.sin(clock.getElapsedTime() * 2 + phaseOffset) * 0.3 + 0.7
    markerRef.current.scale.setScalar(scale)
  })

  return (
    <mesh ref={markerRef} position={position}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#ff6b35" transparent opacity={0.85} />
    </mesh>
  )
}
