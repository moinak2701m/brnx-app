// All PrimeVault calls are routed through the signing proxy server.
// In dev:  PRIMEVAULT_PROXY_URL defaults to localhost:3333 (primevault-test)
// In prod: set PRIMEVAULT_PROXY_URL to the deployed proxy (e.g. Railway)

const PROXY = process.env.PRIMEVAULT_PROXY_URL ?? 'http://localhost:3333'
// BRNX_TESTNET vault — receives wired USD and mints USDC
const TREASURY_VAULT = process.env.PRIMEVAULT_BL_TREASURY_VAULT_ID ?? '56fc0fe1-b5a2-469e-a06e-f71039c7481c'

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

// Returns a quote with quoteId + depositInstructions (wire details) + fees
export async function getQuote({ amountUSD, toChain = 'ETHEREUM_TESTNET' }) {
  const quotes = await pvFetch('/api/external/transactions/quote/', {
    method: 'POST',
    body: JSON.stringify({
      destination:     { type: 'VAULT', id: TREASURY_VAULT },
      fromAsset:       'USD',
      fromAmount:      String(amountUSD),
      toAsset:         'USDC',
      toChain,
      fromPaymentRail: 'WIRE',
      category:        'RAMP',
    }),
  })
  if (!Array.isArray(quotes) || !quotes[0]) throw new Error('No quotes returned')
  return quotes[0]
}

// Execute the on-ramp using a locked quoteId
export async function executeOnRamp({ quoteId, externalId }) {
  return pvFetch('/api/external/transactions/', {
    method: 'POST',
    body: JSON.stringify({
      quoteId,
      externalid: externalId,
      category: 'RAMP',
    }),
  })
}

export async function getTransaction(pvTxId) {
  return pvFetch(`/api/external/transactions/${pvTxId}/`)
}

export async function sendUSDC({ toAddress, amount, externalId }) {
  return pvFetch('/api/external/transactions/', {
    method: 'POST',
    body: JSON.stringify({
      source:      { type: 'VAULT', id: TREASURY_VAULT },
      destination: { type: 'EXTERNAL_WALLET', address: toAddress },
      blockChain:  'ETHEREUM_TESTNET',
      asset:       'USDC',
      amount:      String(amount),
      category:    'TRANSFER',
      externalid:  externalId,
    }),
  })
}

export function isConfigured() {
  return !!(process.env.PRIMEVAULT_PROXY_URL || process.env.PRIMEVAULT_API_KEY)
}
