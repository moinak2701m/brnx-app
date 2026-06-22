import { eq } from 'drizzle-orm'
import { getTransaction, sendUSDC } from '../_lib/primevault.js'
import { getDepositAddress, initiatePayout, getPayoutInfo } from '../_lib/credible.js'
import { getDb, schema } from '../_lib/db.js'

export const STATUS_STAGE = {
  pending_wire:     0,
  wire_received:    1,
  usdc_received:    1,
  usdc_sent:        2,
  payout_initiated: 2,
  completed:        3,
  failed:          -1,
}

// ── Demo mode ─────────────────────────────────────────────────────────────────
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

// ── State machine ─────────────────────────────────────────────────────────────
async function advanceIfNeeded(tx) {
  const db = getDb()

  // 1. Poll PrimeVault until on-ramp completes
  if (['pending_wire', 'wire_received'].includes(tx.status) && tx.pvTransactionId) {
    try {
      const pvTx = await getTransaction(tx.pvTransactionId)
      if (pvTx.status === 'COMPLETED') {
        await db.update(schema.transactions)
          .set({ status: 'usdc_received', updatedAt: new Date() })
          .where(eq(schema.transactions.id, tx.id))
        return { ...tx, status: 'usdc_received' }
      }
    } catch (_) {}
  }

  // 2. Get Credible deposit address, record it, then initiate INR payout.
  //    Note: PrimeVault external API only supports vault-to-vault transfers, so
  //    the on-chain USDC send is handled out-of-band (or via PrimeVault UI) in
  //    the current testnet setup. We proceed directly to payout here.
  if (tx.status === 'usdc_received') {
    try {
      console.log('[advance] step1: getDepositAddress')
      const { address } = await getDepositAddress('ethereum', 'usdc')
      console.log('[advance] step1 ok, address:', address)

      await db.update(schema.transactions)
        .set({ status: 'usdc_sent', credibleDepositAddress: address, updatedAt: new Date() })
        .where(eq(schema.transactions.id, tx.id))

      const ben = tx.beneficiarySnapshot ?? {}
      console.log('[advance] step2: initiatePayout', tx.amountInr, 'INR to', ben.accountNumber)
      const payout = await initiatePayout({
        amount:               tx.amountInr,
        currency:             'inr',
        account_number:       ben.accountNumber,
        ifsc:                 ben.ifsc,
        account_holder_name:  ben.name,
        merchant_payout_id:   tx.id,
        wallet:               'deposit',
        payout_process_type:  'IMPS',
      })
      console.log('[advance] step2 ok, payout_id:', payout?.data?.payout_id ?? payout?.payout_id)

      const payoutId = payout?.data?.payout_id ?? payout?.payout_id
      await db.update(schema.transactions)
        .set({ status: 'payout_initiated', crediblePayoutId: payoutId, updatedAt: new Date() })
        .where(eq(schema.transactions.id, tx.id))

      return { ...tx, status: 'payout_initiated' }
    } catch (err) {
      const msg = err.message ?? String(err)
      console.error('[advance] usdc_received failed:', msg)
      await db.update(schema.transactions)
        .set({ lastError: msg, updatedAt: new Date() })
        .where(eq(schema.transactions.id, tx.id))
        .catch(() => {})
    }
  }

  // 3. Poll Credible payout status → mark completed or failed
  if (tx.status === 'payout_initiated' && tx.crediblePayoutId) {
    try {
      const info = await getPayoutInfo(tx.crediblePayoutId)
      const payoutStatus = info?.data?.status ?? info?.status
      console.log('[advance] credible payout status:', payoutStatus, 'ref:', info?.data?.transaction_reference_no)
      if (payoutStatus === 'completed') {
        await db.update(schema.transactions)
          .set({ status: 'completed', updatedAt: new Date() })
          .where(eq(schema.transactions.id, tx.id))
        return { ...tx, status: 'completed' }
      } else if (payoutStatus === 'failed') {
        await db.update(schema.transactions)
          .set({ status: 'failed', failureReason: 'Credible payout failed', updatedAt: new Date() })
          .where(eq(schema.transactions.id, tx.id))
        return { ...tx, status: 'failed' }
      }
    } catch (err) {
      console.error('[advance] getPayoutInfo failed:', err.message)
    }
  }

  return tx
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query

  if (id?.startsWith('demo_')) {
    const status = demoStatus(id)
    return res.status(200).json({ txId: id, status, stage: STATUS_STAGE[status] ?? 0, done: status === 'completed' })
  }

  try {
    const db = getDb()
    const [tx] = await db.select({
      id:                  schema.transactions.id,
      status:              schema.transactions.status,
      pvTransactionId:     schema.transactions.pvTransactionId,
      amountUsd:           schema.transactions.amountUsd,
      amountInr:           schema.transactions.amountInr,
      beneficiarySnapshot: schema.transactions.beneficiarySnapshot,
      crediblePayoutId:    schema.transactions.crediblePayoutId,
      failureReason:       schema.transactions.failureReason,
      lastError:           schema.transactions.lastError,
    }).from(schema.transactions)
      .where(eq(schema.transactions.id, id))
      .limit(1)

    if (!tx) return res.status(404).json({ error: 'Transaction not found' })

    const advanced = ['completed', 'failed'].includes(tx.status)
      ? tx
      : await advanceIfNeeded(tx)

    return res.status(200).json({
      txId:          advanced.id,
      status:        advanced.status,
      stage:         STATUS_STAGE[advanced.status] ?? 0,
      done:          advanced.status === 'completed',
      failureReason: advanced.failureReason ?? null,
      lastError:     advanced.lastError ?? null,
    })
  } catch (err) {
    console.error('[status]', err)
    return res.status(502).json({ error: err.message })
  }
}
