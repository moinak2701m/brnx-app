const BASE_NGN_USD = 1393

// Random spread of 100-220 bps on top of the base rate, same onramp
// used for both per-invoice bank-transfer quotes and treasury top-ups.
export function getNgnRate() {
  const bps = 100 + Math.random() * 120
  return +(BASE_NGN_USD * (1 + bps / 10000)).toFixed(2)
}

// Quote for paying a fixed USD amount in NGN - used both for invoice
// bank-transfer payments and treasury top-ups (you always specify how
// much USD you want to land, and this tells you how much NGN to send).
export function getUsdToNgnQuote(amountUSD) {
  const rate = getNgnRate()
  const amountNGN = Math.round(amountUSD * rate)
  return {
    rate,
    amountUSD,
    amountNGN,
    expiresAt: Date.now() + 120_000,
  }
}

export function formatNGN(n) {
  return '₦' + new Intl.NumberFormat('en-NG').format(Math.round(n))
}

export function formatUSD(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n)
}
