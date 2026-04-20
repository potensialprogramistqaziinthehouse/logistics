'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeUpVariants } from '@/lib/animations/variants'
import type { TestimonialItem } from '@/lib/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[]
}

// ─── StarRating sub-component ─────────────────────────────────────────────────

interface StarRatingProps {
  rating: 1 | 2 | 3 | 4 | 5
}

function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{ color: i < rating ? '#ff6b35' : '#333344' }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}

// ─── TestimonialCard sub-component ───────────────────────────────────────────

interface TestimonialCardProps {
  testimonial: TestimonialItem
  index: number
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={cardRef}
      variants={fadeUpVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay: index * 0.1 }}
      style={{
        backgroundColor: '#111122',
        willChange: 'transform',
      }}
      className="rounded-xl p-6 flex flex-col gap-4 border border-white/5 hover:border-white/10 transition-colors"
    >
      {/* Star rating */}
      <StarRating rating={testimonial.rating} />

      {/* Quote */}
      <blockquote className="text-[#a0a0b0] leading-relaxed flex-1 text-sm">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author info */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-white font-semibold text-sm">{testimonial.author}</p>
        <p className="text-[#a0a0b0] text-xs mt-0.5">
          {testimonial.role}, {testimonial.company}
        </p>
      </div>
    </motion.div>
  )
}

// ─── TestimonialsSection ──────────────────────────────────────────────────────

/**
 * TestimonialsSection renders a responsive grid of 3 client testimonial cards.
 *
 * Each card displays the author name, role, company, quote, and a 5-star rating
 * rendered in orange (#ff6b35). Cards animate in with a fade-up effect (0.6s)
 * when they enter the viewport, staggered by 100ms per card.
 *
 * Layout: 1 column on mobile (<768px), 3 columns on desktop (md+).
 *
 * Lazy-loaded via Next.js dynamic() import per Requirement 18.2.
 */
export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isHeadingInView = useInView(headingRef, { once: true, margin: '-80px' })

  return (
    <section
      id="testimonials"
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
          What Our Clients Say
        </motion.h2>

        {/* Responsive grid: 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
