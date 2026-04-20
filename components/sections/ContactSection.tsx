'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeUpVariants } from '@/lib/animations/variants'
import type { ContactSectionProps, ContactFormData } from '@/lib/types'

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

function validateForm(data: ContactFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!data.message.trim()) {
    errors.message = 'Message is required.'
  }

  return errors
}

// ─── ContactForm sub-component ────────────────────────────────────────────────

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>
}

function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isPending, setIsPending] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsPending(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      await onSubmit(formData)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', company: '', message: '' })
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsPending(false)
    }
  }

  const inputBaseStyle: React.CSSProperties = {
    backgroundColor: '#111122',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#ffffff',
    padding: '0.75rem 1rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const focusStyle = `
    focus:outline-none focus:ring-0
    focus-visible:[outline:2px_solid_#ff6b35]
    focus-visible:[outline-offset:2px]
  `

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-medium text-[#a0a0b0] mb-1.5"
        >
          Name <span aria-hidden="true" style={{ color: '#ff6b35' }}>*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={formData.name}
          onChange={handleChange}
          disabled={isPending}
          aria-required="true"
          aria-describedby={errors.name ? 'error-name' : undefined}
          aria-invalid={!!errors.name}
          style={inputBaseStyle}
          className={`${focusStyle} disabled:opacity-50`}
          placeholder="Your full name"
        />
        {errors.name && (
          <p id="error-name" role="alert" className="mt-1.5 text-xs" style={{ color: '#ff6b35' }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-[#a0a0b0] mb-1.5"
        >
          Email <span aria-hidden="true" style={{ color: '#ff6b35' }}>*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isPending}
          aria-required="true"
          aria-describedby={errors.email ? 'error-email' : undefined}
          aria-invalid={!!errors.email}
          style={inputBaseStyle}
          className={`${focusStyle} disabled:opacity-50`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p id="error-email" role="alert" className="mt-1.5 text-xs" style={{ color: '#ff6b35' }}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Company (optional) */}
      <div>
        <label
          htmlFor="contact-company"
          className="block text-sm font-medium text-[#a0a0b0] mb-1.5"
        >
          Company <span className="text-xs text-[#a0a0b0]/60">(optional)</span>
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          value={formData.company}
          onChange={handleChange}
          disabled={isPending}
          style={inputBaseStyle}
          className={`${focusStyle} disabled:opacity-50`}
          placeholder="Your company name"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-[#a0a0b0] mb-1.5"
        >
          Message <span aria-hidden="true" style={{ color: '#ff6b35' }}>*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleChange}
          disabled={isPending}
          aria-required="true"
          aria-describedby={errors.message ? 'error-message' : undefined}
          aria-invalid={!!errors.message}
          style={{ ...inputBaseStyle, resize: 'vertical' }}
          className={`${focusStyle} disabled:opacity-50`}
          placeholder="Tell us about your logistics needs..."
        />
        {errors.message && (
          <p id="error-message" role="alert" className="mt-1.5 text-xs" style={{ color: '#ff6b35' }}>
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending}
        style={{
          backgroundColor: isPending ? '#cc5528' : '#ff6b35',
          color: '#ffffff',
          padding: '0.875rem 2rem',
          borderRadius: '0.5rem',
          fontWeight: 600,
          width: '100%',
          cursor: isPending ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s, opacity 0.2s',
          outline: 'none',
        }}
        className="focus-visible:[outline:2px_solid_#4f9eff] focus-visible:[outline-offset:2px] disabled:opacity-70"
        aria-disabled={isPending}
      >
        {isPending ? 'Sending...' : 'Send Message'}
      </button>

      {/* Status messages */}
      {submitStatus === 'success' && (
        <p role="alert" className="text-sm text-center" style={{ color: '#4f9eff' }}>
          Message sent! We&apos;ll get back to you within 24 hours.
        </p>
      )}
      {submitStatus === 'error' && (
        <p role="alert" className="text-sm text-center" style={{ color: '#ff6b35' }}>
          Failed to send message. Please try again.
        </p>
      )}
    </form>
  )
}

// ─── ContactInfo sub-component ────────────────────────────────────────────────

interface ContactInfoProps {
  email: string
  phone: string
  address: string
}

function ContactInfo({ email, phone, address }: ContactInfoProps) {
  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,107,53,0.15)' }}
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff6b35"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white mb-0.5">Email</p>
          <a
            href={`mailto:${email}`}
            className="text-[#a0a0b0] text-sm hover:text-[#ff6b35] transition-colors focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px] rounded"
          >
            {email}
          </a>
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(79,158,255,0.15)' }}
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4f9eff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white mb-0.5">Phone</p>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="text-[#a0a0b0] text-sm hover:text-[#4f9eff] transition-colors focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px] rounded"
          >
            {phone}
          </a>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,107,53,0.15)' }}
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff6b35"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-white mb-0.5">Address</p>
          <address className="text-[#a0a0b0] text-sm not-italic leading-relaxed">
            {address}
          </address>
        </div>
      </div>
    </div>
  )
}

// ─── ContactSection ───────────────────────────────────────────────────────────

/**
 * ContactSection renders the contact form and company contact information.
 *
 * Displays the heading "Get in Touch", a ContactForm with 4 fields (Name,
 * Email, Company, Message), and contact info (email, phone, address).
 *
 * Accessibility:
 * - All inputs are associated with labels via htmlFor
 * - Validation errors use role="alert" for screen readers
 * - All interactive elements have 2px solid focus indicators
 * - Uses semantic <section> and <form> elements
 *
 * Section id: "contact" for anchor navigation.
 *
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8,
 * 19.2, 19.3, 19.6, 19.7**
 */
export function ContactSection({ email, phone, address, onSubmit }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-20 px-6"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.h2
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
        >
          Get in Touch
        </motion.h2>

        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.1 }}
          className="text-[#a0a0b0] text-center mb-12 max-w-xl mx-auto"
        >
          Ready to streamline your logistics? Send us a message and we&apos;ll
          get back to you within 24 hours.
        </motion.p>

        {/* Two-column layout: form + contact info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact form */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.15 }}
            style={{
              backgroundColor: '#111122',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.05)',
              willChange: 'transform',
            }}
          >
            <ContactForm onSubmit={onSubmit} />
          </motion.div>

          {/* Contact info */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            transition={{ delay: 0.25 }}
            className="flex flex-col justify-center"
            style={{ willChange: 'transform' }}
          >
            <h3 className="text-xl font-semibold text-white mb-8">
              Contact Information
            </h3>
            <ContactInfo email={email} phone={phone} address={address} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
