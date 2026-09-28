# Asset Creation Model — Complete Flow Specification

> Source of truth: `src/app/components/dashboard/asset-management.tsx`
> Companion data: `src/app/lib/mock-data.ts` · API layer: `src/utils/api-service.ts`
> Audience: developers implementing / maintaining the asset creation & editing wizard.

---

## 1. Overview

The Asset Creation Model is a **9-step wizard** that exists in two identical dialogs:

| Dialog | Opens via | Submits via | Purpose |
|---|---|---|---|
| **Create Asset** | "Create Asset" trigger | `handleSubmit()` → `assetsApi.create()` | New asset |
| **Edit Asset** | Row "Edit" action | `handleUpdate()` → `assetsApi.update()` | Edit existing asset |

Both dialogs share:

- One state object: `formData` (initialized from `INITIAL_FORM_DATA`).
- One step counter: `currentStep` (1…9), `totalSteps = 9`.
- One navigation function: `nextStep()` / `prevStep()` — with validation gates on **Step 1** and **Step 3** only.
- One payload builder: `buildAssetPayload(formData)`.

The wizard is **not** a simple form: several selections in early steps rewrite option
lists and reveal/hide panels in later steps (see §3, "Selection → Consequence matrix").

---

## 2. Master Flow

```mermaid
flowchart TD
    S0[Open Create Asset dialog] --> S1
    S1["Step 1 · Asset Identity & Status<br/>(stage toggle filters type/status)"]
    S1 -- "gate: validateStep1" --> S2
    S2["Step 2 · Physical & Functional Details"]
    S2 --> S3
    S3["Step 3 · Investment Program & Buying Paths"]
    S3 -- "gate: validateStep3" --> S4
    S4["Step 4 · Pricing & Payment Logic<br/>(payment options depend on paths)"]
    S4 --> S5["Step 5 · Returns & Projections<br/>(live ROI calculations)"]
    S5 --> S6["Step 6 · Risk & Transparency"]
    S6 --> S7["Step 7 · Media & Documentation"]
    S7 --> S8["Step 8 · Commission Setup<br/>(live commission calculations)"]
    S8 --> S9["Step 9 · Review & Publish"]
    S9 -->|"Save Draft / (any step)" D1[handleSubmit 'draft']
    S9 -->|"final button"| D2{status switch}
    D2 -- "published" --> D3[Create/Publish asset]
    D2 -- "draft" --> D4[Save as draft]
    D3 --> D5[Upload images → fetchAssets → close → reset]
```

**Footer buttons (Create dialog):**

| Step | Buttons |
|---|---|
| 1–8 | Previous · Cancel · **Save Draft** (saves anywhere) · **Next** |
| 9 | Previous · Cancel · Save Draft · **Publish Asset** or **Save as Draft** (label follows the Publish Status switch) |

**Footer buttons (Edit dialog):**

| Step | Buttons |
|---|---|
| 1–8 | Previous · Cancel · **Save Changes** (saves anywhere) · **Next** |
| 9 | Previous · Cancel · Save Changes · **Publish Asset** or **Save as Draft** → `handleUpdate()` |

**Hard validation gates** (block "Next"):

- **Step 1** — `validateStep1()`: Asset Name, Development Stage, Asset Type, Project Status, Company, Location must be non-empty.
- **Step 3** — `validateStep3()`: ≥ 1 Buying Path; if Ownership + release basis = *Milestone-linked*, ≥ 1 milestone with name + release %.
- All other steps' `*` labels are **soft** (UI-required only, not enforced on Next).
- Final submit (`handleSubmit`) additionally requires `name` + `company`, otherwise it toasts and jumps back to Step 1.

---

## 3. Selection → Consequence Matrix (the core branching logic)

### 3.1 Development Stage (Step 1) — the biggest branch

Two values: **`Before Development`** (UI label *Pre-Development*) / **`After Development`** (UI label *Post-Development*). Segmented toggle with a context description + chips under it.

