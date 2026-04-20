'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceIconCanvasProps {
  iconType: '3d-box' | '3d-truck' | '3d-plane' | '3d-ship' | '3d-warehouse' | '3d-tracking'
  className?: string
}

// ─── Animated icon meshes ─────────────────────────────────────────────────────

interface IconMeshProps {
  iconType: ServiceIconCanvasProps['iconType']
}

function IconMesh({ iconType }: IconMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.8
    meshRef.current.rotation.x = t * 0.4
  })

  const color = iconType === '3d-box' || iconType === '3d-warehouse' || iconType === '3d-tracking'
    ? '#4f9eff'
    : '#ff6b35'

  return (
    <mesh ref={meshRef} castShadow>
      {iconType === '3d-box' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
      {iconType === '3d-truck' && <cylinderGeometry args={[0.5, 0.7, 1.4, 8]} />}
      {iconType === '3d-plane' && <coneGeometry args={[0.7, 1.5, 6]} />}
      {iconType === '3d-ship' && <torusGeometry args={[0.7, 0.3, 8, 16]} />}
      {iconType === '3d-warehouse' && <octahedronGeometry args={[0.9]} />}
      {iconType === '3d-tracking' && <icosahedronGeometry args={[0.9]} />}
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
    </mesh>
  )
}

// ─── Skeleton fallback ────────────────────────────────────────────────────────

function IconSkeleton() {
  return (
    <div
      className="w-full h-full rounded-full bg-gray-200 animate-pulse"
      aria-hidden="true"
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * ServiceIconCanvas renders a small animated 3D icon for a given service type.
 *
 * Each icon type maps to a distinct Three.js geometry that rotates continuously
 * on the Y and X axes. The canvas is 80×80 px by default and is wrapped in a
 * Suspense boundary so the rest of the page is never blocked.
 *
 * Accessibility: the wrapping div carries aria-label="Decorative 3D animation"
 * and role="img" so screen readers can identify (and skip) the decorative element.
 */
export function ServiceIconCanvas({ iconType, className }: ServiceIconCanvasProps) {
  return (
    <div
      className={className}
      style={{ width: 80, height: 80 }}
      role="img"
      aria-label="Decorative 3D animation"
    >
      <Suspense fallback={<IconSkeleton />}>
        <Canvas
          camera={{ position: [0, 0, 3] }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Ambient + directional lighting for the icon */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 3, 2]} intensity={1.2} />

          <IconMesh iconType={iconType} />
        </Canvas>
      </Suspense>
    </div>
  )
}
