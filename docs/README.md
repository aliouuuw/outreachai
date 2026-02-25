# OutreachAI Documentation

Welcome to the OutreachAI documentation. This folder contains comprehensive guides for understanding, building, and scaling the OutreachAI platform.

---

## 📚 Documentation Index

### 1. [Project Vision](./PROJECT_VISION.md)
**Purpose**: Strategic overview and product roadmap

**Contents**:
- Executive summary
- Problem statement and solution
- Product pillars and features
- Technical architecture
- Competitive landscape
- Monetization strategy
- Subscription billing + usage limits (SaaS enforcement)
- Success metrics and KPIs
- Risk assessment

**Read this if**: You want to understand the big picture, target market, and business strategy.

---

### 2. [Brand Guidelines](./BRAND_GUIDELINES.md)
**Purpose**: Visual identity and messaging standards

**Contents**:
- Brand essence and personality
- Color palette and usage rules
- Typography system
- Logo guidelines
- UI design patterns
- Animation principles
- Copywriting guidelines
- Voice and tone by channel

**Read this if**: You're designing UI, writing copy, or creating marketing materials.

---

### 3. [API Integrations](./API_INTEGRATIONS.md)
**Purpose**: Third-party API setup and implementation

**Contents**:
- Current integrations (Apify)
- Required integrations (OpenAI, Stripe)
- Planned integrations (Gmail, Lighthouse, etc.)
- Authentication methods
- Rate limits and pricing
- Subscription gating patterns (Stripe → DB → server-side checks)
- Usage metering and quotas
- Code examples
- Environment variables
- Security best practices

**Read this if**: You're implementing API integrations or managing API costs.

---

### 4. [Technical Roadmap](./TECHNICAL_ROADMAP.md)
**Purpose**: Development timeline and implementation plan

**Contents**:
- Current state analysis
- Phase 1: Foundation (Weeks 1-4)
- Phase 2: Core Features (Weeks 5-8)
- Phase 3: Growth Features (Weeks 9-12)
- Database schema
- Subscription gating + quotas milestone
- Code examples
- Performance targets
- Launch checklist

**Read this if**: You're planning development sprints or tracking progress.

---

## 🚀 Quick Start

### For Developers
1. Read [Technical Roadmap](./TECHNICAL_ROADMAP.md) → Phase 1
2. Review [API Integrations](./API_INTEGRATIONS.md) → Setup Instructions
3. Check [Project Vision](./PROJECT_VISION.md) → Technical Architecture

### For Designers
1. Read [Brand Guidelines](./BRAND_GUIDELINES.md) → Visual Identity
2. Review [Project Vision](./PROJECT_VISION.md) → Product Pillars
3. Check existing UI in `/src/app/` for reference

### For Product Managers
1. Read [Project Vision](./PROJECT_VISION.md) → Full document
2. Review [Technical Roadmap](./TECHNICAL_ROADMAP.md) → Success Metrics
3. Check [API Integrations](./API_INTEGRATIONS.md) → Cost Estimates

### For Marketers
1. Read [Brand Guidelines](./BRAND_GUIDELINES.md) → Messaging Framework
2. Review [Project Vision](./PROJECT_VISION.md) → Competitive Landscape
3. Check [Brand Guidelines](./BRAND_GUIDELINES.md) → Voice by Channel

---

## 📋 Project Status (Accurate - Feb 2025)

### ✅ Implemented (What actually works)
- Landing page (`/`) — static marketing with animations
- Features page (`/features`) — static showcase
- Lead Finder page (`/leads`) — UI complete, API works with Apify token
- Apify integration (`/api/leads`) — functional Google Places scraper
- Static email templates — direct/casual/bold in `/leads` modal
- UI component library — Button, Modal, Input, Card, etc.
- Design system — TailwindCSS 4 dark theme
- Documentation — all 5 docs created

### 🔴 Missing (Not implemented - what we need to build)
- Database (PostgreSQL + Drizzle)
- Authentication (better-auth)
- OpenAI integration (real AI email generation)
- Stripe integration (subscriptions, webhooks)
- CRM functionality (lead storage, pipeline, follow-ups)
- Email sending (Gmail/Outlook integration)
- Auth gating (protect `/leads`, enforce quotas)
- Usage metering (plan limits, billing period reset)
- User settings (profile, API keys, preferences)

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Fonts**: Inter, Syne

### Backend
- **Runtime**: Bun
- **Database**: PostgreSQL (planned)
- **ORM**: Drizzle (planned)
- **Auth**: better-auth (planned)

### APIs
- **Lead Scraping**: Apify ✅
- **AI Generation**: OpenAI (planned)
- **Payments**: Stripe (planned)
- **Email**: Gmail API (planned)

---

## 📊 Key Metrics

### Product Metrics
- Lead searches per user
- Emails generated per user
- Copy-to-clipboard rate
- Sequence completion rate

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn rate
- Free → Paid conversion

### User Outcomes
- Average reply rate (target: 30%+)
- Calls booked per user
- Time saved vs manual prospecting

---

## 🎯 Current Priorities

### Week 1
1. Set up PostgreSQL database
2. Implement authentication
3. Create user dashboard
4. Build settings page

### Week 2
1. Integrate OpenAI API
2. Build email generation endpoint
3. Replace static templates
4. Add regenerate functionality

### Week 3
1. Set up Stripe
2. Create checkout flow
3. Implement webhooks
4. Test subscription lifecycle

### Week 4
1. Build CRM foundation
2. Add lead saving
3. Implement pipeline stages
4. Create follow-up reminders

---

## 🔗 Useful Links

### Development
- [Next.js Docs](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Bun Docs](https://bun.sh/docs)

### APIs
- [Apify Docs](https://docs.apify.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Gmail API Docs](https://developers.google.com/gmail/api)

### Design
- [Lucide Icons](https://lucide.dev)
- [Google Fonts](https://fonts.google.com)
- [Coolors Palette](https://coolors.co)

---

## 📝 Contributing

### Documentation Updates
When updating docs, follow these guidelines:
1. Keep language clear and concise
2. Include code examples where relevant
3. Update the "Last Updated" date
4. Increment version number if major changes
5. Cross-reference related documents

### File Structure
```
docs/
├── README.md                 # This file
├── PROJECT_VISION.md         # Strategic overview
├── BRAND_GUIDELINES.md       # Visual identity
├── API_INTEGRATIONS.md       # API setup guides
└── TECHNICAL_ROADMAP.md      # Development plan
```

---

## 🆘 Support

### Questions?
- **Technical**: Check [Technical Roadmap](./TECHNICAL_ROADMAP.md)
- **Design**: Check [Brand Guidelines](./BRAND_GUIDELINES.md)
- **Product**: Check [Project Vision](./PROJECT_VISION.md)
- **APIs**: Check [API Integrations](./API_INTEGRATIONS.md)

### Need Help?
- Review existing documentation first
- Check code comments in `/src/`
- Ask in team chat or create an issue

---

## 📅 Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| README.md | 1.0 | 2025-02-25 |
| PROJECT_VISION.md | 1.0 | 2025-02-25 |
| BRAND_GUIDELINES.md | 1.0 | 2025-02-25 |
| API_INTEGRATIONS.md | 1.0 | 2025-02-25 |
| TECHNICAL_ROADMAP.md | 1.0 | 2025-02-25 |

---

**OutreachAI** — Close More Clients. Without the Grind.
