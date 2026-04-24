'use client'

import React from 'react'

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Careers', href: '#' },
]

// Simple inline SVG icons for social media
function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const socialLinks = [
  { label: 'LinkedIn', href: '#', Icon: LinkedInIcon },
  { label: 'Twitter', href: '#', Icon: TwitterIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
]

/**
 * Footer component for Hummet Logistics.
 *
 * Displays:
 * - Copyright notice: "© 2024 Hummet Logistics. All rights reserved."
 * - Legal links: Privacy Policy, Terms of Service, Careers
 * - Social media icons: LinkedIn, Twitter, Facebook (placeholder hrefs)
 *
 * Accessibility:
 * - Uses semantic <footer> element (Requirement 19.4)
 * - All links are keyboard-navigable with visible 2px solid focus indicators
 * - Social icon links have aria-label for screen readers
 * - SVG icons are aria-hidden (decorative)
 *
 * **Validates: Requirements 12.1, 12.2, 12.3, 19.4**
 */
export function Footer() {
  return (
    <footer
      className="border-t border-white/10"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright — Requirement 12.1 */}
          <p className="text-sm" style={{ color: '#a0a0b0' }}>
            © 2024 Hummet Logistics. All rights reserved.
          </p>

          {/* Legal / page links — Requirement 12.2 */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-6" role="list">
              {footerLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm transition-colors duration-200 rounded focus:outline-none focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px]"
                    style={{ color: '#a0a0b0' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = '#ffffff')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = '#a0a0b0')
                    }
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social media icons — Requirement 12.3 */}
          <ul
            className="flex items-center gap-4"
            role="list"
            aria-label="Social media links"
          >
            {socialLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  className="transition-colors duration-200 rounded focus:outline-none focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px]"
                  style={{ color: '#a0a0b0' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = '#ff6b35')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#a0a0b0')
                  }
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
