'use client'

import { useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { SceneLighting } from './SceneLighting'
import { GlobeModel } from './GlobeModel'
import { TruckModel } from './TruckModel'
import { ParticleField } from './ParticleField'

interface HeroCanvasProps {
  scrollProgress: MotionValue<number>  // 0 = top, 1 = hero bottom
  mousePosition: { x: MotionValue<number>; y: MotionValue<number> }  // normalized -1 to 1
}

/**
 * Skeleton loader shown while the 3D scene is loading via Suspense.
 */
function CanvasSkeleton() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #0a0a0f 0%, #111122 100%)',
        animation: 'pulse 2s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * HeroCanvas renders the React Three Fiber canvas for the hero section.
 *
 * Responsibilities:
 * - Own the R3F <Canvas> with camera, lighting, and 3D scene elements
 * - Pass scroll and mouse data down to child 3D components
 * - Handle WebGL context loss gracefully with a fallback overlay
 * - Wrap scene in <Suspense> with a skeleton loader fallback
 */
export function HeroCanvas({ scrollProgress, mousePosition }: HeroCanvasProps) {
  const [contextLost, setContextLost] = useState(false)

  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault()
    setContextLost(true)
  }, [])

  const handleContextRestored = useCallback(
    (event: Event & { target: EventTarget | null }) => {
      setContextLost(false)
      // Access the WebGL renderer via the canvas element's __r3f context
      const canvas = event.target as HTMLCanvasElement | null
      if (canvas) {
        // Attempt to restore the WebGL context via the renderer
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
        if (gl && 'forceContextRestore' in gl) {
          ;(gl as WebGLRenderingContext & { forceContextRestore: () => void }).forceContextRestore()
        }
      }
    },
    []
  )

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Suspense fallback={<CanvasSkeleton />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
          shadows
          style={{ position: 'absolute', inset: 0 }}
          aria-label="Decorative 3D animation"
          onCreated={({ gl }) => {
            // Handle WebGL context loss/restore
            gl.domElement.addEventListener('webglcontextlost', handleContextLost)
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored as EventListener)
          }}
        >
          <SceneLighting />
          <GlobeModel
            scrollProgress={scrollProgress}
            mouseX={mousePosition.x}
            mouseY={mousePosition.y}
          />
          <Suspense fallback={null}>
            <TruckModel scrollProgress={scrollProgress} modelPath="/models/truck.glb" />
          </Suspense>
          <ParticleField scrollProgress={scrollProgress} />
        </Canvas>
      </Suspense>

      {/* WebGL context loss overlay */}
      {contextLost && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 10, 15, 0.75)',
            color: '#ffffff',
            fontSize: '1rem',
            zIndex: 10,
          }}
          role="status"
          aria-live="polite"
        >
          Reloading 3D scene...
        </div>
      )}
    </div>
  )
}
