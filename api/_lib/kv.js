import { Redis } from '@upstash/redis'

let _client = null

function getClient() {
  if (_client) return _client
  if (!process.env.KV_REST_API_URL) return null
  _client = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
  return _client
}

// In-memory fallback when KV is not configured (demo / local dev)
const mem = new Map()

export async function kvGet(key) {
  const client = getClient()
  if (client) {
    const val = await client.get(key)
    // Upstash auto-deserializes JSON; re-serialize so callers can JSON.parse uniformly
    if (val === null) return null
    return typeof val === 'string' ? val : JSON.stringify(val)
  }
  return mem.get(key) ?? null
}

export async function kvSet(key, value, { ex } = {}) {
  const client = getClient()
  if (client) return ex ? client.set(key, value, { ex }) : client.set(key, value)
  mem.set(key, value)
  if (ex) setTimeout(() => mem.delete(key), ex * 1000)
  return 'OK'
}
