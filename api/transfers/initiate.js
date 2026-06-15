import { getQuote, executeOnRamp, isConfigured as pvConfigured } from '../_lib/primevault.js'
import { kvSet } from '../_lib/kv.js'

// Shown in demo mode (no PrimeVault credentials configured)
const DEMO_BANK = {
  accountName: 'Apex Remittance Inc.',
  bankName: 'JPMorgan Chase',
  accountNumber: '8872 0041 3321',
  routingNumber: '021000021',
  swift: 'CHASUS33',
}

const TTL = 60 * 60 * 24 * 7 // 7 days

function txId() {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { amountUSD, amountINR, beneficiary } = req.body ?? {}
  if (!amountUSD || !amountINR || !beneficiary) {
    return res.status(400).json({ error: 'amountUSD, amountINR and beneficiary are required' })
  }

  // ── Demo mode ───────────────────────────────────────────────────────────────
  if (!pvConfigured()) {
    const id = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return res.status(200).json({ txId: id, bankDetails: DEMO_BANK, mode: 'demo' })
  }

  // ── Live mode ────────────────────────────────────────────────────────────────
  try {
    const id = txId()
    const quote = await getQuote({ amountUSD })
    const pvTx  = await executeOnRamp({ quoteId: quote.quoteid, externalId: id })

    const bd = pvTx.source?.bankdetails ?? {}
    const bankDetails = {
      accountName:   bd.accountname   ?? DEMO_BANK.accountName,
      bankName:      bd.bankname       ?? DEMO_BANK.bankName,
      accountNumber: bd.accountnumber  ?? DEMO_BANK.accountNumber,
      routingNumber: bd.routingnumber  ?? DEMO_BANK.routingNumber,
      swift:         bd.swiftcode      ?? DEMO_BANK.swift,
      iban:          bd.iban           ?? undefined,
    }

    await kvSet(`tx:${id}`, JSON.stringify({
      id,
      status: 'pending_wire',
      amountUSD,
      amountINR,
      beneficiary,
      pvTransactionId: pvTx.id,
      pvQuoteId: quote.quoteid,
      bankDetails,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }), { ex: TTL })

    return res.status(200).json({ txId: id, bankDetails })
  } catch (err) {
    console.error('[initiate]', err)
    // Degrade gracefully — return demo bank details so the UI isn't broken
    const id = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return res.status(200).json({ txId: id, bankDetails: DEMO_BANK, mode: 'degraded', error: err.message })
  }
}
