import type { SiteConfig } from '@/lib/types'

// ─── Error Type ───────────────────────────────────────────────────────────────

export interface ConfigError {
  type: 'parse_error' | 'validation_error'
  message: string
  line?: number
  column?: number
}

// ─── Line/Column Extraction ───────────────────────────────────────────────────

/**
 * Given a JSON string and a character offset, return the 1-based line and
 * column numbers for that position.
 */
function offsetToLineCol(json: string, offset: number): { line: number; column: number } {
  const lines = json.slice(0, offset).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}

/**
 * Attempt to extract a character offset from a native JSON SyntaxError
 * message. Different runtimes format the message differently; we try a few
 * common patterns and fall back to undefined when none match.
 */
function extractOffsetFromSyntaxError(json: string, err: SyntaxError): number | undefined {
  // V8: "Unexpected token 'x', "...abc" is not valid JSON"
  // V8 (older): "Unexpected token x in JSON at position 42"
  const posMatch = err.message.match(/at position (\d+)/)
  if (posMatch) return parseInt(posMatch[1], 10)

  // Some runtimes include "(line N column M)" in the message
  const lineColMatch = err.message.match(/\(line (\d+) column (\d+)\)/)
  if (lineColMatch) {
    // Convert line/col back to an approximate offset so we can re-derive
    // canonical line/col from our own function.
    const targetLine = parseInt(lineColMatch[1], 10)
    const targetCol = parseInt(lineColMatch[2], 10)
    const lines = json.split('\n')
    let offset = 0
    for (let i = 0; i < targetLine - 1 && i < lines.length; i++) {
      offset += lines[i].length + 1 // +1 for the newline
    }
    offset += targetCol - 1
    return offset
  }

  return undefined
}

// ─── Schema Validation ────────────────────────────────────────────────────────

type ValidationResult = { valid: true } | { valid: false; message: string }

function isNonEmptyString(value: unknown, fieldPath: string): ValidationResult {
  if (typeof value !== 'string' || value.trim() === '') {
    return { valid: false, message: `"${fieldPath}" must be a non-empty string` }
  }
  return { valid: true }
}

function isPositiveNumber(value: unknown, fieldPath: string): ValidationResult {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
    return { valid: false, message: `"${fieldPath}" must be a positive number` }
  }
  return { valid: true }
}

function isValidHref(value: unknown, fieldPath: string): ValidationResult {
  if (typeof value !== 'string' || value.trim() === '') {
    return { valid: false, message: `"${fieldPath}" must be a non-empty string` }
  }
  // Accept anchor hashes and absolute/relative URLs
  const trimmed = value.trim()
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return { valid: true }
  }
  return { valid: false, message: `"${fieldPath}" must be a valid URL or anchor hash` }
}

function isInteger(value: unknown, fieldPath: string): ValidationResult {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return { valid: false, message: `"${fieldPath}" must be an integer` }
  }
  return { valid: true }
}

function check(result: ValidationResult): string | null {
  return result.valid ? null : result.message
}

