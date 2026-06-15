import { verifyWebhookSignature } from '../_lib/credible.js'
import { kvGet, kvSet } from '../_lib/kv.js'

const TTL = 60 * 60 * 24 * 7

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Respond 200 immediately — Credible retries with exponential backoff if we don't
  res.status(200).json({ received: true })

  const body = req.body ?? {}

  if (!verifyWebhookSignature(body)) {
    console.warn('[credible webhook] invalid signature — ignoring')
    return
  }

  const { event_name, metadata = {} } = body
  const { merchant_payout_id, payout_id, payout_failure_reason } = metadata

  if (!merchant_payout_id) return

  try {
    const raw = await kvGet(`tx:${merchant_payout_id}`)
    if (!raw) {
      console.warn('[credible webhook] unknown merchant_payout_id:', merchant_payout_id)
      return
    }

    const tx = JSON.parse(raw)

    if (event_name === 'payout_completed') {
      await kvSet(`tx:${merchant_payout_id}`, JSON.stringify({
        ...tx,
        status: 'completed',
        crediblePayoutId: payout_id ?? tx.crediblePayoutId,
        updatedAt: Date.now(),
      }), { ex: TTL })
      console.log('[credible webhook] payout_completed for', merchant_payout_id)
    }

    if (event_name === 'payout_failed') {
      await kvSet(`tx:${merchant_payout_id}`, JSON.stringify({
        ...tx,
        status: 'failed',
        failureReason: payout_failure_reason ?? 'Payout failed',
        updatedAt: Date.now(),
      }), { ex: TTL })
      console.error('[credible webhook] payout_failed for', merchant_payout_id, payout_failure_reason)
    }
  } catch (err) {
    console.error('[credible webhook] error:', err)
  }
}
