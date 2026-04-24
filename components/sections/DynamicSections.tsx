'use client'

/**
 * DynamicSections wraps the heavy sections that need `ssr: false` dynamic imports.
 *
 * In Next.js 15 App Router, `dynamic()` with `ssr: false` is only allowed inside
 * Client Components. This wrapper is a Client Component that lazy-loads
 * AboutSection and TestimonialsSection without SSR.
 */

import dynamic from 'next/dynamic'
import type { TestimonialItem } from '@/lib/types'

const AboutSection = dynamic(
  () => import('@/components/sections/AboutSection'),
  { ssr: false }
)

const TestimonialsSection = dynamic(
  () => import('@/components/sections/TestimonialsSection'),
  { ssr: false }
)

interface DynamicSectionsProps {
  testimonials: TestimonialItem[]
}

export function DynamicSections({ testimonials }: DynamicSectionsProps) {
  return (
    <>
      <AboutSection />
      <TestimonialsSection testimonials={testimonials} />
    </>
  )
}
