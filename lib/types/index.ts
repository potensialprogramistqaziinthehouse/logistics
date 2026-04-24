import type { MotionValue } from 'framer-motion'
import type * as THREE from 'three'

// ─── Data Models ────────────────────────────────────────────────────────────

export interface ServiceItem {
  id: string
  icon: '3d-box' | '3d-truck' | '3d-plane' | '3d-ship' | '3d-warehouse' | '3d-tracking'
  title: string
  description: string
  stat: string
}

export interface StatItem {
  value: number
  suffix: string
  label: string
  duration?: number
}

export interface TestimonialItem {
  id: string
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
  rating: 1 | 2 | 3 | 4 | 5
}

export interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
}

export interface SiteConfig {
  company: {
    name: string
    tagline: string
    logo: string
    founded: number
    email: string
    phone: string
    address: string
  }
  hero: {
    headline: string
    subheadline: string
    ctaPrimary: { label: string; href: string }
    ctaSecondary: { label: string; href: string }
    videoFallback?: string
  }
  services: ServiceItem[]
  stats: StatItem[]
  testimonials: TestimonialItem[]
}

// ─── Three.js Runtime State ──────────────────────────────────────────────────

export interface SceneState {
  cameraPosition: THREE.Vector3
  globeRotation: THREE.Euler
  truckProgress: number
  particleTime: number
  isWebGLAvailable: boolean
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary: { label: string; href: string }
}

export interface HeroCanvasProps {
  scrollProgress: MotionValue<number>
  mousePosition: { x: number; y: number }
}

export interface GlobeModelProps {
  scrollProgress: MotionValue<number>
  rotationSpeed?: number
  routeCount?: number
  markerCount?: number
}

export interface TruckModelProps {
  scrollProgress: MotionValue<number>
  modelPath: string
}

export interface ParticleFieldProps {
  count?: number
  spread?: number
  color?: string
  scrollProgress: MotionValue<number>
}

export interface AnimatedCounterProps {
  value: number
  suffix: string
  duration: number
  className?: string
}

export interface ContactSectionProps {
  email: string
  phone: string
  address: string
  onSubmit?: (data: ContactFormData) => Promise<void>
}
