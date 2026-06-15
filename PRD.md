# Product Requirements Document
## Borderless — Inward Remittance Retail App (Demo)

**Version:** 1.0  
**Date:** June 2026  
**Status:** Engineering Ready  
**Owner:** Moinak / Borderless Product  
**Depends on:** BRD v1.0

---

## Table of Contents

1. [Tech Stack & Decisions](#1-tech-stack--decisions)
2. [Project Structure](#2-project-structure)
3. [Design System Implementation](#3-design-system-implementation)
4. [Routing & Navigation](#4-routing--navigation)
5. [State Management & Mock Data](#5-state-management--mock-data)
6. [Simulation Engine](#6-simulation-engine)
7. [Shared Components](#7-shared-components)
8. [Screen Specifications](#8-screen-specifications)
9. [Animation & Interaction Specs](#9-animation--interaction-specs)
10. [Assets & Fonts](#10-assets--fonts)
11. [Build & Run](#11-build--run)

---

## 1. Tech Stack & Decisions

### 1.1 Framework: React + Vite (Web, Mobile-First)

This is a **web app that presents as a mobile app**. The app renders inside a fixed `390×844px` phone frame centred in the browser — the standard approach for web-based mobile demos. No React Native, no app store.

**Rationale:**
- Consistent with the existing BRNX codebase (React + Vite + Tailwind)
- Demo-shareable via URL — no app install required
- Faster to build than React Native for a mock
- Full browser dev tooling (no Metro bundler, no simulators required)

### 1.2 Full Stack

| Concern | Library | Version | Notes |
|---------|---------|---------|-------|
| UI Framework | React | 18 | |
| Bundler | Vite | 5 | |
| Routing | React Router | v6 | `createBrowserRouter` |
| Styling | Tailwind CSS | v4 | `@theme` tokens in CSS |
| State | Zustand | 4 | Single store, no context hell |
| Animations | Framer Motion | 11 | Page transitions + micro-animations |
| Icons | Lucide React | latest | Consistent icon system |
| Font | Inter | 300–700 | Google Fonts |
| Date utils | date-fns | 3 | Formatting only |

No backend. No API calls. No environment variables needed.

### 1.3 Key Constraints

- No real auth — login is purely navigational
- No real KYC — document upload is UI only, approval is simulated after 3s
- No real FX — rates are hardcoded with a deterministic variance function
- No real payments — processing is a `setTimeout` chain
- All state lives in Zustand; persisted to `localStorage` so the demo survives page refresh

---

## 2. Project Structure

```
brnx-app/
├── public/
│   └── assets/
│       ├── borderless-logo.svg       ← full logo (logomark + wordmark)
│       └── borderless-mark.svg       ← logomark only (4 quadrants)
├── src/
│   ├── main.jsx                      ← Vite entry, router setup
│   ├── App.jsx                       ← PhoneFrame wrapper + RouterProvider
│   ├── index.css                     ← Tailwind @theme tokens + base styles
│   │
│   ├── store/
│   │   └── index.js                  ← Zustand store (single file)
│   │
│   ├── data/
│   │   └── mock.js                   ← All hardcoded mock data
│   │
│   ├── lib/
│   │   ├── simulation.js             ← setTimeout-based payment simulation
│   │   └── fx.js                     ← FX rate logic + rate lock timer
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PhoneFrame.jsx        ← 390×844 container with chrome
│   │   │   ├── BottomTabBar.jsx      ← Home/Loans/Send/History/Profile
│   │   │   └── ScreenHeader.jsx      ← Back arrow + title + right action
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.jsx            ← Pill buttons (primary / ghost / danger)
│   │   │   ├── Input.jsx             ← Text input with label + error
│   │   │   ├── Dropdown.jsx          ← Native select styled
│   │   │   ├── Badge.jsx             ← Status badges (Credited / Pending / etc.)
│   │   │   ├── Card.jsx              ← White card with border-radius
│   │   │   ├── GradientCard.jsx      ← Blue gradient card (home header style)
│   │   │   ├── StepProgress.jsx      ← Horizontal step indicator
│   │   │   ├── StatusStepper.jsx     ← Vertical processing steps
│   │   │   ├── CountdownTimer.jsx    ← MM:SS rate lock countdown
│   │   │   ├── Toast.jsx             ← Green/red floating toast
│   │   │   ├── FileUpload.jsx        ← Drag & drop / tap upload zone
│   │   │   └── PillSelector.jsx      ← Multi-option pill toggle (KYC ID type)
│   │   │
│   │   └── domain/
│   │       ├── LoanCard.jsx          ← Loan summary card (used on /loans list)
│   │       ├── TransactionRow.jsx    ← Single row in transaction list
│   │       ├── BeneficiaryCard.jsx   ← Beneficiary card with Send button
│   │       ├── QuoteCard.jsx         ← FX quote with send/receive amounts
│   │       └── FeeBreakdown.jsx      ← Collapsible fee detail
│   │
│   └── pages/
│       ├── onboarding/
│       │   ├── Splash.jsx
│       │   ├── SignUp.jsx
│       │   ├── KycUpload.jsx
│       │   ├── KycPending.jsx
│       │   ├── KycApproved.jsx
│       │   └── Login.jsx
│       │
│       ├── home/
│       │   └── Home.jsx
│       │
│       ├── loans/
│       │   ├── LoanList.jsx
│       │   ├── AddLoan.jsx           ← 3-step wizard (internal state)
│       │   ├── LoanDetail.jsx
│       │   └── pay/
│       │       ├── PayAmount.jsx     ← Step 1
│       │       ├── PayQuote.jsx      ← Step 2
│       │       ├── PayReview.jsx     ← Step 3
│       │       ├── PayProcessing.jsx ← Step 4
│       │       └── PaySuccess.jsx    ← Step 5
│       │
│       ├── send/
│       │   ├── SendHome.jsx          ← Beneficiary list
│       │   ├── AddBeneficiary.jsx
│       │   └── wizard/
│       │       ├── SendAmount.jsx
│       │       ├── SendQuote.jsx
│       │       ├── SendReview.jsx
│       │       ├── SendProcessing.jsx
│       │       └── SendSuccess.jsx
│       │
│       ├── transactions/
│       │   ├── TransactionList.jsx
│       │   └── TransactionDetail.jsx
│       │
│       └── profile/
│           ├── Profile.jsx
│           └── PaymentSource.jsx
│
├── index.html
├── vite.config.js
├── tailwind.config.js               ← (if needed for v4 compat)
└── package.json
```

---

## 3. Design System Implementation

### 3.1 CSS Tokens (`src/index.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  /* Brand */
  --color-brand:          #0061D3;
  --color-brand-dark:     #00326D;

  /* Primary UI */
  --color-primary:        #1a56db;
  --color-primary-hover:  #1648c0;
  --color-primary-light:  #eff6ff;

  /* Surface */
  --color-surface:        #f9fafb;
  --color-card:           #ffffff;
  --color-border:         #e5e7eb;
  --color-border-light:   #f3f4f6;

  /* Text */
  --color-text:           #111827;
  --color-muted:          #6b7280;
  --color-placeholder:    #9ca3af;

  /* Semantic */
  --color-success:        #16a34a;
  --color-success-light:  #d1fae5;
  --color-warning:        #f97316;
  --color-warning-light:  #fff7ed;
  --color-danger:         #dc2626;
  --color-danger-light:   #fef2f2;
  --color-purple:         #7c3aed;
  --color-purple-light:   #ede9fe;

  /* Radius */
  --radius-pill:          9999px;
  --radius-card:          16px;
  --radius-input:         12px;
  --radius-badge:         9999px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: #e5e7eb;   /* grey desktop bg behind the phone frame */
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

### 3.2 Button Component (`src/components/ui/Button.jsx`)

Three variants:

| Variant | Class pattern | Usage |
|---------|--------------|-------|
| `primary` | `bg-primary text-white rounded-pill` | Main CTA |
| `ghost` | `border border-primary text-primary rounded-pill` | Secondary CTA |
| `danger` | `text-danger` | Destructive / log out |

Props: `variant`, `size` (`sm` / `md` / `lg`), `loading` (shows spinner + disables), `fullWidth`, `onClick`, `disabled`.

```jsx
// Usage
<Button variant="primary" fullWidth loading={isSubmitting}>Confirm & Send</Button>
<Button variant="ghost" fullWidth>Go back</Button>
```

### 3.3 Badge Component (`src/components/ui/Badge.jsx`)

```jsx
const BADGE_STYLES = {
  credited:   { text: 'CREDITED',    color: '#16a34a', bg: '#d1fae5' },
  pending:    { text: 'PENDING',     color: '#f97316', bg: '#fff7ed' },
  processing: { text: 'PROCESSING',  color: '#7c3aed', bg: '#ede9fe' },
  failed:     { text: 'FAILED',      color: '#dc2626', bg: '#fef2f2' },
  verified:   { text: 'VERIFIED',    color: '#16a34a', bg: '#d1fae5' },
  review:     { text: 'UNDER REVIEW',color: '#f97316', bg: '#fff7ed' },
}
```

Props: `status` (key from above map), `size` (`sm` / `md`).

### 3.4 PhoneFrame Component (`src/components/layout/PhoneFrame.jsx`)

Wraps the entire app in a 390×844 container:

```jsx
// Desktop: centred phone frame with chrome
// Mobile (actual phone): full screen, no chrome

const PhoneFrame = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#e5e7eb]">
    <div
      style={{ width: 390, height: 844 }}
      className="relative bg-white overflow-hidden rounded-[44px]
                 shadow-2xl border-[8px] border-[#1a1a1a] flex flex-col"
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7
                      bg-[#1a1a1a] rounded-b-2xl z-50" />
      {/* Screen content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  </div>
)
```

On viewports < 430px wide: frame chrome hidden, app fills full screen (real phone experience for demos on actual devices).

### 3.5 CountdownTimer Component (`src/components/ui/CountdownTimer.jsx`)

```jsx
// Props: initialSeconds (default 120), onExpire callback
// Displays MM:SS
// Text colour: --color-warning when > 30s, --color-danger when ≤ 30s
// Calls onExpire() at 0:00 — parent disables CTA and shows "Rate expired" message
```

---

## 4. Routing & Navigation

### 4.1 Router Setup (`src/main.jsx`)

```jsx
const router = createBrowserRouter([
  // Unauthenticated
  { path: '/',                  element: <Splash /> },
  { path: '/signup',            element: <SignUp /> },
  { path: '/kyc',               element: <KycUpload /> },
  { path: '/kyc/pending',       element: <KycPending /> },
  { path: '/kyc/approved',      element: <KycApproved /> },
  { path: '/login',             element: <Login /> },

  // Authenticated shell (has BottomTabBar)
  {
    path: '/app',
    element: <AuthenticatedLayout />,   // renders <Outlet> + <BottomTabBar>
    children: [
      { path: 'home',                   element: <Home /> },

      { path: 'loans',                  element: <LoanList /> },
      { path: 'loans/add',              element: <AddLoan /> },
      { path: 'loans/:id',              element: <LoanDetail /> },
      { path: 'loans/:id/pay/amount',   element: <PayAmount /> },
      { path: 'loans/:id/pay/quote',    element: <PayQuote /> },
      { path: 'loans/:id/pay/review',   element: <PayReview /> },
      { path: 'loans/:id/pay/processing', element: <PayProcessing /> },
      { path: 'loans/:id/pay/success',  element: <PaySuccess /> },

      { path: 'send',                   element: <SendHome /> },
      { path: 'send/add-beneficiary',   element: <AddBeneficiary /> },
      { path: 'send/amount',            element: <SendAmount /> },
      { path: 'send/quote',             element: <SendQuote /> },
      { path: 'send/review',            element: <SendReview /> },
      { path: 'send/processing',        element: <SendProcessing /> },
      { path: 'send/success',           element: <SendSuccess /> },

      { path: 'transactions',           element: <TransactionList /> },
      { path: 'transactions/:id',       element: <TransactionDetail /> },

      { path: 'profile',                element: <Profile /> },
      { path: 'profile/payment-source', element: <PaymentSource /> },
    ]
  }
])
```

### 4.2 BottomTabBar Visibility

The `AuthenticatedLayout` hides the `BottomTabBar` when the current route is a wizard step or a detail page — specifically any route matching:
- `/app/loans/:id/pay/*`
- `/app/send/amount`, `/app/send/quote`, `/app/send/review`, `/app/send/processing`, `/app/send/success`
- `/app/loans/add`
- `/app/send/add-beneficiary`
- `/app/transactions/:id`
- `/app/profile/payment-source`

### 4.3 Scroll Behaviour

Each screen is a `flex flex-col h-full overflow-y-auto` container. The phone frame clips overflow. Sticky CTAs are `sticky bottom-0` with a white fade-out gradient above them.

---

## 5. State Management & Mock Data

### 5.1 Zustand Store (`src/store/index.js`)

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_USER, MOCK_LOANS, MOCK_BENEFICIARIES,
         MOCK_TRANSACTIONS, MOCK_PAYMENT_SOURCE } from '../data/mock'

const useStore = create(
  persist(
    (set, get) => ({

      // ── Auth ──────────────────────────────────────────────
      isAuthenticated: false,
      kycStatus: 'idle',           // idle | pending | approved
      user: MOCK_USER,
      login:  () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),
      setKycStatus: (s) => set({ kycStatus: s }),

      // ── Loans ─────────────────────────────────────────────
      loans: MOCK_LOANS,
      addLoan: (loan) => set(s => ({ loans: [...s.loans, loan] })),

      // ── Beneficiaries ────────────────────────────────────
      beneficiaries: MOCK_BENEFICIARIES,
      addBeneficiary: (b) => set(s => ({ beneficiaries: [...s.beneficiaries, b] })),
      deleteBeneficiary: (id) => set(s => ({
        beneficiaries: s.beneficiaries.filter(b => b.id !== id)
      })),

      // ── Transactions ─────────────────────────────────────
      transactions: MOCK_TRANSACTIONS,
      addTransaction: (tx) => set(s => ({ transactions: [tx, ...s.transactions] })),

      // ── Payment source ───────────────────────────────────
      paymentSource: MOCK_PAYMENT_SOURCE,

      // ── Active payment wizard state ───────────────────────
      // Cleared at the start of each new payment flow
      activePayment: null,
      setActivePayment: (p) => set({ activePayment: p }),
      clearActivePayment: () => set({ activePayment: null }),

    }),
    { name: 'brnx-store' }     // persisted to localStorage
  )
)

export default useStore
```

### 5.2 Mock Data (`src/data/mock.js`)

```js
export const MOCK_USER = {
  id: 'usr_001',
  name: 'Arjun Mehta',
  email: 'arjun@email.com',
  phone: '+1 (734) 555-0142',
  country: 'United States',
  initial: 'A',
}

export const MOCK_LOANS = [
  {
    id: 'loan_001',
    lender: 'HDFC Credila',
    lenderShort: 'HDFC',
    reference: '****4821',
    borrower: 'Arjun Mehta',
    outstandingINR: 2845000,       // ₹28,45,000
    emiINR: 32500,                 // ₹32,500
    nextDueDate: '2026-07-05',
    interestRate: '11.5% p.a.',
    tenure: '10 years',
    loanType: 'Education Loan',
    repaymentAccount: {
      bank: 'HSBC India',
      accountMasked: '****7823',
      accountFull: '10247823',
      ifsc: 'HSBC0400002',
      accountName: 'Arjun Mehta',
    }
  }
]

export const MOCK_BENEFICIARIES = [
  {
    id: 'ben_001',
    name: 'Ramesh Mehta',
    relationship: 'Father',
    type: 'bank',
    bank: 'State Bank of India',
    accountMasked: '****2210',
    ifsc: 'SBIN0001234',
  },
  {
    id: 'ben_002',
    name: 'Priya Mehta',
    relationship: 'Mother',
    type: 'upi',
    upiId: 'priya.mehta@okhdfc',
  }
]

export const MOCK_PAYMENT_SOURCE = {
  bank: 'Chase Bank',
  type: 'ACH',
  accountMasked: '****4521',
  country: 'United States',
  flag: '🇺🇸',
}

export const MOCK_TRANSACTIONS = [
  {
    id: 'txn_001',
    type: 'loan',
    label: 'HDFC Credila Repayment',
    amountUSD: 389.50,
    amountINR: 32500,
    rate: 83.91,
    fee: 2.50,
    status: 'credited',
    creditedTo: 'HSBC India ****7823',
    loan: 'HDFC Credila ****4821',
    date: '2026-06-11T15:42:00',
  },
  {
    id: 'txn_002',
    type: 'send',
    label: 'Sent to Dad',
    beneficiaryName: 'Ramesh Mehta',
    amountUSD: 120.80,
    amountINR: 10000,
    rate: 82.78,
    fee: 2.50,
    status: 'credited',
    creditedTo: 'SBI ****2210',
    date: '2026-06-03T11:18:00',
  },
  {
    id: 'txn_003',
    type: 'loan',
    label: 'HDFC Credila Repayment',
    amountUSD: 389.50,
    amountINR: 32500,
    rate: 83.45,
    fee: 2.50,
    status: 'credited',
    creditedTo: 'HSBC India ****7823',
    loan: 'HDFC Credila ****4821',
    date: '2026-05-07T09:30:00',
  }
]
```

---

## 6. Simulation Engine

### 6.1 FX Rate Logic (`src/lib/fx.js`)

```js
// Base rates — hardcoded
const BASE_RATES = {
  USD: 83.91,
  EUR: 91.45,
  SGD: 62.80,
}

const BORDERLESS_FEE = 2.50   // flat, in source currency

// Adds ±0.5% deterministic variance based on current minute
// Same minute = same rate (stable within a session)
export function getRate(currency = 'USD') {
  const minute = new Date().getMinutes()
  const variance = ((minute % 10) - 5) * 0.001  // -0.5% to +0.5%
  return +(BASE_RATES[currency] * (1 + variance)).toFixed(2)
}

export function getQuote(amountINR, currency = 'USD') {
  const rate = getRate(currency)
  const transferAmountSource = +(amountINR / rate).toFixed(2)
  const totalSource = +(transferAmountSource + BORDERLESS_FEE).toFixed(2)
  return {
    rate,
    currency,
    amountINR,
    transferAmountSource,
    fee: BORDERLESS_FEE,
    totalSource,
    expiresAt: Date.now() + 120_000,   // 2 minutes
  }
}

export function getQuoteFromSource(amountSource, currency = 'USD') {
  const rate = getRate(currency)
  const transferAmount = +(amountSource - BORDERLESS_FEE).toFixed(2)
  const amountINR = Math.round(transferAmount * rate)
  return {
    rate,
    currency,
    amountINR,
    transferAmountSource: transferAmount,
    fee: BORDERLESS_FEE,
    totalSource: amountSource,
    expiresAt: Date.now() + 120_000,
  }
}
```

### 6.2 Payment Simulation (`src/lib/simulation.js`)

```js
// Runs the 4-step payment processing animation
// Returns a Promise that resolves when all steps complete
// Each step fires an onStep(stepIndex) callback so the UI updates progressively

export async function runPaymentSimulation(onStep) {
  const STEP_DELAYS = [0, 1200, 2200, 3400]   // ms
  for (let i = 0; i < 4; i++) {
    await delay(STEP_DELAYS[i])
    onStep(i)
  }
}

const delay = (ms) => new Promise(res => setTimeout(res, ms))
```

### 6.3 Rate Lock Behaviour

- `CountdownTimer` accepts `expiresAt` (Unix ms timestamp from `getQuote()`)
- On every second tick: `secondsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))`
- `onExpire` fires once when `secondsLeft` reaches 0
- Parent page sets `quoteExpired = true` → disables CTA, shows "Rate expired" message + Refresh button
- Refreshing calls `getQuote()` again, gets a new `expiresAt`, resets timer

---

## 7. Shared Components

### 7.1 ScreenHeader (`src/components/layout/ScreenHeader.jsx`)

```jsx
// Props: title, showBack (bool), onBack (fn), rightElement (JSX)
// Back arrow uses navigate(-1) from useNavigate unless onBack provided
// Used on all non-tab screens
```

### 7.2 StepProgress (`src/components/ui/StepProgress.jsx`)

```jsx
// Props: steps (string[]), currentStep (0-indexed)
// Completed: filled blue circle + white ✓
// Active: filled blue circle + white number
// Upcoming: outlined grey circle + grey number
// Connector lines: grey by default, blue when step to its left is completed
```

### 7.3 StatusStepper (`src/components/ui/StatusStepper.jsx`)

```jsx
// The vertical 4-step processing animation
// Props: steps (string[]), completedUpTo (0-indexed, -1 = none complete)
// Each step: small circle + label + timestamp
// Circle animates from grey outline → filled blue on completion
// Uses Framer Motion for the fill animation
```

### 7.4 GradientCard (`src/components/ui/GradientCard.jsx`)

```jsx
// Blue gradient card used on Home greeting, Loan Detail header, Profile header
// Background: linear-gradient(135deg, #0061D3 0%, #00326D 100%)
// Always white text
// Props: children, className
```

### 7.5 QuoteCard (`src/components/domain/QuoteCard.jsx`)

```jsx
// The send/receive display used on Quote and Review screens
// Props: quote (from getQuote()), type ('loan' | 'send'), destination (string)
// Shows: source amount + source account | arrow | INR amount + destination
// Includes FeeBreakdown (collapsible)
```

### 7.6 Toast (`src/components/ui/Toast.jsx`)

```jsx
// Floats top-centre of phone frame, z-50
// Props: message, type ('success' | 'error'), visible, onHide
// Auto-hides after 3000ms
// Framer Motion slide-down enter + fade-out exit
// Usage: call showToast(message, type) from a small toast context
```

---

## 8. Screen Specifications

> Full content/copy spec is in BRD.md. This section defines implementation detail: component composition, navigation triggers, and state interactions.

---

### 8.1 Onboarding Screens

#### Splash (`/`)

- No store reads
- `<img src="/assets/borderless-logo.svg" />` — full logo
- Navigate to `/signup` on "Get Started"
- Navigate to `/login` on "Log in"

#### SignUp (`/signup`)

**Local state:** `{ name, email, phone, country, errors }`  
**On submit:** Validate all fields → call `store.login()` + `store.setKycStatus('idle')` → navigate to `/kyc`  
**No store write for user details** (user is already pre-populated from `MOCK_USER` in the store)

#### KycUpload (`/kyc`)

**Local state:** `{ idType, frontFile, selfieFile }`  
**On submit:** `store.setKycStatus('pending')` → navigate to `/kyc/pending`  
File upload: input type="file" styled as drop zone. On file select, show filename + remove button. No actual upload.

#### KycPending (`/kyc/pending`)

**On mount:** `setTimeout(() => { store.setKycStatus('approved'); navigate('/kyc/approved') }, 3000)`  
Show animated pulsing circle during wait.

#### KycApproved (`/kyc/approved`)

**On "Continue to Dashboard":** navigate to `/app/home`

#### Login (`/login`)

**On submit:** `store.login()` → navigate to `/app/home`  
No validation — any input works (demo).

---

### 8.2 Home (`/app/home`)

**Store reads:** `user`, `loans`, `transactions` (first 3)

**Loan section:**
- If `loans.length === 0`: empty state + "Add Loan" button → `/app/loans/add`
- If loans exist: render `<LoanCard />` for each. "Pay Now" → `/app/loans/:id/pay/amount`

**Quick action cards:**
- "Pay Loan" → `/app/loans` (if loans exist) or `/app/loans/add` (if none)
- "Send Home" → `/app/send`

**Recent transactions:** map first 3 from `transactions` store. "See All" → `/app/transactions`

---

### 8.3 Loan List (`/app/loans`)

**Store reads:** `loans`

**"+ Add Loan" button** → `/app/loans/add`

**Each `<LoanCard />`:**
- Tap card body → `/app/loans/:id`
- "Pay Now" button → `/app/loans/:id/pay/amount`

---

### 8.4 Add Loan (`/app/loans/add`)

**Local state (wizard):** `{ step: 0|1|2, lender, reference, borrowerName, repayAccount: { bank, accountNumber, ifsc, accountName } }`

**Step 0 — Loan Details:**
- Lender dropdown, Reference number, Borrower name (pre-filled from `store.user.name`)
- "Continue" → `step = 1`

**Step 1 — Repayment Account:**
- Contextual hint card (renders after lender is selected)
- Bank dropdown, Account number, IFSC
- "Verify Account" → 1.5s simulated lookup → shows account name "ARJUN MEHTA" + Verified badge → `step = 2`

**Step 2 — Confirm:**
- Read-only summary of step 0 + step 1 data
- "Add This Loan" → `store.addLoan(newLoan)` → navigate to `/app/loans` → show success toast

**New loan object shape:** same as `MOCK_LOANS[0]` schema, with `id: 'loan_' + Date.now()`.

---

### 8.5 Loan Detail (`/app/loans/:id`)

**Store read:** `loans.find(l => l.id === params.id)`  
**"Pay EMI" CTA:** `store.setActivePayment({ loanId, mode: 'emi' })` → `/app/loans/:id/pay/amount`  
**"Custom Amount" CTA:** `store.setActivePayment({ loanId, mode: 'custom' })` → `/app/loans/:id/pay/amount`

---

### 8.6 Loan Payment Wizard

The wizard is a sequence of 5 routes. State is passed via `store.activePayment` — don't use URL params for wizard state.

#### PayAmount (`/app/loans/:id/pay/amount`)

**Local state:** `{ currency: 'USD', amountINR: '', amountSource: '' }`  
**Pre-fill:** If `activePayment.mode === 'emi'`, pre-fill `amountINR` with `loan.emiINR`  
**Amount input:** User can type in either INR or source currency — live conversion using `getRate()`.  
Quick pills call `setAmountINR(value)`.  
**"Get Quote" CTA:** calls `getQuote(amountINR, currency)` → `store.setActivePayment({ ...activePayment, quote })` → navigate to quote screen

#### PayQuote (`/app/loans/:id/pay/quote`)

**Store read:** `activePayment.quote`  
Renders `<QuoteCard quote={quote} type="loan" destination={loan.repaymentAccount} />`  
**`<CountdownTimer expiresAt={quote.expiresAt} onExpire={() => setExpired(true)} />`**  
**"Lock This Rate" CTA:** navigate to review screen (quote already in store)  
**Expired state:** CTA disabled, "Rate expired" message, "Refresh Quote" → calls `getQuote()` again + re-renders

#### PayReview (`/app/loans/:id/pay/review`)

**Store read:** `activePayment.quote`, `paymentSource`, loan  
**Timer continues** (same `expiresAt`)  
**"Confirm & Send" CTA:** navigate to `/app/loans/:id/pay/processing`  
**Expired:** same handling as PayQuote

#### PayProcessing (`/app/loans/:id/pay/processing`)

**On mount:** call `runPaymentSimulation(onStep)` — no back button  
**`onStep(i)`:** sets `completedSteps = i` → `<StatusStepper completedUpTo={completedSteps} />`  
**On complete (all 4 steps done):**
1. Build transaction object from `activePayment` + current time
2. `store.addTransaction(tx)`
3. `store.clearActivePayment()`
4. Navigate to `/app/loans/:id/pay/success`

#### PaySuccess (`/app/loans/:id/pay/success`)

**Store read:** `transactions[0]` (most recently added)  
**"Download Receipt":** console.log or window.print() — no real download in demo  
**"Back to Home":** navigate to `/app/home`

---

### 8.7 Send Money Home (`/app/send`)

**Store reads:** `beneficiaries`

**Each `<BeneficiaryCard />`:**
- "Send" button → `store.setActivePayment({ type: 'send', beneficiaryId: b.id })` → `/app/send/amount`

**"+ Add Beneficiary"** → `/app/send/add-beneficiary`

---

### 8.8 Add Beneficiary (`/app/send/add-beneficiary`)

**Local state:** `{ name, relationship, destType: 'bank'|'upi', bank, accountNumber, ifsc, accountName, upiId }`  
**Account verify (bank):** 1.5s delay → auto-fill `accountName` with `name.toUpperCase()` + show Verified badge  
**"Save Beneficiary" CTA:** `store.addBeneficiary(newBeneficiary)` → navigate back to `/app/send` → toast

---

### 8.9 Send Money Wizard

Identical flow to Loan Payment wizard. Key differences:

| | Loan | Send |
|-|------|------|
| Wizard base route | `/app/loans/:id/pay/*` | `/app/send/*` |
| Destination label | "Your account receives" | "They receive" |
| Destination detail | `loan.repaymentAccount` | `beneficiary.bank / .upiId` |
| Transaction type stored | `'loan'` | `'send'` |
| Post-success navigate | `/app/home` | `/app/home` |

---

### 8.10 Transaction List (`/app/transactions`)

**Store read:** `transactions`

**Filter tabs:** All / Loan Repayment / Money Transfer  
**Active filter** stored in local state, filters `transactions` by `type`.

**Each `<TransactionRow />`:** tap → `/app/transactions/:id`

---

### 8.11 Transaction Detail (`/app/transactions/:id`)

**Store read:** `transactions.find(t => t.id === params.id)`  
Status stepper shows all 4 steps completed (historical — no animation).

---

### 8.12 Profile (`/app/profile`)

**Store reads:** `user`, `kycStatus`, `loans`, `beneficiaries`, `paymentSource`  
**"Log Out"** → `store.logout()` → navigate to `/`

---

### 8.13 Payment Source (`/app/profile/payment-source`)

**Store read:** `paymentSource`  
Static display — no editing in demo. "Add another source" → shows a static modal with the three corridor options (ACH / SEPA / PayNow) but no real functionality.

---

## 9. Animation & Interaction Specs

All animations use **Framer Motion**.

### 9.1 Page Transitions

All screen navigations use a shared `PageTransition` wrapper:

```jsx
// Forward navigation (push): slide in from right
// Back navigation (pop): slide in from left
// Tab switches: fade only (no slide)

const variants = {
  enter:  { x: '100%', opacity: 0 },
  center: { x: 0,      opacity: 1 },
  exit:   { x: '-30%', opacity: 0 },
}
// transition: spring, stiffness: 300, damping: 30
```

Detect forward vs back with a custom `useNavDirection()` hook that tracks `window.history.state.idx`.

### 9.2 Key Micro-Animations

| Interaction | Animation |
|-------------|-----------|
| Button press | `scale: 0.97` on tap, spring back |
| Toast appear | Slide down from top + fade in, 300ms |
| Toast dismiss | Fade out + slide up, 200ms |
| KYC pending pulse | `scale: 1 → 1.08 → 1`, repeat, 1.5s ease |
| Status step complete | Circle fill: grey outline → blue fill, 400ms spring |
| Quote card appear | Fade in + translate up 12px, 350ms ease-out |
| Processing spinner | Rotate 360°, linear, 800ms, repeat |
| Rate expiry flash | Background flashes warning-light, 500ms, 3 repeats at <30s |
| Quick pill select | Blue outline + blue text, instant |

### 9.3 Number Formatting

- INR: `₹` prefix + Indian numbering system (`₹28,45,000` not `₹2,845,000`)
- USD/EUR/SGD: standard 2 decimal places (`$389.50`)
- Use `Intl.NumberFormat` — wrap in a `formatINR(n)` and `formatSource(n, currency)` utility in `src/lib/fx.js`

```js
export const formatINR = (n) =>
  '₹' + new Intl.NumberFormat('en-IN').format(n)

export const formatSource = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
```

---

## 10. Assets & Fonts

### 10.1 Logo Files

Copy from `/Users/moinak/Downloads/` into `public/assets/`:

| File | Source | Usage |
|------|--------|-------|
| `borderless-logo.svg` | `borderlessLogo.svg` | Full logo — splash, login, profile header |
| `borderless-mark.svg` | Extract first `<path>` group from SVG | 4-quadrant mark only — top-left of authenticated screens |

For the logomark-only version, extract the four `<path>` elements (lines 2–5 of the SVG) with their `<defs>` gradients into a new file. Remove the wordmark paths (line 6 onward).

### 10.2 Fonts

Loaded via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### 10.3 Icons

All icons from **Lucide React**. Key icons used:

| Icon | Usage |
|------|-------|
| `GraduationCap` | Loans tab, loan transaction row |
| `Send` | Send tab, money transfer row |
| `Clock` | History tab |
| `User` | Profile tab |
| `Home` | Home tab |
| `ChevronRight` | List row chevrons |
| `ArrowLeft` | Back navigation |
| `CheckCircle2` | Success screens, KYC approved |
| `Shield` | KYC pending |
| `AlertTriangle` | Rate expiry warning |
| `Download` | Download receipt |
| `CreditCard` | Payment source |
| `Plus` | Add loan, add beneficiary |
| `Building2` | Bank account |

---

## 11. Build & Run

### 11.1 Setup

```bash
cd /Users/moinak/Claude/brnx-app
npm create vite@latest . -- --template react
npm install
npm install react-router-dom zustand framer-motion lucide-react date-fns
npm install -D tailwindcss @tailwindcss/vite
```

### 11.2 Vite Config (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 11.3 Dev

```bash
npm run dev
# Opens at http://localhost:5173
# Phone frame visible on desktop; full screen on mobile viewport
```

### 11.4 Deploy

Static export — deploy to Vercel:
```bash
npm run build   # outputs to /dist
# Push to GitHub → Vercel auto-deploys
```

No server, no env vars, no database.

---

## Appendix A — Screen Inventory

| # | Screen | Route | Tab visible |
|---|--------|-------|-------------|
| 1 | Splash | `/` | No |
| 2 | Sign Up | `/signup` | No |
| 3 | KYC Upload | `/kyc` | No |
| 4 | KYC Pending | `/kyc/pending` | No |
| 5 | KYC Approved | `/kyc/approved` | No |
| 6 | Login | `/login` | No |
| 7 | Home | `/app/home` | Yes |
| 8 | Loan List | `/app/loans` | Yes |
| 9 | Add Loan | `/app/loans/add` | No |
| 10 | Loan Detail | `/app/loans/:id` | No |
| 11 | Pay — Amount | `/app/loans/:id/pay/amount` | No |
| 12 | Pay — Quote | `/app/loans/:id/pay/quote` | No |
| 13 | Pay — Review | `/app/loans/:id/pay/review` | No |
| 14 | Pay — Processing | `/app/loans/:id/pay/processing` | No |
| 15 | Pay — Success | `/app/loans/:id/pay/success` | No |
| 16 | Send Home | `/app/send` | Yes |
| 17 | Add Beneficiary | `/app/send/add-beneficiary` | No |
| 18 | Send — Amount | `/app/send/amount` | No |
| 19 | Send — Quote | `/app/send/quote` | No |
| 20 | Send — Review | `/app/send/review` | No |
| 21 | Send — Processing | `/app/send/processing` | No |
| 22 | Send — Success | `/app/send/success` | No |
| 23 | Transaction List | `/app/transactions` | Yes |
| 24 | Transaction Detail | `/app/transactions/:id` | No |
| 25 | Profile | `/app/profile` | Yes |
| 26 | Payment Source | `/app/profile/payment-source` | No |

**Total: 26 screens**

---

## Appendix B — Wizard State Flow

```
Loan Payment:
  setActivePayment({ loanId, mode })
      ↓
  PayAmount → getQuote() → setActivePayment({ ...prev, quote })
      ↓
  PayQuote → (timer running) → navigate forward
      ↓
  PayReview → (timer continuing) → "Confirm & Send"
      ↓
  PayProcessing → runPaymentSimulation() → addTransaction() → clearActivePayment()
      ↓
  PaySuccess → read transactions[0]

Send Money:
  setActivePayment({ type: 'send', beneficiaryId })
      ↓
  (identical flow, different labels/destination)
```

---

*PRD v1.0 — Engineering ready. All flows are simulated. No real APIs.*
