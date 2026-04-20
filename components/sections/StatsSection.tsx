'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { fadeUpVariants } from '@/lib/animations/variants'
import type { StatItem } from '@/lib/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsSectionProps {
  stats: StatItem[]
}

// ─── StatCard sub-component ───────────────────────────────────────────────────

interface StatCardProps {
  stat: StatItem
  index: number
}

function StatCard({ stat, index }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUpVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay: index * 0.1 }}
      style={{ willChange: 'transform' }}
      className="flex flex-col items-center gap-2 text-center"
    >
      {/* Animated counter with large font */}
      <AnimatedCounter
        value={stat.value}
        suffix={stat.suffix}
        duration={stat.duration ?? 2000}
        className="text-5xl md:text-6xl font-bold text-[#ff6b35]"
      />

      {/* Label */}
      <span className="text-sm md:text-base font-medium" style={{ color: '#a0a0b0' }}>
        {stat.label}
      </span>
    </motion.div>
  )
}

// ─── StatsSection ─────────────────────────────────────────────────────────────

/**
 * StatsSection renders 4 animated statistics in a horizontal band.
 *
 * Layout: 2×2 grid on mobile (<768px), 4 columns on desktop (md+).
 * Each stat uses AnimatedCounter to count from 0 to the target value
 * (easeOut, 2s) when the section enters the viewport — animating once
 * per page load.
 *
 * Requirements: 8.1, 8.2, 8.3, 17.2
 */
export function StatsSection({ stats }: StatsSectionProps) {
  const headingRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(headingRef, { once: true, margin: '-80px' })

  return (
    <section
      id="stats"
      className="py-20 px-6"
      style={{ backgroundColor: '#0d0d1a' }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={headingRef}
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
