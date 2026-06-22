import crypto from 'node:crypto'

// All Credible calls are routed through the Railway proxy (fixed outbound IP whitelisted in Credible).
// The proxy handles HMAC-SHA256 signing using credentials stored in Railway env vars.

const PROXY = (process.env.PRIMEVAULT_PROXY_URL ?? 'http://localhost:3333').trim().replace(/\/$/, '')

async function credibleFetch(path, options = {}) {
  const url = `${PROXY}/credible${path}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Credible ${path} → ${res.status}: ${text}`)
  return JSON.parse(text)
}

export async function getFxRate(inputCurrency = 'usdc', outputCurrency = 'inr') {
  return credibleFetch(`/getFxRate?input_currency=${inputCurrency}&output_currency=${outputCurrency}`)
}

export async function getDepositAddress(blockchain = 'ethereum', currency = 'usdc') {
  const res = await credibleFetch(`/getDepositAddress?blockchain=${blockchain}&currency=${currency}`)
  // API wraps in { data: [{ address, blockchain, chain, currency }] }
  const address = res?.data?.[0]?.address ?? res?.address
  if (!address) throw new Error('No deposit address returned from Credible')
  return { address, raw: res }
}

export async function validateBankAccount({ currency = 'inr', account_number, ifsc, account_holder_name }) {
  const idempotencyKey = `val-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return credibleFetch('/validateBankAccount', {
    method:  'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body:    JSON.stringify({ currency, account_number, ifsc, account_holder_name }),
  })
}

export async function initiatePayout(payload) {
  return credibleFetch('/initiatePayout', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
}

export async function getPayoutInfo(payoutId) {
  return credibleFetch(`/getPayoutInfo?payout_id=${payoutId}`)
}

export function verifyWebhookSignature(body) {
  // Webhook verification uses the secret directly — webhooks come inbound to Vercel, not through Railway
  const secret = process.env.CREDIBLE_SECRET_KEY?.trim()
  if (!secret) return false
  const { signature, ...rest } = body
  if (!signature) return false
  const sorted = Object.keys(rest).sort().reduce((acc, k) => { acc[k] = String(rest[k]); return acc }, {})
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(sorted)).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
}

export function isConfigured() {
  return !!(process.env.PRIMEVAULT_PROXY_URL)
}
