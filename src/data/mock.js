export const MOCK_USER = {
  id: 'usr_001',
  name: 'Arjun Mehta',
  email: 'arjun@email.com',
  phone: '+1 (734) 555-0142',
  country: 'United States',
}

// purpose: 'family' | 'loan' | 'self'
export const MOCK_BENEFICIARIES = [
  {
    id: 'ben_001',
    name: 'Ramesh Mehta',
    relation: 'Father',
    purpose: 'family',
    bankAccount: {
      bank: 'State Bank of India',
      accountMasked: '****2210',
      ifsc: 'SBIN0001234',
    },
  },
  {
    id: 'ben_002',
    name: 'Priya Mehta',
    relation: 'Mother',
    purpose: 'family',
    bankAccount: { bank: 'HDFC Bank', accountMasked: '****8841', ifsc: 'HDFC0001234' },
  },
  {
    id: 'ben_003',
    name: 'HSBC',
    relation: 'Repayment Account',
    purpose: 'loan',
    bankAccount: {
      bank: 'HSBC India',
      accountMasked: '****7823',
      ifsc: 'HSBC0400002',
    },
  },
]

export const MOCK_PAYMENT_SOURCE = {
  id: 'chase_ach',
  bankName: 'Chase Bank',
  type: 'ACH',
  accountMasked: '****4521',
  country: 'United States',
  flag: '🇺🇸',
  currency: 'USD',
}

export const MOCK_TRANSACTIONS = [
  {
    id: 'txn_001',
    type: 'transfer',
    purpose: 'loan',
    beneficiaryName: 'HSBC',
    amountINR: 32500,
    amountSource: 389.50,
    currency: 'USD',
    status: 'credited',
    date: '11 Jun 2026',
  },
  {
    id: 'txn_002',
    type: 'transfer',
    purpose: 'family',
    beneficiaryName: 'Ramesh Mehta',
    amountINR: 10000,
    amountSource: 120.80,
    currency: 'USD',
    status: 'credited',
    date: '3 Jun 2026',
  },
  {
    id: 'txn_003',
    type: 'transfer',
    purpose: 'loan',
    beneficiaryName: 'HSBC',
    amountINR: 32500,
    amountSource: 389.50,
    currency: 'USD',
    status: 'credited',
    date: '7 May 2026',
  },
]
