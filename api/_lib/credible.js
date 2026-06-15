import crypto from 'crypto'

const BASE = process.env.CREDIBLE_BASE_URL ?? 'https://testnetapi.credible.finance/remittance/api'
const API_KEY = () => process.env.CREDIBLE_API_KEY ?? ''
const SECRET = () => process.env.CREDIBLE_SECRET_KEY ?? ''

// Credible auth: sort all params + X-NONCE + X-RECV-WINDOW, JSON stringify, HMAC-SHA256
function buildHeaders(params = {}) {
  const nonce = Date.now().toString()
  const recvWindow = '5000'

  const toSign = { ...params, 'X-NONCE': nonce, 'X-RECV-WINDOW': recvWindow }
  const sorted = Object.keys(toSign)
    .sort()
    .reduce((acc, k) => { acc[k] = String(toSign[k]); return acc }, {})

  const sig = crypto
    .createHmac('sha256', SECRET())
    .update(JSON.stringify(sorted))
    .digest('hex')

  return {
    'X-API-KEY': API_KEY(),
    'X-NONCE': nonce,
    'X-RECV-WINDOW': recvWindow,
    'X-SIGNATURE': sig,
    'Content-Type': 'application/json',
  }
}

export async function getFxRate(inputCurrency = 'usdc', outputCurrency = 'inr') {
  const params = { input_currency: inputCurrency, output_currency: outputCurrency }
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/getFxRate?${qs}`, { headers: buildHeaders(params) })
  return res.json()
}

export async function getDepositAddress(blockchain = 'ethereum', currency = 'usdc') {
  const params = { blockchain, currency }
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/getDepositAddress?${qs}`, { headers: buildHeaders(params) })
  if (!res.ok) throw new Error(`Credible getDepositAddress → ${res.status}`)
  return res.json()
}

export async function initiatePayout(payload) {
  const res = await fetch(`${BASE}/initiatePayout`, {
    method: 'POST',
    headers: buildHeaders(payload),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Credible initiatePayout → ${res.status}: ${JSON.stringify(data)}`)
  return data
}

export async function getPayoutInfo(payoutId) {
  const params = { payout_id: payoutId }
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/getPayoutInfo?${qs}`, { headers: buildHeaders(params) })
  return res.json()
}

// Verify an inbound webhook — regenerate sig over the body and compare
export function verifyWebhookSignature(body) {
  const { signature, ...rest } = body
  if (!signature) return false
  const sorted = Object.keys(rest)
    .sort()
    .reduce((acc, k) => { acc[k] = String(rest[k]); return acc }, {})
  const expected = crypto
    .createHmac('sha256', SECRET())
    .update(JSON.stringify(sorted))
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
}

export function isConfigured() {
  return !!(process.env.CREDIBLE_API_KEY && process.env.CREDIBLE_SECRET_KEY)
}
