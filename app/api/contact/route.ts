import { NextRequest, NextResponse } from 'next/server'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPayload {
  name: string
  email: string
  company?: string
  message: string
}

interface ValidationError {
  field: string
  message: string
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  windowStart: number
}

// In-memory store: IP → { count, windowStart }
// NOTE: This resets on server restart. For production, use Redis or similar.
const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMIT_MAX = 5          // max submissions per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000  // 1 hour in milliseconds

/**
 * Returns true if the IP is within the allowed rate limit, false if exceeded.
 * Mutates the store to track the new request.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(ip, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count += 1
  return true
}

// ─── Sanitization ─────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and script content from a string.
 * Removes <script>...</script> blocks first, then all remaining HTML tags.
 */
export function sanitizeInput(value: string): string {
  // Remove <script> blocks (including content)
  let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  // Remove all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  return sanitized.trim()
}

// ─── Validation ───────────────────────────────────────────────────────────────

// RFC 5322-inspired email regex — practical and widely used
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Validates the contact form payload.
 * Returns an array of validation errors (empty array = valid).
 */
export function validateContactPayload(payload: Partial<ContactPayload>): ValidationError[] {
  const errors: ValidationError[] = []

  // name: non-empty, 1–100 chars
  if (typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required.' })
  } else if (payload.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be 100 characters or fewer.' })
  }

  // email: valid email format
  if (typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required.' })
  } else if (!EMAIL_REGEX.test(payload.email.trim())) {
    errors.push({ field: 'email', message: 'Please provide a valid email address.' })
  }

  // message: non-empty, 10–2000 chars
  if (typeof payload.message !== 'string' || payload.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required.' })
  } else if (payload.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters.' })
  } else if (payload.message.trim().length > 2000) {
    errors.push({ field: 'message', message: 'Message must be 2000 characters or fewer.' })
  }

  return errors
}

// ─── Route Handler ────────────────────────────────────────────────────────────

/**
 * POST /api/contact
 *
 * Accepts a JSON body with { name, email, company?, message }.
 * Validates, sanitizes, and rate-limits the submission.
 *
 * Responses:
 *   200 — submission accepted
 *   400 — validation failure (descriptive error message)
 *   429 — rate limit exceeded
 *   500 — unexpected server error
 *
 * API keys and email-sending credentials are NEVER exposed to the client.
 * All processing happens server-side only.
 *
 * Requirements: 10.5, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Resolve client IP ──────────────────────────────────────────────────
    // x-forwarded-for is set by proxies/load balancers; fall back to a
    // generic key so rate limiting still works in local dev.
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    // ── Rate limiting ──────────────────────────────────────────────────────
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before submitting again.' },
        { status: 429 }
      )
    }

    // ── Parse body ─────────────────────────────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      )
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      )
    }

    const raw = body as Record<string, unknown>

    // ── Validate ───────────────────────────────────────────────────────────
    const payload: Partial<ContactPayload> = {
      name: typeof raw.name === 'string' ? raw.name : undefined,
      email: typeof raw.email === 'string' ? raw.email : undefined,
      company: typeof raw.company === 'string' ? raw.company : undefined,
      message: typeof raw.message === 'string' ? raw.message : undefined,
    }

    const validationErrors = validateContactPayload(payload)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: validationErrors[0].message,
          errors: validationErrors,
        },
        { status: 400 }
      )
    }

    // ── Sanitize ───────────────────────────────────────────────────────────
    const sanitized: ContactPayload = {
      name: sanitizeInput(payload.name!),
      email: sanitizeInput(payload.email!),
      company: payload.company ? sanitizeInput(payload.company) : '',
      message: sanitizeInput(payload.message!),
    }

    // ── Process submission ─────────────────────────────────────────────────
    // In production, send an email here using a server-side email service
    // (e.g., Resend, SendGrid). API keys are read from environment variables
    // and NEVER included in the client bundle.
    //
    // Example (not executed — requires env vars):
    //   const apiKey = process.env.RESEND_API_KEY  // server-side only
    //   await resend.emails.send({ from: '...', to: '...', ...sanitized })
    //
    // For now, log to server console (safe — never reaches the client).
    console.log('[contact] New submission from', ip, {
      name: sanitized.name,
      email: sanitized.email,
      company: sanitized.company,
      messageLength: sanitized.message.length,
    })

    return NextResponse.json(
      { success: true, message: "Message received. We'll get back to you within 24 hours." },
      { status: 200 }
    )
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
