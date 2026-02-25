# OutreachAI — API Integrations Guide

## Overview

This document outlines all required and planned API integrations for OutreachAI, including setup instructions, rate limits, pricing, and implementation priorities.

---

## Current Integrations

### 1. Apify API ✅ (Implemented)

**Purpose**: Scrape Google Places data for lead discovery

**Endpoint**: `compass/crawler-google-places` actor

**Authentication**: API Token (stored in `APIFY_TOKEN` env variable)

**Implementation**:
```typescript
// /src/app/api/leads/route.ts
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

const run = await client.actor('compass/crawler-google-places').call({
  searchStringsArray: [`${industry} in ${location}`],
  maxCrawledPlacesPerSearch: 60,
  language: 'en',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
```

**Rate Limits**:
- Free tier: $5 credit/month
- Paid: Pay-as-you-go ($0.25 per 1000 results)
- Recommended: Start with $20/month budget

**Data Returned**:
```typescript
{
  title: string;           // Business name
  address: string;         // Full address
  city: string;           // City
  phone: string;          // Phone number
  totalScore: number;     // Rating (0-5)
  reviewsCount: number;   // Number of reviews
  categoryName: string;   // Business category
  website: string;        // Website URL
  url: string;           // Google Maps URL
  placeId: string;       // Google Place ID
}
```

**Setup Instructions**:
1. Sign up at https://apify.com
2. Get API token from Settings → Integrations
3. Add to `.env.local`: `APIFY_TOKEN=your_token_here`
4. Test with: `bun run dev` → Navigate to `/leads`

---

## Phase 1: MVP Integrations (Required)

### 2. OpenAI API 🔴 (Not Implemented)

**Purpose**: Generate personalized email content, subject lines, and sequences

**Model Recommendations**:
- **GPT-4o**: Best quality, higher cost ($5/1M input tokens)
- **GPT-4o-mini**: Good balance, lower cost ($0.15/1M input tokens)
- **GPT-3.5-turbo**: Fastest, cheapest ($0.50/1M input tokens)

**Authentication**: API Key

**Proposed Implementation**:
```typescript
// /src/lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmail(params: {
  prospectName: string;
  businessName: string;
  industry: string;
  painPoint: string;
  tone: 'direct' | 'casual' | 'bold';
}) {
  const prompt = `Write a cold email to ${params.prospectName} at ${params.businessName}...`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert cold email copywriter...' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  
  return response.choices[0].message.content;
}
```

**Rate Limits**:
- Tier 1 (Free): 500 requests/day
- Tier 2 ($5+ spent): 5,000 requests/day
- Tier 3 ($50+ spent): 10,000 requests/day

**Cost Estimates** (GPT-4o-mini):
- Per email generation: ~$0.001 (1000 tokens)
- 1000 emails/month: ~$1
- 10,000 emails/month: ~$10

**Setup Instructions**:
1. Sign up at https://platform.openai.com
2. Create API key
3. Add to `.env.local`: `OPENAI_API_KEY=sk-...`
4. Install: `bun add openai`

---

### 3. Stripe API 🔴 (Not Implemented)

**Purpose**: Payment processing, subscription management

**Products to Create**:
- Starter: $0/month (free tier)
- Pro: $49/month
- Agency: $149/month

**Authentication**: Secret Key + Publishable Key

**Proposed Implementation**:
```typescript
// /src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function createCheckoutSession(priceId: string, userId: string) {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    client_reference_id: userId,
  });
}
```

**Webhooks Required**:
- `checkout.session.completed` — Activate subscription
- `customer.subscription.updated` — Handle plan changes
- `customer.subscription.deleted` — Cancel subscription
- `invoice.payment_failed` — Handle failed payments

**Setup Instructions**:
1. Sign up at https://stripe.com
2. Get API keys from Developers → API keys
3. Create products and prices in Dashboard
4. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Install: `bun add stripe`

#### Subscription Gating & Usage Limits (How to enforce access)

Stripe is only the billing system. The app must enforce access and quotas **server-side**.

**Store subscription state in your database** (authoritative source for gating):
- `subscription_tier`: `starter` | `pro` | `agency`
- `subscription_status`: `active` | `past_due` | `canceled`
- `stripe_customer_id`, `stripe_subscription_id`
- `current_period_start`, `current_period_end` (for quota reset)

**Update those fields via Stripe webhooks**:
- `checkout.session.completed` → mark user subscribed, set tier
- `customer.subscription.updated` → tier/status changes, period boundaries
- `customer.subscription.deleted` → mark canceled
- `invoice.payment_failed` → mark past_due (optionally grace period)

#### Usage Metering (What to count)

