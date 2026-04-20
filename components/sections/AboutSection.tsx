'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeInVariants } from '@/lib/animations/variants'

/**
 * AboutSection displays company history and mission.
 *
 * Renders the heading "About Hummet Logistics" and two paragraphs describing
 * the company's growth and mission. Text animates in with fadeInVariants (0.8s)
 * when the section enters the viewport.
 *
 * Section id: "about" for anchor navigation.
 * Exported as default for dynamic() import with SSR disabled.
 *
 * **Validates: Requirements 7.1, 7.2, 7.3, 18.2**
 */
export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-20 px-6"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <motion.h2
          variants={fadeInVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
        >
          About Hummet Logistics
        </motion.h2>

        {/* Content paragraphs */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-6 text-[#a0a0b0] text-base md:text-lg leading-relaxed"
        >
          <p>
            Founded in 1998, Hummet Logistics has grown from a regional carrier
            to a global logistics powerhouse. With operations in 45 countries
            and a fleet of over 2,500 vehicles, we move more than 100,000
            shipments monthly.
          </p>

          <p>
            Our mission is simple: deliver excellence through innovation,
            reliability, and customer-first service. We leverage cutting-edge
            technology and a network of trusted partners to ensure your cargo
            arrives on time, every time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
