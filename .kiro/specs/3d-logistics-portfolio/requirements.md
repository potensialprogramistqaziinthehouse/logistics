# Requirements Document: 3D Logistics Portfolio Website

## Introduction

This document specifies the functional and non-functional requirements for a single-page portfolio website for Hummet Logistics, a global logistics company. The site showcases the company's services through immersive 3D visuals, scroll-driven animations, and a professional dark-themed interface. The primary goal is to demonstrate technical capability and brand credibility while maintaining fast load times, accessibility, and mobile responsiveness.

The site is built with Next.js 15, React Three Fiber for 3D rendering, and Framer Motion for scroll-linked animations. It consists of six main sections: Hero, Services, About, Stats, Testimonials, and Contact.

---

## Glossary

- **System**: The 3D Logistics Portfolio Website application
- **Hero_Canvas**: The React Three Fiber canvas component containing 3D scene elements
- **Globe_Model**: The animated 3D globe mesh with route lines and location markers
- **Truck_Model**: The animated 3D cargo truck GLTF model
- **Particle_Field**: The floating particle system rendered as instanced points
- **Service_Card**: A UI component displaying a single logistics service with icon, title, and description
- **Animated_Counter**: A UI component that counts from 0 to a target value when scrolled into view
- **Contact_Form**: The form component for user inquiries
- **Scroll_Progress**: A normalized value (0-1) representing scroll position within a section
- **WebGL_Context**: The browser's WebGL rendering context for 3D graphics
- **Route_Line**: A great-circle arc line on the globe representing a shipping route
- **Location_Marker**: A pulsing point on the globe representing a logistics hub

---

## Requirements

### Requirement 1: Company Branding and Identity

**User Story:** As a visitor, I want to see Hummet Logistics' brand identity clearly presented, so that I understand who the company is and what they stand for.

#### Acceptance Criteria

1. THE System SHALL display "Hummet Logistics" as the company name in the navigation bar
2. THE System SHALL display the tagline "Moving the World Forward, One Shipment at a Time" in the hero section
3. THE System SHALL use Bricolage Grotesque font from Google Fonts for all text content
4. THE System SHALL use a dark theme with the following color palette:
   - Background: `#0a0a0f` (near-black)
   - Primary accent: `#ff6b35` (bold orange)
   - Secondary accent: `#4f9eff` (logistics blue)
   - Text primary: `#ffffff` (white)
   - Text secondary: `#a0a0b0` (light gray)
5. THE System SHALL render a text-based logo using "Hummet Logistics" in Bricolage Grotesque Bold

### Requirement 2: Hero Section Layout and Content

**User Story:** As a visitor, I want to see an impressive hero section with clear messaging, so that I immediately understand the company's value proposition.

#### Acceptance Criteria

1. THE Hero_Section SHALL occupy exactly 100vh (full viewport height)
2. THE Hero_Section SHALL display the headline "Global Logistics Solutions That Deliver Excellence"
3. THE Hero_Section SHALL display the subheadline "Connecting continents, delivering promises. Experience logistics powered by innovation and reliability."
4. THE Hero_Section SHALL render two call-to-action buttons:
   - Primary: "Get a Quote" linking to #contact
   - Secondary: "Our Services" linking to #services
5. THE Hero_Section SHALL display a scroll indicator at the bottom that fades out after the user scrolls past 10% of the hero height
6. WHEN the hero section loads, THE System SHALL animate the headline words in with a staggered entrance effect over 1.2 seconds

### Requirement 3: 3D Globe Rendering and Animation

**User Story:** As a visitor, I want to see an animated 3D globe in the hero section, so that I can visualize the global reach of the logistics company.

#### Acceptance Criteria

1. THE Globe_Model SHALL render a 3D sphere with radius 2 units and 64 segments for smooth appearance
2. THE Globe_Model SHALL use a custom GLSL shader with an Earth texture and atmosphere glow effect
3. THE Globe_Model SHALL auto-rotate continuously at 0.002 radians per frame around the Y-axis
4. WHEN the user moves the mouse, THE Globe_Model SHALL tilt subtly based on mouse position (±0.15 radians X-axis, ±0.08 radians Z-axis)
5. WHEN the user scrolls through the hero section, THE Globe_Model SHALL zoom out from camera z-position 5 to z-position 12 based on scroll progress
6. WHEN scroll progress exceeds 70% of the hero section, THE Globe_Model SHALL fade out linearly to 0% opacity by 100% scroll progress
7. THE Globe_Model SHALL render 8 great-circle route lines connecting random surface points
8. THE Globe_Model SHALL render 12 pulsing location markers on the surface
9. FOR ALL route lines, THE System SHALL animate the dash offset to create a traveling cargo effect
10. FOR ALL location markers, THE System SHALL animate scale using a sine wave with staggered phase offsets

