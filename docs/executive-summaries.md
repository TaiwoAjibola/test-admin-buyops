# Executive Summaries — Urbco Real Estate Investment Platform Suite

**Repository:** `admin-master` (Urbco Admin Console) · **Date:** 5 November 2026
**Suite components covered:** Urbco Admin Console · Urbco Foundry · Urbco Harbor · KYC/KYB Review System

---

## Overview

Urbco operates a real estate investment platform delivered as two investor-facing tracks — **Urbco Foundry** (large-ticket, institutional and HNW capital) and **Urbco Harbor** (accessible, fractional tickets from ₦100K) — both controlled and operated from a single internal web application, the **Urbco Admin Console**. A newly added **KYC/KYB Review System** sits inside the console as the compliance gate every investor must clear before capital is accepted.

| Project | Role | Primary users | Status |
|---|---|---|---|
| Urbco Admin Console | Operations & control center for the whole business | Admins, ops staff, finance, compliance officers | Frontend build complete; mock data layer |
| Urbco Foundry | Large-ticket investment platform (≥ ₦200M) | Institutions, family offices, HNW individuals | Configured inside console; no separate app yet |
| Urbco Harbor | Accessible / fractional platform (≥ ₦100K) | Retail investors, diaspora, smaller institutions | Configured inside console; no separate app yet |
| KYC / KYB Review System | Compliance gate on investor onboarding | Compliance officers, admins | Newly built module at `/kyc` |

---

## 1. Urbco Admin Console

### What the application is

An internal, browser-based operations console — a single-page React application (Vite + TypeScript, Tailwind and Radix/shadcn UI components) with no backend connected yet: all data comes from an in-repo mock database and a mock API layer with simulated latency. It carries the Urbco visual identity (indigo primary `#4C51BF`, emerald accent `#10B981`, near-black wordmark, light and dark themes) and is organized into a sidebar of twelve routes across seven functional groups: Overview, Property Management, Sales Team, Compliance, Financial, Reports and Settings.

### What it does

- **Analytics dashboard** — KPI cards (revenue, active assets, companies, agent performance) and charts for sales trends, commission splits and transaction analytics.
- **Company management** — full CRUD on developer/partner companies, profile drawers, agreement and contact metadata, search and filters.
- **Asset management (admin-only)** — a nine-step creation and edit wizard covering: platform and stage, asset typing, status, financial configuration (base price, BuyOps markup, final selling price), investment program and buying paths, payment options and tranche configuration, ownership terms and milestone builder, media and documents, and a final review before publish or save-as-draft. Includes risk classification (Low/Medium/High with up to five custom risk factors), return ranges (rental yield, capital appreciation, total return) and publish/unpublish lifecycle control.
- **Installment & payment plan configuration** — deposits, schedules, durations, scheduled tranches and milestone-linked releases.
- **Sales organization** — clusters with assigned team leads, internal and freelance agents, role assignment and performance tracking.
- **Lead management** — lead creation, assignment to agents, status lifecycle, lead-to-asset association, conversion tracking and payment-readiness notifications.
- **Money movement** — read-only transactions with partial/"broken" payment support, outstanding balance tracking, payment recording, and commission calculation that only accrues on payments actually received, with separate paid/unpaid commission views.
- **Compliance** — the KYC/KYB Review System (see §4).
- **Reporting and settings** — report views, theme and account preferences, localization of currency format (all amounts in Nigerian Naira, ₦).

### How it can be applied

1. **Onboard a supply partner** → create the company record and attach agreements.
2. **Structure and list an asset** → run the nine-step wizard: pick Foundry or Harbor, the development stage (before/after development) and program, set financials and markup, choose buying paths (Investment, Ownership, or both), configure settlement (one-time, investment window, scheduled tranche, milestone-based), add milestones with release percentages, attach media, then publish.
3. **Run the sales machine** → organize clusters and agents, generate and assign leads, track them to payment readiness.
4. **Collect and reconcile** → record transactions including fragmented payments, auto-derive lead/closer/freelancer commissions on received funds only, and monitor unpaid commission liability.
5. **Gate investors** → verify KYC/KYB before they can transact (§4).
6. **Steer the business** → use dashboard KPIs, reports and asset lifecycle controls to decide what to publish, discount or withdraw.

