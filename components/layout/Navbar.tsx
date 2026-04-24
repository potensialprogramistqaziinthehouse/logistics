'use client'

import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Stats', href: '#stats' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initialize on mount
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Company name / logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="text-white font-bold text-xl tracking-tight hover:text-[#ff6b35] transition-colors duration-200 rounded focus:outline-none focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px]"
            aria-label="Hummet Logistics — scroll to top"
          >
            Hummet Logistics
          </a>

          {/* Desktop navigation links */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => handleLinkClick(e, href)}
                  className="text-white/90 hover:text-[#ff6b35] transition-colors duration-200 text-sm font-medium rounded px-1 py-0.5 focus:outline-none focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* Hamburger button — mobile only */}
          <button
            type="button"
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px]"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        } bg-black/90 backdrop-blur-md`}
        aria-hidden={!isMenuOpen}
      >
        <ul className="flex flex-col px-4 pb-4 pt-2 gap-1" role="list">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => handleLinkClick(e, href)}
                tabIndex={isMenuOpen ? 0 : -1}
                className="block text-white/90 hover:text-[#ff6b35] transition-colors duration-200 text-base font-medium py-2 px-2 rounded focus:outline-none focus-visible:[outline:2px_solid_#ff6b35] focus-visible:[outline-offset:2px]"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
