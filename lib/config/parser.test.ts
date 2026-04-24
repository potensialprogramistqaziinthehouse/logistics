/**
 * Tests for lib/config/parser.ts
 *
 * Covers:
 *  - Unit tests: valid input, invalid JSON, schema violations
 *  - Property 8: Round-trip consistency (Requirement 25.4)
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseConfig, serializeConfig, isConfigError } from './parser'
import type { SiteConfig } from '@/lib/types'
import { siteConfig } from './site'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deep-equality check that ignores undefined optional fields */
function configsEqual(a: SiteConfig, b: SiteConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('parseConfig', () => {
  it('parses the real siteConfig round-trip without error', () => {
    const json = serializeConfig(siteConfig)
    const result = parseConfig(json)
    expect(isConfigError(result)).toBe(false)
    expect(configsEqual(result as SiteConfig, siteConfig)).toBe(true)
  })

  it('returns a parse_error for invalid JSON', () => {
    const result = parseConfig('{ not valid json }')
    expect(isConfigError(result)).toBe(true)
    expect((result as ReturnType<typeof parseConfig> & { type: string }).type).toBe('parse_error')
  })

  it('includes a descriptive message for invalid JSON', () => {
    const result = parseConfig('{ "key": }')
    expect(isConfigError(result)).toBe(true)
    const err = result as { message: string }
    expect(err.message).toMatch(/invalid json/i)
  })

  it('returns a validation_error when company.name is missing', () => {
    const bad = JSON.parse(serializeConfig(siteConfig)) as Record<string, unknown>
    ;(bad.company as Record<string, unknown>).name = ''
    const result = parseConfig(JSON.stringify(bad))
    expect(isConfigError(result)).toBe(true)
    const err = result as { type: string; message: string }
    expect(err.type).toBe('validation_error')
    expect(err.message).toMatch(/company\.name/)
  })

  it('returns a validation_error when stats[].value is not positive', () => {
    const bad = JSON.parse(serializeConfig(siteConfig)) as Record<string, unknown>
    ;(bad.stats as Array<Record<string, unknown>>)[0].value = -5
    const result = parseConfig(JSON.stringify(bad))
    expect(isConfigError(result)).toBe(true)
    const err = result as { type: string; message: string }
    expect(err.type).toBe('validation_error')
    expect(err.message).toMatch(/stats\[0\]\.value/)
  })

  it('returns a validation_error for an invalid service icon', () => {
    const bad = JSON.parse(serializeConfig(siteConfig)) as Record<string, unknown>
    ;(bad.services as Array<Record<string, unknown>>)[0].icon = 'invalid-icon'
    const result = parseConfig(JSON.stringify(bad))
    expect(isConfigError(result)).toBe(true)
    const err = result as { type: string; message: string }
    expect(err.type).toBe('validation_error')
    expect(err.message).toMatch(/services\[0\]\.icon/)
  })

  it('returns a validation_error for an invalid testimonial rating', () => {
    const bad = JSON.parse(serializeConfig(siteConfig)) as Record<string, unknown>
    ;(bad.testimonials as Array<Record<string, unknown>>)[0].rating = 6
    const result = parseConfig(JSON.stringify(bad))
    expect(isConfigError(result)).toBe(true)
    const err = result as { type: string; message: string }
    expect(err.type).toBe('validation_error')
    expect(err.message).toMatch(/testimonials\[0\]\.rating/)
  })

  it('returns a validation_error for an invalid hero.ctaPrimary.href', () => {
    const bad = JSON.parse(serializeConfig(siteConfig)) as Record<string, unknown>
    ;(bad.hero as Record<string, unknown>).ctaPrimary = { label: 'Go', href: 'not-a-url' }
    const result = parseConfig(JSON.stringify(bad))
    expect(isConfigError(result)).toBe(true)
    const err = result as { type: string; message: string }
    expect(err.type).toBe('validation_error')
    expect(err.message).toMatch(/hero\.ctaPrimary\.href/)
  })

  it('returns a validation_error when root is not an object', () => {
    const result = parseConfig('"just a string"')
    expect(isConfigError(result)).toBe(true)
    const err = result as { type: string }
    expect(err.type).toBe('validation_error')
  })
})

describe('serializeConfig', () => {
  it('produces valid JSON', () => {
    const json = serializeConfig(siteConfig)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('uses 2-space indentation', () => {
    const json = serializeConfig(siteConfig)
    // Every indented line should start with exactly 2 spaces per level
    const lines = json.split('\n')
    const indentedLines = lines.filter((l) => l.startsWith('  '))
    expect(indentedLines.length).toBeGreaterThan(0)
    // No line should start with a tab
    expect(lines.some((l) => l.startsWith('\t'))).toBe(false)
  })
})

// ─── Property Test ────────────────────────────────────────────────────────────

/**
 * Property 8: Round-trip consistency
 * For all valid SiteConfig objects, parseConfig(serializeConfig(config))
 * produces an equivalent object.
 *
 * Validates: Requirement 25.4
 */
describe('Property 8: Round-trip consistency', () => {
  // Arbitraries for sub-types

  const iconArb = fc.constantFrom(
    '3d-box', '3d-truck', '3d-plane', '3d-ship', '3d-warehouse', '3d-tracking'
  ) as fc.Arbitrary<SiteConfig['services'][number]['icon']>

  const serviceArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
    icon: iconArb,
    title: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
    stat: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
  })

  const statArb = fc.record({
    value: fc.double({ min: 0.001, max: 1_000_000, noNaN: true }).filter((v) => v > 0 && isFinite(v)),
    suffix: fc.string({ maxLength: 10 }),
    label: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
    duration: fc.option(
      fc.double({ min: 0.001, max: 10_000, noNaN: true }).filter((v) => v > 0 && isFinite(v)),
      { nil: undefined }
    ),
  })

  const ratingArb = fc.constantFrom(1, 2, 3, 4, 5) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>

  const testimonialArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    quote: fc.string({ minLength: 1, maxLength: 500 }).filter((s) => s.trim().length > 0),
    author: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
    role: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
    company: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
    rating: ratingArb,
    avatar: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  })

  const hrefArb = fc.oneof(
    fc.string({ minLength: 1, maxLength: 30 })
      .filter((s) => s.trim().length > 0)
      .map((s) => `#${s}`),
    fc.string({ minLength: 1, maxLength: 30 })
      .filter((s) => s.trim().length > 0)
      .map((s) => `/${s}`)
  )

  const siteConfigArb: fc.Arbitrary<SiteConfig> = fc.record({
    company: fc.record({
      name: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
      tagline: fc.string({ minLength: 1, maxLength: 120 }).filter((s) => s.trim().length > 0),
      logo: fc.string({ maxLength: 100 }),
      founded: fc.integer({ min: 1800, max: 2100 }),
      email: fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0),
      phone: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
      address: fc.string({ minLength: 1, maxLength: 120 }).filter((s) => s.trim().length > 0),
    }),
    hero: fc.record({
      headline: fc.string({ minLength: 1, maxLength: 120 }).filter((s) => s.trim().length > 0),
      subheadline: fc.string({ minLength: 1, maxLength: 300 }).filter((s) => s.trim().length > 0),
      ctaPrimary: fc.record({
        label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        href: hrefArb,
      }),
      ctaSecondary: fc.record({
        label: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0),
        href: hrefArb,
      }),
      videoFallback: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    }),
    services: fc.array(serviceArb, { minLength: 0, maxLength: 10 }),
    stats: fc.array(statArb, { minLength: 0, maxLength: 10 }),
    testimonials: fc.array(testimonialArb, { minLength: 0, maxLength: 10 }),
  })

  it('parse(serialize(config)) produces an equivalent SiteConfig for all valid inputs', () => {
    fc.assert(
      fc.property(siteConfigArb, (config) => {
        const json = serializeConfig(config)
        const result = parseConfig(json)

        // Must not be an error
        if (isConfigError(result)) {
          throw new Error(
            `parseConfig returned an error for a valid config: ${(result as { message: string }).message}`
          )
        }

        // Must be equivalent to the original
        return configsEqual(result, config)
      }),
      { numRuns: 200 }
    )
  })
})