| Consequences | Before Development | After Development |
|---|---|---|
| Asset Type options | `Land`, `Off Plan`, `Under Construction` | `Completed`, `Ready to Move`, `Operational` |
| Project Status options | `Land Acquisition`, `Planning`, `Approvals`, `Foundation`, `Under Construction` | `Completed`, `Available`, `Leased`, `Sold Out` |
| Defaults when switching stages | type → `Off Plan`, status → `Foundation` | type → `Completed`, status → `Available` |
| Step 4 pricing panel | **Pre-Development Discounts** (see rules below) | **Market Pricing** note (no discount inputs) |
| Step 6 Construction Progress field | Shown **unless** type = `Land` | Hidden |

- Switching stage keeps type/status if still valid, otherwise replaces them with the stage defaults and toasts: *"Switched to … — asset type and status adjusted to match"*.
- When editing a legacy asset whose combination predates these lists, the current value is appended to the options so it still displays.

**Pre-Development Discounts sub-branch (Step 4):**

| Asset Type | Shown fields |
|---|---|
| `Off Plan` | Off-plan Discount (%) `offPlanDiscount` **and** Stage-based Discount (%) `stageBasedDiscount` |
| `Under Construction` | Stage-based Discount (%) only |
| `Land` | No inputs — note: *"Land parcels are priced per sqm / plot — volume and deal-level discounts are agreed case by case."* |

### 3.2 Investment Program (Step 3) — Foundry vs Harbor

| | **Urbco Foundry** (default, tag *Velocity portfolio*) | **Urbco Harbor** (tag *Structured capital*) |
|---|---|---|
| Identity | Standard & fractional tickets, fast closings, yield-focused payouts | Exceptionally large commitments, milestone-based disbursement, institutional due diligence |
| Allowed Payment Periods (Step 4) | `3, 6, 12, 18, 24, 36 months` | `12, 24, 36, 48, 60 months` |
| Rental Frequency (Step 5) | `Monthly`, `Quarterly`, `Annual`, `N/A` | `Semi-Annual`, `Annual`, `N/A` |
| Risk factor presets (Step 6) | 6 Foundry presets (incl. rental occupancy risk) | 6 Harbor presets (swaps occupancy risk for **counterparty & sponsor credit risk** + **liquidity risk on large-ticket exit**) |
| Management Mode first option | `Urbco Foundry-managed` | `Urbco Harbor-managed` |
| Interest Structure descriptions | Retail-oriented copy | Institutional copy |

**Side effects of changing program** (`handleProgramChange`, toasts *"… selected — funding terms and returns adjusted"*):

1. `rentalFrequency` — kept if still allowed, else forced: Harbor → `Annual`, Foundry → `Monthly`.
2. `installmentPeriods` — intersection with new list kept if non-empty, else defaults: Harbor → `[12, 24, 36 months]`, Foundry → `[6, 12, 24 months]`.
3. `managementMode` — auto-swapped to `<new program>-managed` if it was any `…-managed` value; custom modes untouched.

### 3.3 Buying Paths (Step 3) — Investment / Ownership

Multi-select checkbox cards; **at least one required** (gate on Next).

| Revealed when enabled… | Panel contents |
|---|---|
| **Investment** checked | *Investment Terms* panel: Interest Structure cards, Investment Instrument, Minimum Investment, Total Funding Required, Investment Window dates, Investor Rights, Exit / Redemption Terms; **plus** Fractional Breakdown + Funding Progress when structure = Fractional |
| **Ownership** checked | *Ownership Terms* panel: Payment Release Basis, Milestone Schedule builder, Ownership / Title Terms; **plus** the "Ownership settlement flow" strip |
| Any path checked | Settlement flow strip(s) (Terms → Payment instruction → Trustee custody → Independent reconciliation → Release) |

**Interest Structure** (inside Investment panel) — nests the old Full/Fractional choice:

- `Full` → **Single-ticket Interest** (one whole interest, one acquirer)
- `Fractional` → **Fractional Interests** → reveals Fraction Breakdown:
  - Type = `Land` → Land Units select (`sqm` = Per Square Meter / `plot` = Per Plot) + Number of Units
  - Other types → Total Fractions + Cost per Fraction (₦)
  - → Funding Progress bar (auto-calculated, see §6)
- Changing paths **prunes payment options** in Step 4 (`prunePaymentOptions`): options outside the enabled paths are dropped; empty result falls back to `["One-time"]`.

**Payment Release Basis** (inside Ownership panel):

