# BRNX App — QA Test Plan

## Test Environment
- URL: http://localhost:5173
- Viewport: 390×844 (phone frame simulation)
- State: fresh localStorage (no persisted session)

---

## TC-001 · Splash Screen
| # | Step | Expected | Status |
|---|------|----------|--------|
| 1.1 | Open app at `/` | Redirects to `/splash` | ✅ |
| 1.2 | Splash renders | Borderless logo visible, loading dots animate | ✅ |
| 1.3 | Wait 1.8s (logged out) | Auto-navigates to `/login` | ✅ |
| 1.4 | Trigger with `isAuthenticated=true, kycStatus='approved'` | Auto-navigates to `/home` | ✅ |
| 1.5 | Trigger with `isAuthenticated=true, kycStatus='pending'` | Auto-navigates to `/kyc/pending` | ✅ |

## TC-002 · Login
| # | Step | Expected | Status |
|---|------|----------|--------|
| 2.1 | View Login screen | Logo, email field pre-filled, password field, Sign In button | ✅ |
| 2.2 | Tap Sign In | Loading spinner shows, then navigates to `/kyc/upload` (fresh state) | ✅ |
| 2.3 | Tap "Sign up" | Navigates to `/signup` | ✅ |
| 2.4 | Tap "Skip to Demo Dashboard" | login() + setKycStatus('approved') → `/home` in one tap | ✅ |

## TC-003 · Sign Up
| # | Step | Expected | Status |
|---|------|----------|--------|
| 3.1 | Fill name, email, phone, country | All fields accept input; Dropdown saves string value (not event object) | ✅ Fixed |
| 3.2 | All 4 fields required | Continue button stays disabled until all filled | ✅ |
| 3.3 | Tap Continue | Navigates to `/kyc/upload` | ✅ |
| 3.4 | Tap "Sign in" | Navigates to `/login` | ✅ |

## TC-004 · KYC Flow
| # | Step | Expected | Status |
|---|------|----------|--------|
| 4.1 | KYC Upload screen | Two file upload zones visible, Submit button disabled | ✅ |
| 4.2 | Upload both files | Submit button enables | ✅ |
| 4.3 | Submit | Navigates to `/kyc/pending` | ✅ |
| 4.4 | KYC Pending screen | Clock icon, 3-step list, "Simulate Approval" button visible | ✅ |
| 4.5 | Tap Simulate Approval | kycStatus → approved, navigates to `/kyc/approved` | ✅ |
| 4.6 | KYC Approved screen | Green checkmark, feature list, auto-navigates to Home in 3s | ✅ Fixed |
| 4.7 | Tap "Go to Dashboard" | Navigates to `/home` immediately | ✅ |

## TC-005 · Home Dashboard
| # | Step | Expected | Status |
|---|------|----------|--------|
| 5.1 | Home loads | "Good morning, Arjun" greeting, bell icon | ✅ |
| 5.2 | Balance card | Total outstanding ₹28,45,000, next EMI ₹32,500, Chase ****4521 | ✅ |
| 5.3 | Quick actions | "Repay Loan" and "Send Home" tiles visible | ✅ |
| 5.4 | Loans section | HDFC Credila card with progress bar, EMI, due date | ✅ |
| 5.5 | Recent transactions | 3 mock transactions listed with badge | ✅ |
| 5.6 | Tab bar | 5 tabs: Home, Loans, Send, History, Profile (in-flow, no absolute positioning) | ✅ Fixed |
| 5.7 | Tap Repay Loan | Navigates to `/loans` | ✅ |
| 5.8 | Tap Send Home | Navigates to `/send` | ✅ |

## TC-006 · Loan List
| # | Step | Expected | Status |
|---|------|----------|--------|
| 6.1 | Loans tab | HDFC Credila card, "Add Loan" button | ✅ |
| 6.2 | Tap loan card | Navigates to `/loans/loan_001` | ✅ |
| 6.3 | Tap Add Loan | Navigates to `/loans/add/step1` | ✅ |
| 6.4 | Empty state | "No loans yet" illustration + CTA when no loans | ✅ |

## TC-007 · Add Loan Wizard
| # | Step | Expected | Status |
|---|------|----------|--------|
| 7.1 | Step 1 | Step progress shows Step 1 active, all 5 fields | ✅ |
| 7.2 | Select lender from dropdown | Lender field populates with string value | ✅ Fixed |
| 7.3 | Fill all fields | Continue button enables | ✅ |
| 7.4 | Tap Continue | sessionStorage saved, navigates to step 2 | ✅ |
| 7.5 | Step 2 | HSBC info banner, 4 bank account fields | ✅ |
| 7.6 | Fill all fields | Continue button enables | ✅ |
| 7.7 | Tap Continue | sessionStorage saved, navigates to step 3 | ✅ |
| 7.8 | Step 3 | Both sections show correct data from steps 1 & 2 | ✅ |
| 7.9 | Tap Confirm | Loan added to store, navigates to `/loans` | ✅ |
| 7.10 | Back in LoanList | New loan card appears | ✅ |

