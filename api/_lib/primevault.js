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

// Get an on-ramp quote — user wires USD, USDC lands in treasury vault.
// Uses exact-out: toAmount = USDC desired. finalFromAmount is USD to wire.
// Returns quote object including depositInstructions.bankDetails.
export async function getQuote({ amountUSD, toChain = 'ETHEREUM_TESTNET' }) {
  const intent = {
    source:          { type: 'EXTERNAL_BANK_ACCOUNT' },
    destination:     { type: 'VAULT', id: TREASURY_VAULT },
    fromAsset:       'USD',
    toAmount:        String(amountUSD),
    toAsset:         'USDC',
    toChain,
    fromPaymentRail: 'us wire',
  }
  const data = await pvFetch('/ramp/quote', { method: 'POST', body: JSON.stringify({ intent }) })
  if (!data.quotes?.[0]) throw new Error('No quotes returned')
  return data.quotes[0]   // { quoteId, rate, fees, finalFromAmount, depositInstructions }
}

// Execute on-ramp — returns transaction with depositInstructions.bankDetails (wire instructions)
export async function executeOnRamp({ quoteId, externalId }) {
  return pvFetch('/ramp/transaction', {
    method: 'POST',
    body: JSON.stringify({ quoteId, externalId }),
  })
}

export async function getTransaction(pvTxId) {
  return pvFetch(`/ramp/transaction/${pvTxId}`)
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
