# Implementation Plan: 3D Logistics Portfolio Website

## Overview

Build a single-page portfolio website for Hummet Logistics using Next.js 15, React Three Fiber, Framer Motion, and Tailwind CSS. The implementation follows a bottom-up approach: project setup → core infrastructure → 3D components → UI sections → integration and wiring. Each task builds on the previous, ensuring no orphaned code.

All code is TypeScript. The design document's interfaces, algorithms, and shader code are the authoritative reference for implementation details.

---

## Tasks

- [x] 1. Install dependencies and configure the project
  - Install all required packages: `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `framer-motion`, `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@react-three/postprocessing`, `leva`, `jsdom`
  - Add `@react-three/fiber`, `@react-three/drei`, `three`, `@react-three/postprocessing` to `transpilePackages` in `next.config.ts`
  - Add Content-Security-Policy headers to `next.config.ts` per Requirement 22
  - Configure Tailwind CSS with the custom dark color palette (`#0a0a0f`, `#ff6b35`, `#4f9eff`, `#ffffff`, `#a0a0b0`) and Bricolage Grotesque font via `next/font/google`
  - Set up Vitest config (`vitest.config.ts`) with jsdom environment and `@testing-library/jest-dom` setup file
  - _Requirements: 1.3, 1.4, 18.1, 18.5, 20.1, 20.2, 20.3, 22.1_

- [x] 2. Create site configuration and TypeScript types
  - [x] 2.1 Define all TypeScript interfaces in `lib/types/index.ts`
    - Define `SiteConfig`, `ServiceItem`, `StatItem`, `TestimonialItem`, `ContactFormData`, `SceneState`, `HeroSectionProps`, `HeroCanvasProps`, `GlobeModelProps`, `TruckModelProps`, `ParticleFieldProps`, `AnimatedCounterProps`, `ContactSectionProps` as specified in the design document
    - _Requirements: 6.2, 8.1, 9.2, 10.1_

  - [x] 2.2 Create site content configuration in `lib/config/site.ts`
    - Populate `siteConfig` with all Hummet Logistics content: company details, hero copy, 6 services, 4 stats, 3 testimonials, contact info
    - Use exact copy from Requirements 1–12 (company name, tagline, headlines, service descriptions, stat values, testimonial quotes)
    - _Requirements: 1.1, 1.2, 2.2, 2.3, 6.3, 7.2, 8.2, 9.3, 10.4_

  - [ ]* 2.3 Write property test for SiteConfig round-trip parsing
    - **Property 1: Round-trip consistency** — for all valid `SiteConfig` objects, `parse(serialize(config))` produces an equivalent object
    - **Validates: Requirement 25.4**

- [x] 3. Implement core utility hooks
  - [x] 3.1 Implement `useScrollProgress` hook in `hooks/useScrollProgress.ts`
    - Implement the scroll progress algorithm from the design document exactly: `raw = (viewportH - rect.top) / (viewportH + sectionH)`, clamped to [0, 1]
    - Use a passive scroll event listener; clean up on unmount
    - Return a Framer Motion `MotionValue<number>`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 21.3_

  - [ ]* 3.2 Write property test for `useScrollProgress`
    - **Property 2: Scroll progress always in [0, 1]** — for all arbitrary `scrollY` values (including negative and very large), `computeScrollProgress` returns `v` where `0 ≤ v ≤ 1`
    - **Validates: Requirements 13.1, 13.4**

  - [x] 3.3 Implement `useMouseParallax` hook in `hooks/useMouseParallax.ts`
    - Normalize mouse coordinates to [-1, 1] range for both axes
    - Apply `strength` multiplier (default 1.0)
    - Return `{ x: MotionValue<number>, y: MotionValue<number> }`
    - Clean up `mousemove` listener on unmount
    - _Requirements: 14.1, 14.3_

  - [x] 3.4 Implement `useWebGLDetection` hook in `hooks/useWebGLDetection.ts`
    - Detect WebGL2 availability by attempting `canvas.getContext('webgl2')`
    - Return `{ isAvailable: boolean }` synchronously on mount
    - _Requirements: 15.1_

  - [x] 3.5 Implement `useAnimationPerformance` hook in `hooks/useAnimationPerformance.ts`
    - Track frame rate using `useFrame` delta values
    - When FPS drops below 30 for 3 consecutive frames, trigger a callback to reduce particle count by 50%
    - _Requirements: 21.4_

