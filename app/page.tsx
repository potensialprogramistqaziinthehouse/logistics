import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { DynamicSections } from '@/components/sections/DynamicSections'
import { siteConfig } from '@/lib/config/site'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden" style={{ backgroundColor: '#0a0a0f', color: '#ffffff' }}>
        <HeroSection
          headline={siteConfig.hero.headline}
          subheadline={siteConfig.hero.subheadline}
          ctaPrimary={siteConfig.hero.ctaPrimary}
          ctaSecondary={siteConfig.hero.ctaSecondary}
          videoFallback={siteConfig.hero.videoFallback}
        />

        <ServicesSection services={siteConfig.services} />

        <StatsSection stats={siteConfig.stats} />

        <DynamicSections testimonials={siteConfig.testimonials} />

        <ContactSection
          email={siteConfig.company.email}
          phone={siteConfig.company.phone}
          address={siteConfig.company.address}
        />
      </main>
      <Footer />
    </>
  )
}
