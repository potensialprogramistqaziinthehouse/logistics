'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { particleVertexShader, particleFragmentShader } from '@/lib/three/shaders/particles.glsl'
import type { ParticleFieldProps } from '@/lib/types'

/** Generate particle geometry data outside of render to satisfy purity rules */
function generateParticleData(particleCount: number, spread: number) {
  const positions = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  const phases = new Float32Array(particleCount)

  for (let i = 0; i < particleCount; i++) {
    // Random position in a cube of size `spread`
    positions[i * 3 + 0] = (Math.random() - 0.5) * spread
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread

    // Random size between 1 and 3
    sizes[i] = 1 + Math.random() * 2

    // Random phase between 0 and 2π
    phases[i] = Math.random() * Math.PI * 2
  }

  return { positions, sizes, phases }
}

export function ParticleField({
  count = 2000,
  spread = 20,
  scrollProgress,
}: ParticleFieldProps) {
  const ref = useRef<THREE.Points>(null)

  // Reduce particle count on mobile for performance
  const particleCount =
    typeof window !== 'undefined' && window.innerWidth < 768 ? 500 : count

  const { positions, sizes, phases } = useMemo(
    () => generateParticleData(particleCount, spread),
    [particleCount, spread]
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
    }),
    []
  )

  useFrame(({ clock }) => {
    if (!ref.current) return

    const material = ref.current.material as THREE.ShaderMaterial
    material.uniforms.uTime.value = clock.getElapsedTime()
    material.uniforms.uScrollProgress.value = scrollProgress.get()
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[sizes, 1]}
        />
        <bufferAttribute
          attach="attributes-aPhase"
          args={[phases, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