## TC-008 · Loan Detail
| # | Step | Expected | Status |
|---|------|----------|--------|
| 8.1 | Loan Detail loads | Outstanding ₹28,45,000, HDFC Credila | ✅ |
| 8.2 | Stats row | EMI, next due date, sanctioned amount | ✅ |
| 8.3 | Repayment destination | Shows "HSBC India ****7823" with lock icon | ✅ |
| 8.4 | Payment history | 2 repayment transactions listed | ✅ |
| 8.5 | "Repay Now" button | Visible at bottom, scrolls with content (not clipped) | ✅ Fixed |
| 8.6 | Tap Repay Now | Navigates to `/loans/loan_001/pay/amount` | ✅ |

## TC-009 · Loan Repayment Wizard
| # | Step | Expected | Status |
|---|------|----------|--------|
| 9.1 | PayAmount | Repaying to HSBC India shown; Full EMI (₹32,500) pre-selected | ✅ |
| 9.2 | Switch to Custom | Number input appears | ✅ |
| 9.3 | Enter custom amount | INR label updates below input | ✅ |
| 9.4 | Tap Get Quote | Navigates to PayQuote | ✅ |
| 9.5 | PayQuote | USD/EUR/SGD currency pills, quote card renders | ✅ |
| 9.6 | Countdown timer | Shows mm:ss, counts down without interval thrashing | ✅ Fixed |
| 9.7 | Timer turns red | At 30s remaining, text color turns red | ✅ |
| 9.8 | Switch currency | Quote recalculates, timer resets | ✅ |
| 9.9 | Timer expires | "Rate has expired" state shows, Refresh button | ✅ |
| 9.10 | Tap Refresh Rate | New quote with fresh 2-min countdown | ✅ |
| 9.11 | Tap Lock Rate | Navigates to PayReview | ✅ |
| 9.12 | PayReview | From: Chase ****4521, To: HSBC India ****7823, fee breakdown | ✅ |
| 9.13 | Tap Confirm & Pay | Navigates to PayProcessing | ✅ |
| 9.14 | PayProcessing | 4-step stepper, steps light up sequentially over ~3.6s | ✅ Fixed (null guard) |
| 9.15 | Processing completes | Navigates to PaySuccess | ✅ |
| 9.16 | PaySuccess | Green checkmark, amount, HSBC destination, date | ✅ |
| 9.17 | Back to Home | New transaction appears in Home recent list | ✅ |

## TC-010 · Send Home Wizard
| # | Step | Expected | Status |
|---|------|----------|--------|
| 10.1 | Send tab | Two beneficiary cards (Ramesh Father, Priya Mother) | ✅ |
| 10.2 | Tap Add | Navigates to AddBeneficiary | ✅ |
| 10.3 | AddBeneficiary — Relation dropdown | Dropdown saves string value correctly | ✅ Fixed |
| 10.4 | AddBeneficiary — Bank | Fill name, relation, bank fields | ✅ |
| 10.5 | AddBeneficiary — UPI | Switch to UPI pill, UPI ID field shows | ✅ |
| 10.6 | Save beneficiary | Navigates back to SendHome, new card visible | ✅ |
| 10.7 | Delete beneficiary | Card removed from list | ✅ |
| 10.8 | Tap beneficiary | Navigates to SendAmount | ✅ |
| 10.9 | SendAmount | Recipient name in subtitle, amount input | ✅ |
| 10.10 | Quick amounts | Tap ₹10,000 pill → active state + populates input | ✅ |
| 10.11 | Tap Get Quote | Navigates to SendQuote | ✅ |
| 10.12 | SendQuote | Quote card renders for selected beneficiary | ✅ |
| 10.13 | Tap Lock Rate | Navigates to SendReview | ✅ |
| 10.14 | SendReview | Recipient name, relation, from/to, fee breakdown | ✅ |
| 10.15 | Tap Confirm & Send | Navigates to SendProcessing | ✅ |
| 10.16 | Processing completes | Navigates to SendSuccess | ✅ Fixed (null guard) |
| 10.17 | SendSuccess | Green check, amount, recipient name | ✅ |

