# OutreachAI — Project Vision & Strategy

## Executive Summary

**OutreachAI** is an AI-powered lead generation and outreach platform designed specifically for agency owners, freelancers, and solo operators who sell services (marketing, web/SEO, automation, AI services) and need to scale client acquisition without the manual grind of prospecting.

The platform combines intelligent lead discovery with AI-generated, hyper-personalized outreach content across multiple channels (email, DMs, calls) to help users book more qualified discovery calls and close more clients.

---

## Core Vision

### Problem Statement
Agencies and freelancers spend 3-5 hours daily on manual prospecting:
- Researching potential clients
- Writing personalized cold emails
- Following up multiple times
- Managing outreach across different channels
- Tracking responses and pipeline stages

This creates a bottleneck: **time spent prospecting = time not spent delivering client work**.

### Solution
OutreachAI automates the entire outreach workflow:
1. **Intelligent Lead Discovery** — Find high-intent prospects with specific pain points (no website, low reviews, poor ratings)
2. **AI Content Generation** — Create hyper-personalized emails, DMs, and scripts in seconds
3. **Multi-Touch Sequences** — Build complete 5-email follow-up sequences with different angles
4. **Lightweight CRM** — Track prospects, stages, and follow-up reminders in one clean dashboard

### Target Audience
- **Primary**: Agency owners and freelancers selling services to SMBs (marketing services, SEO, web design, automation, AI services)
- **Secondary**: Small teams doing outbound for B2B offers
- **Verticals**: Marketing agencies, AI automation agencies, web/SEO agencies, consultants, local service lead gen

---

## Product Pillars

### 1. Lead Finder (Data Matrix Terminal)
**Status**: 🟡 **Partially functional** — UI complete, API works with valid Apify token, but no auth gating, no DB save, no quotas

**Purpose**: Discover high-intent local businesses with specific pain points

**Features**:
- Location-based search (city, state, region)
- Industry filtering (14+ categories: restaurants, dental, law firms, etc.)
- Signal-based filtering:
  - **No Website** — businesses without online presence
  - **No Reviews** — businesses with zero Google reviews
  - **Low Rating** — businesses with <3.5 star ratings
  - **All** — unfiltered results
- Real-time scraping via Apify Google Places API
- Export to CSV for external use
- Save/bookmark promising leads
- Direct link to Google Maps listing

**Technical Implementation**:
- Backend: Next.js API route (`/api/leads`)
- Data Source: Apify Client (`compass/crawler-google-places` actor)
- Max scrape depth: 60 places per search
- Filters applied server-side and client-side

### 2. Cold Email Generator
**Status**: 🔴 **Not implemented** — Static templates only in `/leads` page, NO AI generation

**Purpose**: Generate hyper-personalized cold emails based on prospect research