| Value | Meaning | Effect |
|---|---|---|
| `Milestone-linked` | Trustee releases per independently verified milestone (UML §4B/§7) | Milestone Schedule label gets `*`; **Next is blocked** if no complete milestone rows |
| `Scheduled` (default) | Funds release against the fixed tranche schedule from Step 4 | Milestones optional |

**Milestone row fields:** Milestone name (text) · Target Date (date) · Release % (0–100).
Live total shows `Σ release %` — red when > 100 ("adjust before publishing"), green at exactly 100.

### 3.4 Buying Paths → Payment Options (Step 4)

Payment options are **rendered per enabled path** (union when both enabled):

| Path | Options offered | Extra UI |
|---|---|---|
| Investment | `One-time` ("One-time Payment"), `Investment Window` | If *Investment Window* checked: summary line with Step 3 window dates, or red "not set — add dates in Step 3" |
| Ownership | `One-time`, `Scheduled Tranche`, `Milestone-based` | If *Milestone-based* checked: "Released against N milestone(s) configured in Step 3" or warning to add them |
| None | Blocked message: choose a path in Step 3 | — |

**Tranche Configuration panel** appears only when `Scheduled Tranche` is checked:

- Down Payment Amount (₦) — *minimum initial payment required*
- Allowed Payment Periods — checkboxes from the program-aware `paymentPeriods` list (§3.2)

**Legacy value normalization** (on edit load, `normalizePaymentOptions`):

| Stored (legacy) | Becomes |
|---|---|
| `Outright` / `Full` | `One-time` |
| `Installment` | `Scheduled Tranche` |
| `Stage-based` | `Milestone-based` |

Then pruned against the asset's buying paths.

---

## 4. Step-by-Step Input Inventory

Legend: **\*** = label shows required marker; **Gate** = enforced by `validateStep` on Next.
Types: `text`, `number`, `date`, `select`, `multi` (checkbox group), `toggle`, `cards` (clickable cards), `textarea`, `file`.

### Step 1 — Asset Identity & Status  *(Gate: yes)*

| # | Input | Key | Type | Options / Notes |
|---|---|---|---|---|
| 1 | Asset Name **\*** | `name` | text | placeholder `e.g., Marina Heights Tower A` · **Gate** |
| 2 | Reference Code | `referenceCode` | text | placeholder `e.g., MHT-A-2024` |
| 3 | Development Stage **\*** | `developmentStage` | cards (segmented) | `Before Development` \| `After Development` · context description + 4 chips each · **Gate** · *triggers §3.1* |
| 4 | Asset Type **\*** | `type` | select | stage-filtered (§3.1) · **Gate** |
| 5 | Project Status **\*** | `projectStatus` | select | stage-filtered (§3.1) · **Gate** |
| 6 | Location **\*** | `location` | text | placeholder `e.g., Dubai Marina` · **Gate** |
| 7 | Full Address **\*** | `address` | textarea | plot/unit details |
| 8 | Company **\*** | `company` | select | developer/partner companies (fetched from API) · **Gate** → stored as `companyId` |
| 9 | Land Size (sqm) | `landSize` | number | |
| 10 | Built Size (sqm) | `builtSize` | number | |
| 11 | Construction Start | `constructionStart` | date | |
| 12 | Construction End | `constructionEnd` | date | |

> Gate specifics: name, developmentStage, type, projectStatus, company, location. Address is labelled `*` but not gated.

### Step 2 — Physical & Functional Details  *(Gate: no)*

| # | Input | Key | Type | Options / Notes |
|---|---|---|---|---|
| 1 | Property Category **\*** | `propertyCategory` | select | `Residential` \| `Commercial` \| `Mixed-use` \| `Land` (default `Residential`) |
| 2 | Total Units / Rooms **\*** | `totalUnits` | number | |
| 3 | Unit Configuration **\*** | `unitConfiguration` | multi + custom add | presets: `Studio Apartment`, `1 Bedroom`, `2 Bedrooms`, `3 Bedrooms`, `4 Bedrooms`, `5 Bedrooms`; free-text "Add custom type" → appended as extra checkbox |
| 4 | Furnishing Status **\*** | `furnishingStatus` | select | `Unfurnished` \| `Semi-furnished` \| `Fully furnished` \| `N/A` |
| 5 | Shared Facilities | `sharedFacilities` | multi + custom add | presets: `Pool`, `Gym`, `Parking`, `Security`, `Private Beach`, `Spa`, `Retail`, `Meeting Rooms`, `Elevators`; free-text "Add custom facility" |
| 6 | Facility Management Included | `facilityManagement` | toggle | default **on** |

