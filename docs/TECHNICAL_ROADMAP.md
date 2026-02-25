# OutreachAI — Technical Roadmap

## Current State Analysis (Accurate Audit - Feb 2025)

### ✅ Implemented Features
- **Landing page** (`/`) — Static marketing page with animations, pricing tiers, testimonials
- **Features page** (`/features`) — Static showcase with mockups, no real functionality
- **Lead Finder page** (`/leads`) — Full UI with search form, results table, filters, CSV export, pitch modal
- **Apify integration** (`/api/leads`) — Working API route that calls Google Places scraper (requires API_TOKEN env var)
- **Email templates** — Static templates in `/leads` (direct/casual/bold tones), NOT AI-generated
- **UI components** — Button, Modal, Input, Card, Badge, Chip components in `/src/components/ui`
- **Design system** — TailwindCSS 4 with custom dark theme (colors, fonts in globals.css)

### 🔴 Missing Critical Components (What the docs incorrectly claimed was "partial")
- **Database** — No PostgreSQL, no Drizzle, no user/leads/usage tables
- **Authentication** — No better-auth, no login/signup, no session management
- **OpenAI integration** — No AI email generation (static templates only)
- **Stripe integration** — No checkout, no subscriptions, no webhooks
- **CRM functionality** — No saved leads to DB, no pipeline tracking, no follow-up reminders
- **Email sending** — No Gmail/Outlook integration, users must copy/paste manually
- **Auth gating** — `/leads` is publicly accessible, no quota enforcement
- **Usage metering** — No counters, no plan limits, no billing period tracking
- **User settings** — No profile, no preferences, no API key management

---

## Phase 1: Foundation (Weeks 1-4)

### Week 1: Database & Auth Setup

#### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  api_keys JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  industry VARCHAR(100),
  website TEXT,
  rating DECIMAL(2,1),
  reviews_count INTEGER,
  maps_url TEXT,
  place_id VARCHAR(255),
  signals JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  saved_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  location VARCHAR(100),
  filter_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  subject VARCHAR(500),
  body TEXT,
  tone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  replied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sequences table
CREATE TABLE sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  emails JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_usage_user_id ON usage(user_id);
CREATE INDEX idx_usage_created_at ON usage(created_at);
```

#### Tasks
- [ ] Set up PostgreSQL database (Supabase or Neon)
- [ ] Install Drizzle ORM: `bun add drizzle-orm postgres`
- [ ] Create schema file: `/src/db/schema.ts`
- [ ] Set up migrations: `bun add -D drizzle-kit`
- [ ] Run initial migration
- [ ] Create database connection utility: `/src/db/index.ts`

#### Subscription Gating + Quotas (Required for SaaS)

If OutreachAI is going to charge monthly subscriptions, the app must enforce **plan access + usage limits** on the server before any paid-cost APIs are called.

**Add subscription fields** (users table):
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_tier` (starter | pro | agency)
- `subscription_status` (active | past_due | canceled)
- `current_period_start`, `current_period_end`

**Add usage counters** (recommended: per user per period):
- `lead_searches_used`
- `leads_returned_used`
- `ai_messages_used`

Implementation tasks:
- [ ] Create plan limits mapping in code (single source of truth)
- [ ] Add middleware/route protection for app routes (require auth for `/leads`, `/dashboard`, generation endpoints)
- [ ] Build a server-side guard utility to check `subscription_status` + quotas before calling Apify/OpenAI
- [ ] Record usage after each successful call (atomic increment)
- [ ] Implement reset logic based on Stripe billing period (recommended)
- [ ] Add rate limiting (per user) for abuse prevention

#### Authentication
- [ ] Install better-auth: `bun add better-auth`
- [ ] Configure email/password provider (or OAuth if needed)
- [ ] Create auth API routes: `/src/app/api/auth/[...route]`
- [ ] Add session middleware
- [ ] Create protected route wrapper
- [ ] Build login/signup pages

---

### Week 2: OpenAI Integration