## TC-011 · Transaction History
| # | Step | Expected | Status |
|---|------|----------|--------|
| 11.1 | History tab | 3 mock transactions listed | ✅ |
| 11.2 | Each row | Icon (arrow in/out), label, date, amount, badge | ✅ |
| 11.3 | Tap transaction | Navigates to TransactionDetail | ✅ |
| 11.4 | Detail screen | Amount, type, recipient, source amount, date, journey stepper | ✅ |
| 11.5 | Repayment — all steps completed | 4 steps all lit (credited status) | ✅ |
| 11.6 | Unknown txId | Redirects to /transactions | ✅ Fixed |

## TC-012 · Profile
| # | Step | Expected | Status |
|---|------|----------|--------|
| 12.1 | Profile tab | Avatar 'A', Arjun Mehta, KYC Verified badge | ✅ |
| 12.2 | Payment Source item | Shows "Chase Bank ****4521" as sub-label | ✅ |
| 12.3 | Tap Payment Source | Navigates to `/profile/payment-source` | ✅ |
| 12.4 | PaymentSource screen | Chase selected (filled radio), Wise option | ✅ |
| 12.5 | Select Wise | Radio moves to Wise, `setPaymentSource` called | ✅ Fixed |
| 12.6 | Back to Profile | Payment Source sub-label updates to Wise | ✅ Fixed |
| 12.7 | Tap Sign Out | logout() called, kycStatus reset, navigate to login | ✅ |

## TC-013 · Navigation & Layout
| # | Step | Expected | Status |
|---|------|----------|--------|
| 13.1 | Tab bar visibility | Visible on all 5 main screens, in normal document flow | ✅ Fixed |
| 13.2 | Tab bar active state | Correct tab highlighted including sub-routes | ✅ |
| 13.3 | Back button | Works on all detail/wizard screens | ✅ |
| 13.4 | Content above notch | No content hidden behind 34px notch area | ✅ |
| 13.5 | Scroll works | Long screens scroll, content visible | ✅ Fixed |
| 13.6 | Direct URL navigation | `/home` redirects to login if unauthenticated | ✅ |

## TC-014 · Edge Cases
| # | Step | Expected | Status |
|---|------|----------|--------|
| 14.1 | Empty loans state | "No loans yet" illustration + CTA | ✅ |
| 14.2 | Empty beneficiaries | "No beneficiaries" illustration + CTA | ✅ |
| 14.3 | Empty transactions | "No transactions" illustration | ✅ |
| 14.4 | PayProcessing with null activePayment | Redirects to /loans, no crash | ✅ Fixed |
| 14.5 | SendProcessing with null activePayment | Redirects to /send, no crash | ✅ Fixed |
| 14.6 | Quote expires mid-flow | "Rate has expired" state, Refresh button | ✅ |
| 14.7 | Back from PayProcessing | Back button absent (no ScreenHeader) | ✅ |

---

## Bug Inventory — Post-Fix Status

| ID | File | Severity | Issue | Status |
|----|------|----------|-------|--------|
| B01 | Dropdown.jsx | **Critical** | Raw SyntheticEvent passed as onChange; SignUp stored event object | ✅ FIXED |
| B02 | CountdownTimer.jsx | **High** | `secondsLeft` in deps → interval recreated every second | ✅ FIXED |
| B03 | PayProcessing.jsx | **High** | No null guard on `activePayment` | ✅ FIXED |
| B04 | SendProcessing.jsx | **High** | No null guard on `activePayment` | ✅ FIXED |
| B05 | StatusStepper.jsx | Medium | Unused `format` import from date-fns | ✅ FIXED |
| B06 | PaymentSource.jsx | **High** | Selection non-functional; no `setPaymentSource` in store | ✅ FIXED |
| B07 | App.jsx | **High** | No height wrapper around RouterProvider | ✅ FIXED |
| B08 | AuthenticatedLayout.jsx | **High** | Tab bar was absolute-positioned, conflicting with h-full screens | ✅ FIXED |
| B09 | Splash.jsx | Medium | Missing deps in useEffect (navigate, auth state) | ✅ FIXED |
| B10 | KycApproved.jsx | Medium | No auto-navigate to /home after approval | ✅ FIXED |
| B11 | Login.jsx | Medium | No demo quick-start path | ✅ FIXED |
| B12 | LoanDetail.jsx | Medium | "Repay Now" button inside scroll area on h-full layout | ✅ FIXED |
| B13 | All screens | Medium | `h-full` + inner `overflow-y-auto` conflict; screens used wrong layout pattern | ✅ FIXED |
| B14 | Splash.jsx | Low | `[isAuthenticated, kycStatus]` missing from useEffect deps | ✅ FIXED |
