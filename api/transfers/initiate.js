import { getQuote, executeOnRamp, isConfigured as pvConfigured } from '../_lib/primevault.js'
import { getDb, schema } from '../_lib/db.js'

const DEMO_BANK = {
  accountName:   'Apex Remittance Inc.',
  bankName:      'JPMorgan Chase',
  accountNumber: '8872 0041 3321',
  routingNumber: '021000021',
  swift:         'CHASUS33',
}

function txId() {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { amountUSD, amountINR, exchangeRate, beneficiary } = req.body ?? {}
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
    const id    = txId()
    const quote = await getQuote({ amountUSD })
    const pvTx  = await executeOnRamp({ quoteId: quote.quoteId, externalId: id })

    const bd = quote.depositInstructions?.bankDetails
           ?? pvTx.depositInstructions?.bankDetails
           ?? {}
    const bankDetails = {
      accountName:   bd.beneficiaryName ?? DEMO_BANK.accountName,
      bankName:      bd.bankName        ?? DEMO_BANK.bankName,
      accountNumber: bd.accountNumber   ?? DEMO_BANK.accountNumber,
      routingNumber: bd.routingNumber   ?? DEMO_BANK.routingNumber,
      swift:         bd.swiftCode       ?? DEMO_BANK.swift,
      bankAddress:   bd.bankAddress     ?? undefined,
    }

    const db = getDb()
    await db.insert(schema.transactions).values({
      id,
      status:              'pending_wire',
      amountUsd:           String(amountUSD),
      amountInr:           String(amountINR),
      exchangeRate:        exchangeRate ? String(exchangeRate) : null,
      pvTransactionId:     pvTx.id,
      pvQuoteId:           quote.quoteId,
      bankDetails,
      beneficiarySnapshot: beneficiary,
    })

    return res.status(200).json({ txId: id, bankDetails })
  } catch (err) {
    console.error('[initiate]', err)
    const id = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return res.status(200).json({ txId: id, bankDetails: DEMO_BANK, mode: 'degraded', error: err.message })
  }
}
