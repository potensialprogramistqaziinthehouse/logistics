import { useRef, useEffect } from 'react'
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix: string
  duration: number
  className?: string
}

export function AnimatedCounter({ value, suffix, duration, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const displayValue = useMotionValue(0)
  const rounded = useTransform(displayValue, Math.round)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      animate(displayValue, value, {
        duration: duration / 1000,
        ease: 'easeOut',
      })
    }
  }, [isInView, value, duration, displayValue])

  return (
    <span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