- [x] 4. Implement Three.js utility functions
  - [x] 4.1 Implement `createGlobeGeometry` in `lib/three/geometry.ts`
    - Create `THREE.SphereGeometry` with given `radius` and `segments` (minimum 16)
    - Validate preconditions: `radius > 0`, `segments >= 16`
    - _Requirements: 3.1_

  - [x] 4.2 Implement `buildRouteLines` in `lib/three/geometry.ts`
    - Generate `count` great-circle arc lines using `THREE.CatmullRomCurve3` between random surface points on a sphere of `globeRadius`
    - Assign `userData.phaseOffset` ∈ [0, 2π] to each line
    - Use `THREE.LineDashedMaterial` with `transparent: true`
    - Validate: `count > 0 && count <= 20`, `globeRadius > 0`
    - _Requirements: 3.7, 3.9_

  - [ ]* 4.3 Write property test for `buildRouteLines`
    - **Property 3: Route line count** — for all `count` ∈ [1, 20] and `radius` > 0, `buildRouteLines(count, radius).length === count`
    - **Property 4: Phase offset range** — for all returned lines, `userData.phaseOffset` ∈ [0, 2π]
    - **Validates: Requirements 3.7, 3.9**

  - [x] 4.4 Implement `lerpCameraToScroll` in `lib/three/camera.ts`
    - Implement the camera lerp algorithm: move `camera.position.z` toward `lerp(startZ, endZ, progress)` by `lerpFactor` each call
    - Validate preconditions: `progress` ∈ [0, 1], `startZ < endZ`, `lerpFactor` ∈ (0, 1]
    - Mutate only `camera.position.z`
    - _Requirements: 3.5_

  - [ ]* 4.5 Write property test for `lerpCameraToScroll`
    - **Property 5: Camera z never overshoots** — for all `progress` ∈ [0, 1], `startZ` ∈ [1, 5], `endZ` ∈ [6, 15], the target `lerp(startZ, endZ, progress)` is always in `[startZ, endZ]`
    - **Validates: Design correctness property: "camera.position.z converges toward lerp(startZ, endZ, progress) and never overshoots"**

  - [x] 4.6 Create GLSL shader files in `lib/three/shaders/`
    - Create `particles.glsl.ts` with `particleVertexShader` and `particleFragmentShader` exactly as specified in the design document
    - Create `globe.glsl.ts` with `globeVertexShader` and `globeFragmentShader` for Earth texture + atmosphere glow effect
    - _Requirements: 3.2, 5.2_

  - [x] 4.7 Implement Framer Motion animation variants in `lib/animations/variants.ts`
    - Define `fadeUpVariants` (fade-up entrance, 0.6s), `staggeredHeadlineVariants` (staggered word entrance, 1.2s), `fadeInVariants` (generic fade-in, 0.8s)
    - Apply `will-change: transform` to all scroll-animated variant definitions
    - _Requirements: 2.6, 5.4, 6.5, 7.3, 9.5, 18.4_

- [x] 5. Checkpoint — Verify utilities compile and tests pass
  - Ensure all hooks and utility functions compile without TypeScript errors
  - Run `vitest --run` to confirm property tests pass
  - Ask the user if any questions arise before proceeding to 3D components.

