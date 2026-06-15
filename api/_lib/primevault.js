// All PrimeVault calls are routed through the signing proxy server.
// In dev:  PRIMEVAULT_PROXY_URL defaults to localhost:3333 (primevault-test)
// In prod: set PRIMEVAULT_PROXY_URL to the deployed proxy (e.g. Railway)

const PROXY = process.env.PRIMEVAULT_PROXY_URL ?? 'http://localhost:3333'
const TREASURY_VAULT = process.env.PRIMEVAULT_BL_TREASURY_VAULT_ID ?? '2e1f77a9-ea85-4555-983b-3736531016a5'

async function pvFetch(path, options = {}) {
  const normalizedPath = path.endsWith('/') ? path : path + '/'
  const res = await fetch(`${PROXY}${normalizedPath}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`PrimeVault ${path} → ${res.status}: ${text}`)
  return JSON.parse(text)
}

export async function getQuote({ amountUSD, toChain = 'ethereum' }) {
  const quotes = await pvFetch('/api/external/transactions/quote/', {
    method: 'POST',
    body: JSON.stringify({
      destination: { type: 'vault', id: TREASURY_VAULT },
      fromasset: 'usd',
      fromamount: String(amountUSD),
      toasset: 'usdc',
      tochain: toChain,
      frompaymentrail: 'us wire',
    }),
  })
  if (!Array.isArray(quotes) || !quotes[0]) throw new Error('No quotes returned')
  return quotes[0]
}

export async function executeOnRamp({ quoteId, externalId }) {
  return pvFetch('/api/external/transactions/', {
    method: 'POST',
    body: JSON.stringify({ quoteid: quoteId, externalid: externalId }),
  })
}

export async function getTransaction(pvTxId) {
  return pvFetch(`/api/external/transactions/${pvTxId}/`)
}

export async function sendUSDC({ toAddress, amount, externalId }) {
  return pvFetch('/api/external/transactions/', {
    method: 'POST',
    body: JSON.stringify({
      source: { type: 'VAULT', id: TREASURY_VAULT },
      destination: { type: 'EXTERNAL_WALLET', address: toAddress },
      blockChain: 'ETHEREUM',
      asset: 'USDC',
      amount: String(amount),
      category: 'TRANSFER',
      externalid: externalId,
    }),
  })
}

export function isConfigured() {
  return !!(process.env.PRIMEVAULT_PROXY_URL || process.env.PRIMEVAULT_API_KEY)
}
