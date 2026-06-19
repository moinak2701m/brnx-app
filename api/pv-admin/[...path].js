const PROXY = (process.env.PRIMEVAULT_PROXY_URL ?? 'http://localhost:3333').trim().replace(/\/$/, '')

export default async function handler(req, res) {
  const path = '/' + (req.query.path ?? []).join('/')
  const qs   = new URL(req.url, 'http://x').search

  const url  = `${PROXY}${path}${qs}`

  const upstream = await fetch(url, {
    method:  req.method,
    headers: { 'Content-Type': 'application/json' },
    body:    ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
  })

  const text = await upstream.text()
  res.status(upstream.status).setHeader('Content-Type', 'application/json').send(text)
}
