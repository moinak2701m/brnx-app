import { getTransaction, sendUSDC } from '../_lib/primevault.js'
import { getDepositAddress, initiatePayout } from '../_lib/credible.js'
import { kvGet, kvSet } from '../_lib/kv.js'

const TTL = 60 * 60 * 24 * 7

// Map internal status → tracker stage index shown in SendSuccess
export const STATUS_STAGE = {
  pending_wire:     0,
  wire_received:    1,
  usdc_received:    1,
  usdc_sent:        2,
  payout_initiated: 2,
  completed:        3,
  failed:          -1,
}

// ── Demo mode ────────────────────────────────────────────────────────────────
// txId encodes creation timestamp so stage advances automatically without KV
function demoStatus(txId) {
  const ts = parseInt(txId.split('_')[1], 10)
  if (isNaN(ts)) return 'pending_wire'
  const ms = Date.now() - ts
  if (ms <  3_000) return 'pending_wire'
  if (ms <  8_000) return 'wire_received'
  if (ms < 14_000) return 'usdc_received'
  if (ms < 20_000) return 'usdc_sent'
  if (ms < 26_000) return 'payout_initiated'
  return 'completed'
}

// ── Advance state machine ─────────────────────────────────────────────────────
// Called on each poll; triggers the next step if conditions are met.
// All transitions are idempotent — KV status guards against double-execution.
async function advanceIfNeeded(tx) {
  // 1. pending_wire / wire_received — poll PrimeVault until on-ramp completes
  if (['pending_wire', 'wire_received'].includes(tx.status) && tx.pvTransactionId) {
    try {
      const pvTx = await getTransaction(tx.pvTransactionId)
      if (pvTx.status === 'COMPLETED') {
        tx = { ...tx, status: 'usdc_received', updatedAt: Date.now() }
        await kvSet(`tx:${tx.id}`, JSON.stringify(tx), { ex: TTL })
      }
    } catch (_) {
      // PrimeVault unreachable — continue with stored status, retry next poll
    }
  }

  // 2. usdc_received — send USDC to Credible + immediately initiate INR payout
  if (tx.status === 'usdc_received') {
    try {
      const { address } = await getDepositAddress('ethereum', 'usdc')

      await sendUSDC({
        toAddress: address,
        amount: tx.amountUSD,
        externalId: `${tx.id}_usdc`,
      })

      tx = { ...tx, status: 'usdc_sent', credibleDepositAddress: address, updatedAt: Date.now() }
      await kvSet(`tx:${tx.id}`, JSON.stringify(tx), { ex: TTL })

      const payout = await initiatePayout({
        amount: tx.amountINR,
        currency: 'inr',
        account_number: tx.beneficiary.accountNumber,
        ifsc: tx.beneficiary.ifsc,
        account_holder_name: tx.beneficiary.name,
        merchant_payout_id: tx.id,
        wallet: 'deposit',
        payout_process_type: 'IMPS',
      })

      tx = { ...tx, status: 'payout_initiated', crediblePayoutId: payout.payout_id, updatedAt: Date.now() }
      await kvSet(`tx:${tx.id}`, JSON.stringify(tx), { ex: TTL })
    } catch (err) {
      console.error('[advance] usdc_received step failed:', err.message)
      // Do not crash — status stays at usdc_received and will retry next poll
    }
  }

  return tx
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query

  // Demo / degraded txIds: advance stages on elapsed time, no KV needed
  if (id?.startsWith('demo_')) {
    const status = demoStatus(id)
    return res.status(200).json({
      txId: id,
      status,
      stage: STATUS_STAGE[status] ?? 0,
      done: status === 'completed',
    })
  }

  try {
    const raw = await kvGet(`tx:${id}`)
    if (!raw) return res.status(404).json({ error: 'Transaction not found' })

    let tx = JSON.parse(raw)

    // Only advance if there is meaningful work to do
    if (!['payout_initiated', 'completed', 'failed'].includes(tx.status)) {
      tx = await advanceIfNeeded(tx)
    }

    return res.status(200).json({
      txId: tx.id,
      status: tx.status,
      stage: STATUS_STAGE[tx.status] ?? 0,
      done: tx.status === 'completed',
      failureReason: tx.failureReason ?? null,
    })
  } catch (err) {
    console.error('[status]', err)
    return res.status(502).json({ error: err.message })
  }
}
