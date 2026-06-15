import { kvGet, kvSet } from '../_lib/kv.js'

const TTL = 60 * 60 * 24 * 7

// PrimeVault does not yet document webhook events for ramp transactions.
// This handler is wired and ready — when PrimeVault adds webhook support,
// register this URL in the PrimeVault dashboard and the pipeline will
// advance automatically instead of relying on frontend polling.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  res.status(200).json({ received: true })

  const body = req.body ?? {}
  console.log('[primevault webhook]', JSON.stringify(body))

  // Expected shape (speculative — update when PrimeVault confirms the payload schema):
  // { event: 'transaction.completed', externalId: '<our txId>', status: 'COMPLETED' }
  const externalId = body.externalId ?? body.external_id
  const status     = body.status ?? body.event

  if (!externalId) return

  try {
    const raw = await kvGet(`tx:${externalId}`)
    if (!raw) return

    const tx = JSON.parse(raw)
    if (!['pending_wire', 'wire_received'].includes(tx.status)) return

    const nextStatus = status === 'COMPLETED' ? 'usdc_received' : 'wire_received'
    await kvSet(`tx:${externalId}`, JSON.stringify({
      ...tx,
      status: nextStatus,
      updatedAt: Date.now(),
    }), { ex: TTL })
  } catch (err) {
    console.error('[primevault webhook] error:', err)
  }
}