function validateSiteConfig(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return 'Root value must be a JSON object'
  }

  const obj = data as Record<string, unknown>

  // ── company ──────────────────────────────────────────────────────────────
  if (typeof obj.company !== 'object' || obj.company === null || Array.isArray(obj.company)) {
    return '"company" must be an object'
  }
  const company = obj.company as Record<string, unknown>

  const companyChecks: Array<string | null> = [
    check(isNonEmptyString(company.name, 'company.name')),
    check(isNonEmptyString(company.tagline, 'company.tagline')),
    typeof company.logo !== 'string'
      ? '"company.logo" must be a string'
      : null,
    check(isInteger(company.founded, 'company.founded')),
    check(isNonEmptyString(company.email, 'company.email')),
    check(isNonEmptyString(company.phone, 'company.phone')),
    check(isNonEmptyString(company.address, 'company.address')),
  ]
  for (const err of companyChecks) {
    if (err) return err
  }

  // ── hero ─────────────────────────────────────────────────────────────────
  if (typeof obj.hero !== 'object' || obj.hero === null || Array.isArray(obj.hero)) {
    return '"hero" must be an object'
  }
  const hero = obj.hero as Record<string, unknown>

  const heroChecks: Array<string | null> = [
    check(isNonEmptyString(hero.headline, 'hero.headline')),
    check(isNonEmptyString(hero.subheadline, 'hero.subheadline')),
  ]
  for (const err of heroChecks) {
    if (err) return err
  }

  for (const ctaKey of ['ctaPrimary', 'ctaSecondary'] as const) {
    if (typeof hero[ctaKey] !== 'object' || hero[ctaKey] === null || Array.isArray(hero[ctaKey])) {
      return `"hero.${ctaKey}" must be an object`
    }
    const cta = hero[ctaKey] as Record<string, unknown>
    const labelErr = check(isNonEmptyString(cta.label, `hero.${ctaKey}.label`))
    if (labelErr) return labelErr
    const hrefErr = check(isValidHref(cta.href, `hero.${ctaKey}.href`))
    if (hrefErr) return hrefErr
  }

  if (hero.videoFallback !== undefined && typeof hero.videoFallback !== 'string') {
    return '"hero.videoFallback" must be a string when provided'
  }

  // ── services ─────────────────────────────────────────────────────────────
  if (!Array.isArray(obj.services)) {
    return '"services" must be an array'
  }
  const validIcons = new Set([
    '3d-box', '3d-truck', '3d-plane', '3d-ship', '3d-warehouse', '3d-tracking',
  ])
  for (let i = 0; i < (obj.services as unknown[]).length; i++) {
    const svc = (obj.services as unknown[])[i]
    if (typeof svc !== 'object' || svc === null || Array.isArray(svc)) {
      return `"services[${i}]" must be an object`
    }
    const s = svc as Record<string, unknown>
    const svcChecks: Array<string | null> = [
      check(isNonEmptyString(s.id, `services[${i}].id`)),
      !validIcons.has(s.icon as string)
        ? `"services[${i}].icon" must be one of: ${[...validIcons].join(', ')}`
        : null,
      check(isNonEmptyString(s.title, `services[${i}].title`)),
      check(isNonEmptyString(s.description, `services[${i}].description`)),
      check(isNonEmptyString(s.stat, `services[${i}].stat`)),
    ]
    for (const err of svcChecks) {
      if (err) return err
    }
  }

  // ── stats ─────────────────────────────────────────────────────────────────
  if (!Array.isArray(obj.stats)) {
    return '"stats" must be an array'
  }
  for (let i = 0; i < (obj.stats as unknown[]).length; i++) {
    const stat = (obj.stats as unknown[])[i]
    if (typeof stat !== 'object' || stat === null || Array.isArray(stat)) {
      return `"stats[${i}]" must be an object`
    }
    const s = stat as Record<string, unknown>
    const statChecks: Array<string | null> = [
      check(isPositiveNumber(s.value, `stats[${i}].value`)),
      typeof s.suffix !== 'string' ? `"stats[${i}].suffix" must be a string` : null,
      check(isNonEmptyString(s.label, `stats[${i}].label`)),
    ]
    if (s.duration !== undefined) {
      statChecks.push(check(isPositiveNumber(s.duration, `stats[${i}].duration`)))
    }
    for (const err of statChecks) {
      if (err) return err
    }
  }

  // ── testimonials ──────────────────────────────────────────────────────────
  if (!Array.isArray(obj.testimonials)) {
    return '"testimonials" must be an array'
  }
  const validRatings = new Set([1, 2, 3, 4, 5])
  for (let i = 0; i < (obj.testimonials as unknown[]).length; i++) {
    const t = (obj.testimonials as unknown[])[i]
    if (typeof t !== 'object' || t === null || Array.isArray(t)) {
      return `"testimonials[${i}]" must be an object`
    }
    const item = t as Record<string, unknown>
    const tChecks: Array<string | null> = [
      check(isNonEmptyString(item.id, `testimonials[${i}].id`)),
      check(isNonEmptyString(item.quote, `testimonials[${i}].quote`)),
      check(isNonEmptyString(item.author, `testimonials[${i}].author`)),
      check(isNonEmptyString(item.role, `testimonials[${i}].role`)),
      check(isNonEmptyString(item.company, `testimonials[${i}].company`)),
      !validRatings.has(item.rating as number)
        ? `"testimonials[${i}].rating" must be 1, 2, 3, 4, or 5`
        : null,
    ]
    if (item.avatar !== undefined && typeof item.avatar !== 'string') {
      tChecks.push(`"testimonials[${i}].avatar" must be a string when provided`)
    }
    for (const err of tChecks) {
      if (err) return err
    }
  }

  return null // all good
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a JSON string into a `SiteConfig` object.
 *
 * Returns a `ConfigError` when:
 * - The string is not valid JSON (with line/column info where available)
 * - The parsed value does not satisfy the `SiteConfig` schema
 */
export function parseConfig(json: string): SiteConfig | ConfigError {
  let parsed: unknown

  try {
    parsed = JSON.parse(json)
  } catch (err) {
    const syntaxErr = err as SyntaxError
    const offset = extractOffsetFromSyntaxError(json, syntaxErr)
    const pos = offset !== undefined ? offsetToLineCol(json, offset) : undefined

    return {
      type: 'parse_error',
      message: `Invalid JSON: ${syntaxErr.message}`,
      ...(pos ?? {}),
    }
  }

  const validationError = validateSiteConfig(parsed)
  if (validationError) {
    return {
      type: 'validation_error',
      message: validationError,
    }
  }

  return parsed as SiteConfig
}

/**
 * Serialize a `SiteConfig` object to a JSON string with 2-space indentation.
 */
export function serializeConfig(config: SiteConfig): string {
  return JSON.stringify(config, null, 2)
}

/**
 * Type guard to distinguish a `ConfigError` from a `SiteConfig`.
 */
export function isConfigError(value: SiteConfig | ConfigError): value is ConfigError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    ((value as ConfigError).type === 'parse_error' ||
      (value as ConfigError).type === 'validation_error')
  )
}