#### Email Generation Service
```typescript
// /src/lib/ai/email-generator.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateColdEmail(params: {
  prospectName: string;
  businessName: string;
  industry: string;
  painPoint: string;
  userOffer: string;
  tone: 'direct' | 'casual' | 'bold';
}) {
  const systemPrompt = `You are an expert cold email copywriter specializing in B2B outreach for service providers.
  
  Rules:
  - Keep emails under 150 words
  - Start with a personalized hook
  - Focus on ONE specific pain point
  - Include a clear, low-friction CTA
  - Never use generic phrases like "I hope this email finds you well"
  - Match the requested tone exactly`;

  const userPrompt = `Write a cold email to ${params.prospectName} at ${params.businessName}.
  
  Context:
  - Industry: ${params.industry}
  - Pain point: ${params.painPoint}
  - My offer: ${params.userOffer}
  - Tone: ${params.tone}
  
  Generate:
  1. Subject line (under 50 characters)
  2. Email body (under 150 words)`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 600,
  });

  const content = response.choices[0].message.content;
  
  // Parse response to extract subject and body
  const [subject, ...bodyParts] = content.split('\n\n');
  const body = bodyParts.join('\n\n');
  
  return {
    subject: subject.replace('Subject: ', '').trim(),
    body: body.trim(),
    tokensUsed: response.usage?.total_tokens || 0,
  };
}
```

#### Tasks
- [ ] Install OpenAI SDK: `bun add openai`
- [ ] Create email generation service
- [ ] Build API endpoint: `/src/app/api/generate/email/route.ts`
- [ ] Add rate limiting (10 requests/minute per user)
- [ ] Track token usage in database
- [ ] Implement caching for similar requests
- [ ] Add regenerate functionality
- [ ] Build subject line variations generator

---

### Week 3: User Dashboard & Settings

#### Dashboard Layout
```
/dashboard
  ├── /overview        # Stats, recent activity
  ├── /leads           # Saved leads, CRM view
  ├── /campaigns       # Active campaigns
  ├── /emails          # Generated emails, sequences
  └── /settings        # API keys, preferences, billing
```

#### Tasks
- [ ] Create dashboard layout component
- [ ] Build overview page with stats
- [ ] Implement leads CRM view
- [ ] Add drag-and-drop pipeline stages
- [ ] Create settings page
- [ ] Add API key management
- [ ] Build user preferences form
- [ ] Implement profile editing

---

### Week 4: Stripe Integration

#### Subscription Flow
```typescript
// /src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const PLANS = {
  starter: { priceId: 'price_starter', amount: 0 },
  pro: { priceId: 'price_pro', amount: 4900 },
  agency: { priceId: 'price_agency', amount: 14900 },
};

export async function createCheckoutSession(
  userId: string,
  plan: keyof typeof PLANS
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    client_reference_id: userId,
    metadata: { userId, plan },
  });
  
  return session;
}
```

#### Tasks
- [ ] Create Stripe account
- [ ] Set up products and prices
- [ ] Install Stripe SDK: `bun add stripe`
- [ ] Build checkout API route
- [ ] Implement webhook handler
- [ ] Handle subscription lifecycle events
- [ ] Add billing portal link
- [ ] Create upgrade/downgrade flows
- [ ] Test with Stripe test mode

---

## Phase 2: Core Features (Weeks 5-8)

### Week 5: Email Sequences

#### Tasks
- [ ] Build sequence generator UI
- [ ] Create 5-email sequence prompt
- [ ] Implement sequence preview
- [ ] Add edit/regenerate per email
- [ ] Save sequences to database
- [ ] Build sequence library
- [ ] Add sequence templates

---

### Week 6: Website Audit Feature

#### Tasks
- [ ] Integrate PageSpeed Insights API
- [ ] Build website scraper
- [ ] Create audit scoring algorithm
- [ ] Generate audit-based email prompts
- [ ] Build audit results UI
- [ ] Add PDF export
- [ ] Cache audit results (24hr TTL)

---

### Week 7: Email Sending Integration

#### Tasks
- [ ] Implement Gmail OAuth flow
- [ ] Build email sending service
- [ ] Add email tracking pixels
- [ ] Implement reply detection
- [ ] Create sent emails log
- [ ] Build inbox sync
- [ ] Add unsubscribe handling