- [x] 6. Implement 3D scene components
  - [x] 6.1 Implement `SceneLighting` component in `components/3d/SceneLighting.tsx`
    - Add ambient light, directional light (with shadow casting), and a subtle point light for atmosphere
    - _Requirements: 4.4_

  - [x] 6.2 Implement `ParticleField` component in `components/3d/ParticleField.tsx`
    - Create `THREE.BufferGeometry` with `count` instanced points (default 2000, 500 on mobile < 768px)
    - Attach `particleVertexShader` and `particleFragmentShader` via `THREE.ShaderMaterial`
    - Pass `uTime` and `uScrollProgress` uniforms; update `uTime` each frame via `useFrame`
    - Guard `useFrame` with `if (!ref.current) return`
    - Fade out linearly as `scrollProgress` increases
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 21.1, 21.2_

  - [x] 6.3 Implement `GlobeModel` component in `components/3d/GlobeModel.tsx`
    - Render a `THREE.Mesh` with `sphereGeometry args={[2, 64, 64]}` and the globe shader material
    - Implement the `updateGlobe` algorithm from the design document in `useFrame`: auto-rotation, mouse parallax tilt, scroll-driven camera pull-back, opacity fade-out after 70% scroll
    - Call `buildRouteLines(8, 2)` on mount and animate them via `animateRouteLines` in `useFrame`
    - Render 12 pulsing location markers using sine-wave scale animation with staggered phase offsets
    - Guard all `useFrame` mutations with null checks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 14.2, 14.3, 21.1, 21.2_

  - [x] 6.4 Implement `TruckModel` component in `components/3d/TruckModel.tsx`
    - Load GLTF from `/models/truck.glb` using `useGLTF` from Drei
    - Animate truck position along a bezier path and rotate wheels synchronized with forward movement
    - Enable shadow casting (`castShadow`)
    - Implement fallback: if GLTF fails to load, render a procedural low-poly box geometry
    - Only load models from `/public/models` (same origin); validate `.glb`/`.gltf` extension
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 18.5, 24.1, 24.3_

  - [x] 6.5 Implement `ServiceIconCanvas` component in `components/3d/ServiceIconCanvas.tsx`
    - Small R3F canvas rendering an animated 3D icon for each service type
    - Support icon types: `'3d-box' | '3d-truck' | '3d-plane' | '3d-ship' | '3d-warehouse' | '3d-tracking'`
    - Wrap in `<Suspense>` with a skeleton fallback
    - _Requirements: 6.4, 18.3_

  - [x] 6.6 Implement `HeroCanvas` component in `components/3d/HeroCanvas.tsx`
    - Create the R3F `<Canvas>` with `PerspectiveCamera`, `SceneLighting`, `GlobeModel`, `TruckModel`, `ParticleField`
    - Cap pixel ratio at `Math.min(window.devicePixelRatio, 2)`
    - Pass `scrollProgress` and `mousePosition` props down to child 3D components
    - Handle WebGL context loss: listen for `webglcontextlost` → show overlay "Reloading 3D scene..."; listen for `webglcontextrestored` → call `renderer.forceContextRestore()` and hide overlay
    - Wrap in `<Suspense>` with a skeleton loader fallback
    - Add `aria-label="Decorative 3D animation"` for accessibility
    - _Requirements: 15.2, 15.3, 16.1, 16.2, 16.3, 18.1, 18.3, 19.1_

