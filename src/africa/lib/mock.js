// The Sender role always plays as this one primary sender. The second
// sender is flavor-only (shows up in Receiver's list, has an invoice,
// but there's no "logged in as Kano Textiles" perspective in this demo).
export const DEMO_SENDER_ID = 'sender_lagos_foods'

export const MOCK_SENDERS = [
  { id: DEMO_SENDER_ID, name: 'Lagos Foods Ltd', country: 'Nigeria', isYou: true },
  { id: 'sender_kano_textiles', name: 'Kano Textiles Co', country: 'Nigeria', isYou: false },
]

export const MOCK_RECEIVER = {
  name: 'Atlas Supply Co',
  country: 'United States',
}

export const MOCK_RECEIVER_BANK = {
  bankName: 'Chase Bank',
  accountName: 'Atlas Supply Co',
  accountNumber: '****4521',
  currency: 'USD',
}

// Mocked onramp-partner NGN collection account the sender wires to.
export const ONRAMP_PARTNER_BANK = {
  bankName: 'Providus Bank',
  accountName: 'Dragonfly Payments Ltd',
  accountNumber: '0123456789',
}

const emptyTimestamps = () => ({
  created: null,
  payment_initiated: null,
  received_in_wallet: null,
  received_in_bank: null,
})

export const MOCK_INVOICES = [
  {
    id: 'inv_1001',
    invoiceNumber: 'INV-1001',
    senderId: DEMO_SENDER_ID,
    description: 'Q1 packaging materials',
    amountUSD: 420,
    fileName: null,
    status: 'created',
    quote: null,
    paymentMethod: null,
    timestamps: { ...emptyTimestamps(), created: '2026-07-28T09:12:00Z' },
  },
  {
    id: 'inv_1002',
    invoiceNumber: 'INV-1002',
    senderId: DEMO_SENDER_ID,
    description: 'Cold storage equipment lease',
    amountUSD: 1150,
    fileName: 'equipment-lease.pdf',
    status: 'payment_initiated',
    quote: { rate: 1408.5, amountUSD: 1150, amountNGN: 1619775 },
    paymentMethod: 'bank_transfer',
    timestamps: {
      ...emptyTimestamps(),
      created: '2026-07-22T14:03:00Z',
      payment_initiated: '2026-07-26T10:45:00Z',
    },
  },
  {
    id: 'inv_1003',
    invoiceNumber: 'INV-1003',
    senderId: DEMO_SENDER_ID,
    description: 'Freight & logistics — February',
    amountUSD: 680,
    fileName: null,
    status: 'received_in_wallet',
    quote: { rate: 1401.2, amountUSD: 680, amountNGN: 952816 },
    paymentMethod: 'bank_transfer',
    timestamps: {
      ...emptyTimestamps(),
      created: '2026-07-10T08:30:00Z',
      payment_initiated: '2026-07-12T16:20:00Z',
      received_in_wallet: '2026-07-12T16:24:00Z',
    },
  },
  {
    id: 'inv_1004',
    invoiceNumber: 'INV-1004',
    senderId: 'sender_kano_textiles',
    description: 'Dye lot 44 — raw cotton',
    amountUSD: 2300,
    fileName: 'invoice-dyelot44.pdf',
    status: 'received_in_bank',
    quote: { rate: 1415.9, amountUSD: 2300, amountNGN: 3256570 },
    paymentMethod: 'bank_transfer',
    timestamps: {
      created: '2026-06-18T11:00:00Z',
      payment_initiated: '2026-06-19T09:15:00Z',
      received_in_wallet: '2026-06-19T09:19:00Z',
      received_in_bank: '2026-06-21T13:40:00Z',
    },
  },
  {
    id: 'inv_1005',
    invoiceNumber: 'INV-1005',
    senderId: DEMO_SENDER_ID,
    description: 'Software subscription renewal',
    amountUSD: 95,
    fileName: null,
    status: 'created',
    quote: null,
    paymentMethod: null,
    timestamps: { ...emptyTimestamps(), created: '2026-08-05T17:48:00Z' },
  },
]

export const MOCK_TREASURY_TOPUPS = [
  {
    id: 'topup_1',
    amountUSD: 250,
    status: 'received_in_wallet',
    quote: { rate: 1393.0, amountUSD: 250, amountNGN: 348250 },
    timestamps: {
      created: '2026-07-15T11:52:00Z',
      payment_initiated: '2026-07-15T11:58:00Z',
      received_in_wallet: '2026-07-15T12:03:00Z',
    },
  },
]

export const MOCK_SENDER_WALLET_BALANCE = 250
