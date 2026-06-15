import { kvGet, kvSet } from '../_lib/kv.js'

const TTL = 60 * 60 * 24 * 7

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { txId } = req.body ?? {}
  if (!txId) return res.status(400).json({ error: 'txId is required' })

  // Demo txIds need no persistence
  if (txId.startsWith('demo_')) return res.status(200).json({ ok: true })

  try {
    const raw = await kvGet(`tx:${txId}`)
    if (!raw) return res.status(404).json({ error: 'Transaction not found' })

    const tx = JSON.parse(raw)
    await kvSet(`tx:${txId}`, JSON.stringify({
      ...tx,
      confirmedAt: Date.now(),
      updatedAt: Date.now(),
    }), { ex: TTL })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[confirm]', err)
    return res.status(502).json({ error: err.message })
  }
}
