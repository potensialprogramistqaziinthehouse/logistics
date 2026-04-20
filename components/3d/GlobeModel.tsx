'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { buildRouteLines } from '@/lib/three/geometry'
import { lerpCameraToScroll } from '@/lib/three/camera'
import { globeVertexShader, globeFragmentShader } from '@/lib/three/shaders/globe.glsl'

interface GlobeModelProps {
  scrollProgress: MotionValue<number>
  mouseX?: MotionValue<number>
  mouseY?: MotionValue<number>
  rotationSpeed?: number  // default: 0.002 rad/frame
  routeCount?: number     // default: 8
  markerCount?: number    // default: 12
}

/**
 * Animates route lines each frame:
 * - Advances dash offset to create a "traveling cargo" effect
 * - Pulses opacity with staggered phase offsets
 */
function animateRouteLines(lines: THREE.Line[], time: number): void {
  for (const line of lines) {
    // Cast to access dashOffset (a valid WebGL uniform not yet typed in @types/three)
    const material = line.material as THREE.LineDashedMaterial & { dashOffset: number }
    // Animate dash offset for traveling effect
    material.dashOffset = -(time * 0.5)
    // Pulse opacity with staggered phase
    const phase: number = line.userData.phaseOffset ?? 0
    material.opacity = 0.3 + 0.4 * Math.sin(time * 1.2 + phase)
  }
}

export function GlobeModel({
  scrollProgress,
  mouseX,
  mouseY,
  rotationSpeed = 0.002,
  routeCount = 8,
  markerCount = 12,
}: GlobeModelProps) {
  const globeRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const routeLinesRef = useRef<THREE.Line[]>([])

  // Globe shader uniforms
  const uniforms = useMemo(
    () => ({
      uTexture: { value: new THREE.Texture() },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    }),
    []
  )

  // Build route lines on mount and add them to the group
  useEffect(() => {
    const lines = buildRouteLines(routeCount, 2)
    routeLinesRef.current = lines
    if (groupRef.current) {
      for (const line of lines) {
        groupRef.current.add(line)
      }
    }
    return () => {
      // Clean up route lines on unmount
      if (groupRef.current) {
        for (const line of lines) {
          groupRef.current.remove(line)
          line.geometry.dispose()
          ;(line.material as THREE.Material).dispose()
        }
      }
      routeLinesRef.current = []
    }
  }, [routeCount])

  // Precompute marker positions and phase offsets
  const markerData = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const phaseOffsets: number[] = []
    for (let i = 0; i < markerCount; i++) {
      // Random point on sphere surface (radius 2)
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      positions.push(new THREE.Vector3(x, y, z))
      // Staggered phase offset
      phaseOffsets.push((i / markerCount) * 2 * Math.PI)
    }
    return { positions, phaseOffsets }
  }, [markerCount])

  useFrame(({ clock, camera }, delta) => {
    if (!globeRef.current) return

    const globe = globeRef.current
    const time = clock.getElapsedTime()
    const progress = scrollProgress.get()

    // Auto-rotation around Y-axis
    globe.rotation.y += rotationSpeed * delta * 60

    // Mouse parallax tilt (subtle)
    const mx = mouseX ? mouseX.get() : 0
    const my = mouseY ? mouseY.get() : 0
    const targetTiltX = my * 0.15
    const targetTiltZ = mx * 0.08
    globe.rotation.x += (targetTiltX - globe.rotation.x) * 0.05
    globe.rotation.z += (targetTiltZ - globe.rotation.z) * 0.05

    // Scroll-driven camera pull-back
    lerpCameraToScroll(camera as THREE.PerspectiveCamera, progress, {
      startZ: 5,
      endZ: 12,
      lerpFactor: 0.08,
    })

    // Opacity fade-out after 70% scroll progress
    const material = globe.material as THREE.ShaderMaterial
    if (progress > 0.7) {
      const opacity = 1 - (progress - 0.7) / 0.3
      material.uniforms.uOpacity.value = Math.max(0, opacity)
    } else {
      material.uniforms.uOpacity.value = 1
    }

    // Update time uniform
    material.uniforms.uTime.value = time

    // Animate route lines
    animateRouteLines(routeLinesRef.current, time)
  })

  return (
    <group ref={groupRef}>
      {/* Globe sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          vertexShader={globeVertexShader}
          fragmentShader={globeFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* Pulsing location markers */}
      {markerData.positions.map((pos, i) => (
        <PulsingMarker
          key={i}
          position={pos}
          phaseOffset={markerData.phaseOffsets[i]}
        />
      ))}
    </group>
  )
}

// ─── Pulsing Marker Sub-component ────────────────────────────────────────────

interface PulsingMarkerProps {
  position: THREE.Vector3
  phaseOffset: number
}

function PulsingMarker({ position, phaseOffset }: PulsingMarkerProps) {
  const markerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!markerRef.current) return
    const time = clock.getElapsedTime()
    const scale = Math.sin(time * 2 + phaseOffset) * 0.3 + 0.7
    markerRef.current.scale.setScalar(scale)
  })

  return (
    <mesh ref={markerRef} position={position}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#ff6b35" transparent opacity={0.85} />
    </mesh>
  )
}