### Step 3 — Investment Program & Buying Paths  *(Gate: yes)*

| # | Input | Key | Type | Options / Notes |
|---|---|---|---|---|
| 1 | Investment Program **\*** | `platform` | cards | `Urbco Foundry` \| `Urbco Harbor` (default Foundry) · *triggers §3.2* |
| 2 | Buying Paths **\*** | `buyingPaths` | cards (multi) | `Investment` \| `Ownership` · **Gate: ≥ 1** · *triggers §3.3* |
| — | Settlement flow strips | — | read-only | per enabled path; Ownership strip's final chip varies with release basis |
| 3a | *(if Investment)* Interest Structure **\*** | `ownershipType` | cards | `Full` = Single-ticket Interest \| `Fractional` = Fractional Interests (default `Full`) |
| 3b | *(if Investment + Land + Fractional)* Land Units **\*** | `landUnitType` | select | `sqm` \| `plot` |
| 3c | *(same)* Number of Units **\*** | `landUnitCount` | number | |
| 3d | *(if Investment + non-Land + Fractional)* Total Fractions **\*** | `fractionTotal` | number | e.g. `100` |
| 3e | *(same)* Cost per Fraction (₦) **\*** | `costPerFraction` | number | e.g. `8500` → stored as `fractionCost` |
| 3f | *(Fractional)* Funding Progress | — | auto | see §6 |
| 3g | *(if Investment)* Investment Instrument | `investmentType` | select | `Equity` \| `Debt` \| `Mezzanine` |
| 3h | *(if Investment)* Minimum Investment (₦) | `minimumInvestment` | number | |
| 3i | *(if Investment)* Total Funding Required (₦) | `targetFunding` | number | |
| 3j | *(if Investment)* Window Opens / Closes | `investmentWindowStart/End` | date ×2 | powers Step 4 window summary |
| 3k | *(if Investment)* Investor Rights | `investorRights` | textarea | e.g. pro-rata voting, quarterly reporting |
| 3l | *(if Investment)* Exit / Redemption Terms | `redemptionTerms` | textarea | e.g. 30-day notice after holding period |
| 4a | *(if Ownership)* Payment Release Basis **\*** | `releaseBasis` | cards | `Milestone-linked` \| `Scheduled` (default) · *triggers §3.3 validation* |
| 4b | *(if Ownership)* Milestone Schedule | `milestones[]` | repeatable rows | `{name, targetDate, releasePct}` · Add/Remove row · live Σ% (red if >100) |
| 4c | *(if Ownership)* Ownership / Title Terms | `titleTerms` | textarea | title transfer / occupancy terms |

### Step 4 — Pricing & Payment Logic  *(Gate: no)*

| # | Input | Key | Type | Options / Notes |
|---|---|---|---|---|
| 1 | Base Asset Value (₦) **\*** | `basePrice` | number | **Editing this resets** markup, markup % selector and custom % |
| 2 | BuyOps Markup **\*** | `markup` (+ ui state `markupPct`, `customPctInput`) | select of % | presets `1, 2, 3, 5, 7, 10, 15, 20` % or `Custom %` (own number input) · auto-computes `markup` amount = `% × basePrice` · live "= ₦…" preview |
| 3 | Final Selling Price | — | auto card | `basePrice + markup` (§6) |
| 4 | Payment Options **\*** | `paymentOptions` | multi, per path | see §3.4 (blocked message if no paths) |
| 5 | *(if Scheduled Tranche)* Down Payment Amount (₦) **\*** | `downPaymentAmount` | number | |
| 6 | *(if Scheduled Tranche)* Allowed Payment Periods **\*** | `installmentPeriods` | multi | program-aware list (§3.2); defaults `[6,12,24 months]` |
| 7 | *(stage/type sub-branch)* Discounts | `offPlanDiscount`, `stageBasedDiscount` | number (0.1 step) | see §3.1 |
| — | Payment Security notice | — | read-only | escrow copy |