At minimum, meter the actions that cost you money:
- Apify lead searches
- Apify leads returned (or crawl depth)
- AI generations (emails/sequences)

**Recommended counters** (per user, per billing period):
- `lead_searches_used`
- `leads_returned_used`
- `ai_messages_used`

#### Quotas by Plan (Example)

These should live in code as a single mapping so they’re easy to change:

```ts
type Plan = 'starter' | 'pro' | 'agency';

const PLAN_LIMITS: Record<Plan, {
  leadSearches: number;
  leadsReturned: number;
  aiMessages: number;
}> = {
  starter: { leadSearches: 20, leadsReturned: 200, aiMessages: 25 },
  pro: { leadSearches: 200, leadsReturned: 10_000, aiMessages: 10_000 },
  agency: { leadSearches: 1_000, leadsReturned: 100_000, aiMessages: 100_000 },
};
```

Even if you market “unlimited”, keep a high ceiling + rate limits to protect costs.

#### Server-side Guard Pattern (Before calling Apify/OpenAI)

Enforce on every expensive API route:

```ts
export async function assertWithinPlanLimits(params: {
  userId: string;
  action: 'lead_search' | 'ai_message';
  units: number; // e.g. leads returned, or 1 search
}) {
  // 1) Load user subscription tier/status + current period
  // 2) Load current counters for that period
  // 3) If status not active (or allowed grace), throw 402/403
  // 4) If counter + units exceeds PLAN_LIMITS[tier], throw 429/403 with a clear upgrade message
  // 5) Otherwise, allow the request
}
```

Then in routes like `/api/leads`:
- validate session
- call `assertWithinPlanLimits({ action: 'lead_search', units: 1 })`
- call Apify
- after you get results, call `assertWithinPlanLimits({ action: 'lead_search', units: leads.length })` or update `leadsReturnedUsed` accordingly

#### Rate Limiting (Abuse prevention)

Implement throttles even with quotas:
- per-user: e.g. 10 requests/minute for AI generation
- per-IP (optional): protect unauthenticated endpoints

Practical options:
- Upstash Redis rate limiting
- in-memory (dev only)

Return `429` with a consistent JSON shape:
```json
{ "error": "rate_limited", "message": "Too many requests. Try again in 60 seconds." }
```

---

## Phase 2: Growth Integrations

### 4. Gmail API 🔴 (Planned)

**Purpose**: Send emails, track opens/replies, sync inbox

**OAuth Scopes Required**:
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.modify`

**Implementation**:
```typescript
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Send email
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
await gmail.users.messages.send({
  userId: 'me',
  requestBody: { raw: encodedEmail },
});
```

**Rate Limits**:
- 100 emails/day (new accounts)
- 500 emails/day (established accounts)
- 2000 emails/day (Google Workspace)

**Setup**:
1. Create project in Google Cloud Console
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Install: `bun add googleapis`

---

### 5. Microsoft Graph API (Outlook) 🔴 (Planned)

**Purpose**: Send emails for Outlook/Microsoft 365 users

**OAuth Scopes**:
- `Mail.Send`
- `Mail.Read`
- `Mail.ReadWrite`

**Implementation**:
```typescript
import { Client } from '@microsoft/microsoft-graph-client';

const client = Client.init({
  authProvider: (done) => {
    done(null, accessToken);
  }
});

await client.api('/me/sendMail').post({
  message: {
    subject: 'Subject',
    body: { contentType: 'Text', content: 'Body' },
    toRecipients: [{ emailAddress: { address: 'email@example.com' } }]
  }
});
```

**Setup**:
1. Register app in Azure Portal
2. Add Microsoft Graph permissions
3. Install: `bun add @microsoft/microsoft-graph-client`

---

### 6. Lighthouse API 🔴 (Planned)

**Purpose**: Website performance audits for "Audit Outreach" feature

**Options**:
- **PageSpeed Insights API** (Free, Google-hosted)
- **Self-hosted Lighthouse** (More control)

**Implementation** (PageSpeed Insights):
```typescript
const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${websiteUrl}&category=performance&category=seo`;

const response = await fetch(url);
const data = await response.json();

const scores = {
  performance: data.lighthouseResult.categories.performance.score * 100,
  seo: data.lighthouseResult.categories.seo.score * 100,
};
```

**Rate Limits**:
- 25,000 requests/day (free)
- 400 requests/100 seconds

**Setup**:
1. Enable PageSpeed Insights API in Google Cloud
2. Get API key
3. Add to `.env.local`: `GOOGLE_PAGESPEED_API_KEY=...`

---

### 7. Hunter.io / Clearbit 🔴 (Planned)

**Purpose**: Email enrichment and verification

