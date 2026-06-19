const PROXY = (process.env.PRIMEVAULT_PROXY_URL ?? 'http://localhost:3333').trim().replace(/\/$/, '')

export default async function handler(req, res) {
  const { p: path = '/', ...rest } = req.query
  const qs = new URLSearchParams(rest).toString()
  const target = `${PROXY}${path}${qs ? '?' + qs : ''}`

  try {
    const upstream = await fetch(target, {
      method:  req.method,
      headers: { 'Content-Type': 'application/json' },
      body:    ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    })
    const text = await upstream.text()
    res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