### Step 5 — Returns & Projections  *(Gate: no)*

| # | Input | Key | Type | Notes |
|---|---|---|---|---|
| 1 | Projected Rental Income (₦) **\*** | `projectedRentalIncome` | number | |
| 2 | Rental Frequency **\*** | `rentalFrequency` | select | program-aware list (§3.2); default `Annual` |
| 3 | Operating Cost Assumptions (₦/year) **\*** | `operatingCost` | number | maintenance, management fees, utilities |
| 4 | Capital Appreciation (% p.a.) **\*** | `capitalAppreciation` | number (0.1) | |
| 5 | First Payout Date | `firstPayoutDate` | date | |
| 6 | *Calculated Returns* (live) | — | auto | Rental Yield % · Capital Growth % · Total Annual Return % (§6) |
| 7 | Rental Yield Range Min/Max (%) | `rentalYieldMin/Max` | number pair | manual range for investor transparency |
| 8 | Capital Appreciation Range Min/Max (%) | `capitalAppreciationMin/Max` | number pair | |
| 9 | Total Returns Range Min/Max (%) | `totalReturnsMin/Max` | number pair | combined annual returns |

### Step 6 — Risk & Transparency  *(Gate: no)*

| # | Input | Key | Type | Options / Notes |
|---|---|---|---|---|
| 1 | Construction Progress (%) | `constructionProgress` | number 0–100 | **only** when stage = Before Development **and** type ≠ `Land` · saved as `constructionStage` |
| 2 | Risk Level **\*** | `riskLevel` | cards (3-up) | `Low` \| `Medium` \| `High` (default `Low`, color-coded) |
| 3 | Investment Risk Factors | `riskFactors` | multi + custom | **program-aware presets** (§3.2) + free-text "Add Custom Risk Factor" (Enter or Add button); custom ones listed separately with ✕ remove |
| 4 | Off-plan Security Notes | `offPlanSecurity` | textarea | **only** when type = `Off Plan` · placeholder `e.g., Developer escrow account + Bank guarantee` |
| 5 | Exit Liquidity Settings **\*** | `exitLiquidity` | select | `High - Can exit within 30 days` \| `Medium - Exit within 60-90 days` \| `Low - Exit after 6+ months` |
| 6 | Management Mode **\*** | `managementMode` | select | `<program>-managed` (auto-relabelled on program change) \| `Self-managed` \| `Third-party managed` |
| — | Transparency Notice | — | read-only | auditor copy |

### Step 7 — Media & Documentation  *(Gate: no)*

| # | Input | Key | Type | Notes |
|---|---|---|---|---|
| 1 | Upload Images | `images` (+ `uploadedImages[]`) | file `image/*`, multi | counts + per-file remove; files posted via `assetsApi.uploadImages` **after create** |
| 2 | Upload Documents | `documents` (+ `uploadedDocuments[]`) | file `.pdf,.doc,.docx,.txt`, multi | counts + per-file remove |
| 3 | Virtual Tour Links | `virtualTours` / `videoTourUrl` | URL input | ⚠️ input is currently **display-only** (not wired to state) — see §8 quirks |

### Step 8 — Commission Setup  *(Gate: no)*

| # | Input | Key | Type | Default |
|---|---|---|---|---|
| 1 | Lead Commission (%) **\*** | `leadCommission` | number (0.1) | `2.5` |
| 2 | Deal Closer Commission (%) **\*** | `closerCommission` | number (0.1) | `1.5` |
| — | Total Commission · Commission per Sale | — | auto | live cards (§6) |
| — | Lead Agent Earns · Closer Agent Earns | — | auto rows | `finalPrice × %` |

### Step 9 — Review & Publish  *(final)*

Read-only summary rows (create & edit identical):

`Asset Name` · `Reference Code` · `Type` · `Development Stage` (badge) · `Investment Program` (badge) · **`Buying Paths`** (badges, red "None selected" if empty) · **`Interest Structure`** (only if Investment path: Single-ticket Interest / Fractional Interests) · **`Release Basis`** (only if Ownership path: "Milestone-linked (N milestones)" / "Scheduled tranche") · `Location` · `Property Category` · `Total Units`