### Sectors and contexts it can be applied to

- **Real estate asset classes** — land acquisition, off-plan and under-construction projects, completed/operational buildings, waterfront and industrial estates (as modeled: Marina Heights, Lekki Phase 1 Estate, Abuja Commercial Plaza, Eko Atlantic, Ibeju-Lekki Industrial Estate).
- **Capital-market channels** — the console already models the institution taxonomy it expects: Banks & DFIs, Pension Funds, Insurance Companies, Investment Managers & Funds, Sovereign & Development Funds, Family Offices & HNW, Corporates & Treasuries, Others.
- **Geographies** — Nigerian markets primarily (Lagos: Victoria Island, Lekki, Ikeja, Ikoyi, Ibeju-Lekki, Eko Atlantic; Abuja CBD) but the structure is country-agnostic.
- **Adjacent operational uses** — brokerage and agent-network management, proptech back-office, asset/facility management portfolios, cooperative or REIT-style pooled ownership administration, and any compliance-gated investment workflow.

### Status

Feature-complete frontend prototype. Backend, real payments, file storage, email/SMS notifications, document signing and the customer portal are not connected; data resets to mock values when the session reloads.

---

## 2. Urbco Foundry

### What it is

The large-ticket track of the suite, targeted at whole-asset and high-value participation with a minimum exposure of **₦200M**. Foundry assets are described as "Urbco Foundry-managed", span both before-development and after-development stages, and are typically marquee commercial, mixed-use, infrastructure or industrial properties.

### What it does

- Offers **two buying paths** configured per asset: **Investment** (capital into the program — single-ticket vs fractional interests, interest structure, instrument type, minimum investment, funding target, dated investment window, investor rights, redemption terms) and **Ownership** (title transfer — release basis scheduled or milestone-linked, milestone builder with target dates and release percentages, title terms).
- Supports a **Harbor large-ticket bridge**, letting large Harbor tickets be serviced inside Foundry-owned assets.
- Settlement vocabulary: **One-time**, **Investment Window** (Investment path), **Scheduled Tranche** and **Milestone-based** (Ownership path).
- Carries risk presets per program, return projections (rental yield, capital appreciation, total return) and stage-based discounts for off-plan participation.
- Accepts institutional and HNW individual capital, with KYB document sets enforced at onboarding.

### How it can be applied

- Raise structured capital for a single marquee asset from institutions writing ₦200M+ tickets.
- Run a dated investment window with a funding target, then convert subscriptions into tranches tied to construction milestones.
- Give family offices and sovereign funds either direct fractional interests or outright ownership participation with milestone-based release.
- Administer redemptions and investor rights from the asset record itself.

### Sectors it applies to

Commercial office and retail, mixed-use and waterfront developments, industrial and logistics parks, infrastructure and energy-adjacent property, large land banking, hospitality — funded by pension funds, banks and DFIs, insurance companies, asset managers, sovereign/development funds and family offices.

---

## 3. Urbco Harbor

### What it is

The accessible track: fractional participation from **₦100K**, focused on pre-development and inception-stage projects. Harbor opens the same assets to retail investors, diaspora buyers and smaller institutions that cannot write Foundry-scale tickets.

### What it does

- Fractional interests with low entry tickets and scheduled tranche or milestone-based payment plans, plus one-time settlement.
- Individual KYC set for its investors: government photo ID, live biometric selfie, proof of address (under 3 months) and an accreditation questionnaire covering risk profile and source of funds.
- Where a Harbor-track institution is onboarding, the console additionally requires the individual document set on top of the corporate KYB set.
- Shares the same asset engine as Foundry, so pricing, markup, discount and milestone mechanics are consistent across both tracks.

### How it can be applied

- Retail and diaspora onboarding at scale into pre-development land and industrial estate projects.
- Micro-ticket pooling toward a Foundry-grade asset, with milestone-based tranches matching construction progress.
- Employer, cooperative or community investment schemes where many small contributors buy into one property.
- A testing ground for new asset programs before they are promoted to Foundry.

### Sectors it applies to

Residential and mixed-use developments, student housing, healthcare facilities, pre-development land parcels, industrial and logistics estates, and any retail participation channel where ticket size — not asset quality — is the barrier.

---