- [x] 7. Implement UI section components
  - [x] 7.1 Implement `Navbar` component in `components/layout/Navbar.tsx`
    - Fixed position at top of viewport; display "Hummet Logistics" on the left
    - Render navigation links: Services, About, Stats, Testimonials, Contact
    - Smooth-scroll to section on link click
    - Add semi-transparent dark background + backdrop blur when scrolled past hero (detect via `useScrollProgress` or `window.scrollY > window.innerHeight`)
    - Collapse to hamburger menu on mobile (< 768px)
    - Use semantic `<nav>` element; ensure all links are keyboard-navigable with visible focus indicators
    - _Requirements: 1.1, 11.1, 11.2, 11.3, 11.4, 11.5, 17.4, 19.2, 19.3, 19.4_

  - [x] 7.2 Implement `HeroSection` component in `components/sections/HeroSection.tsx`
    - Full-viewport layout (`100vh`) with absolute-positioned `HeroCanvas` behind text
    - Animate headline words with staggered Framer Motion entrance over 1.2s using `staggeredHeadlineVariants`
    - Display subheadline, two CTA buttons ("Get a Quote" → `#contact`, "Our Services" → `#services`)
    - Show scroll indicator at bottom; fade it out after user scrolls past 10% of hero height
    - Render WebGL fallback video (`/videos/hero-fallback.mp4`, autoplay/muted/loop) when WebGL is unavailable
    - Reduce headline font size by 30% on mobile (< 768px)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 15.2, 15.4, 15.5, 17.5_

  - [x] 7.3 Implement `AnimatedCounter` component in `components/ui/AnimatedCounter.tsx`
    - Use `useInView` with `{ once: true, margin: '-100px' }` to trigger animation exactly once
    - Animate `displayValue` from 0 to `value` over `duration` ms using Framer Motion `animate` with `easeOut`
    - Apply `useTransform(displayValue, Math.round)` so display is always an integer
    - Render `<span>{rounded}{suffix}</span>`
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ]* 7.4 Write property test for `AnimatedCounter`
    - **Property 6: Counter animates exactly once** — after `isInView` becomes true, the counter reaches `value` and does not restart on subsequent renders
    - **Validates: Requirement 8.4**

  - [x] 7.5 Implement `ServicesSection` component in `components/sections/ServicesSection.tsx`
    - Display heading "Our Services"
    - Render 6 `ServiceCard` sub-components in a responsive grid (3 columns desktop, 1 column mobile < 768px)
    - Each `ServiceCard` includes: `ServiceIconCanvas`, title, description, stat
    - Animate each card in with `fadeUpVariants` (0.6s) when it enters the viewport
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 17.1_

  - [x] 7.6 Implement `StatsSection` component in `components/sections/StatsSection.tsx`
    - Display 4 stats in a horizontal layout (2×2 grid on mobile < 768px)
    - Render an `AnimatedCounter` for each stat with the values from `siteConfig.stats`
    - _Requirements: 8.1, 8.2, 8.3, 17.2_

  - [x] 7.7 Implement `AboutSection` component in `components/sections/AboutSection.tsx`
    - Display heading "About Hummet Logistics" and the two paragraphs from Requirement 7.2
    - Animate text in with `fadeInVariants` (0.8s) when section enters viewport
    - Export as default for `dynamic()` import (SSR disabled)
    - _Requirements: 7.1, 7.2, 7.3, 18.2_

  - [x] 7.8 Implement `TestimonialsSection` component in `components/sections/TestimonialsSection.tsx`
    - Display heading "What Our Clients Say"
    - Render 3 testimonial cards with author name, role, company, quote, and 5-star rating
    - Animate each card in with `fadeUpVariants` (0.6s) when it enters viewport
    - Export as default for `dynamic()` import
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 18.2_

  - [x] 7.9 Implement `ContactSection` component in `components/sections/ContactSection.tsx`
    - Display heading "Get in Touch" and contact info (email, phone, address)
    - Render `ContactForm` with 4 fields: Name (required), Email (required + validation), Company (optional), Message (required)
    - Associate all inputs with `<label htmlFor>` attributes
    - Display validation errors with `role="alert"` for screen readers
    - Handle submit: POST to `/api/contact`, disable button + show "Sending..." during pending, show success/error messages
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 19.2, 19.3, 19.6, 19.7_

  - [ ]* 7.10 Write property test for `ContactForm` double-submit prevention
    - **Property 7: No double-submit** — for all `ContactFormData` submissions, the submit button is disabled during the pending state, preventing concurrent submissions
    - **Validates: Design correctness property: "for all ContactFormData submissions, the form is disabled during pending state"**

  - [x] 7.11 Implement `Footer` component in `components/layout/Footer.tsx`
    - Display copyright, Privacy Policy / Terms of Service / Careers links, and LinkedIn/Twitter/Facebook social icons
    - Use semantic `<footer>` element
    - _Requirements: 12.1, 12.2, 12.3, 19.4_