Plus: returns block (Rental Yield range, Capital Appreciation range, Total Returns range — each shown only if entered; construction progress % if set; exit liquidity), commission summary (Total Commission %, Total Annual Return %), selected risk factors, green reminder note, and the **Publish Status** switch (`checked ⇔ status === "published"`, toggles `published` / `draft`).

Final footer button label: `Publish Asset` when status is `published`, else `Save as Draft`.

---

## 5. Navigation & State Rules

1. **Next** → run gate (Step 1 / Step 3) → `currentStep + 1` (max 9).
2. **Previous** → `currentStep − 1` (min 1). No validation on back.
3. **Save Draft (create) / Save Changes (edit)** available at any step — submits current data immediately without gates.
4. Opening **Edit** resets to Step 1, resets markup UI state, and maps the asset into `formData` (§7).
5. Opening **Create** starts fresh from `INITIAL_FORM_DATA`; a successful create resets the dialog back to Step 1.
6. Progress header shows `Step N of 9: <step title>`; titles:
   1. Asset Identity & Status · 2. Physical Details & Facilities · 3. **Investment Program & Buying Paths** · 4. Pricing Logic · 5. Returns Projections · 6. Risk & Management Assessment · 7. Media & Documentation · 8. Commission Setup · 9. Review & Publish.

---

## 6. Calculations

All formulas below are implemented as derived values in the component (recomputed on every render).

| Result | Formula | Where shown |
|---|---|---|
| **Markup amount** | `markup = (pct / 100) × basePrice` (rounded to whole naira) — pct from preset or custom input; changing `basePrice` clears markup | Step 4 preview "= ₦…" |
| **Final Selling Price** | `finalPrice = basePrice + markup` | Step 4 big card, Step 8 "Based on final selling price…", Step 9 |
| **Rental Yield** | `rentalYield = projectedRentalIncome / finalPrice × 100` (2 dp; `0.00` if no income or price 0) | Step 5 Calculated Returns |
| **Total Annual Return** | `totalAnnualReturn = rentalYield + capitalAppreciation` (2 dp) | Step 5 Calculated Returns; Step 9 |
| **Total Commission** | `totalCommission = leadCommission + closerCommission` (displayed 1 dp) | Step 8 |
| **Commission per Sale** | `finalPrice × totalCommission / 100` | Step 8 |
| **Lead / Closer earns** | `finalPrice × respectiveCommission / 100` | Step 8 rows |
| **Milestone release total** | `Σ milestone.releasePct` — red > 100, green = 100 | Step 3 milestone builder |
| **Funding Progress** | `ownershipType === "Fractional" && fractionTotal ? floor(random × 100) : 100` — ⚠️ currently **random** (mock placeholder), see §8 | Step 3 |
| **Review step values** | `computedBase = basePrice ‖ preDevCost`; `computedFinal = computedBase + computedMarkup` (independent recomputation used for the review block) | Step 9 |

**Manual ranges** (`rentalYieldMin/Max`, `capitalAppreciationMin/Max`, `totalReturnsMin/Max`) are *entered*, not derived — they feed investor-facing displays as-is.

### Payload mapping — `buildAssetPayload(formData)`

The payload spreads `formData` and then transforms:

| Payload field | Source |
|---|---|
| `price` | `basePrice` (fallback `preDevCost`) as number |
| `markup` | markup as number |
| `finalPrice` | `price + markup` |
| `companyId` | `formData.company` |
| `company` | looked-up company object (fallback `{id, name: "Partner Developer"}`) |
| `facilities` | `sharedFacilities` |
| `fractionCost` | `costPerFraction` |
| `furnished` | `furnishingStatus` |
| `constructionStage` | `constructionProgress` |
| `unitConfiguration` | array → `join(", ")` string |
| `totalAnnualReturn` | `totalReturnsMax ‖ capitalAppreciation ‖ "15.00"` |
| `platform` / `developmentStage` | defaulted (`Urbco Foundry` / `Before Development`) |

Everything else (`buyingPaths`, `milestones`, `releaseBasis`, `titleTerms`, window dates,
rights, redemption terms, discounts, risk, commissions, `status`, …) is passed through as-is.

---

