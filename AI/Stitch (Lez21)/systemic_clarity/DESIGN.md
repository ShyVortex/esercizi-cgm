---
name: Systemic Clarity
colors:
  surface: '#fbf8fe'
  surface-dim: '#dcd9de'
  surface-bright: '#fbf8fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f8'
  surface-container: '#f0edf2'
  surface-container-high: '#eae7ed'
  surface-container-highest: '#e4e1e7'
  on-surface: '#1b1b1f'
  on-surface-variant: '#424752'
  inverse-surface: '#303034'
  inverse-on-surface: '#f3f0f5'
  outline: '#727783'
  outline-variant: '#c2c6d4'
  surface-tint: '#005db5'
  primary: '#00488d'
  on-primary: '#ffffff'
  primary-container: '#005fb8'
  on-primary-container: '#cadcff'
  inverse-primary: '#a8c8ff'
  secondary: '#535f70'
  on-secondary: '#ffffff'
  secondary-container: '#d7e3f8'
  on-secondary-container: '#596576'
  tertiary: '#53425c'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c5975'
  on-tertiary-container: '#ebd3f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a8c8ff'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#00468b'
  secondary-fixed: '#d7e3f8'
  secondary-fixed-dim: '#bbc7db'
  on-secondary-fixed: '#101c2b'
  on-secondary-fixed-variant: '#3c4858'
  tertiary-fixed: '#f3dafc'
  tertiary-fixed-dim: '#d6bedf'
  on-tertiary-fixed: '#25152d'
  on-tertiary-fixed-variant: '#52405b'
  background: '#fbf8fe'
  on-background: '#1b1b1f'
  surface-variant: '#e4e1e7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 57px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.25px
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: 0px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: 0px
  headline-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0px
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0.15px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is a refined implementation of modern Material Design 3 principles, specifically tailored for long-form content consumption and community interaction. It targets a broad public audience, prioritizing legibility, accessibility, and cognitive ease. 

The aesthetic is **Corporate / Modern**, utilizing a systematic approach to depth and hierarchy. It evokes a sense of reliability and editorial authority through structured grids, purposeful whitespace, and a disciplined application of color. The interface remains unobtrusive, allowing the author's content to remain the primary focal point while providing a high-performance framework for navigation and engagement.

## Colors
The palette is built upon a professional blue primary tone that provides a trustworthy anchor for actions and branding.

### Light Mode
Surfaces utilize a clean white base (#FFFFFF) with a hierarchy of neutral greys for borders and secondary text. Interaction states follow a tonal palette based on the primary blue, ensuring clear feedback for hover, focus, and pressed states.

### Dark Mode
The dark theme adheres to accessibility standards, avoiding pure black to reduce eye strain. The base layer is #121212, with elevated surfaces at #1E1E1E. Text is capped at #E0E0E0 to maintain a high but comfortable contrast ratio. Primary accents are shifted to a lighter, more vibrant blue to ensure visibility against dark backgrounds.

## Typography
This design system utilizes **Inter** for all roles to ensure maximum legibility and a systematic, utilitarian feel. The hierarchy is strictly enforced:

- **Display & Headlines:** Used for page titles and major sections. These use tighter tracking and heavier weights to create immediate visual impact.
- **Body:** The "Body Large" (16px) is the standard for article content, optimized with a 1.5x line height to ensure comfortable reading of long-form text.
- **Labels:** Used for metadata (dates, categories) and small UI elements. These often utilize medium weights to maintain readability at smaller scales.

## Layout & Spacing
The system is built on a strict **8px grid**, ensuring that all margins, paddings, and component heights are multiples of 8. 

- **Desktop:** A 12-column fluid grid within a 1200px max-width container. Content is centered with 24px gutters.
- **Tablet (768px - 1024px):** A 12-column grid with reduced margins (32px) and 16px gutters.
- **Mobile (<768px):** A 4-column grid with 16px side margins and 16px gutters. 

Vertical rhythm is maintained by using the `lg` (24px) spacing unit between related components and `xxl` (48px) between major sections.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows**, following the Material 3 elevation model:

1.  **Level 0 (Flat):** The main background surface.
2.  **Level 1:** Subtle shadow (1px blur) or a 5% primary color tint. Used for cards in an idle state.
3.  **Level 2:** Distinct shadow (4px blur) used for elevated surfaces like navigation bars or active cards.
4.  **Level 3:** Pronounced shadow (8px blur) used for floating action buttons or dropdown menus.

In Dark Mode, elevation is communicated primarily through surface color lightening rather than shadows. Higher elevation levels use lighter shades of grey to simulate proximity to a light source.

## Shapes
The design system employs a **Rounded** shape language to feel approachable yet structured.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) corner radius.
- **Large Elements (Cards, Modals):** 1rem (16px) corner radius.
- **Extra Large (Hero Sections):** 1.5rem (24px) corner radius.

Consistent rounding across all components reinforces the cohesive, system-led aesthetic.

## Components
### Buttons
Buttons use the primary blue for "Filled" variants. "Outlined" buttons use a 1px border in a neutral-mid tone. All buttons have a minimum height of 48px for touch targets and include a 2px focus ring for keyboard navigation.

### Cards
Elevation cards are the primary container for blog posts. They feature a 1px subtle border in light mode (#E0E0E0) and transition to Level 2 elevation on hover to indicate interactivity.

### Form Inputs
Inputs utilize a "Filled" style with a bottom-only border that transitions to a 2px primary blue line on focus. Labels use the `label-md` style and float above the input when active.

### Skeleton Loading
Skeleton patterns mimic the layout of the final content. Use a subtle shimmering gradient animation (from surface color to a slightly lighter tint) to indicate background loading without jarring transitions.

### Chips & Tags
Small, 32px height rounded-pill containers used for article categories. They use a low-opacity primary tint with `label-md` typography.