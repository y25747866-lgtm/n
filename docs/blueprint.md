# **App Name**: Boss OS

## Core Features:

- Ebook Content Generation: AI-powered generation of ebook content based on topic, type, tone, and length using an LLM. The LLM tool decides when, or if, to incorporate facts into its output.
- Cover Image Generation: AI-driven creation of cover images concurrently with content generation, based on style presets, supporting regeneration and editing features.
- Subscription Management: Gated access to generation features based on subscription status, with trial and paid plan options using `startSubscription(planId)` and `startTrial()` placeholders.
- Unified Progress Modal: Real-time display of content and cover generation progress, ETAs, cancel options, and post-completion product package preview.
- Cover Customizer: Modal interface for editing generated covers with text blocks, background options, typography presets, and color accent pickers using `renderCover()` placeholder.
- Trending Ideas: Display trend suggestions based on user's topics and input, calling `fetchTrends(topic)` and `generateProductBundle()` to make product generation easy.
- Document Export: Support the exporting and download of generated ebooks, course content in PDF, DOCX, and ZIP formats for **Boss OS**.

## Style Guidelines:

- Dark background: #0B0F19
- Light background: #FFFFFF
- Accent-Gradient-1: linear-gradient(135deg, #3B82F6 0%, #7C3AED 50%, #06B6D4 100%). The equivalent hexadecimal RGB value that serves as the fallback color is #3B82F6.
- Accent-Gradient-2: linear-gradient(135deg, #2563EB 0%, #06B6D4 50%, #34D399 100%).
- Primary font: 'Inter', a grotesque-style sans-serif, is used across the application for a modern rounded aesthetic in both headlines and body text.
- Cards will have a backdrop blur of 8px and a border of 1px solid rgba(255,255,255,0.04) in dark mode and rgba(0,0,0,0.06) in light mode.
- Base spacing: 24px; Mobile spacing: 16px.
- Implement subtle animations for generating new jokes, as well as the Hero CTA's hover.
- Loading animations on buttons and content display for pending API actions.