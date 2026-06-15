# Business Requirements Document
## Borderless — Inward Remittance Retail Mobile App

**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft  
**Owner:** Moinak / Borderless Product  

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Brand & Design System](#2-brand--design-system)
3. [User Persona](#3-user-persona)
4. [User Stories by Epic](#4-user-stories-by-epic)
5. [Application Structure & Navigation](#5-application-structure--navigation)
6. [Onboarding Flow](#6-onboarding-flow)
7. [Home Dashboard](#7-home-dashboard)
8. [Loan Repayment Flow](#8-loan-repayment-flow)
9. [Send Money Home Flow](#9-send-money-home-flow)
10. [Transaction History](#10-transaction-history)
11. [Profile & Settings](#11-profile--settings)
12. [Simulated Data & Mock State](#12-simulated-data--mock-state)
13. [Status & Error States](#13-status--error-states)
14. [Out of Scope — v1 Demo](#14-out-of-scope--v1-demo)

---

## 1. Product Overview

International students on education loans face two recurring financial pain points: repaying INR-denominated loans from abroad (typically requiring slow, expensive SWIFT wires) and sending money home to family. Today, both involve opaque FX rates, 3–5 day settlement windows, and intermediary bank fees.

**Borderless** solves this with a crypto-blind retail experience that moves money over stablecoin rails — the student sees only their source currency going in and INR credited at the destination. No wallets, no blockchain jargon, no crypto onboarding friction.

### Two Core Use Cases

| Use Case | User Action | Destination |
|----------|-------------|-------------|
| **Loan Repayment** | Pay EMI or custom amount toward an education loan | Lender's bank account (HDFC Credila, Avanse, Axis, SBI, etc.) |
| **Send Money Home** | Transfer money to a family member | Beneficiary's bank account or UPI ID |

### The Demo Goal

This is a high-fidelity mock application. All flows are simulated — no real APIs, no real money movement. The purpose is to demonstrate:
1. The end-to-end student remittance UX
2. The value proposition of stablecoin rails (speed, transparent FX, rate lock)
3. The Borderless product vision for the retail inward remittance segment

---

## 2. Brand & Design System

### 2.1 Logo

The Borderless logo consists of two elements used together:

- **Logomark:** Four quadrants arranged in a 2×2 grid — top-right and bottom-left are filled blue, top-left and bottom-right are also filled blue, each quadrant is a rounded rectangle. The four quadrants form a square with a subtle cross-shaped negative space at the centre.
- **Wordmark:** "borderless" in lowercase, set in the brand blue.

**Logo usage:**
- Full logo (logomark + wordmark): splash screen, onboarding header, profile screen
- Logomark only: app icon, top-left corner of authenticated screens (compact)
- Minimum clear space: equal to the height of one quadrant on all sides
- Never stretch, recolour, or separate the wordmark from the logomark on branded screens

**Logo SVG source:** `borderlessLogo.svg` in `/assets`

### 2.2 Colour Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-blue` | `#0061D3` | Logo, primary CTAs, active states |
| `--brand-blue-dark` | `#00326D` | Logo gradient end, deep accent |
| `--primary` | `#1a56db` | Buttons, links, highlights |
| `--primary-hover` | `#1648c0` | Button hover state |
| `--primary-light` | `#eff6ff` | Button ghost backgrounds, highlights |
| `--surface` | `#f9fafb` | Page/screen background |
| `--card` | `#ffffff` | Card backgrounds |
| `--border` | `#e5e7eb` | Card borders, dividers |
| `--text-primary` | `#111827` | Body text, headings |
| `--text-muted` | `#6b7280` | Labels, subtitles, placeholders |
| `--text-placeholder` | `#9ca3af` | Input placeholders |
| `--success` | `#16a34a` | Success badges, confirmed states |
| `--success-light` | `#d1fae5` | Success badge backgrounds |
| `--warning` | `#f97316` | Pending states, rate expiry warning |
| `--warning-light` | `#fff7ed` | Warning banner backgrounds |
| `--danger` | `#dc2626` | Errors, failed states |
| `--danger-light` | `#fef2f2` | Error banner backgrounds |
| `--purple` | `#7c3aed` | Processing/in-transit states |
| `--purple-light` | `#ede9fe` | Processing badge backgrounds |

### 2.3 Typography

**Font family:** Inter (Google Fonts, weights 300–700)  
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| Heading XL | 28px | 700 | Splash headline, success screen |
| Heading L | 22px | 700 | Screen titles |
| Heading M | 18px | 600 | Card titles, section headers |
| Body | 15px | 400 | Default body copy |
| Body Medium | 15px | 500 | Labels, tab items |
| Caption | 13px | 400 | Muted labels, hints |
| Micro | 11px | 500 | Status badges, all-caps labels |

### 2.4 Component Tokens

| Component | Value |
|-----------|-------|
| Button border-radius | `999px` (pill) |
| Card border-radius | `16px` |
| Input border-radius | `12px` |
| Bottom tab bar height | `64px` (+ safe area inset) |
| Top status bar | native system |
| Screen horizontal padding | `20px` |
| Card padding | `20px` |
| Section gap | `24px` |

### 2.5 Status Badges

All badges: `font-size: 11px`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.05em`, `border-radius: 999px`, `padding: 3px 10px`

| Status | Label | Text Colour | Background |
|--------|-------|-------------|------------|
| Pending | PENDING | `#f97316` | `#fff7ed` |
| Processing | PROCESSING | `#7c3aed` | `#ede9fe` |
| Credited | CREDITED | `#16a34a` | `#d1fae5` |
| Failed | FAILED | `#dc2626` | `#fef2f2` |
| KYC Approved | VERIFIED | `#16a34a` | `#d1fae5` |
| KYC Pending | UNDER REVIEW | `#f97316` | `#fff7ed` |

---

## 3. User Persona

**Arjun, 24 — MS student at University of Michigan**

- On a $45,000 education loan from HDFC Credila, denominated in INR
- Pays EMIs from his US bank account — currently using his university's wire transfer service (takes 4–5 days, costs $30 per transfer)
- Also sends $200–$300 home to his parents every month
- Not familiar with crypto — would not use a product that requires understanding wallets or stablecoins
- High trust threshold: needs to feel confident money reaches the right place
- Mobile-first: does everything on his phone

**Jobs to be done:**
1. Pay my loan EMI quickly and cheaply, from the US
2. Send money home to my parents without hassle
3. Know the exact INR amount that will land before I confirm

---

## 4. User Stories by Epic

### Epic 1 — Onboarding

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| O-1 | As a new user, I want to understand what Borderless does before signing up | Splash + value prop screen shown before any sign-up prompt |
| O-2 | As a new user, I want to create an account with my basic details | Sign-up form: name, email, phone, country of residence |
| O-3 | As a new user, I want to complete identity verification so I can send money | KYC form: ID type selection + document upload UI (simulated) |
| O-4 | As a new user, I want to know my verification is being reviewed | KYC pending screen shown immediately after submission |
| O-5 | As a new user, I want to be notified when I'm approved so I can start using the app | KYC approved screen with CTA to continue to dashboard |
| O-6 | As a returning user, I want to log in quickly | Email + PIN / biometric login screen |

### Epic 2 — Loan Repayment Setup

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| L-1 | As a student, I want to add my education loan so the app knows where to send repayments | Lender dropdown + loan reference number entry |
| L-2 | As a student, I want to link the Indian bank account my loan was disbursed into | HSBC India account number + IFSC captured during loan setup — this is the fixed repayment destination |
| L-3 | As a student, I want the app to fetch my loan details automatically | Simulated loan lookup showing outstanding balance, EMI amount, next due date, lender name |
| L-4 | As a student, I want to see my loan dashboard at a glance | Loan card showing balance, EMI, due date, lender info, and linked HSBC account (masked) |
| L-5 | As a student, I want to add more than one loan | Ability to add multiple loan accounts, each with its own linked disbursement account |

### Epic 3 — Loan Repayment Payment

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| P-1 | As a student, I want to choose how much to pay toward my loan | Amount entry: pre-filled with current EMI, option to enter custom amount |
| P-2 | As a student, I want to see the exact FX rate and fees before I commit | FX quote screen: USD → INR rate, fee, exact INR amount landing, rate lock timer |
| P-3 | As a student, I want my rate to be locked while I review | Rate lock timer (2:00) — quote expires if not confirmed in time |
| P-4 | As a student, I want to review all payment details before confirming | Review screen: source, destination (masked loan account), amount, fee, total |
| P-5 | As a student, I want to track my payment in real time | Simulated status progression: Initiated → Payment received → Converting → Credited |
| P-6 | As a student, I want confirmation that my loan was credited | Success screen with INR amount credited, transaction ID, timestamp |
| P-7 | As a student, I want a receipt I can reference or share | Downloadable/shareable payment receipt with all transaction details |

### Epic 4 — Send Money Home

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| S-1 | As a student, I want to add a family member as a beneficiary | Add beneficiary: name, relationship, bank account (IFSC + account no.) or UPI ID |
| S-2 | As a student, I want to manage my saved beneficiaries | Beneficiary list: view, edit, delete |
| S-3 | As a student, I want to send money to a saved beneficiary | Select beneficiary → enter amount |
| S-4 | As a student, I want to see the FX rate and fees before sending | Same FX quote flow as loan repayment (USD/EUR/SGD → INR) |
| S-5 | As a student, I want to review the transfer before confirming | Review screen: source, beneficiary details (masked), amount, fee, total |
| S-6 | As a student, I want to track the transfer status | Same simulated status progression as loan repayment |
| S-7 | As a student, I want confirmation and a receipt when money is sent | Success screen + receipt |

### Epic 5 — Transaction History

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| T-1 | As a student, I want to see all my past transactions in one place | Transactions list: type icon, destination, amount, date, status badge |
| T-2 | As a student, I want to filter transactions by type | Filter tabs: All / Loan Repayment / Money Transfer |
| T-3 | As a student, I want to see the full details of any transaction | Transaction detail screen with complete breakdown |

### Epic 6 — Profile & Settings

| # | Story | Acceptance Criteria |
|---|-------|---------------------|
| PR-1 | As a student, I want to see my account details and KYC status | Profile screen: name, email, phone, KYC badge |
| PR-2 | As a student, I want to manage my payment source (on-ramp method) | Add / view linked payment source: ACH (US), SEPA (EU), PayNow (SG) |

---

## 5. Application Structure & Navigation

### 5.1 Screen Routes

```
/splash                         — Splash / value prop
/onboarding/signup              — Sign up
/onboarding/kyc                 — KYC document upload
/onboarding/kyc/pending         — KYC under review
/onboarding/kyc/approved        — KYC approved

/login                          — Returning user login

/home                           — Dashboard
/loans                          — My Loans
/loans/add                      — Add loan
/loans/:id                      — Loan detail
/loans/:id/pay                  — Loan repayment wizard (steps 1–4)

/send                           — Send money home (beneficiary list)
/send/add-beneficiary           — Add beneficiary
/send/new                       — Send money wizard (steps 1–4)

/transactions                   — Transaction history
/transactions/:id               — Transaction detail

/profile                        — Profile & settings
/profile/payment-source         — Manage on-ramp source
```

### 5.2 Bottom Tab Navigation (authenticated)

| Tab | Icon | Route |
|-----|------|-------|
| Home | House | `/home` |
| Loans | Graduation cap | `/loans` |
| Send | Arrow up-right | `/send` |
| History | Clock | `/transactions` |
| Profile | Person | `/profile` |

Active tab: blue icon + label (`#1a56db`). Inactive: grey icon + label (`#9ca3af`). Tab bar background: white, top border `#e5e7eb`, height 64px + safe area inset.

---

## 6. Onboarding Flow

### Screen ON-1: Splash

**Route:** `/splash`

**Layout:** Full-screen, white background. Content vertically centred.

**Elements:**
- Borderless full logo (logomark + wordmark), centred, `width: 160px`
- Below logo: tagline — `"Pay loans. Send love home."` — 22px, bold, `#111827`, centred
- Sub-tagline: `"Fast INR transfers, powered by modern rails."` — 15px, muted, centred
- **Get Started** button — blue pill, full-width, bottom of screen with 32px margin
- **Log in** text link — below button, centred, muted: `"Already have an account? Log in"`

---

### Screen ON-2: Sign Up

**Route:** `/onboarding/signup`

**Header:** Borderless logomark (compact, top-left, `32px`)

**Title:** `"Create your account"` — 22px, bold  
**Subtitle:** `"Takes less than 2 minutes."` — muted

**Form Fields:**

| Field | Type | Placeholder | Required |
|-------|------|-------------|----------|
| Full Name | Text | `Arjun Mehta` | Yes |
| Email Address | Email | `arjun@email.com` | Yes |
| Phone Number | Tel | `+1 (555) 000-0000` | Yes |
| Country of Residence | Dropdown | `United States` | Yes |

**CTA:** `"Continue"` — blue pill, full-width  

**Footer:** `"By continuing, you agree to our Terms of Service and Privacy Policy."` — 12px, muted, centred

---

### Screen ON-3: KYC — Identity Verification

**Route:** `/onboarding/kyc`

**Header:** Back arrow (left) + progress indicator `1 of 2`

**Title:** `"Verify your identity"` — 22px, bold  
**Subtitle:** `"Required to send money. Takes under a minute."` — muted

**Step progress bar:** `● Upload ID  ○ Review` — 2 steps

**Form:**

| Field | Type | Notes |
|-------|------|-------|
| ID Type | Pill selector (3 options) | `Passport` · `Driver's License` · `National ID` |
| Front of Document | File upload zone | Drag & drop or tap to upload. PNG, JPG, PDF. Max 10MB. Shows file name + remove button after upload. |
| Selfie | Camera/upload zone | `"Take a selfie or upload a photo"` — shows preview after capture |

**CTA:** `"Submit for Verification"` — blue pill, full-width  

**Hint text below CTA:** `"Your documents are encrypted and never stored beyond verification."` — 12px, muted, centred

---

### Screen ON-4: KYC — Under Review

**Route:** `/onboarding/kyc/pending`

**Layout:** Full-screen, centred content. No back button.

**Elements:**
- Borderless logomark (top-left)
- Animated hourglass or pulsing shield icon (centre) — blue
- Heading: `"Verifying your identity"` — 22px, bold
- Subtext: `"This usually takes less than a minute."` — muted
- Animated progress dots below subtext
- **Auto-advances** to ON-5 after 3 seconds (simulated approval)

---

### Screen ON-5: KYC — Approved

**Route:** `/onboarding/kyc/approved`

**Layout:** Full-screen, centred content.

**Elements:**
- Large green checkmark icon in filled circle (`#16a34a`)
- Heading: `"You're verified!"` — 22px, bold
- Subtext: `"Your identity has been confirmed. You can now send money."` — muted
- `VERIFIED` badge (green pill) — centred below subtext
- **Continue to Dashboard** button — blue pill, full-width, bottom of screen

---

### Screen ON-6: Login (Returning User)

**Route:** `/login`

**Header:** Borderless full logo (centred)

**Title:** `"Welcome back"` — 22px, bold

**Form:**
- Email address field
- 6-digit PIN field (masked dots) — `"Enter your PIN"`

**CTA:** `"Log In"` — blue pill, full-width  
**Secondary:** `"Use Face ID / Touch ID"` — ghost button with biometric icon  
**Footer link:** `"Forgot PIN?"` — blue text link, centred

---

## 7. Home Dashboard

### Screen H-1: Home

**Route:** `/home`

**Header (top of screen):**
- Left: Borderless logomark (`24px`)
- Right: Bell icon (notifications) + Avatar circle with user initial

**Greeting card** (full-width, blue gradient `#0061D3 → #00326D`, `border-radius: 20px`, `padding: 24px`):
- `"Good morning, Arjun"` — 18px, semibold, white
- Sub-label: `"borderless.world"` — 13px, white 60% opacity
- Below: `VERIFIED` badge (white text, white/20% background)

**Quick Actions row** (2 cards, side by side):

| Card | Icon | Label | Route |
|------|------|-------|-------|
| Pay Loan | Graduation cap | `"Pay Loan"` | `/loans` |
| Send Home | Arrow up-right | `"Send Home"` | `/send` |

Cards: white, `border-radius: 16px`, `border: 1px solid #e5e7eb`, `padding: 20px`, icon in blue circle, label below.

**My Loans section:**
- Section header: `"My Loans"` — 16px, semibold + `"Add"` link (blue, right-aligned)
- Loan summary card (if loan added): lender name, outstanding balance in INR, next EMI due date, `Pay Now` button (blue pill, small)
- Empty state (if no loan): `"No loans added yet"` — muted, `"+ Add Loan"` blue text button

**Recent Transactions section:**
- Section header: `"Recent Transactions"` — 16px, semibold + `"See All"` link
- 3 most recent transaction rows (see Section 10 for row spec)
- Empty state: `"No transactions yet"` — muted

---

## 8. Loan Repayment Flow

### Screen L-1: My Loans

**Route:** `/loans`

**Title:** `"My Loans"` — 22px, bold  
**Subtitle:** `"Manage and repay your education loans."` — muted

**Add Loan button:** `"+ Add Loan"` — blue pill, top-right

**Loan cards list:**

Each card (`border: 1px solid #e5e7eb`, `border-radius: 16px`, `padding: 20px`):
- Top row: lender logo placeholder (grey circle) + lender name (bold) + loan account number (masked: `****4821`, muted)
- Middle row: `"Outstanding Balance"` label (muted, 12px caps) + balance in INR (bold, 22px, `#111827`)
- Bottom row: `"Next EMI"` — amount + due date (muted) | `Pay Now` button (blue pill, small, right-aligned)

Empty state: centred illustration + `"No loans added"` + `"Add your first education loan"` + `"+ Add Loan"` blue button.

---

### Screen L-2: Add Loan

**Route:** `/loans/add`

**Header:** Back arrow + `"Add Loan"` title (centred)

**Step progress (3 steps):** `● Loan Details  ○ Repayment Account  ○ Confirm`

**Section 1 — Loan details:**

| Field | Type | Options / Placeholder |
|-------|------|----------------------|
| Lender | Dropdown | HDFC Credila · Avanse Financial · Axis Bank · SBI · ICICI Bank · Other |
| Loan Reference Number | Text | `Enter your loan reference number` |
| Your Name on Loan | Text | Auto-filled from KYC name; editable |

**Section 2 — Repayment account** (shown after lender is selected, with a contextual hint):

> **Hint card** (light yellow `#fef9c3`, `border-radius: 12px`, `padding: 14px`):  
> `"Your lender disburses the loan into your Indian bank account. Repayments go back to that same account."` — 13px, muted

| Field | Type | Placeholder | Notes |
|-------|------|-------------|-------|
| Bank Name | Dropdown | `HSBC India` | Indian bank where loan was disbursed |
| Account Number | Text | `Enter account number` | |
| IFSC Code | Text | `HSBC0001234` | |
| Account Name | Text (read-only) | Auto-filled: `"ARJUN MEHTA"` + `Verified ✓` (simulated) | |

**CTA:** `"Look Up My Loan"` — blue pill, full-width

**Behaviour:** On submit → simulated 2-second loading state → advances to L-3

---

### Screen L-3: Loan Details Confirmation

**Route:** `/loans/add` (step 2)

**Step progress:** `✓ Loan Details  ✓ Repayment Account  ● Confirm`

**Loan summary card** (light blue background `#eff6ff`, `border-radius: 16px`, `padding: 20px`):

| Label | Value (simulated) |
|-------|-------------------|
| Lender | HDFC Credila |
| Loan Reference | ****4821 |
| Borrower | Arjun Mehta |
| Outstanding Balance | ₹28,45,000 |
| Monthly EMI | ₹32,500 |
| Next Due Date | Jul 5, 2026 |

**Repayment account card** (white, `border: 1px solid #e5e7eb`, `border-radius: 12px`, `padding: 16px`, below loan card):
- Section label: `"REPAYMENTS GO TO"` — 11px, muted, uppercase
- Bank name + account (masked): `HSBC India · ****7823`
- Account name: `Arjun Mehta` + `Verified ✓` green badge
- IFSC: `HSBC0400002`

> This account is fixed for all repayments of this loan. It cannot be changed after saving — contact support if needed.

**CTA:** `"Add This Loan"` — blue pill, full-width  
**Secondary:** `"This doesn't look right"` — grey text link, centred

**On success:** Returns to `/loans` with loan card added + green toast `"Loan added successfully"`

---

### Screen L-4: Loan Detail

**Route:** `/loans/:id`

**Header:** Back arrow + lender name (centred)

**Loan header card** (blue gradient, same as home greeting card):
- Lender name — 16px, semibold, white
- `"Outstanding Balance"` label — 13px, white 60%
- Balance in INR — 28px, bold, white (e.g. `₹28,45,000`)
- Below: `"Next EMI: ₹32,500 · Due Jul 5, 2026"` — 13px, white 70%

**Details card** (white, below):

| Field | Value |
|-------|-------|
| Loan Reference | ****4821 |
| Lender | HDFC Credila |
| Loan Type | Education Loan |
| Tenure | 10 years |
| Interest Rate | 11.5% p.a. |
| EMI Amount | ₹32,500 / month |
| Next Due Date | Jul 5, 2026 |
| Repayment Account | HSBC India · ****7823 |

**CTA row (bottom, sticky):**
- `"Pay EMI"` — blue pill, full-width (pre-fills EMI amount)
- `"Custom Amount"` — ghost pill, full-width

---

### Screen LP-1: Loan Payment — Step 1 (Amount)

**Route:** `/loans/:id/pay`

**Header:** Back arrow + `"Repay Loan"` title

**Step progress (4 steps):** `● Amount  ○ Quote  ○ Review  ○ Done`

**Reference card** (light blue `#eff6ff`, `border-radius: 12px`, `padding: 16px`):  
`"HDFC Credila"` (lender, muted, 12px) | `"EMI due Jul 5"` (muted)  
`"To: HSBC India ****7823"` — 13px, `#111827` (the fixed repayment account)

**Amount input (large):**
- Currency selector pill (left): flag + currency code — `🇺🇸 USD` (tappable, shows corridor options: USD / EUR / SGD)
- Amount input (right): large numeric input, placeholder `0.00`
- Pre-filled suggestion: `"= ₹32,500 EMI"` — blue text below input, tappable to auto-fill

**Quick amount pills row:** `₹10,000` · `₹25,000` · `₹32,500 (EMI)` · `₹50,000`

**Live equivalent row:**  
`"≈ USD 387.00"` — muted, updates as user types (or vice versa)

**CTA:** `"Get Quote"` — blue pill, full-width, disabled until amount > 0

---

### Screen LP-2: Loan Payment — Step 2 (FX Quote)

**Route:** `/loans/:id/pay` (step 2)

**Step progress:** `✓ Amount  ● Quote  ○ Review  ○ Done`

**Rate lock timer (top-right):** `"Rate locked for  1:58"` — orange text, countdown  
When < 30s: text turns red, background flashes subtly.

**Quote card** (white, `border-radius: 16px`, `padding: 20px`):

**You send:**  
`$387.00 USD` — 28px, bold, `#111827`  
`"via ACH from Chase Bank ****4521"` — 13px, muted

**Arrow down icon** (grey, centred)

**Your account receives:**  
`₹32,500 INR` — 28px, bold, `#16a34a`  
`"HSBC India — ****7823"` — 13px, muted  
`"Loan repayment account · HDFC Credila"` — 12px, muted

**Rate row:** `"Exchange Rate"` · `$1 = ₹83.91` (bold) — `"Live rate"` badge (blue, pill, small)

**Fee breakdown (collapsible `"Show details"` link):**

| Label | Amount |
|-------|--------|
| Transfer amount | $387.00 |
| Borderless fee | $2.50 |
| **Total you pay** | **$389.50** |

**Subtle footnote:** `"Powered by instant settlement rails"` — 12px, muted, centred. *(No crypto mention.)*

**CTA:** `"Lock This Rate"` — blue pill, full-width  
**Secondary:** `"Refresh Quote"` — grey text link (if timer nearing expiry)

---

### Screen LP-3: Loan Payment — Step 3 (Review & Confirm)

**Route:** `/loans/:id/pay` (step 3)

**Step progress:** `✓ Amount  ✓ Quote  ● Review  ○ Done`

**Timer (top-right):** `"Rate expires  1:32"` — orange, countdown continues

**Title:** `"Review your payment"` — 20px, bold

**Summary card:**

| Label | Value |
|-------|-------|
| You send | `$389.50 USD` |
| From | `Chase Bank ****4521 (ACH)` |
| Exchange rate | `$1 = ₹83.91` |
| Your account receives | `₹32,500 INR` |
| To | `HSBC India ****7823 (your loan account)` |
| Loan | `HDFC Credila — ****4821` |
| Purpose | `Education Loan Repayment` |
| Estimated credit | `Within minutes` |

**CTA:** `"Confirm & Send"` — blue pill, full-width  
**Secondary:** `"Go back"` — grey text link

**Quote expiry handling:** If timer hits 0:00 before user confirms — CTA disabled, inline message: `"Rate expired. Get a new quote."` + `"Refresh"` button.

---

### Screen LP-4: Loan Payment — Step 4 (Processing → Credited)

**Route:** `/loans/:id/pay` (step 4)

**No back button.** Full-screen animated state.

**Processing state (shown for ~3 seconds):**
- Animated pulsing circle (blue)
- Heading: `"Sending your payment…"` — 20px, bold, centred
- Subtext: `"This usually takes less than a minute."` — muted

**Status stepper** (vertical, appears below animation, steps fill in sequentially):

| Step | Label | Timing |
|------|-------|--------|
| 1 | Payment initiated | Immediate |
| 2 | Funds received | +1s |
| 3 | Converting to INR | +2s |
| 4 | Credited to HSBC India ****7823 | +3s |

Each step: small circle (fills blue on complete) + label + timestamp (simulated, e.g. `"Jun 11, 2026 · 3:42 PM"`).

**Auto-advances** to LP-5 when all steps complete.

---

### Screen LP-5: Loan Payment — Step 5 (Success)

**Route:** `/loans/:id/pay` (success)

**Step progress:** All 4 steps completed (all blue ✓)

**Centre-aligned:**
- Large green checkmark in filled circle (`#16a34a`, `64px`)
- Heading: `"Loan payment sent!"` — 24px, bold
- Subtext: `"₹32,500 has been credited to your HSBC India account."` — muted

**Receipt card:**

| Label | Value |
|-------|-------|
| Transaction ID | `TXN-20260611-4821` |
| Amount sent | $389.50 USD |
| Amount credited | ₹32,500 INR |
| Exchange rate | $1 = ₹83.91 |
| Credited to | HSBC India ****7823 |
| Loan | HDFC Credila ****4821 |
| Date & time | Jun 11, 2026 · 3:42 PM |
| Status | `CREDITED` (green badge) |

**CTA row:**
- `"Download Receipt"` — blue pill, full-width
- `"Back to Home"` — ghost pill, full-width

---

## 9. Send Money Home Flow

### Screen SM-1: Send Money Home (Beneficiary List)

**Route:** `/send`

**Title:** `"Send Money Home"` — 22px, bold  
**Subtitle:** `"Send INR to family in India."` — muted

**Add Beneficiary button:** `"+ Add Beneficiary"` — blue pill, top-right

**Beneficiary cards list:**

Each card (`border: 1px solid #e5e7eb`, `border-radius: 16px`, `padding: 20px`):
- Left: Avatar circle (initials, blue background)
- Centre: Name (bold) + relationship tag (`"Father"`, muted pill) + masked destination (`"SBI ****2210"` or `"UPI: dad@upi"`, muted)
- Right: `"Send"` button — blue pill, small

Empty state: `"No beneficiaries added"` + `"Add a family member to send money home"` + `"+ Add Beneficiary"` button.

---

### Screen SM-2: Add Beneficiary

**Route:** `/send/add-beneficiary`

**Header:** Back arrow + `"Add Beneficiary"`

**Form:**

| Field | Type | Placeholder |
|-------|------|-------------|
| Full Name | Text | `Dad's full name` |
| Relationship | Dropdown pill selector | Father · Mother · Spouse · Sibling · Other |
| Destination Type | Toggle | `Bank Account` / `UPI ID` |

**If Bank Account selected:**

| Field | Type | Placeholder |
|-------|------|-------------|
| Bank Name | Dropdown | State Bank of India, HDFC Bank, ICICI Bank, Axis Bank, Kotak… |
| Account Number | Text | `Enter account number` |
| IFSC Code | Text | `SBIN0001234` |
| Account Name | Text (read-only) | Auto-filled after account entry (simulated): `"RAMESH MEHTA"` + `Verified ✓` badge |

**If UPI ID selected:**

| Field | Type | Placeholder |
|-------|------|-------------|
| UPI ID | Text | `dad@okicici` |

**CTA:** `"Save Beneficiary"` — blue pill, full-width

**On success:** Returns to `/send` with beneficiary added + green toast `"Beneficiary saved"`

---

### Screen SM-3 to SM-7: Send Money Wizard

**Route:** `/send/new`

**Step progress (4 steps):** `Amount  →  Quote  →  Review  →  Done`

The send money wizard is **identical in structure** to the Loan Payment wizard (Screens LP-1 through LP-5) with the following differences:

| Element | Loan Repayment | Send Money Home |
|---------|---------------|-----------------|
| Reference card | Loan account + lender | Beneficiary name + relationship |
| Destination label | `"Loan receives"` | `"They receive"` |
| Destination detail | `"HDFC Credila ****4821"` | `"Dad · SBI ****2210"` |
| Purpose | `"Education Loan Repayment"` | `"Family Maintenance"` |
| Quick amounts | Loan-specific | `₹5,000` · `₹10,000` · `₹25,000` · `₹50,000` |
| Success heading | `"Loan payment sent!"` | `"Money sent home!"` |
| Success subtext | Loan credited copy | `"₹10,000 is on its way to Dad."` |

---

## 10. Transaction History

### Screen TX-1: Transactions

**Route:** `/transactions`

**Title:** `"Transactions"` — 22px, bold

**Summary cards row (2 cards, side by side):**

| Card | Label | Value |
|------|-------|-------|
| Loan Payments | TOTAL REPAID | `$1,168.50` |
| Money Sent | TOTAL SENT | `$583.20` |

**Filter tab bar:** `All` · `Loan Payments` · `Money Sent`

**Transaction rows list:**

Each row (`padding: 16px 0`, `border-bottom: 1px solid #f3f4f6`):
- Left: Icon in coloured circle — graduation cap (loan, blue) or house (send home, green)
- Centre: Primary label (bold, 15px) — e.g. `"HDFC Credila Repayment"` or `"Sent to Dad"` + Date (muted, 13px) — `"Jun 11, 2026"`
- Right: Amount (bold, 15px) — `"$389.50"` + Status badge below

Tapping a row → navigates to TX-2.

---

### Screen TX-2: Transaction Detail

**Route:** `/transactions/:id`

**Header:** Back arrow + `"Transaction Detail"`

**Status hero block** (full-width card, background matches status colour tint):
- Status badge (large, centred)
- Transaction type — `"Loan Repayment"` or `"Money Transfer"` — 18px, semibold
- Amount sent — 28px, bold, `#111827`
- Date — muted

**Details card:**

For loan repayment:

| Label | Value |
|-------|-------|
| Transaction ID | `TXN-20260611-4821` |
| You sent | `$389.50 USD` |
| Exchange rate | `$1 = ₹83.91` |
| Amount credited | `₹32,500 INR` |
| From | `Chase Bank ****4521` |
| Credited to | `HSBC India ****7823 (your loan account)` |
| Loan | `HDFC Credila ****4821` |
| Purpose | Education Loan Repayment |
| Initiated | Jun 11, 2026 · 3:42 PM |
| Credited | Jun 11, 2026 · 3:43 PM |
| Status | `CREDITED` |

**Status timeline** (vertical stepper, all steps completed for settled transactions):
- Payment initiated → Funds received → Converting to INR → Credited

**CTA:** `"Download Receipt"` — ghost pill, full-width

---

## 11. Profile & Settings

### Screen PR-1: Profile

**Route:** `/profile`

**Header:** Borderless logomark (top-left)

**Profile card** (blue gradient, same style as home greeting card):
- Avatar circle (initials, white, large — 56px)
- Name — 18px, semibold, white
- Email — 13px, white 70%
- `VERIFIED` badge (white outline pill)

**Settings list:**

| Item | Icon | Detail | Chevron |
|------|------|--------|---------|
| Payment Source | Bank icon | `Chase Bank ****4521 (ACH)` | → |
| My Loans | Graduation cap | `1 active loan` | → |
| Beneficiaries | Person icon | `2 saved` | → |
| Transaction History | Clock | — | → |
| Help & Support | Question mark | — | → |
| Log Out | Exit icon | — | — (red text) |

---

### Screen PR-2: Payment Source

**Route:** `/profile/payment-source`

**Header:** Back arrow + `"Payment Source"`

**Subtitle:** `"This is where your transfers are funded from."` — muted

**Connected source card** (white, `border: 1px solid #e5e7eb`, `border-radius: 16px`, `padding: 20px`):
- Bank icon + `"Chase Bank"` (bold) + `"Checking ****4521"` (muted)
- `"ACH Transfer"` — 13px, muted + `"Default"` green badge

**Add another source** (ghost card, dashed border):
- `"+ Add Payment Source"` — centred, blue text

**Available source types:**

| Type | Label | Countries |
|------|-------|-----------|
| ACH | US Bank Account | United States |
| SEPA | European Bank Account | Eurozone |
| PayNow / FAST | Singapore Bank / PayNow | Singapore |

---

## 12. Simulated Data & Mock State

All data in the demo is hardcoded. No real API calls.

### Default User (logged-in state)

| Field | Value |
|-------|-------|
| Name | Arjun Mehta |
| Email | arjun@email.com |
| Phone | +1 (734) 555-0142 |
| Country | United States |
| KYC Status | Verified |
| Payment Source | Chase Bank · Checking ****4521 (ACH) |

### Simulated Loan

| Field | Value |
|-------|-------|
| Lender | HDFC Credila |
| Loan Reference | ****4821 |
| Outstanding Balance | ₹28,45,000 |
| Monthly EMI | ₹32,500 |
| Next Due Date | Jul 5, 2026 |
| Interest Rate | 11.5% p.a. |
| Tenure | 10 years |
| Repayment Account | HSBC India · ****7823 · IFSC: HSBC0400002 |
| Account Name | Arjun Mehta |

### Simulated Beneficiaries

| Name | Relationship | Destination |
|------|-------------|-------------|
| Ramesh Mehta | Father | SBI ****2210 |
| Priya Mehta | Mother | UPI: priya.mehta@okhdfc |

### Simulated FX Rates

| Corridor | Rate | Fee |
|----------|------|-----|
| USD → INR | $1 = ₹83.91 | $2.50 flat |
| EUR → INR | €1 = ₹91.45 | €2.50 flat |
| SGD → INR | S$1 = ₹62.80 | S$2.50 flat |

### Simulated Transaction History

| ID | Type | Amount | INR | Status | Date |
|----|------|--------|-----|--------|------|
| TXN-001 | Loan Repayment | $389.50 | ₹32,500 | Credited | Jun 11, 2026 |
| TXN-002 | Money Transfer | $120.80 | ₹10,000 | Credited | Jun 3, 2026 |
| TXN-003 | Loan Repayment | $389.50 | ₹32,500 | Credited | May 7, 2026 |

---

## 13. Status & Error States

### 13.1 Loading States
- All CTAs show a spinner and are disabled while a simulated API call is in progress
- Loan lookup: 2-second loading state with `"Looking up your loan…"` label
- KYC review: 3-second animated pending state before auto-advancing to approved

### 13.2 Empty States
All list screens (Loans, Beneficiaries, Transactions) show:
- Muted icon (grey, centred)
- Heading: e.g. `"No loans added yet"`
- Sub-text + CTA button

### 13.3 Form Validation
- All required fields: inline red error below field on submit if empty
- Email: format validation
- IFSC: 11-character alphanumeric format check (mocked)
- Amount: must be > 0; must not exceed `"Max: $5,000 per transfer"` (mocked limit)

### 13.4 Rate Expiry
- Timer turns red when < 30 seconds remain
- At 0:00: CTA disabled, message: `"Rate expired. Tap to refresh."` + `"Refresh Rate"` blue text button
- Refreshing re-runs the quote step with a new simulated rate (±0.5% variance)

### 13.5 KYC Gate
- All routes under `/loans`, `/send`, `/transactions`, `/profile` redirect to `/onboarding/kyc/pending` if KYC is not approved
- On-screen message: `"Complete identity verification to continue"`

---

## 14. Out of Scope — v1 Demo

| Item | Note |
|------|------|
| Real KYC / Facia AI | Simulated — no document verification |
| Real FX rates | Hardcoded rates with ±0.5% simulated variance |
| Real bank connections (Plaid/ACH) | Simulated — payment source is mocked |
| Real IMPS/UPI payout | Simulated — no actual money movement |
| Push notifications | Not implemented |
| Recurring / scheduled payments | Post-demo feature |
| Multi-currency wallet | Not in scope |
| Loan lender API integration | Loan data is hardcoded |
| LRS / FEMA tracking | Not relevant for demo |
| Referral programme | Post-demo |
| Biometric login (real) | UI only — no actual biometric auth |

---

*Document prepared by Borderless Product Team · June 2026*  
*For the demo build, all flows are simulated. No real money movement or API calls.*
