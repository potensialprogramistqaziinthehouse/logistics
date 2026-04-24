/**
 * Unit tests for /api/contact route handler.
 *
 * Tests cover:
 * - Valid submission returns 200
 * - Missing name returns 400
 * - Invalid email returns 400
 * - Message too short (< 10 chars) returns 400
 * - HTML injection in name is sanitized
 * - Rate limiting returns 429 after 5 submissions
 *
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.6
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, sanitizeInput, validateContactPayload } from './route'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: unknown, ip = '127.0.0.1'): NextRequest {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

const validPayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  company: 'Acme Corp',
  message: 'Hello, I would like to get a quote for shipping.',
}

// ─── sanitizeInput ────────────────────────────────────────────────────────────

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<b>bold</b>')).toBe('bold')
  })

  it('strips <script> blocks including their content', () => {
    expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('hello')
  })

  it('strips nested/multiple tags', () => {
    expect(sanitizeInput('<div><p>text</p></div>')).toBe('text')
  })

  it('leaves plain text unchanged', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World')
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })
})

// ─── validateContactPayload ───────────────────────────────────────────────────

describe('validateContactPayload', () => {
  it('returns no errors for a valid payload', () => {
    const errors = validateContactPayload(validPayload)
    expect(errors).toHaveLength(0)
  })

  it('returns error when name is missing', () => {
    const errors = validateContactPayload({ ...validPayload, name: undefined })
    expect(errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('returns error when name is empty string', () => {
    const errors = validateContactPayload({ ...validPayload, name: '   ' })
    expect(errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('returns error when name exceeds 100 characters', () => {
    const errors = validateContactPayload({ ...validPayload, name: 'a'.repeat(101) })
    expect(errors.some((e) => e.field === 'name')).toBe(true)
  })

  it('accepts name of exactly 100 characters', () => {
    const errors = validateContactPayload({ ...validPayload, name: 'a'.repeat(100) })
    expect(errors.some((e) => e.field === 'name')).toBe(false)
  })

  it('returns error when email is missing', () => {
    const errors = validateContactPayload({ ...validPayload, email: undefined })
    expect(errors.some((e) => e.field === 'email')).toBe(true)
  })

  it('returns error for invalid email format', () => {
    const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', 'no-at-sign']
    for (const email of invalidEmails) {
      const errors = validateContactPayload({ ...validPayload, email })
      expect(errors.some((e) => e.field === 'email'), `expected error for: ${email}`).toBe(true)
    }
  })

  it('accepts valid email addresses', () => {
    const validEmails = ['user@example.com', 'user+tag@sub.domain.org', 'a@b.co']
    for (const email of validEmails) {
      const errors = validateContactPayload({ ...validPayload, email })
      expect(errors.some((e) => e.field === 'email'), `unexpected error for: ${email}`).toBe(false)
    }
  })

  it('returns error when message is missing', () => {
    const errors = validateContactPayload({ ...validPayload, message: undefined })
    expect(errors.some((e) => e.field === 'message')).toBe(true)
  })

  it('returns error when message is fewer than 10 characters', () => {
    const errors = validateContactPayload({ ...validPayload, message: 'Short' })
    expect(errors.some((e) => e.field === 'message')).toBe(true)
  })

  it('accepts message of exactly 10 characters', () => {
    const errors = validateContactPayload({ ...validPayload, message: '1234567890' })
    expect(errors.some((e) => e.field === 'message')).toBe(false)
  })

  it('returns error when message exceeds 2000 characters', () => {
    const errors = validateContactPayload({ ...validPayload, message: 'a'.repeat(2001) })
    expect(errors.some((e) => e.field === 'message')).toBe(true)
  })

  it('accepts message of exactly 2000 characters', () => {
    const errors = validateContactPayload({ ...validPayload, message: 'a'.repeat(2000) })
    expect(errors.some((e) => e.field === 'message')).toBe(false)
  })
})

// ─── POST handler ─────────────────────────────────────────────────────────────

describe('POST /api/contact', () => {
  // Use a unique IP per test group to avoid cross-test rate limit interference
  let testIp: string

  beforeEach(() => {
    // Generate a unique IP per test to isolate rate limit state
    testIp = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}-${Date.now()}`
  })

  it('returns 200 for a valid submission', async () => {
    const req = makeRequest(validPayload, testIp)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({ ...validPayload, name: '' }, testIp)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 400 when email is invalid', async () => {
    const req = makeRequest({ ...validPayload, email: 'not-an-email' }, testIp)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 400 when message is too short (< 10 chars)', async () => {
    const req = makeRequest({ ...validPayload, message: 'Hi' }, testIp)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/10 characters/i)
  })

  it('returns 400 when message is missing', async () => {
    const req = makeRequest({ ...validPayload, message: '' }, testIp)
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp,
      },
      body: 'not-json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('sanitizes HTML injection in name field', async () => {
    const req = makeRequest(
      { ...validPayload, name: '<script>alert("xss")</script>Jane' },
      testIp
    )
    const res = await POST(req)
    // Should succeed (sanitized, not rejected)
    expect(res.status).toBe(200)
  })

  it('sanitizes HTML tags in message field', async () => {
    const req = makeRequest(
      { ...validPayload, message: '<b>Hello</b> I need a quote for my shipment please.' },
      testIp
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('returns 429 after exceeding rate limit (5 submissions per hour)', async () => {
    const rateLimitIp = `192.168.99.${Math.floor(Math.random() * 255)}-ratelimit-${Date.now()}`

    // First 5 should succeed
    for (let i = 0; i < 5; i++) {
      const req = makeRequest(validPayload, rateLimitIp)
      const res = await POST(req)
      expect(res.status).toBe(200)
    }

    // 6th should be rate-limited
    const req = makeRequest(validPayload, rateLimitIp)
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('includes descriptive error messages in 400 responses', async () => {
    const req = makeRequest({ ...validPayload, email: 'bad-email' }, testIp)
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(typeof body.error).toBe('string')
    expect(body.error.length).toBeGreaterThan(0)
  })
})