## 4. KYC / KYB Review System (Compliance Module)

### What it is

A compliance module inside the admin console at `/kyc` ("Compliance → KYC Review"), implementing the Urbco KYC specification. Its subjects are investor user records; each carries an entity type (individual, family office, institution), an investor track (Foundry or Harbor), a KYC status, timestamps and structured remediation feedback.

### What it does

- **Review queue** with six summary counters (total, verified, under review, action needed, not submitted, average completion) and filters by status, entity type and name/email.
- **Completion scorecard** — a percentage per investor decomposed into profile fields, required documents and declarations, so an operator can see exactly what has been done and what has not. A document only counts once uploaded and not rejected.
- **Per-document review** — approve or reject each document individually with a written reason that the investor sees; rejected documents fall out of the completion score until re-uploaded.
- **Status lifecycle** — pending → under review → verified, or to failed / remediation required, matching the specified state machine, with resubmission returning the record to under review.
- **Remediation builder** — pick items from a grouped checklist (Profile / Document / Declaration); selected items are written onto the record and rendered as the investor's remediation checklist.
- **Investor nudging** — a "Remind" action per investor that sends a completion reminder and records when it was last sent.

### Document sets enforced

| Entity type | Required documents | Profile fields | Declarations |
|---|---|---|---|
| Individual | Government photo ID, live biometric selfie, proof of address, accreditation questionnaire (4) | NIN, BVN, residential address (3) | Source of funds, target track (2) |
| Family office | Articles of incorporation, trustee/director passports, proof of AUM, beneficial ownership register (4) | Company name, RC number, company address, representative name and email (5) | Declared AUM range, target track (2) |
| Institution | Articles, trustee/director passports, board resolution, UBO register, corporate registration & tax ID, officer identification, AML compliance certificate (7 — plus the 4 individual documents where the track is Harbor = 11) | Company name, RC number, address, representative, institution type, structure, AUM range, horizon, sectors, regulatory status (11) | none — captured in onboarding flow |

### How it can be applied

- As the **pre-investment gate**: no investor transacts until their record is verified.
- As **document QA**: reject poor-quality uploads (blurry selfies, expired IDs, stale bank references) with a specific reason instead of failing the whole record.
- As an **outstanding-items engine**: the completion percentage and checklist tell operators precisely what to chase; the reminder action closes the loop with the investor.
- As an **audit trail**: status transitions, per-document decisions and remediation items are recorded against the investor for regulatory review.

### Sectors it applies to

Individuals on both tracks, family offices, and the full institution taxonomy (banks and DFIs, pension funds, insurers, investment managers, sovereign and development funds, corporates and treasuries). The pattern also transfers to any KYC-gated vertical the business enters — lending, insurance, securities or cross-border remittance onboarding.

---

## How the projects work together

1. A **company** is registered in the console.
2. An **asset** is created in the nine-step wizard and assigned to **Foundry** or **Harbor**, with buying paths, payment options and milestones configured.
3. The asset is **published**, making it available to the chosen track.
4. **Clusters and agents** receive leads against that asset and drive them to payment readiness.
5. An **investor** must clear **KYC/KYB** for their entity type before capital is accepted.
6. **Transactions** are recorded (including partial payments), commissions accrue on receipts only, and **Foundry/Harbor** program rules govern tranches and milestone releases.
7. Everything is visible through **dashboard analytics and reports**, and asset visibility is controlled by publish/unpublish.

---

## Technical baseline and current limitations

- **Stack:** React 18 SPA built with Vite, TypeScript-styled TSX, Tailwind CSS with a custom theme layer (light/dark tokens), Radix-based shadcn UI component set, lucide icons, Recharts for analytics, sonner for toasts.
- **Data:** front-end only — `src/app/lib/mock-data.ts` plus a mock API service (`src/utils/api-service.ts`) with simulated latency and in-session mutation. No database, no authentication service, no file storage.
- **Verification:** the project has no TypeScript compiler gate; correctness is enforced by `npm run build` plus an identifier scan for used-but-unimported components.
- **Known limitations:** no backend persistence (state resets on reload), documents are referenced but never uploaded, no email/SMS delivery behind reminders, no customer/investor portal in this repository, and the "BuyOps Markup" label still reflects the legacy brand name.