**Features**:
- URL-based analysis (paste prospect's website)
- AI reads website copy, identifies gaps and pain points
- Generates:
  - Subject line
  - Personalized opener with specific hook
  - Value proposition
  - Clear CTA
- Tone adjustment: Professional, Casual, Bold
- One-click regenerate for variations
- Copy-to-clipboard functionality

**Planned Enhancements**:
- Actual AI integration (OpenAI GPT-4, Claude, or Gemini)
- Website scraping and analysis
- Pain point extraction from reviews
- A/B testing subject lines

### 3. Follow-Up Sequences
**Status**: � **Not implemented** — Mockup on homepage only, no functionality

**Purpose**: Build complete multi-touch email sequences

**Features**:
- 5-email sequence generation in one go
- Each email uses different persuasion angle:
  1. Cold intro — pain + hook
  2. Value add — free tip or insight
  3. Social proof — case study
  4. New angle — different pain point
  5. Breakup email — urgency/scarcity
- Suggested send timing (Day 0, 2, 5, 9, 14)
- Tone adapts based on sequence position

**Planned Enhancements**:
- Sequence templates by industry
- Automated scheduling integration
- Reply detection and auto-pause

### 4. Website Audit Outreach
**Status**: � **Not implemented** — Mockup on features page only

**Purpose**: Lead with insight, not a pitch

**Features**:
- Automated website scoring across:
  - Page speed (mobile/desktop)
  - SEO score
  - Trust signals (reviews, testimonials, SSL)
  - Copy clarity
- Generates outreach email based on weakest areas
- Positions sender as expert consultant
- 3-5x higher conversion than generic emails

**Planned Enhancements**:
- Lighthouse API integration
- SEO audit via Screaming Frog or similar
- Screenshot capture of issues
- PDF report generation

### 5. Outreach CRM
**Status**: � **Not implemented** — Mockup on features page only, no DB storage, no pipeline tracking

**Purpose**: Never lose track of a lead

**Features**:
- Pipeline view with drag-and-drop stages:
  - Sent
  - Opened
  - Replied
  - Call Booked
  - Closed Won/Lost
- Automatic follow-up reminders
- One-click access to all emails sent
- Reply tracking and open rate visibility
- Search and filter by status, date, industry

**Planned Enhancements**:
- Email integration (Gmail, Outlook)
- Webhook support for Zapier/Make
- Team collaboration features
- Activity timeline per prospect

### 6. Multi-Channel Scripts
**Status**: 🟡 Planned

**Additional Features**:
- **DM Scripts**: LinkedIn, Instagram, Twitter
- **Call Scripts**: Full opener-to-close cold call scripts
- **Loom Video Scripts**: 60-second personalized video outlines
- **Icebreaker Engine**: Unique first-line hooks
- **Subject Line Generator**: 10 variations scored for open rate
- **Review Pain Miner**: Scrape Google reviews for complaints

---

## Technical Architecture

### Current Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **Runtime**: Bun (preferred by user)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Fonts**: Inter (body), Syne (headings)
- **Data Source**: Apify Client (Google Places scraper)

### Required Integrations

#### Phase 1 (MVP)
1. **Apify API** ✅ — Lead scraping (Google Places)
2. **OpenAI API** 🔴 — Email generation, content writing
3. **Stripe** 🔴 — Payment processing

#### Phase 2 (Growth)
4. **Gmail API** 🔴 — Email sending, reply tracking
5. **Outlook API** 🔴 — Email sending for Microsoft users
6. **Lighthouse API** 🔴 — Website performance audits
7. **Clearbit/Hunter.io** 🔴 — Email enrichment and verification

#### Phase 3 (Scale)
8. **Zapier/Make** 🔴 — Workflow automation
9. **Slack** 🔴 — Team notifications
10. **HubSpot/Salesforce** 🔴 — CRM sync
11. **LinkedIn API** 🔴 — Profile scraping, DM automation (if allowed)
12. **Twilio** 🔴 — SMS follow-ups

### Database Requirements
**Status**: 🔴 Not implemented

**Needed Tables**:
- `users` — User accounts, subscription tier, API keys
- `leads` — Saved leads from searches
- `campaigns` — Outreach campaigns
- `emails` — Generated emails, sequences
- `activities` — Tracking (sent, opened, replied, clicked)
- `templates` — User-created email templates
- `settings` — User preferences, tone, signature

**Recommended Stack**:
- PostgreSQL (via Supabase or Neon)
- Drizzle ORM (aligns with user's tech preferences)
- Prisma (alternative)

### Authentication
**Status**: 🔴 Not implemented

**Recommended**:
- better-auth (email/password, optional OAuth providers)
- OAuth: Google, Microsoft (optional via better-auth)
- Magic link email login
- API key management for integrations

---

## User Journey

### Onboarding Flow
1. **Sign Up** → Email or OAuth
2. **Define Your Offer** → What you do, who you help, what makes you different
3. **Connect Integrations** → Gmail (optional), Apify token
4. **First Search** → Find 10-20 leads in your niche
5. **Generate First Email** → AI writes personalized outreach
6. **Send & Track** → Copy email, send manually or via integration

### Core Workflow
1. **Search for Leads** → Use Lead Finder with location + industry + filters
2. **Review Results** → Sort by signals (no website, low rating, etc.)
3. **Generate Outreach** → Click "Pitch" → AI generates email based on tone
4. **Copy & Send** → Copy to clipboard → Send via Gmail/Outlook
5. **Track in CRM** → Lead moves to "Sent" stage
6. **Follow Up** → Generate sequence, send follow-ups on schedule
7. **Book Call** → Prospect replies → Move to "Call Booked"
8. **Close Deal** → Move to "Closed Won"

---

## Monetization Strategy

### Pricing Tiers (as shown on homepage)

#### Starter — $0/month
- 25 AI-generated messages/month
- Cold email generator
- Basic icebreakers
- 1 active sequence
- **Target**: Freelancers testing the platform

#### Pro — $49/month ⭐ (Recommended)
- Unlimited AI messages
- All message types (email, DM, call)
- Full sequence builder
- Outreach CRM included
- Priority support
- **Target**: Active freelancers and small agencies

#### Agency — $149/month
- Everything in Pro
- Up to 10 team seats
- Client workspaces (white-label)
- White-label exports
- Dedicated account manager
- **Target**: Agencies managing multiple clients

### Subscription Billing & Usage Limits (SaaS Enforcement)

OutreachAI is intended to be a **self-serve SaaS**: users sign up, subscribe monthly, and use the site immediately.

**Billing (Stripe Subscriptions)**:
- Checkout uses Stripe **subscription mode** (Starter/Pro/Agency).
- Webhooks keep the app authoritative about access:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- The application stores and checks per-user fields like:
  - `subscription_tier` (starter | pro | agency)
  - `subscription_status` (active | past_due | canceled)
  - `stripe_customer_id`

**How usage is limited** (quotas + rate limits):
- **Server-side gating**: every paid-cost API route (Apify scraping, AI generation, enrichment) enforces plan + quota before doing work.
- **Usage metering**: each billable action increments counters in the database (e.g. lead searches, leads returned, AI messages generated).
- **Monthly reset**: quotas reset on the billing period (recommended) or calendar month (simpler).
- **Rate limiting**: add per-user throttles to prevent abuse even on “unlimited” plans.

**What gets metered** (minimum viable):
- Lead searches per month
- Leads returned per month (important for Apify cost control)
- AI messages generated per month

### Revenue Projections
- **Year 1 Goal**: 500 paying users (mix of Pro/Agency)
- **MRR Target**: $25K-$35K
- **Churn Target**: <5% monthly

---

## Competitive Landscape

### Direct Competitors
1. **Instantly.ai** — Email outreach automation, higher price point
2. **Lemlist** — Cold email + LinkedIn automation
3. **Reply.io** — Multi-channel outreach sequences
4. **Smartlead** — AI email writer + deliverability focus

### Differentiation
- **Lead Finder Built-In** — Competitors require external lead lists
- **Local Business Focus** — Optimized for service providers targeting local businesses
- **Simpler Pricing** — No per-seat or per-email charges
- **Faster Setup** — 2 minutes vs 30+ minutes for competitors
- **Better UX** — Modern, clean interface vs cluttered dashboards

---

## Success Metrics (KPIs)

### Product Metrics
- **Lead Search Volume** — Searches per user per month
- **Email Generation Rate** — Emails generated per user per month
- **Copy Rate** — % of generated emails actually copied
- **Sequence Completion** — % of users who build full 5-email sequences

### Business Metrics
- **MRR** — Monthly recurring revenue
- **Churn Rate** — % of users canceling per month
- **LTV:CAC Ratio** — Lifetime value vs customer acquisition cost
- **Activation Rate** — % of signups who generate first email within 7 days
- **Conversion Rate** — Free → Paid conversion %

### User Outcomes
- **Reply Rate** — Average % of emails getting replies (target: 30%+)
- **Calls Booked** — Average calls booked per user per month
- **Time Saved** — Hours saved vs manual prospecting (target: 10+ hours/week)

---

## Roadmap

### Phase 1: MVP (Current → 3 months)
- ✅ Lead Finder with Apify integration
- 🔴 OpenAI integration for email generation
- 🔴 User authentication (better-auth)
- 🔴 Database setup (PostgreSQL + Drizzle)
- 🔴 Stripe payment integration
- 🔴 Basic CRM (save leads, track status)

### Phase 2: Growth (3-6 months)
- 🔴 Email sequences (5-touch automation)
- 🔴 Website audit feature (Lighthouse integration)
- 🔴 Gmail/Outlook integration for sending
- 🔴 Reply tracking and open rates
- 🔴 Team collaboration (Agency tier)
- 🔴 Template library

### Phase 3: Scale (6-12 months)
- 🔴 LinkedIn DM automation
- 🔴 Call script generator
- 🔴 Loom video script generator
- 🔴 Review mining (Google, Yelp)
- 🔴 Zapier/Make integration
- 🔴 Mobile app (React Native)
- 🔴 White-label solution for agencies

---

## Risk Assessment

### Technical Risks
- **API Rate Limits** — Apify, OpenAI have usage caps
- **Email Deliverability** — Spam filters may block automated emails
- **Data Accuracy** — Scraped data may be outdated or incomplete

**Mitigation**:
- Implement rate limiting and queuing
- Educate users on email best practices
- Validate and enrich data with multiple sources

### Business Risks
- **Competition** — Established players with larger budgets
- **Market Saturation** — Cold email fatigue among prospects
- **Regulatory** — GDPR, CAN-SPAM compliance

**Mitigation**:
- Focus on niche (local business outreach)
- Emphasize personalization over volume
- Build compliance features (unsubscribe, data deletion)

### User Risks
- **Low Activation** — Users sign up but don't generate first email
- **High Churn** — Users cancel after 1-2 months

**Mitigation**:
- Onboarding email sequence with tutorials
- In-app guidance and tooltips
- Success stories and case studies

---

## Next Steps

### Immediate Priorities
1. **Set up database** — PostgreSQL + Drizzle ORM
2. **Implement authentication** — better-auth (email/password, optional OAuth)
3. **Integrate OpenAI API** — Email generation with GPT-4
4. **Build CRM foundation** — Save leads, track stages
5. **Add Stripe** — Payment processing for Pro/Agency tiers

### Week 1 Tasks
- [ ] Create database schema (users, leads, campaigns, emails)
- [ ] Set up Supabase or Neon PostgreSQL instance
- [ ] Install and configure better-auth
- [ ] Create protected routes for authenticated users
- [ ] Build user settings page (API keys, preferences)

### Week 2 Tasks
- [ ] Integrate OpenAI API for email generation
- [ ] Build email generation UI (replace mockup)
- [ ] Implement tone selection (direct, casual, bold)
- [ ] Add regenerate functionality
- [ ] Test with real prospect data

### Week 3-4 Tasks
- [ ] Build CRM dashboard
- [ ] Implement lead saving from search results
- [ ] Add pipeline stages and drag-and-drop
- [ ] Create follow-up reminder system
- [ ] Integrate Stripe for subscription management

---

## Conclusion

OutreachAI has a clear product-market fit opportunity in the **AI-powered outreach automation** space, specifically targeting **service-based freelancers and agencies** who need to scale client acquisition.

The platform's unique combination of **intelligent lead discovery** + **AI content generation** + **lightweight CRM** positions it as a complete solution rather than just another email tool.

With the right execution on technical integrations (OpenAI, Stripe, email APIs) and a focus on user activation and retention, OutreachAI can capture a meaningful share of the $500M+ sales automation market.
