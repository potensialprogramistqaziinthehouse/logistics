'use client'

import { useRef, Component, useEffect, useState } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'

interface TruckModelProps {
  scrollProgress: MotionValue<number>
  modelPath: string
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

class GLTFErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[CarModel] GLTF load failed, using fallback:', error.message, info)
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

// ─── Path validation ──────────────────────────────────────────────────────────

function isValidModelPath(path: string): boolean {
  if (!path) return false
  return (path.endsWith('.glb') || path.endsWith('.gltf')) && path.startsWith('/models/')
}

// ─── Material helpers ─────────────────────────────────────────────────────────

function buildCarMaterials() {
  return {
    body: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1a2e'),
      metalness: 0.95,
      roughness: 0.1,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4f9eff'),
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.45,
    }),
    wheel: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111111'),
      metalness: 0.6,
      roughness: 0.4,
    }),
    rim: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#888888'),
      metalness: 1.0,
      roughness: 0.15,
    }),
  }
}

function applyCarMaterials(root: THREE.Object3D) {
  const mats = buildCarMaterials()
  root.traverse(child => {
    const mesh = child as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.receiveShadow = true
    // Dispose embedded textures — this is what causes the blob URL errors
    const disposeMat = (m: THREE.Material) => {
      if (m instanceof THREE.MeshStandardMaterial || m instanceof THREE.MeshPhysicalMaterial) {
        m.map?.dispose()
        m.normalMap?.dispose()
        m.roughnessMap?.dispose()
        m.metalnessMap?.dispose()
        m.aoMap?.dispose()
        m.emissiveMap?.dispose()
        m.map = null
        m.normalMap = null
        m.roughnessMap = null
        m.metalnessMap = null
        m.aoMap = null
        m.emissiveMap = null
      }
      m.dispose()
    }
    if (Array.isArray(mesh.material)) mesh.material.forEach(disposeMat)
    else if (mesh.material) disposeMat(mesh.material)

    const name = child.name.toLowerCase()
    if (name.includes('glass') || name.includes('window') || name.includes('windshield')) {
      mesh.material = mats.glass
    } else if (name.includes('wheel') || name.includes('tire') || name.includes('tyre')) {
      mesh.material = mats.wheel
    } else if (name.includes('rim') || name.includes('brake') || name.includes('disc')) {
      mesh.material = mats.rim
    } else {
      mesh.material = mats.body
    }
  })
}

function fitAndCentre(root: THREE.Object3D, targetSize = 3) {
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) root.scale.setScalar(targetSize / maxDim)
  // Re-centre after scale
  box.setFromObject(root)
  const centre = new THREE.Vector3()
  box.getCenter(centre)
  root.position.y -= centre.y + box.min.y
}

// ─── Fallback box ─────────────────────────────────────────────────────────────

function FallbackCar({ positionX }: { positionX: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref} position={[positionX, -0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.5, 1.1]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.2, 0.4, 0.9]} />
        <meshStandardMaterial color="#0d0d1a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ─── GLTF car — loads via raw GLTFLoader with a silent LoadingManager ─────────

/**
 * We bypass useGLTF/drei entirely and use the raw GLTFLoader with a custom
 * LoadingManager that silently swallows blob URL errors.
 * This is the only reliable way to suppress the
 * "THREE.GLTFLoader: Couldn't load texture blob:..." console error,
 * because the error fires inside the loader before any material swap can run.
 */
function GLTFCar({
  modelPath,
  positionX,
  onError,
}: {
  modelPath: string
  positionX: number
  onError: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const sceneRef = useRef<THREE.Object3D | null>(null)
  const { gl } = useThree()

  useEffect(() => {
    // LoadingManager that silently ignores blob:// texture failures
    const manager = new THREE.LoadingManager()
    manager.onError = (url: string) => {
      if (url.startsWith('blob:')) {
        // Silently ignore — embedded texture blob URLs fail in dev, harmless
        return
      }
      console.warn('[CarModel] Asset failed to load:', url)
    }

    const dracoLoader = new DRACOLoader(manager)
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')

    const loader = new GLTFLoader(manager)
    loader.setDRACOLoader(dracoLoader)

    loader.load(
      modelPath,
      (gltf: GLTF) => {
        const root = gltf.scene
        // Strip embedded textures and apply clean PBR materials
        applyCarMaterials(root)
        fitAndCentre(root, 3)
        sceneRef.current = root
        if (groupRef.current) {
          // Clear any previous children
          while (groupRef.current.children.length > 0) {
            groupRef.current.remove(groupRef.current.children[0])
          }
          groupRef.current.add(root)
        }
      },
      undefined,
      (err: unknown) => {
        console.warn('[CarModel] Failed to load GLB:', err)
        onError()
      }
    )

    return () => {
      dracoLoader.dispose()
      // Dispose loaded scene on unmount
      if (sceneRef.current) {
        sceneRef.current.traverse(child => {
          const mesh = child as THREE.Mesh
          if (mesh.isMesh) {
            mesh.geometry?.dispose()
            if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose())
            else mesh.material?.dispose()
          }
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath, gl])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.35
  })

  return <group ref={groupRef} position={[positionX, -0.8, 0]} />
}

// ─── Wrapper that handles the error → fallback transition ─────────────────────

function GLTFCarWithFallback({ modelPath, positionX }: { modelPath: string; positionX: number }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <FallbackCar positionX={positionX} />
  return (
    <GLTFErrorBoundary fallback={<FallbackCar positionX={positionX} />}>
      <GLTFCar modelPath={modelPath} positionX={positionX} onError={() => setFailed(true)} />
    </GLTFErrorBoundary>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TruckModel({ modelPath, scrollProgress: _scrollProgress }: TruckModelProps) {
  const positionX = 3.5
  if (!isValidModelPath(modelPath)) return <FallbackCar positionX={positionX} />
  return <GLTFCarWithFallback modelPath={modelPath} positionX={positionX} />
}

export function preloadTruckModel(modelPath: string): void {
  // No-op: we use raw GLTFLoader now, not useGLTF
}
