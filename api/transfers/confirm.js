import { eq } from 'drizzle-orm'
import { getDb, schema } from '../_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { txId } = req.body ?? {}
  if (!txId) return res.status(400).json({ error: 'txId is required' })

  if (txId.startsWith('demo_')) return res.status(200).json({ ok: true })

  try {
    const db = getDb()
    const [tx] = await db.select().from(schema.transactions)
      .where(eq(schema.transactions.id, txId))
      .limit(1)

    if (!tx) return res.status(404).json({ error: 'Transaction not found' })

    await db.update(schema.transactions)
      .set({ updatedAt: new Date() })
      .where(eq(schema.transactions.id, txId))

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[confirm]', err)
    return res.status(502).json({ error: err.message })
  }
}
