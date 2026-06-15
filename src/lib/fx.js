const MID_RATES = { USD: 85.50, EUR: 92.40, SGD: 63.60 }

export function getRate(currency = 'USD') {
  const mid = MID_RATES[currency] ?? 95.00
  const bps = 10 + Math.random() * 25        // random 10–35 bps
  const sign = Math.random() < 0.5 ? 1 : -1
  return +(mid * (1 + sign * bps / 10000)).toFixed(2)
}

export function getQuote(amountINR, currency = 'USD') {
  const rate = getRate(currency)
  const total = +(amountINR / rate).toFixed(2)
  return {
    rate,
    currency,
    amountINR,
    total,
    expiresAt: Date.now() + 120_000,
  }
}

export function formatINR(n) {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n))
}

export function formatRate(n) {
  return '₹' + n.toFixed(2)
}

export function formatSource(n, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n)
}

export const CURRENCY_FLAGS = { USD: '🇺🇸', EUR: '🇪🇺', SGD: '🇸🇬' }
export const CURRENCY_LABELS = { USD: 'USD', EUR: 'EUR', SGD: 'SGD' }
