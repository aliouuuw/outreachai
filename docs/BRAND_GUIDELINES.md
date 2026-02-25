# OutreachAI — Brand Guidelines

## Brand Identity

### Brand Essence
OutreachAI is **sharp, efficient, and unapologetically direct**. We help doers close deals without the fluff.

**Brand Personality**:
- **Confident** — We know our product works
- **No-nonsense** — Cut the jargon, deliver results
- **Empowering** — Built for movers, not talkers
- **Modern** — Cutting-edge tech, zero legacy bloat

**Brand Voice**:
- Direct and conversational
- Results-focused, not feature-focused
- Empathetic to the grind of manual prospecting
- Slightly bold, never arrogant

---

## Visual Identity

### Color Palette

#### Primary Colors
```css
--color-bg: #060910        /* Deep space black */
--color-bg2: #0b0f1a       /* Darker slate */
--color-bg3: #0f1520       /* Medium slate */
--color-bg4: #131927       /* Lighter slate */
--color-border: #1a2235    /* Subtle borders */
```

#### Accent Colors
```css
--color-accent: #6366f1    /* Indigo (primary CTA) */
--color-accent2: #8b5cf6   /* Purple (gradients) */
--color-a78bfa: #a78bfa    /* Light purple (highlights) */
```

#### Text Colors
```css
--color-text: #f0f2f8      /* Primary text (near white) */
--color-muted: #5a6480     /* Secondary text */
--color-muted2: #8892aa    /* Tertiary text */
```

#### Status Colors
```css
--color-green: #10b981     /* Success, positive signals */
--color-red: #ef4444       /* Alerts, negative signals */
--color-amber: #f59e0b     /* Warnings, caution */
```

