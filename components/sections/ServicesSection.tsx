'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ServiceIconCanvas } from '@/components/3d/ServiceIconCanvas'
import { fadeUpVariants } from '@/lib/animations/variants'
import type { ServiceItem } from '@/lib/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ServicesSectionProps {
  services: ServiceItem[]
}

// ─── ServiceCard sub-component ────────────────────────────────────────────────

interface ServiceCardProps {
  service: ServiceItem
  index: number
}

function ServiceCard({ service, index }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUpVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      // Stagger each card slightly based on its index
      transition={{ delay: index * 0.1 }}
      style={{
        backgroundColor: '#111122',
        willChange: 'transform',
      }}
      className="rounded-xl p-6 flex flex-col gap-4 border border-white/5 hover:border-white/10 transition-colors"
    >
      {/* 3D icon */}
      <div className="flex items-center justify-start">
        <ServiceIconCanvas iconType={service.icon} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white leading-snug">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#a0a0b0] leading-relaxed flex-1">
        {service.description}
      </p>

      {/* Stat with orange accent */}
      <div className="mt-auto pt-2 border-t border-white/10">
        <span
          className="text-sm font-semibold"
          style={{ color: '#ff6b35' }}
        >
          {service.stat}
        </span>
      </div>
    </motion.div>
  )
}

// ─── ServicesSection ──────────────────────────────────────────────────────────

/**
 * ServicesSection renders a responsive grid of 6 service cards.
 *
 * Each card contains a small animated 3D icon canvas, a title, a description,
 * and a highlighted stat. Cards animate in with a fade-up effect (0.6s) when
 * they enter the viewport, staggered by 100ms per card.
 *
 * Layout: 1 column on mobile (<768px), 3 columns on desktop (md+).
 */
export function ServicesSection({ services }: ServicesSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: '-80px' })

  return (
    <section
      id="services"
      className="py-20 px-6"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.h2
          ref={headingRef}
          variants={fadeUpVariants}
          initial="hidden"
          animate={isHeadingInView ? 'visible' : 'hidden'}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
        >
          Our Services
        </motion.h2>

        {/* Responsive grid: 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
