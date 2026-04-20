'use client'

import { useRef } from 'react'
import { motion, useTransform } from 'framer-motion'
import { HeroCanvas } from '@/components/3d/HeroCanvas'
import useScrollProgress from '@/hooks/useScrollProgress'
import useMouseParallax from '@/hooks/useMouseParallax'
import useWebGLDetection from '@/hooks/useWebGLDetection'
import {
  staggeredHeadlineVariants,
  headlineWordVariants,
} from '@/lib/animations/variants'

interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaPrimary: { label: string; href: string }
  ctaSecondary: { label: string; href: string }
  videoFallback?: string
}

export function HeroSection({
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  videoFallback = '/videos/hero-fallback.mp4',
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null!)
  const scrollProgress = useScrollProgress(sectionRef)
  const mousePosition = useMouseParallax(1.0)
  const { isAvailable: isWebGLAvailable } = useWebGLDetection()

  // Fade out scroll indicator after user scrolls past 10% of hero height
  // scrollProgress at 10% of hero: raw = (viewportH - (heroTop - 0.1*heroH)) / (viewportH + heroH)
  // Simpler: fade out when scrollProgress > 0.05 (approximately 10% into the section)
  const scrollIndicatorOpacity = useTransform(scrollProgress, [0, 0.05], [1, 0])

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ height: '100vh' }}
      className="relative overflow-hidden"
    >
      {/* 3D Canvas background or video fallback */}
      {isWebGLAvailable ? (
        <HeroCanvas
          scrollProgress={scrollProgress}
          mousePosition={mousePosition}
        />
      ) : (
        <video
          src={videoFallback}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Dark overlay to ensure text readability */}
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
      />

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Staggered headline */}
        <motion.h1
          variants={staggeredHeadlineVariants}
          initial="hidden"
          animate="visible"
          className="font-bold leading-tight mb-6 text-white text-4xl md:text-6xl"
          style={{ willChange: 'transform' }}
        >
          {headline.split(' ').map((word, i) => (
            <motion.span
              key={i}
              variants={headlineWordVariants}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
          className="text-lg md:text-xl text-[#a0a0b0] max-w-2xl mb-10"
          style={{ willChange: 'transform' }}
        >
          {subheadline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Primary CTA */}
          <a
            href={ctaPrimary.href}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:ring-offset-2 focus:ring-offset-transparent"
            style={{ backgroundColor: '#ff6b35' }}
          >
            {ctaPrimary.label}
          </a>

          {/* Secondary CTA */}
          <a
            href={ctaSecondary.href}
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-white border-2 border-white bg-transparent transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
          >
            {ctaSecondary.label}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: scrollIndicatorOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
        aria-hidden="true"
      >
        <span className="text-sm tracking-widest uppercase">Scroll</span>
        {/* Animated chevron */}
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </motion.div>
    </section>
  )
}