- [x] 8. Implement the API route for contact form
  - Create `app/api/contact/route.ts` as a Next.js Route Handler
  - Validate `name` (non-empty, 1–100 chars), `email` (valid email regex), `message` (non-empty, 10–2000 chars) per Requirement 23
  - Sanitize all inputs: strip HTML tags and script content
  - Implement rate limiting: max 5 submissions per IP per hour (use an in-memory store or `next/headers` + a simple counter)
  - Return 400 with descriptive error on validation failure; 200 on success
  - Never expose API keys in the client bundle
  - _Requirements: 10.5, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6_

  - [ ]* 8.1 Write unit tests for `/api/contact` validation
    - Test: valid submission returns 200
    - Test: missing name returns 400
    - Test: invalid email returns 400
    - Test: message too short (< 10 chars) returns 400
    - Test: HTML injection in name is sanitized
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.6_

- [x] 9. Implement Config Parser and Serializer
  - Create `lib/config/parser.ts` with `parseConfig(json: string): SiteConfig | ConfigError` and `serializeConfig(config: SiteConfig): string`
  - `parseConfig` returns a descriptive error with line/column info on invalid JSON or schema violations
  - `serializeConfig` formats output with 2-space indentation
  - _Requirements: 25.1, 25.2, 25.3_

  - [ ]* 9.1 Write property test for Config round-trip
    - **Property 8: Round-trip consistency** — for all valid `SiteConfig` objects, `parseConfig(serializeConfig(config))` produces an equivalent object
    - **Validates: Requirement 25.4**

- [x] 10. Wire everything together in the root page
  - Update `app/layout.tsx` to load Bricolage Grotesque via `next/font/google` (weights 400, 600, 700; `display: 'swap'`), apply it as a CSS variable, and preload the font
  - Update `app/globals.css` to apply the dark background (`#0a0a0f`), font variable, and `will-change: transform` utility class
  - Update `app/page.tsx` to compose all sections per the design document's example usage:
    - Import `HeroSection`, `ServicesSection`, `StatsSection`, `ContactSection` directly
    - Lazy-load `AboutSection` and `TestimonialsSection` via `dynamic()` with `ssr: false`
    - Pass `siteConfig` data to each section
    - Wrap the page in a `<main>` semantic element
  - Wire `useScrollProgress` and `useMouseParallax` in `HeroSection` and pass values to `HeroCanvas`
  - _Requirements: 1.3, 1.4, 1.5, 18.2, 19.4, 20.1, 20.2, 20.3, 20.4_

- [x] 11. Checkpoint — Full integration verification
  - Run `npm run build` to confirm no TypeScript or build errors
  - Run `vitest --run` to confirm all property tests and unit tests pass
  - Verify the page compiles and all dynamic imports resolve without SSR errors
  - Ask the user if any questions arise before final review.

- [x] 12. Accessibility and performance audit
  - [x] 12.1 Audit all interactive elements for keyboard navigation and visible focus indicators (2px solid outline)
    - Check: Navbar links, CTA buttons, hamburger menu, form inputs, submit button, footer links
    - _Requirements: 19.2, 19.3_

  - [x] 12.2 Verify semantic HTML structure
    - Confirm `<nav>`, `<main>`, `<section>`, `<footer>`, `<form>` elements are used correctly
    - Confirm all 3D canvases have `aria-label="Decorative 3D animation"`
    - _Requirements: 19.1, 19.4_

  - [x] 12.3 Verify font loading configuration
    - Confirm `font-display: swap` is applied via `next/font/google` options
    - Confirm font is preloaded in the document `<head>`
    - _Requirements: 20.3, 20.4_

  - [ ]* 12.4 Write property test for hero section height invariant
    - **Property 9: Hero section always 100vh** — for all viewport sizes, the hero section's rendered height equals `window.innerHeight`
    - **Validates: Design correctness property: "for all viewport sizes, the hero section occupies exactly 100vh height"**

- [x] 13. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` to confirm all tests pass
  - Run `npm run lint` to confirm no lint errors
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for full traceability
- Checkpoints (tasks 5, 11, 13) ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The GLTF truck model (`/public/models/truck.glb`) must be provided separately — the `TruckModel` component includes a procedural fallback for development
- All 3D packages must be in `transpilePackages` in `next.config.ts` for Next.js App Router compatibility
- The design document's pseudocode algorithms (globe rotation, scroll progress, route line animation) are the authoritative implementation reference
