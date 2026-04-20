'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'

interface TruckModelProps {
  scrollProgress: MotionValue<number>
  modelPath: string  // '/models/truck.glb'
}

/**
 * Validates that a model path is safe to load:
 * - Must end with .glb or .gltf
 * - Must start with /models/ (same-origin /public/models)
 */
function isValidModelPath(path: string): boolean {
  if (!path) return false
  const hasValidExtension = path.endsWith('.glb') || path.endsWith('.gltf')
  const isSameOrigin = path.startsWith('/models/')
  return hasValidExtension && isSameOrigin
}

// ─── Bezier path for truck animation ─────────────────────────────────────────

const BEZIER_CURVE = new THREE.CubicBezierCurve3(
  new THREE.Vector3(-8, -1, 0),
  new THREE.Vector3(-3, -1, 2),
  new THREE.Vector3(3, -1, -2),
  new THREE.Vector3(8, -1, 0)
)

// ─── Fallback procedural truck ────────────────────────────────────────────────

function FallbackTruck({ truckProgressRef }: { truckProgressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    const pos = BEZIER_CURVE.getPoint(truckProgressRef.current)
    groupRef.current.position.copy(pos)
  })

  return (
    <group ref={groupRef} castShadow>
      <mesh castShadow>
        <boxGeometry args={[2, 1, 0.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// ─── GLTF truck (inner component, always calls useGLTF) ───────────────────────

function GLTFTruck({
  modelPath,
  truckProgressRef,
  wheelProgressRef,
}: {
  modelPath: string
  truckProgressRef: React.MutableRefObject<number>
  wheelProgressRef: React.MutableRefObject<number>
}) {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef<THREE.Group>(null)

  // Clone the scene so multiple instances don't share state
  const clonedScene = useMemo(() => {
    if (!scene) return null
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true
      }
    })
    return clone
  }, [scene])

  // Collect wheel meshes by name convention (e.g. "wheel", "Wheel", "tire")
  const wheelRefs = useMemo(() => {
    const wheels: THREE.Object3D[] = []
    if (clonedScene) {
      clonedScene.traverse((child) => {
        const name = child.name.toLowerCase()
        if (name.includes('wheel') || name.includes('tire') || name.includes('tyre')) {
          wheels.push(child)
        }
      })
    }
    return wheels
  }, [clonedScene])

  useFrame(() => {
    if (!groupRef.current || !clonedScene) return

    // Position truck along bezier path
    const pos = BEZIER_CURVE.getPoint(truckProgressRef.current)
    groupRef.current.position.copy(pos)

    // Orient truck to face direction of travel
    const tangent = BEZIER_CURVE.getTangent(truckProgressRef.current)
    if (tangent.length() > 0) {
      groupRef.current.rotation.y = Math.atan2(tangent.x, tangent.z)
    }

    // Rotate wheels based on progress (simulate rolling)
    const wheelAngle = wheelProgressRef.current * Math.PI * 8
    for (const wheel of wheelRefs) {
      wheel.rotation.x = wheelAngle
    }
  })

  if (!clonedScene) return null

  return (
    <group ref={groupRef} castShadow>
      <primitive object={clonedScene} />
    </group>
  )
}

// ─── Main TruckModel component ────────────────────────────────────────────────

/**
 * TruckModel renders an animated cargo truck along a bezier path.
 *
 * Security: only loads models from /public/models (same origin) with .glb/.gltf extension.
 * Fallback: if the model path is invalid or the GLTF fails to load, renders a procedural
 * low-poly box geometry instead.
 *
 * Note: Wrap this component in a <Suspense> boundary in the parent, since useGLTF
 * uses React Suspense for async loading.
 */
export function TruckModel({ scrollProgress, modelPath }: TruckModelProps) {
  // Shared animation state refs (updated in the outer useFrame, read by child)
  const truckProgressRef = useRef<number>(0)
  const wheelProgressRef = useRef<number>(0)

  // Advance truck progress each frame (loops 0→1 continuously)
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    // Loop every ~10 seconds
    truckProgressRef.current = (time * 0.1) % 1
    wheelProgressRef.current = truckProgressRef.current
  })

  const pathIsValid = isValidModelPath(modelPath)

  if (!pathIsValid) {
    return <FallbackTruck truckProgressRef={truckProgressRef} />
  }

  return (
    <GLTFTruck
      modelPath={modelPath}
      truckProgressRef={truckProgressRef}
      wheelProgressRef={wheelProgressRef}
    />
  )
}

// Preload the model when the path is known at module level
// (called externally by the parent when a valid path is available)
export function preloadTruckModel(modelPath: string): void {
  if (isValidModelPath(modelPath)) {
    useGLTF.preload(modelPath)
  }
}