**Hunter.io**:
- Find email addresses from domain
- Verify email deliverability
- Pricing: $49/month for 1,000 searches

**Clearbit**:
- Company data enrichment
- Logo, employee count, tech stack
- Pricing: $99/month for 2,500 enrichments

**Implementation** (Hunter.io):
```typescript
const response = await fetch(
  `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${process.env.HUNTER_API_KEY}`
);

const data = await response.json();
const emails = data.data.emails;
```

---

## Phase 3: Scale Integrations

### 8. Zapier / Make (Integromat) 🔴 (Planned)

**Purpose**: Workflow automation, CRM sync

**Implementation**: Build webhooks for:
- New lead found
- Email sent
- Reply received
- Call booked

**Webhook Example**:
```typescript
// /src/app/api/webhooks/zapier/route.ts
export async function POST(req: Request) {
  const { event, data } = await req.json();
  
  // Validate webhook signature
  // Trigger Zapier action
  
  return new Response('OK', { status: 200 });
}
```

---

### 9. LinkedIn API 🔴 (Planned - Restricted)

**Purpose**: Profile scraping, connection requests

**⚠️ Warning**: LinkedIn heavily restricts automation
- Official API very limited
- Unofficial scraping violates ToS
- Risk of account suspension

**Alternative**: Generate DM scripts for manual sending

---

### 10. Twilio API 🔴 (Planned)

**Purpose**: SMS follow-ups, phone number verification

**Implementation**:
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: 'Follow-up message',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: '+1234567890',
});
```

**Pricing**:
- $1/month per phone number
- $0.0079 per SMS sent (US)

---

## Environment Variables

### Required for MVP
```bash
# Apify (Lead Scraping)
APIFY_TOKEN=your_apify_token

# OpenAI (Email Generation)
OPENAI_API_KEY=sk-...

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Authentication (better-auth)
BETTER_AUTH_SECRET=random_secret_string
BETTER_AUTH_URL=http://localhost:3000
```

### Optional (Phase 2+)
```bash
# Gmail
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Microsoft
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# Hunter.io
HUNTER_API_KEY=...

# PageSpeed Insights
GOOGLE_PAGESPEED_API_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

---

## Cost Estimates

### Monthly API Costs (1000 active users)

| Service | Usage | Cost |
|---------|-------|------|
| Apify | 50K leads/month | $12.50 |
| OpenAI (GPT-4o-mini) | 100K emails | $100 |
| Stripe | 500 transactions | $0 (fees only) |
| Gmail API | Free | $0 |
| Hunter.io | 10K verifications | $199 |
| PageSpeed | 25K audits | $0 |
| **Total** | | **~$311.50/month** |

**Revenue**: 1000 users × $49 avg = $49,000/month  
**API Cost %**: 0.6% of revenue ✅

---

## Security Best Practices

### API Key Storage
- ✅ Use environment variables (`.env.local`)
- ✅ Never commit to Git (add to `.gitignore`)
- ✅ Rotate keys every 90 days
- ✅ Use separate keys for dev/staging/prod

### Rate Limiting
- Implement request queuing
- Cache API responses where possible
- Show user-friendly error messages
- Retry with exponential backoff

### Error Handling
```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.status === 429) {
    // Rate limit hit
    return { error: 'Too many requests. Please try again in a minute.' };
  }
  if (error.status === 401) {
    // Invalid API key
    return { error: 'API authentication failed. Please check your settings.' };
  }
  // Generic error
  console.error('API Error:', error);
  return { error: 'Something went wrong. Please try again.' };
}
```

---

## Testing & Development

### API Mocking (Development)
Use MSW (Mock Service Worker) for local testing:

```typescript
// /src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/generate-email', () => {
    return HttpResponse.json({
      subject: 'Mock subject line',
      body: 'Mock email body...',
    });
  }),
];
```

### API Monitoring
- Set up alerts for rate limit warnings
- Track API costs daily
- Monitor error rates (>5% = investigate)
- Log all API calls for debugging

---

## Next Steps

### Week 1
- [ ] Set up OpenAI API integration
- [ ] Create email generation endpoint
- [ ] Test with real prospect data
- [ ] Implement error handling

### Week 2
- [ ] Set up Stripe products and prices
- [ ] Build checkout flow
- [ ] Implement webhook handlers
- [ ] Test subscription lifecycle

### Week 3
- [ ] Add Gmail OAuth flow
- [ ] Implement email sending
- [ ] Track sent emails in database
- [ ] Build reply detection

### Week 4
- [ ] Integrate PageSpeed Insights
- [ ] Build website audit feature
- [ ] Generate audit-based emails
- [ ] Test end-to-end flow

---

**Last Updated**: 2025-02-25  
**Version**: 1.0
