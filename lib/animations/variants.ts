import type { Variants } from 'framer-motion'

/**
 * Fade-up entrance animation variant.
 * Duration: 0.6s
 * Applies will-change: transform for GPU compositing.
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    willChange: 'transform',
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

/**
 * Staggered headline container variant.
 * Staggers child word animations with a 0.1s delay between each word.
 * Total animation time: ~1.2s
 */
export const staggeredHeadlineVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

/**
 * Individual word variant for use inside staggeredHeadlineVariants.
 * Applies will-change: transform for GPU compositing.
 */
export const headlineWordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    willChange: 'transform',
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

/**
 * Generic fade-in animation variant.
 * Duration: 0.8s
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}