## 7. Edit-Specific Behaviour (`handleEdit`)

1. Finds the asset, derives **`buyingPaths`**: uses stored `buyingPaths` if present; otherwise
   legacy fallback `ownershipType === "Fractional" → ["Investment"]`, else `["Ownership"]`.
2. **Normalizes payment options** via the legacy map (§3.4) pruned to those paths.
3. Maps legacy keys: `fractionCost → costPerFraction`, `furnished → furnishingStatus`,
   `facilities → sharedFacilities`, `constructionStage → constructionProgress`,
   `targetFunding ‖ totalInvestmentRequired → targetFunding`, `images/documents/virtualTours` counts,
   `managementMode` defaulting to `` `${platform}-managed` ``.
4. New-term defaults when absent: `releaseBasis: "Scheduled"`, `milestones: []`, window/rights/redemption/title = `""`.
5. Resets wizard to Step 1 and clears markup UI state; dialog ids are `edit-`-prefixed
   (e.g. `edit-titleTerms`, `edit-milestone-name-0`) to avoid clashing with the Create dialog.
6. Final submit calls `handleUpdate()` → `assetsApi.update(id, buildAssetPayload(formData))`.

---

## 8. Known Quirks / Gaps (for the developer's attention)

| # | Quirk | Detail |
|---|---|---|
| 1 | **Funding Progress is random** | `Math.floor(Math.random() * 100)` for fractional assets — placeholder until real sold/total data exists |
| 2 | **`description` has no input** | `formData.description` exists in state/payload but no field edits it |
| 3 | **Virtual tour URL not wired** | Step 7 URL input has no `value`/`onChange`; `virtualTours` counter never increments from it |
| 4 | **Documents never upload** | Create posts **images only** via `assetsApi.uploadImages`; `uploadedDocuments` are counted/previewed but not sent |
| 5 | **Soft `*` labels** | Only Steps 1 & 3 enforce validation; `*` on other steps is cosmetic |
| 6 | **"BuyOps Markup" label** | Legacy product name kept in Step 4 label (out of scope for the Urbco rename) |
| 7 | **Legacy payment vocabulary** | `mock-data.ts` still stores `Outright`/`Installment`; normalized only on edit-load. New saves write the new vocabulary (`One-time`, `Scheduled Tranche`, `Milestone-based`, `Investment Window`) |
| 8 | **`status` values** | Initial `active`; Publish switch writes `published`/`draft`; list filters treat them as free strings (`active`, `pending`, … in mock data) |

---

## 9. Quick Reference — Every Enumerated Option

```
Development Stage        Before Development | After Development
Asset Type (pre-dev)     Land | Off Plan | Under Construction
Asset Type (post-dev)    Completed | Ready to Move | Operational
Status (pre-dev)         Land Acquisition | Planning | Approvals | Foundation | Under Construction
Status (post-dev)        Completed | Available | Leased | Sold Out
Property Category        Residential | Commercial | Mixed-use | Land
Furnishing               Unfurnished | Semi-furnished | Fully furnished | N/A
Unit presets             Studio Apartment | 1–5 Bedrooms (+ custom)
Facility presets         Pool | Gym | Parking | Security | Private Beach | Spa | Retail | Meeting Rooms | Elevators (+ custom)
Program                  Urbco Foundry | Urbco Harbor
Buying Paths             Investment | Ownership (multi, ≥1)
Interest Structure       Full (Single-ticket) | Fractional
Land units               sqm | plot
Investment Instrument    Equity | Debt | Mezzanine
Release Basis            Milestone-linked | Scheduled
Payment options          One-time | Investment Window | Scheduled Tranche | Milestone-based   (path-filtered)
Markup presets           1 | 2 | 3 | 5 | 7 | 10 | 15 | 20 | Custom %
Payment periods          Foundry: 3|6|12|18|24|36 mo · Harbor: 12|24|36|48|60 mo
Rental Frequency         Foundry: Monthly|Quarterly|Annual|N/A · Harbor: Semi-Annual|Annual|N/A
Risk Level               Low | Medium | High
Exit Liquidity           High (≤30d) | Medium (60–90d) | Low (6+ months)
Management Mode          <program>-managed | Self-managed | Third-party managed
Publish status           active (initial) | published | draft
```