### Requirement 4: 3D Truck Model Animation

**User Story:** As a visitor, I want to see an animated cargo truck in the hero section, so that I can visualize the logistics operations.

#### Acceptance Criteria

1. THE Truck_Model SHALL load a GLTF model from `/models/truck.glb`
2. WHEN the GLTF model loads successfully, THE Truck_Model SHALL animate along a bezier path across the scene
3. THE Truck_Model SHALL animate wheel rotation synchronized with forward movement
4. THE Truck_Model SHALL cast shadows onto a ground plane
5. IF the GLTF model fails to load, THEN THE System SHALL render a procedural low-poly box geometry as a fallback

### Requirement 5: Particle Field Rendering

**User Story:** As a visitor, I want to see floating particles in the hero section, so that I can perceive a sense of data flow and movement.

#### Acceptance Criteria

1. THE Particle_Field SHALL render 2000 particles using THREE.BufferGeometry with instanced points
2. THE Particle_Field SHALL use a custom vertex shader to animate particle positions with sinusoidal drift
3. THE Particle_Field SHALL use the secondary accent color (#4f9eff) for all particles
4. WHEN the user scrolls through the hero section, THE Particle_Field SHALL fade out linearly based on scroll progress
5. WHERE the viewport width is less than 768px, THE Particle_Field SHALL render only 500 particles for performance

### Requirement 6: Services Section Content and Layout

**User Story:** As a visitor, I want to see the logistics services offered, so that I can understand what the company provides.

#### Acceptance Criteria

1. THE Services_Section SHALL display the heading "Our Services"
2. THE Services_Section SHALL render 6 service cards in a responsive grid layout
3. THE Services_Section SHALL display the following services:
   - **Air Freight**: "Fast, reliable air cargo solutions for time-sensitive shipments worldwide. 99.2% on-time delivery."
   - **Ocean Freight**: "Cost-effective sea transport for bulk cargo and containers across all major trade routes. 50K+ TEUs monthly."
   - **Ground Transport**: "Comprehensive trucking and rail services for domestic and cross-border deliveries. 2,500+ vehicles."
   - **Warehousing**: "Secure, climate-controlled storage facilities with advanced inventory management. 5M+ sq ft capacity."
   - **Customs Brokerage**: "Expert customs clearance and compliance services to streamline international trade. 48-hour average clearance."
   - **Supply Chain Solutions**: "End-to-end logistics planning and optimization for complex supply chains. 30% cost reduction average."
4. FOR ALL service cards, THE System SHALL render a small 3D icon canvas with an animated icon
5. WHEN a service card enters the viewport, THE System SHALL animate it in with a fade-up effect over 0.6 seconds

### Requirement 7: About Section Content

**User Story:** As a visitor, I want to learn about Hummet Logistics' history and mission, so that I can trust the company.

#### Acceptance Criteria

1. THE About_Section SHALL display the heading "About Hummet Logistics"
2. THE About_Section SHALL display the following content:
   - "Founded in 1998, Hummet Logistics has grown from a regional carrier to a global logistics powerhouse. With operations in 45 countries and a fleet of over 2,500 vehicles, we move more than 100,000 shipments monthly."
   - "Our mission is simple: deliver excellence through innovation, reliability, and customer-first service. We leverage cutting-edge technology and a network of trusted partners to ensure your cargo arrives on time, every time."
3. WHEN the about section enters the viewport, THE System SHALL animate the text in with a fade-up effect over 0.8 seconds

### Requirement 8: Stats Section Display and Animation

**User Story:** As a visitor, I want to see impressive statistics about the company, so that I can gauge their scale and reliability.

#### Acceptance Criteria

1. THE Stats_Section SHALL display 4 statistics in a horizontal layout
2. THE Stats_Section SHALL display the following stats:
   - **45+**: "Countries Served"
   - **100K+**: "Monthly Shipments"
   - **99.2%**: "On-Time Delivery"
   - **2.5K+**: "Fleet Vehicles"
3. FOR ALL statistics, THE Animated_Counter SHALL count from 0 to the target value over 2 seconds when the section enters the viewport
4. THE Animated_Counter SHALL animate exactly once per page load (not on every scroll)
5. THE Animated_Counter SHALL use an easeOut easing function for natural deceleration

### Requirement 9: Testimonials Section Content

**User Story:** As a visitor, I want to read testimonials from other clients, so that I can trust the company's service quality.

#### Acceptance Criteria

1. THE Testimonials_Section SHALL display the heading "What Our Clients Say"
2. THE Testimonials_Section SHALL render 3 testimonial cards
3. THE Testimonials_Section SHALL display the following testimonials:
   - **Sarah Chen, Supply Chain Director, TechGlobal Inc.**: "Hummet Logistics transformed our supply chain. Their real-time tracking and proactive communication gave us the visibility we needed. Highly recommended!" (5 stars)
   - **Marcus Rodriguez, Operations Manager, RetailCorp**: "We've worked with many logistics providers, but Hummet stands out. Their customs brokerage team saved us weeks of delays. True professionals." (5 stars)
   - **Aisha Patel, CEO, GreenGoods Co.**: "Switching to Hummet reduced our shipping costs by 28% while improving delivery times. Their warehousing solutions are top-notch." (5 stars)
4. FOR ALL testimonial cards, THE System SHALL display the author name, role, company, quote, and 5-star rating
5. WHEN a testimonial card enters the viewport, THE System SHALL animate it in with a fade-up effect over 0.6 seconds

### Requirement 10: Contact Section Form and Layout

**User Story:** As a visitor, I want to submit an inquiry, so that I can request a quote or ask questions.

#### Acceptance Criteria

1. THE Contact_Section SHALL display the heading "Get in Touch"
2. THE Contact_Form SHALL render 4 input fields:
   - Name (required, text input)
   - Email (required, email input with validation)
   - Company (optional, text input)
   - Message (required, textarea)
3. THE Contact_Form SHALL render a submit button labeled "Send Message"
4. THE Contact_Section SHALL display the following contact information:
   - Email: contact@hummetlogistics.com
   - Phone: +1 (555) 123-4567
   - Address: 1250 Harbor Blvd, Los Angeles, CA 90021
5. WHEN the user submits the form with valid data, THE System SHALL POST the data to `/api/contact`
6. WHEN the form submission is pending, THE System SHALL disable the submit button and display "Sending..."
7. IF the form submission fails, THEN THE System SHALL display an inline error message "Failed to send message. Please try again."
8. WHEN the form submission succeeds, THE System SHALL display a success message "Message sent! We'll get back to you within 24 hours."

### Requirement 11: Navigation Bar Functionality

**User Story:** As a visitor, I want to navigate between sections easily, so that I can find information quickly.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL remain fixed at the top of the viewport during scroll
2. THE Navigation_Bar SHALL display the company name "Hummet Logistics" on the left
3. THE Navigation_Bar SHALL render navigation links for: Services, About, Stats, Testimonials, Contact
4. WHEN the user clicks a navigation link, THE System SHALL smooth-scroll to the corresponding section
5. WHEN the user scrolls past the hero section, THE Navigation_Bar SHALL add a semi-transparent dark background with backdrop blur

### Requirement 12: Footer Content

**User Story:** As a visitor, I want to see footer information, so that I can access legal links and social media.

#### Acceptance Criteria

1. THE Footer SHALL display "© 2024 Hummet Logistics. All rights reserved."
2. THE Footer SHALL render links for: Privacy Policy, Terms of Service, Careers
3. THE Footer SHALL render social media icons for: LinkedIn, Twitter, Facebook (placeholder links)

### Requirement 13: Scroll Progress Tracking

**User Story:** As a developer, I want accurate scroll progress values for each section, so that I can drive animations correctly.

#### Acceptance Criteria

1. FOR ALL sections with scroll-driven animations, THE System SHALL compute a scroll progress value in the range [0, 1]
2. THE scroll progress value SHALL be 0 when the section top edge reaches the viewport bottom
3. THE scroll progress value SHALL be 1 when the section bottom edge reaches the viewport top
4. THE scroll progress computation SHALL clamp the value to [0, 1] (never outside this range)
5. THE scroll progress SHALL update on every scroll event using a passive event listener

### Requirement 14: Mouse Parallax Effect

**User Story:** As a visitor, I want the 3D scene to respond to my mouse movement, so that I can interact with the visuals.

#### Acceptance Criteria

1. WHEN the user moves the mouse, THE System SHALL compute normalized mouse coordinates in the range [-1, 1] for both X and Y axes
2. THE Globe_Model SHALL apply mouse parallax tilt with strength 1.0 (default)
3. THE mouse parallax effect SHALL interpolate smoothly with a lerp factor of 0.05 to avoid jittery movement

### Requirement 15: WebGL Availability and Fallback

**User Story:** As a visitor on a device without WebGL support, I want to see a fallback experience, so that I can still view the site content.

#### Acceptance Criteria

1. WHEN the page loads, THE System SHALL detect WebGL availability by attempting to create a WebGL2 context
2. IF WebGL is not available, THEN THE System SHALL render a full-screen looping video as a fallback for the hero canvas
3. IF WebGL is not available, THEN THE System SHALL hide all 3D canvas elements in other sections
4. THE fallback video SHALL be located at `/videos/hero-fallback.mp4`
5. THE fallback video SHALL autoplay, loop, and be muted

### Requirement 16: WebGL Context Loss Recovery

**User Story:** As a visitor experiencing a WebGL context loss, I want the 3D scene to recover automatically, so that I can continue viewing the site.

#### Acceptance Criteria

1. WHEN a `webglcontextlost` event fires on the canvas, THE System SHALL display a semi-transparent overlay with the message "Reloading 3D scene..."
2. WHEN a `webglcontextrestored` event fires, THE System SHALL call `renderer.forceContextRestore()` to reinitialize the scene
3. WHEN the context is restored, THE System SHALL hide the overlay and resume rendering

### Requirement 17: Responsive Layout Behavior

**User Story:** As a visitor on a mobile device, I want the site to adapt to my screen size, so that I can view all content comfortably.

#### Acceptance Criteria

1. WHERE the viewport width is less than 768px, THE Services_Section SHALL render service cards in a single column
2. WHERE the viewport width is less than 768px, THE Stats_Section SHALL render statistics in a 2x2 grid
3. WHERE the viewport width is less than 768px, THE Testimonials_Section SHALL render testimonial cards in a single column
4. WHERE the viewport width is less than 768px, THE Navigation_Bar SHALL collapse navigation links into a hamburger menu
5. WHERE the viewport width is less than 768px, THE Hero_Section SHALL reduce headline font size by 30%

### Requirement 18: Performance Optimization

**User Story:** As a visitor, I want the site to load quickly and run smoothly, so that I have a good experience.

#### Acceptance Criteria

1. THE Hero_Canvas SHALL cap the pixel ratio at `Math.min(window.devicePixelRatio, 2)` to avoid excessive overdraw
2. THE System SHALL lazy-load the About_Section and Testimonials_Section using Next.js dynamic imports
3. THE System SHALL wrap each 3D canvas in a React Suspense boundary with a skeleton loader fallback
4. THE System SHALL apply `will-change: transform` CSS property to all scroll-animated elements
5. THE System SHALL use Draco-compressed GLB files for all GLTF models
6. THE Truck_Model GLTF file SHALL be less than 500KB in size

### Requirement 19: Accessibility Compliance

**User Story:** As a visitor using assistive technology, I want the site to be accessible, so that I can navigate and understand the content.

#### Acceptance Criteria

1. THE System SHALL provide alt text for all decorative 3D canvases: "Decorative 3D animation"
2. THE System SHALL ensure all interactive elements (buttons, links, form inputs) are keyboard-navigable
3. THE System SHALL provide visible focus indicators for all interactive elements with a 2px solid outline
4. THE System SHALL use semantic HTML elements (nav, main, section, footer, form)
5. THE System SHALL ensure color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
6. THE Contact_Form SHALL associate all input fields with labels using `htmlFor` attributes
7. THE Contact_Form SHALL display validation error messages with `role="alert"` for screen readers

### Requirement 20: Font Loading and Display

**User Story:** As a visitor, I want text to display quickly with the correct font, so that I can read content without layout shifts.

#### Acceptance Criteria

1. THE System SHALL load Bricolage Grotesque font from Google Fonts using `next/font/google`
2. THE System SHALL use font weights 400 (regular), 600 (semibold), and 700 (bold)
3. THE System SHALL apply `font-display: swap` to prevent invisible text during font loading
4. THE System SHALL preload the Bricolage Grotesque font file in the document head

### Requirement 21: Animation Performance Monitoring

**User Story:** As a developer, I want to ensure animations run at 60fps, so that the user experience is smooth.

#### Acceptance Criteria

1. THE System SHALL use `requestAnimationFrame` for all Three.js render loops via React Three Fiber's `useFrame`
2. THE System SHALL guard all `useFrame` callbacks with null checks (`if (!ref.current) return`) to prevent errors
3. THE System SHALL use passive scroll event listeners to avoid blocking the main thread
4. WHERE the frame rate drops below 30fps for 3 consecutive frames, THE System SHALL reduce particle count by 50%

### Requirement 22: Content Security Policy

**User Story:** As a site administrator, I want to prevent XSS attacks, so that the site is secure.

#### Acceptance Criteria

1. THE System SHALL set a Content-Security-Policy header in `next.config.ts` with the following directives:
   - `default-src 'self'`
   - `script-src 'self' 'unsafe-eval' 'unsafe-inline'` (required for Three.js)
   - `style-src 'self' 'unsafe-inline' fonts.googleapis.com`
   - `font-src 'self' fonts.gstatic.com`
   - `img-src 'self' data: blob:`
   - `connect-src 'self'`
2. THE System SHALL never use `dangerouslySetInnerHTML` for rendering dynamic content

### Requirement 23: Contact Form Server-Side Validation

**User Story:** As a site administrator, I want to validate contact form submissions server-side, so that I can prevent spam and malicious input.

#### Acceptance Criteria

1. THE `/api/contact` endpoint SHALL validate that the `name` field is a non-empty string with length 1-100 characters
2. THE `/api/contact` endpoint SHALL validate that the `email` field matches a valid email regex pattern
3. THE `/api/contact` endpoint SHALL validate that the `message` field is a non-empty string with length 10-2000 characters
4. THE `/api/contact` endpoint SHALL sanitize all input fields to remove HTML tags and script content
5. THE `/api/contact` endpoint SHALL implement rate limiting: maximum 5 submissions per IP address per hour
6. IF validation fails, THEN THE endpoint SHALL return a 400 status code with a descriptive error message

### Requirement 24: GLTF Model Security

**User Story:** As a site administrator, I want to ensure 3D models are loaded securely, so that the site is not vulnerable to malicious content.

#### Acceptance Criteria

1. THE System SHALL only load GLTF models from the `/public/models` directory (same origin)
2. THE System SHALL never load GLTF models from user-provided URLs or external domains
3. THE System SHALL validate that all GLTF model files have a `.glb` or `.gltf` extension before loading

### Requirement 25: Parser and Serializer for Configuration (if applicable)

**User Story:** As a developer, I want to parse and serialize site configuration, so that I can manage content easily.

#### Acceptance Criteria

1. WHEN a valid `site-config.json` file is provided, THE Config_Parser SHALL parse it into a `SiteConfig` TypeScript object
2. WHEN an invalid `site-config.json` file is provided, THE Config_Parser SHALL return a descriptive error with line and column information
3. THE Config_Serializer SHALL format `SiteConfig` objects back into valid JSON files with 2-space indentation
4. FOR ALL valid `SiteConfig` objects, parsing then serializing then parsing SHALL produce an equivalent object (round-trip property)

---

## Notes

- All 3D rendering is handled by React Three Fiber and Three.js
- All UI animations are handled by Framer Motion
- The site is a single-page application with no routing beyond anchor links
- All content is static and defined in `lib/config/site.ts`
- The contact form submits to a Next.js API route at `/api/contact`
- The site uses Tailwind CSS for styling with a custom dark theme configuration