### Color Usage Rules
- **Backgrounds**: Always use dark palette (#060910 → #131927)
- **CTAs**: Indigo (#6366f1) for primary, gradients for hero sections
- **Highlights**: Purple (#a78bfa) for emphasized text in emails/mockups
- **Signals**: Red for "No Website", Amber for "No Reviews", Green for success states

---

## Typography

### Font Families

#### Headings — Syne
- **Weight**: 700 (Bold), 800 (Extrabold)
- **Usage**: H1, H2, H3, logo, section titles
- **Characteristics**: Geometric, modern, confident
- **Letter Spacing**: -0.03em to -0.05em (tight tracking)

```css
font-family: 'Syne', sans-serif;
font-weight: 800;
letter-spacing: -0.03em;
```

#### Body — Inter
- **Weight**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold)
- **Usage**: Paragraphs, UI text, navigation
- **Characteristics**: Clean, readable, professional
- **Line Height**: 1.6 for body, 1.2 for UI elements

```css
font-family: 'Inter', sans-serif;
font-weight: 400;
line-height: 1.6;
```

#### Monospace — System Mono
- **Usage**: Data tables, terminal UI, technical displays
- **Characteristics**: Fixed-width, technical aesthetic

```css
font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
```

### Type Scale
```css
/* Hero Headlines */
h1: clamp(2.5rem, 6vw, 4.5rem)  /* 40px → 72px */

/* Section Titles */
h2: clamp(1.75rem, 4vw, 3rem)   /* 28px → 48px */

/* Feature Titles */
h3: clamp(1.25rem, 2.5vw, 1.75rem) /* 20px → 28px */

/* Body Text */
p: 1rem (16px)

/* Small UI Text */
small: 0.875rem (14px)

/* Micro Text (labels, tags) */
micro: 0.625rem - 0.75rem (10px - 12px)
```

---

## Logo & Branding

### Logo
**Wordmark**: "OutreachAI"
- Font: Syne Extrabold (800)
- Color: White (#f0f2f8) on dark backgrounds
- Spacing: Tight tracking (-0.02em)
- No icon/symbol — pure wordmark

### Logo Variations
1. **Primary**: White on dark (#060910)
2. **Gradient**: Linear gradient (indigo → purple) for hero sections
3. **Monochrome**: Single color for minimal contexts

### Logo Usage Rules
- Minimum size: 120px width
- Clear space: 20px on all sides
- Never stretch or distort
- Never add drop shadows or effects
- Never place on busy backgrounds

---

## UI Design System

### Design Principles
1. **Brutalist Minimalism** — Clean, functional, zero decoration
2. **High Contrast** — Dark backgrounds, bright accents
3. **Data-First** — Information hierarchy over aesthetics
4. **Terminal Aesthetic** — Inspired by command-line interfaces

### Component Patterns

#### Buttons
**Primary CTA**:
```css
background: #6366f1;
color: white;
padding: 12px 24px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.1em;
border: none;
transition: all 0.2s;
```

**Secondary CTA**:
```css
background: transparent;
color: #f0f2f8;
border: 1px solid #1a2235;
padding: 12px 24px;
```

**Gradient CTA** (Hero sections):
```css
background: linear-gradient(135deg, #6366f1, #8b5cf6);
color: white;
```

#### Cards
```css
background: #0f1520;
border: 1px solid #1a2235;
border-radius: 0px; /* Sharp corners */
padding: 24px;
```

#### Inputs
```css
background: #0f1520;
border: 1px solid #1a2235;
color: #f0f2f8;
padding: 10px 16px;
font-family: 'Inter', sans-serif;
outline: none;
transition: border-color 0.2s;

/* Focus state */
border-color: #6366f1;
```

#### Tags/Badges
```css
/* No Website (Red) */
background: rgba(239, 68, 68, 0.12);
border: 1px solid rgba(239, 68, 68, 0.25);
color: #ef4444;
padding: 4px 12px;
font-size: 10px;
font-weight: 700;
text-transform: uppercase;
border-radius: 100px;
```

---

## Animation & Motion

### Animation Principles
- **Fast & Snappy** — 0.2s - 0.3s transitions
- **Easing**: cubic-bezier(0.22, 0.68, 0, 1) for smooth deceleration
- **Purposeful** — Animations guide attention, not distract

### Key Animations

#### Fade Up (Scroll reveal)
```css
opacity: 0;
transform: translateY(20px);
transition: opacity 0.6s ease, transform 0.6s ease;

/* When visible */
opacity: 1;
transform: translateY(0);
```

#### Hover States
```css
/* Buttons */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

/* Cards */
border-color: rgba(99, 102, 241, 0.4);
```

#### Custom Cursor
- 12px circle following mouse
- Larger glow (80px) with smooth lag
- Color: Indigo (#6366f1)

#### Particle Grid Background
- 120 floating particles
- Connected lines when close (<120px)
- Subtle grid overlay (80px spacing)
- Low opacity (0.035 - 0.12)

---

## Copywriting Guidelines

### Tone of Voice
**Do**:
- Be direct: "Close More Clients. Without the Grind."
- Use active voice: "OutreachAI writes..." not "Emails are written by..."
- Speak to pain points: "3 hours a day on cold outreach"
- Quantify results: "34% reply rate", "12 calls booked"

**Don't**:
- Use jargon: "Leverage synergies", "Best-in-class solutions"
- Be vague: "Improve your outreach" → "Book 4 calls in your first week"
- Oversell: "Revolutionary", "Game-changing", "Disruptive"
- Use corporate speak: "We are pleased to announce..."

### Headline Formulas
1. **Outcome + Benefit**: "Close More Clients. Without the Grind."
2. **Problem + Solution**: "Stop Staring at Blank Screens. Start Booking Calls."
3. **Time Savings**: "3 Hours → 20 Minutes. Same Results."
4. **Contrast**: "Outreach That Converts. Not Spam."

### Call-to-Action (CTA) Copy
**Strong CTAs**:
- "Start for Free →"
- "See How It Works"
- "Get Started — No Card Needed"
- "Book a Demo"

**Weak CTAs** (avoid):
- "Learn More"
- "Click Here"
- "Submit"
- "Continue"

---

## Messaging Framework

### Value Propositions

#### Primary
"OutreachAI writes hyper-personalized cold emails, DMs, and follow-up sequences so you can focus on delivering — not prospecting."

#### Secondary
- "From zero to outreach in minutes"
- "Everything you need to land clients"
- "Outreach that actually gets replies"

### Feature → Benefit Translation

| Feature | Benefit |
|---------|---------|
| AI Email Generator | Stop staring at blank screens |
| Lead Finder | No more manual research |
| Follow-Up Sequences | Never forget a prospect |
| Website Audit | Lead with insight, not a pitch |
| Outreach CRM | Track every deal in one place |

### Social Proof Elements
- "12,400+ Active Users"
- "3.2M+ Emails Generated"
- "34% Average Reply Rate"
- "98% Customer Satisfaction"

---

## Photography & Imagery

### Image Style
- **No stock photos** — Use UI mockups and screenshots
- **Dark mode only** — All interface shots on dark backgrounds
- **High contrast** — Bright text on dark surfaces
- **Minimal** — Focus on data, not decoration

### Mockup Guidelines
- Browser chrome: Dark with colored dots (red, yellow, green)
- URL bar: "app.outreachai.co/generate"
- Content: Real-looking data (names, businesses, metrics)
- Floating effect: Subtle shadow and 10px vertical animation

### Iconography
- **Style**: Emoji-based for warmth (✉️ 🧠 🔁 📱 📞 📊)
- **Fallback**: Lucide React icons for UI elements
- **Size**: 24px - 32px for feature cards
- **Color**: Inherit from parent or accent color

---

## Voice & Messaging by Channel

### Homepage
- **Tone**: Bold, confident, results-driven
- **Focus**: Outcomes (more clients, less time)
- **CTA**: "Start for Free"

### Features Page
- **Tone**: Educational, detailed
- **Focus**: How it works, specific capabilities
- **CTA**: "Start for Free" or "See Pricing"

### Pricing Page
- **Tone**: Transparent, honest
- **Focus**: Value per tier, no hidden fees
- **CTA**: "Get Started Free" (Starter/Pro), "Contact Sales" (Agency)

### Lead Finder (App)
- **Tone**: Technical, terminal-like
- **Focus**: Data, signals, efficiency
- **CTA**: "Execute Scan", "Pitch", "Export Data"

### Email Marketing
- **Tone**: Helpful, educational
- **Focus**: Tips, case studies, product updates
- **CTA**: "Read More", "Try This Feature"

---

## Competitor Differentiation

### What We Are
- **Simple** — 2-minute setup vs 30+ minutes
- **Focused** — Built for service providers, not enterprise sales teams
- **Affordable** — $49/mo vs $99-$299/mo competitors
- **All-in-One** — Lead finder + AI writer + CRM

### What We're Not
- **Not an email deliverability tool** — We generate content, not send bulk emails
- **Not a LinkedIn automation bot** — We write scripts, not automate actions
- **Not enterprise software** — Built for solo/small teams, not 100+ person orgs
- **Not a lead database** — We find leads in real-time, not sell stale lists

---

## Brand Applications

### Website
- Dark background (#060910)
- Animated particle grid
- Custom cursor (indigo circle + glow)
- Scroll-triggered fade-up animations
- Sticky navbar with blur on scroll

### App Interface (Lead Finder)
- Terminal aesthetic
- Monospace fonts for data
- High-density tables
- Signal-based color coding (red, amber, green)
- Minimal chrome, maximum data

### Marketing Materials
- Dark backgrounds with gradient accents
- Large, bold headlines (Syne 800)
- Quantified results (numbers, percentages)
- Real UI screenshots, not illustrations
- Testimonials with initials (JM, SR, DT)

### Social Media
- **Twitter/X**: Short, punchy tips (280 chars)
- **LinkedIn**: Case studies, thought leadership
- **Instagram**: UI screenshots with overlaid stats
- **YouTube**: Screen recordings with voiceover tutorials

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Primary text (#f0f2f8) on dark (#060910) = 15.8:1 ✅
- Muted text (#8892aa) on dark (#060910) = 7.2:1 ✅

### Typography
- Minimum font size: 14px (0.875rem)
- Line height: 1.6 for body text
- Letter spacing: Adjusted for readability

### Keyboard Navigation
- All interactive elements focusable
- Focus states with accent border (#6366f1)
- Skip to content link

### Screen Readers
- Semantic HTML (nav, section, article)
- Alt text for all images
- ARIA labels for icon-only buttons

---

## Brand Don'ts

❌ **Never**:
- Use light mode or white backgrounds
- Add gradients to body text
- Use rounded corners on cards (keep sharp)
- Mix multiple accent colors (stick to indigo/purple)
- Use stock photos of people
- Write long-winded copy
- Promise unrealistic results ("10x your revenue overnight")
- Use Comic Sans or decorative fonts
- Add unnecessary animations or effects

✅ **Always**:
- Keep it dark, sharp, and minimal
- Lead with outcomes, not features
- Use real data in mockups
- Maintain high contrast
- Write like a human, not a corporation
- Test on real users
- Iterate based on feedback

---

## Contact & Resources

**Brand Assets**: `/public/` (logos, icons)
**Design System**: `/src/app/globals.css`
**Component Library**: `/src/components/ui/`

**Questions?** Refer to this guide or ask the design lead.

---

**Last Updated**: 2025-02-25
**Version**: 1.0