---

### Week 8: CRM Enhancements

#### Tasks
- [ ] Add pipeline customization
- [ ] Implement follow-up reminders
- [ ] Build activity timeline
- [ ] Add notes and tags
- [ ] Create bulk actions
- [ ] Implement search and filters
- [ ] Add export to CSV

---

## Phase 3: Growth Features (Weeks 9-12)

### Week 9: Multi-Channel Scripts

#### Tasks
- [ ] Build DM script generator (LinkedIn, Instagram)
- [ ] Create call script generator
- [ ] Add Loom video script generator
- [ ] Build icebreaker engine
- [ ] Implement review mining

---

### Week 10: Team Collaboration (Agency Tier)

#### Tasks
- [ ] Add team member invites
- [ ] Implement role-based permissions
- [ ] Create client workspaces
- [ ] Build activity feed
- [ ] Add team analytics

---

### Week 11: Integrations & Automation

#### Tasks
- [ ] Build Zapier webhooks
- [ ] Add HubSpot sync
- [ ] Implement Slack notifications
- [ ] Create API documentation
- [ ] Build public API

---

### Week 12: Polish & Optimization

#### Tasks
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog or Mixpanel)
- [ ] User onboarding flow
- [ ] Help documentation

---

## Technical Debt & Maintenance

### Code Quality
- [ ] Set up ESLint + Prettier
- [ ] Add TypeScript strict mode
- [ ] Write unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Implement code reviews

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add performance monitoring
- [ ] Implement logging (Winston or Pino)
- [ ] Create health check endpoints
- [ ] Set up uptime monitoring

### Security
- [ ] Add rate limiting (Upstash Redis)
- [ ] Implement CSRF protection
- [ ] Add input validation (Zod)
- [ ] Set up security headers
- [ ] Regular dependency updates
- [ ] Penetration testing

---

## Infrastructure

### Hosting
- **Recommended**: Vercel (Next.js optimized)
- **Alternative**: Railway, Fly.io, AWS

### Database
- **Recommended**: Supabase (PostgreSQL + Auth)
- **Alternative**: Neon, PlanetScale

### File Storage
- **Recommended**: Vercel Blob
- **Alternative**: AWS S3, Cloudflare R2

### Email Delivery
- **Recommended**: Resend
- **Alternative**: SendGrid, Postmark

---

## Performance Targets

### Page Load Times
- Landing page: <2s (LCP)
- Dashboard: <3s (LCP)
- Lead search: <5s (including API call)

### API Response Times
- Email generation: <10s
- Lead search: <15s
- Database queries: <100ms

### Uptime
- Target: 99.9% (8.76 hours downtime/year)
- Monitoring: UptimeRobot or Better Uptime

---

## Launch Checklist

### Pre-Launch
- [ ] Complete MVP features (Phase 1)
- [ ] Test all user flows
- [ ] Set up error tracking
- [ ] Configure analytics
- [ ] Write help documentation
- [ ] Create demo video
- [ ] Set up support email
- [ ] Prepare launch announcement

### Launch Day
- [ ] Deploy to production
- [ ] Test payment flow
- [ ] Monitor error rates
- [ ] Respond to user feedback
- [ ] Post on Product Hunt
- [ ] Share on social media

### Post-Launch (Week 1)
- [ ] Fix critical bugs
- [ ] Respond to support tickets
- [ ] Gather user feedback
- [ ] Iterate on UX issues
- [ ] Monitor conversion rates
- [ ] Adjust pricing if needed

---

## Success Metrics

### Week 1
- 100 signups
- 50 activated users (generated first email)
- 10 paying customers

### Month 1
- 500 signups
- 250 activated users
- 50 paying customers
- $2,500 MRR

### Month 3
- 2,000 signups
- 1,000 activated users
- 200 paying customers
- $10,000 MRR

### Month 6
- 5,000 signups
- 2,500 activated users
- 500 paying customers
- $25,000 MRR

---

**Last Updated**: 2025-02-25  
**Version**: 1.0
