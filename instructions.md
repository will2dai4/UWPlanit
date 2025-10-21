# Waterloo Course Graph & Planner — **AI-Implementation Blueprint v2 (Hardened)**

**Objective.** Ship a **launch-ready**, _profitable_ freemium web app for University of Waterloo students that

1. visualizes **every UW course** as an interactive dependency graph, and
2. provides a **premium planner** workspace guarded by _soft_ anti-sharing.

> **Pricing (v1):** CAD $ 2.99 / month · CAD $ 12.99 lifetime  
> **Target API:** UW Open Data v3 (API-key auth)  
> **Hosting Goal:** lowest-cost viable (Serverless / VPS)  
> **Accessibility:** no formal WCAG target, but **i18n** & **PWA** offline mode  
> **Primary KPI:** conversion rate (free → premium); secondary = viral share metric

---

## 0 Stack Summary ⚙️

| Layer              | Primary Tech                                         | Hardened Add-Ons / Rationale                                                    |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| **UI / SPA**       | **Next.js 18**                                       | `next-pwa` (offline/install prompt) · WebGL fallback via **@react-three/fiber** |
| State Mgmt         | Zustand + Context                                    | unchanged                                                                       |
| Styling & Motion   | Tailwind CSS + Framer Motion                         | validated **320 → 1920 px**                                                     |
| Graph Renderer     | **visx** _(pre-computed coords)_; WebGL fallback     | nightly layout: Graphology + ForceAtlas2                                        |
| API Layer          | **tRPC**                                             | per-IP rate-limit middleware                                                    |
| Auth SaaS          | **Auth0**                                            | CASL double-opt-in flag (GDPR/CASL)                                             |
| Database           | **Supabase Postgres** + **Redis Edge Cache**         | `./ops/promote_db.sh` upgrade script                                            |
| Static Course Data | Supabase Storage                                     | versioned; plus `graph_layout.json`                                             |
| Payments           | **Stripe + Stripe Tax**                              | downgrade/failed-payment cron; GST/HST collection                               |
| Hosting            | **Vercel** (web) + **Railway** (export worker queue) | isolate CPU-intensive PDF/PNG export                                            |
| CI/CD              | GitHub Actions + Turborepo                           | Playwright mobile matrix                                                        |
| Observability      | **Sentry** (error APM) + **Grafana Cloud**           | Slack alert channel                                                             |
| Analytics          | **Plausible** (self-host)                            | referral & cohort plug-ins                                                      |

---

## 1 Data Pipeline 🗄️

```mermaid
graph TD
    A[UW API v3] -->|nightly, throttled| B[Raw JSON Cache (Supabase)]
    B --> C[Transform · Parse (NLP + regex)]
    C -->|validate schema| D[Course Table]
    D -->|edge build| E[Graphology Layout]
    E --> F[graph_layout.json]
    C --> G[courses-YYYYMMDD.json]
```

| Step                  | Schedule          | Action                                                   | Notes                                       |
| --------------------- | ----------------- | -------------------------------------------------------- | ------------------------------------------- |
| **Fetch**             | nightly 00:30 UTC | Pull _diff-patch_ with `If-None-Match` + retry (3×, 5 s) | Protects against 429s                       |
| **Normalize & Parse** | same job          | NLP → tokens → arrays (logs failures)                    | Insert parse failures into `parse_failures` |
| **Persist Raw**       | same job          | Store versioned JSON in Supabase                         | Keep last 30 days                           |
| **Layout Compute**    | same job          | ForceAtlas2 → fixed node coords                          | Output `graph_layout.json`                  |
| **Cache Invalidate**  | webhook           | Purge Vercel + Redis keys                                | < 60 s propagation                          |

---

## 2 Application Features & Flows 🖥️📱

### 2.1 Public (Free) Tier

1. **Homepage** → Hero, demo graph, _Add-to-Home-Screen_ banner (PWA).
2. **Interactive Course Graph**
   - Uses **pre-computed** coords; WebGL fallback if Canvas slow.
   - Fuse.js fuzzy search · department filter chips.
3. **Course Drawer**
   - Details, terms offered, **license footer** (API terms).
   - Tabs: _Prereqs | Coreqs | Antireqs_ (deep-links jump).

### 2.2 Premium Tier

1. **Planner Canvas** (drag-n-drop per term).
   - Requisite validation (green/red).
   - Auto-save to DB, Redis session cache.
2. **Export Queue** → Railway worker renders PDF/PNG (Chromium).
3. **Multi-Device Sync**:
   - Soft cap = 2 active tokens.
   - **Heuristic** detects unusually distant IPs + OTP challenge.

### 2.3 Auth & On-boarding

- Routes: `/auth/*`. Email verification mandatory.
- Double-opt-in checkbox for marketing (email drip).

### 2.4 Billing

- Stripe Product: `waterloo_planner`.
- Plans: monthly/yearly (Stripe Tax auto-calc GST/HST).
- Webhook handles: `invoice.paid` → upgrade, `invoice.payment_failed` → grace → auto-downgrade (read-only).

### 2.5 Marketing Growth

- **Referral deep-link** (`/r/:code`) adds query param to signup.
- Drip email sequence via Stripe + Brevo.

---

## 3 Ops & Observability 🔍

| Concern     | Tooling                          | Alert Policy                           |
| ----------- | -------------------------------- | -------------------------------------- |
| Errors      | **Sentry**                       | P1: new uncaught error → Slack #alerts |
| Performance | Grafana Cloud (Prom + Loki)      | p95 > 1 s for `/api/graph`             |
| Admin       | Minimal portal (Next.js / Clerk) | view users, plans, parse errors        |

---

## 4 Database Schema (Postgres +x Redis) 🗃️

```sql
-- users
ALTER TABLE users
  ADD COLUMN marketing_opt_in boolean DEFAULT false;

-- parse failure log
CREATE TABLE IF NOT EXISTS parse_failures (
  id serial PRIMARY KEY,
  raw_text text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- referrals
CREATE TABLE IF NOT EXISTS referrals (
  code text PRIMARY KEY,
  referrer_uuid uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);
```

_(Original `plans`, `device_sessions`, `course_files` tables unchanged.)_

---

## 5 Capacity & Scalability 📈

- **Redis** cache (`graph_layout`, user plans) — 200 MB free tier.
- Supabase upgrade script promotes to _Small_ (2 vCPU, 8 GB) when row count > 5 M.
- Web export worker isolated on Railway; autoscale 0 → 1 on queue depth.

---

## 6 Testing & CI ✅

- **Playwright**: desktop (Chromium/Firefox/Safari) + mobile (iPhone 12, Pixel 7).
- Lighthouse PWA & a11y budget (`score ≥ 90`) gate.
- Unit coverage ≥ 80 % (Vitest).

---

## 7 Compliance 📜

- **Licence footer** credits UW Open Data.
- **CASL/GDPR**: double-opt-in, unsubscribe link.
- Collect GST/HST for Canadian users via Stripe Tax.

---

### Launch Checklist (excerpt)

- [ ] Nightly cron passed ≥ 3 consecutive runs with zero parse failures.
- [ ] Playwright suite green on **main**.
- [ ] Stripe webhook + downgrade cron verified in staging.
- [ ] Sentry error rate < 0.01 / min over 24 h.
- [ ] Add-to-Home-Screen banner fires on iOS & Android.

---
