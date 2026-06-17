import { eq } from 'drizzle-orm'
import { verifyWebhookSignature } from '../_lib/credible.js'
import { getDb, schema } from '../_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

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
    const db = getDb()

    if (event_name === 'payout_completed') {
      await db.update(schema.transactions)
        .set({ status: 'completed', crediblePayoutId: payout_id, updatedAt: new Date() })
        .where(eq(schema.transactions.id, merchant_payout_id))
      console.log('[credible webhook] payout_completed for', merchant_payout_id)
    }

    if (event_name === 'payout_failed') {
      await db.update(schema.transactions)
        .set({ status: 'failed', failureReason: payout_failure_reason ?? 'Payout failed', updatedAt: new Date() })
        .where(eq(schema.transactions.id, merchant_payout_id))
      console.error('[credible webhook] payout_failed for', merchant_payout_id, payout_failure_reason)
    }
  } catch (err) {
    console.error('[credible webhook] error:', err)
  }
}
