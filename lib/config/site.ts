import type { SiteConfig } from '@/lib/types'

export const siteConfig: SiteConfig = {
  company: {
    name: 'Hummet Logistics',
    tagline: 'Moving the World Forward, One Shipment at a Time',
    logo: '',
    founded: 1998,
    email: 'contact@hummetlogistics.com',
    phone: '+1 (555) 123-4567',
    address: '1250 Harbor Blvd, Los Angeles, CA 90021',
  },

  hero: {
    headline: 'Global Logistics Solutions That Deliver Excellence',
    subheadline:
      'Connecting continents, delivering promises. Experience logistics powered by innovation and reliability.',
    ctaPrimary: { label: 'Get a Quote', href: '#contact' },
    ctaSecondary: { label: 'Our Services', href: '#services' },
    videoFallback: '/videos/hero-fallback.mp4',
  },

  services: [
    {
      id: 'air-freight',
      icon: '3d-plane',
      title: 'Air Freight',
      description:
        'Fast, reliable air cargo solutions for time-sensitive shipments worldwide. 99.2% on-time delivery.',
      stat: '99.2% on-time',
    },
    {
      id: 'ocean-freight',
      icon: '3d-ship',
      title: 'Ocean Freight',
      description:
        'Cost-effective sea transport for bulk cargo and containers across all major trade routes. 50K+ TEUs monthly.',
      stat: '50K+ TEUs monthly',
    },
    {
      id: 'ground-transport',
      icon: '3d-truck',
      title: 'Ground Transport',
      description:
        'Comprehensive trucking and rail services for domestic and cross-border deliveries. 2,500+ vehicles.',
      stat: '2,500+ vehicles',
    },
    {
      id: 'warehousing',
      icon: '3d-warehouse',
      title: 'Warehousing',
      description:
        'Secure, climate-controlled storage facilities with advanced inventory management. 5M+ sq ft capacity.',
      stat: '5M+ sq ft',
    },
    {
      id: 'customs-brokerage',
      icon: '3d-box',
      title: 'Customs Brokerage',
      description:
        'Expert customs clearance and compliance services to streamline international trade. 48-hour average clearance.',
      stat: '48hr avg clearance',
    },
    {
      id: 'supply-chain',
      icon: '3d-tracking',
      title: 'Supply Chain Solutions',
      description:
        'End-to-end logistics planning and optimization for complex supply chains. 30% cost reduction average.',
      stat: '30% cost reduction',
    },
  ],

  stats: [
    { value: 45, suffix: '+', label: 'Countries Served', duration: 2000 },
    { value: 100, suffix: 'K+', label: 'Monthly Shipments', duration: 2000 },
    { value: 99.2, suffix: '%', label: 'On-Time Delivery', duration: 2000 },
    { value: 2.5, suffix: 'K+', label: 'Fleet Vehicles', duration: 2000 },
  ],

  testimonials: [
    {
      id: 't1',
      author: 'Sarah Chen',
      role: 'Supply Chain Director',
      company: 'TechGlobal Inc.',
      quote:
        'Hummet Logistics transformed our supply chain. Their real-time tracking and proactive communication gave us the visibility we needed. Highly recommended!',
      rating: 5,
    },
    {
      id: 't2',
      author: 'Marcus Rodriguez',
      role: 'Operations Manager',
      company: 'RetailCorp',
      quote:
        "We've worked with many logistics providers, but Hummet stands out. Their customs brokerage team saved us weeks of delays. True professionals.",
      rating: 5,
    },
    {
      id: 't3',
      author: 'Aisha Patel',
      role: 'CEO',
      company: 'GreenGoods Co.',
      quote:
        'Switching to Hummet reduced our shipping costs by 28% while improving delivery times. Their warehousing solutions are top-notch.',
      rating: 5,
    },
  ],
}
