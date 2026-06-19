import { useEffect, useState, useRef } from 'react'

const PROXY = '/api/pv-admin'

async function pvFetch(path, opts = {}) {
  const res = await fetch(`${PROXY}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  })
  if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
  return res.json()
}

const api = {
  listVaults:          ()   => pvFetch('/api/external/vaults/'),
  getVault:            (id) => pvFetch(`/api/external/vaults/${id}/`),
  getBalances:         (id) => pvFetch(`/api/external/vaults/${id}/balances/`),
  getDetailedBalances: (id) => pvFetch(`/api/external/vaults/${id}/detailed_balances/`),
  listTransactions:    ()   => pvFetch('/api/external/transactions/'),
  getTransaction:      (id) => pvFetch(`/api/external/transactions/${id}/`),
  estimateFee:         (b)  => pvFetch('/api/external/transactions/estimate_fee/', { method: 'POST', body: JSON.stringify(b) }),
  sendTransaction:     (b)  => pvFetch('/api/external/transactions/', { method: 'POST', body: JSON.stringify(b) }),
  getOutboundIp:       ()   => pvFetch('/myip'),
}

function usdcFrom(balances) {
  if (!balances) return 0
  // object form: { USDC: { ETHEREUM_TESTNET: '1.23' } }
  if (balances.USDC) {
    return Object.values(balances.USDC).reduce((s, v) => s + Number(v), 0)
  }
  // array form: [{ symbol, balance }]
  if (Array.isArray(balances)) {
    return balances
      .filter(t => (t.symbol ?? t.asset ?? '').toUpperCase().includes('USDC'))
      .reduce((s, t) => s + Number(t.balance ?? 0), 0)
  }
  return 0
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [view, setView] = useState('vaults') // 'vaults' | 'send' | 'txns'
  const [selectedVault, setSelectedVault] = useState(null)
  const [outboundIp, setOutboundIp] = useState(null)

  useEffect(() => {
    api.getOutboundIp().then(d => setOutboundIp(d.ip)).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      {/* Top nav */}
      <div style={{ background: '#1a56db', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 32, height: 56 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>BRNX Admin · PrimeVault</span>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {[['vaults', 'Vaults'], ['txns', 'Transactions'], ['send', 'Send']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 8,
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>{label}</button>
          ))}
        </div>
        {outboundIp && (
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            Outbound IP: <span style={{ color: '#fff', fontFamily: 'monospace' }}>{outboundIp}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        {view === 'vaults' && <VaultsView onSelectVault={setSelectedVault} selectedVaultId={selectedVault?.id} />}
        {view === 'txns'   && <TransactionsView />}
        {view === 'send'   && <SendView />}
      </div>
    </div>
  )
}

// ── Vaults view ───────────────────────────────────────────────────────────────
function VaultsView({ onSelectVault, selectedVaultId }) {
  const [vaults, setVaults]   = useState([])
  const [balMap, setBalMap]   = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [detail, setDetail]   = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.listVaults()
      .then(d => {
        const list = d.results ?? d.vaults ?? d ?? []
        setVaults(list)
        Promise.all(list.map(v =>
          api.getBalances(v.id)
            .then(b => ({ id: v.id, bal: b }))
            .catch(() => ({ id: v.id, bal: {} }))
        )).then(results => {
          const m = {}
          results.forEach(r => { m[r.id] = r.bal })
          setBalMap(m)
        })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function selectVault(v) {
    onSelectVault(v)
    setDetailLoading(true)
    Promise.all([
      api.getDetailedBalances(v.id).catch(() => []),
      api.listTransactions().catch(() => ({ results: [] })),
    ]).then(([bals, txData]) => {
      const allTxs = txData.results ?? txData.transactions ?? txData ?? []
      const txs = allTxs.filter(tx => tx.vaultId === v.id || tx.toVaultId === v.id).slice(0, 10)
      setDetail({ vault: v, balances: Array.isArray(bals) ? bals : [], txs })
    }).catch(e => setDetail({ error: e.message }))
      .finally(() => setDetailLoading(false))
  }

  if (loading) return <Spinner label="Loading vaults…" />
  if (error)   return <ErrorBox message={error} />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Vault list */}
      <div>
        <SectionTitle>Vaults ({vaults.length})</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vaults.map(v => {
            const bal = usdcFrom(balMap[v.id] ?? {})
            const selected = v.id === selectedVaultId
            return (
              <div key={v.id} onClick={() => selectVault(v)} style={{
                background: selected ? '#eff6ff' : '#fff',
                border: `1.5px solid ${selected ? '#1a56db' : '#e5e7eb'}`,
                borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'border-color 0.15s',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{v.vaultName ?? v.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 }}>{v.id.slice(0, 20)}…</div>
                  {v.isTestNetVault && <TestnetBadge />}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a56db' }}>
                    {bal.toFixed(4)} <span style={{ fontSize: 11, color: '#9ca3af' }}>USDC</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Vault detail */}
      <div>
        {!selectedVaultId && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9ca3af', fontSize: 14 }}>
            Select a vault to view details
          </div>
        )}
        {detailLoading && <Spinner label="Loading vault…" />}
        {detail && !detailLoading && detail.error && <ErrorBox message={detail.error} />}
        {detail && !detailLoading && !detail.error && <VaultDetail detail={detail} />}
      </div>
    </div>
  )
}

function VaultDetail({ detail }) {
  const { vault, balances, txs } = detail
  const usdc = usdcFrom(balances)

  return (
    <div>
      <SectionTitle>{vault.vaultName ?? vault.name}</SectionTitle>

      {/* Balance hero */}
      <div style={{ background: '#1a56db', borderRadius: 14, padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>USDC Balance</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>
            {usdc.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
          </div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Vault ID</div>
          <div style={{ fontSize: 11, color: '#fff', fontFamily: 'monospace' }}>{vault.id}</div>
        </div>
      </div>

      {/* Wallet addresses */}
      {vault.wallets?.length > 0 && (
        <Card title="Wallet Addresses" style={{ marginBottom: 16 }}>
          {vault.wallets.map((w, i) => (
            <Row key={i} label={w.chainName ?? w.blockchain} value={w.address} mono isLast={i === vault.wallets.length - 1} />
          ))}
        </Card>
      )}

      {/* Token balances */}
      {balances.length > 0 && (
        <Card title="Token Balances" style={{ marginBottom: 16 }}>
          {balances.map((t, i) => (
            <Row key={i}
              label={`${t.symbol ?? t.asset ?? '?'} (${t.chain ?? t.blockChain ?? ''})`}
              value={Number(t.balance ?? 0).toFixed(6)}
              isLast={i === balances.length - 1}
            />
          ))}
        </Card>
      )}

      {/* Recent transactions */}
      <Card title="Recent Transactions">
        {txs.length === 0 && <EmptyState label="No transactions" />}
        {txs.map((tx, i) => {
          const isOut = tx.vaultId === vault.id
          return (
            <div key={tx.id ?? i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 16px', borderBottom: i < txs.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 20,
                  background: isOut ? '#fee2e2' : '#d1fae5', color: isOut ? '#991b1b' : '#065f46',
                }}>{isOut ? 'OUT' : 'IN'}</span>
                <div>
                  <div style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>
                    {tx.asset ?? '?'} · {tx.blockChain ?? ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isOut ? '#991b1b' : '#065f46' }}>
                  {isOut ? '−' : '+'}{tx.amount ?? '—'}
                </div>
                <StatusBadge status={tx.status} />
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

// ── Transactions view ─────────────────────────────────────────────────────────
function TransactionsView() {
  const [txs, setTxs]         = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  function load() {
    setLoading(true)
    api.listTransactions()
      .then(d => setTxs(d.results ?? d.transactions ?? d ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  if (loading) return <Spinner label="Loading transactions…" />
  if (error)   return <ErrorBox message={error} />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle style={{ marginBottom: 0 }}>All Transactions ({txs.length})</SectionTitle>
        <Btn onClick={load}>↻ Refresh</Btn>
      </div>
      <Card>
        {txs.length === 0 && <EmptyState label="No transactions" />}
        {txs.map((tx, i) => (
          <div key={tx.id ?? i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: 12, padding: '12px 16px', alignItems: 'center',
            borderBottom: i < txs.length - 1 ? '1px solid #f3f4f6' : 'none',
            fontSize: 12,
          }}>
            <div style={{ fontFamily: 'monospace', color: '#374151', fontSize: 11 }}>{tx.id?.slice(0, 24)}…</div>
            <div style={{ color: '#6b7280' }}>{tx.asset ?? '—'}</div>
            <div style={{ fontWeight: 600 }}>{tx.amount ?? '—'}</div>
            <div style={{ color: '#6b7280', fontSize: 11 }}>{tx.blockChain ?? '—'}</div>
            <StatusBadge status={tx.status} />
          </div>
        ))}
      </Card>
    </div>
  )
}

// ── Send view ─────────────────────────────────────────────────────────────────
const CHAINS = ['ETHEREUM_TESTNET', 'SOLANA_TESTNET', 'BITCOIN_TESTNET']
const ASSETS = ['USDC', 'ETH', 'SOL', 'BTC', 'USDT']
const FEE_TIERS = ['LOW', 'MEDIUM', 'HIGH']

function SendView() {
  const [vaults, setVaults]     = useState([])
  const [step, setStep]         = useState(0) // 0=details, 1=fee, 2=confirm, 3=status
  const [form, setForm]         = useState({ srcId: '', dstId: '', asset: 'USDC', amount: '', chain: 'ETHEREUM_TESTNET', feeTier: 'LOW' })
  const [fee, setFee]           = useState(null)
  const [feeLoading, setFeeLoading] = useState(false)
  const [feeError, setFeeError] = useState(null)
  const [txId, setTxId]         = useState(null)
  const [txStatus, setTxStatus] = useState(null)
  const [txError, setTxError]   = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const pollRef = useRef(false)

  useEffect(() => {
    api.listVaults().then(d => setVaults(d.results ?? d.vaults ?? d ?? [])).catch(() => {})
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function estimateFee() {
    setFeeLoading(true); setFeeError(null)
    try {
      const res = await api.estimateFee({
        source: { type: 'VAULT', id: form.srcId },
        destination: { type: 'VAULT', id: form.dstId },
        amount: form.amount, asset: form.asset, blockChain: form.chain,
        category: 'TRANSFER', gasParams: { feeTier: form.feeTier },
      })
      setFee(res); setStep(2)
    } catch (e) { setFeeError(e.message) }
    finally { setFeeLoading(false) }
  }

  async function submit() {
    setSubmitting(true); setTxError(null)
    try {
      const tx = await api.sendTransaction({
        source: { type: 'VAULT', id: form.srcId },
        destination: { type: 'VAULT', id: form.dstId },
        amount: form.amount, asset: form.asset, blockChain: form.chain,
        category: 'TRANSFER', gasParams: { feeTier: form.feeTier },
      })
      const id = tx.id ?? tx.transactionId
      setTxId(id); setTxStatus(tx); setStep(3)
      if (id) {
        pollRef.current = true
        const poll = async () => {
          if (!pollRef.current) return
          try {
            const updated = await api.getTransaction(id)
            setTxStatus(updated)
            if (!['COMPLETED', 'FAILED'].includes(updated.status)) setTimeout(poll, 3000)
          } catch (e) { setTxError(e.message) }
        }
        setTimeout(poll, 3000)
      }
    } catch (e) { setTxError(e.message) }
    finally { setSubmitting(false) }
  }

  function reset() {
    pollRef.current = false
    setStep(0); setForm({ srcId: '', dstId: '', asset: 'USDC', amount: '', chain: 'ETHEREUM_TESTNET', feeTier: 'LOW' })
    setFee(null); setTxId(null); setTxStatus(null); setTxError(null)
  }

  const steps = ['Details', 'Fee', 'Confirm', 'Status']

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i <= step ? '#1a56db' : '#e5e7eb',
              color: i <= step ? '#fff' : '#9ca3af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>{i < step ? '✓' : i + 1}</div>
            <div style={{ fontSize: 11, color: i === step ? '#1a56db' : '#9ca3af', fontWeight: i === step ? 700 : 400 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32 }}>
        {/* Step 0: Details */}
        {step === 0 && (
          <div>
            <FormTitle>Transfer Details</FormTitle>
            <Field label="Source Vault">
              <VaultSelect value={form.srcId} onChange={v => set('srcId', v)} vaults={vaults} placeholder="Select source vault" />
            </Field>
            <Field label="Destination Vault">
              <VaultSelect value={form.dstId} onChange={v => set('dstId', v)} vaults={vaults} placeholder="Select destination vault" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Asset">
                <NativeSelect value={form.asset} onChange={v => set('asset', v)} options={ASSETS} />
              </Field>
              <Field label="Amount">
                <NativeInput type="number" value={form.amount} onChange={v => set('amount', v)} placeholder="0.00" />
              </Field>
            </div>
            <Field label="Blockchain">
              <NativeSelect value={form.chain} onChange={v => set('chain', v)} options={CHAINS} />
            </Field>
            <Field label="Fee Tier">
              <div style={{ display: 'flex', gap: 8 }}>
                {FEE_TIERS.map(t => (
                  <button key={t} onClick={() => set('feeTier', t)} style={{
                    flex: 1, padding: '8px 0', border: `1.5px solid ${form.feeTier === t ? '#1a56db' : '#e5e7eb'}`,
                    background: form.feeTier === t ? '#eff6ff' : '#fff',
                    color: form.feeTier === t ? '#1a56db' : '#6b7280',
                    borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}>{t}</button>
                ))}
              </div>
            </Field>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <Btn onClick={() => setStep(1)} disabled={!form.srcId || !form.dstId || !form.amount || form.srcId === form.dstId}>
                Next: Estimate Fee →
              </Btn>
            </div>
          </div>
        )}

        {/* Step 1: Fee estimation */}
        {step === 1 && (
          <div>
            <FormTitle>Estimate Fee</FormTitle>
            <SummaryBox rows={[
              ['From', vaults.find(v => v.id === form.srcId)?.vaultName ?? form.srcId],
              ['To', vaults.find(v => v.id === form.dstId)?.vaultName ?? form.dstId],
              ['Amount', `${form.amount} ${form.asset}`],
              ['Chain', form.chain],
              ['Fee Tier', form.feeTier],
            ]} />
            {feeError && <ErrorBox message={feeError} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Btn secondary onClick={() => setStep(0)}>← Back</Btn>
              <Btn onClick={estimateFee} disabled={feeLoading}>{feeLoading ? 'Estimating…' : 'Estimate Gas'}</Btn>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <div>
            <FormTitle>Confirm Transfer</FormTitle>
            <SummaryBox rows={[
              ['From', vaults.find(v => v.id === form.srcId)?.vaultName ?? form.srcId],
              ['To', vaults.find(v => v.id === form.dstId)?.vaultName ?? form.dstId],
              ['Amount', `${form.amount} ${form.asset}`],
              ['Chain', form.chain],
              ['Fee Tier', form.feeTier],
              ...(fee?.gasAmount ? [['Est. Gas', `${fee.gasAmount} ${fee.gasCurrency ?? ''}`]] : []),
            ]} />
            {txError && <ErrorBox message={txError} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Btn secondary onClick={() => setStep(1)} disabled={submitting}>← Back</Btn>
              <Btn onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Transfer'}</Btn>
            </div>
          </div>
        )}

        {/* Step 3: Status */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <FormTitle>Transaction Status</FormTitle>
            <div style={{ margin: '24px 0' }}>
              {txStatus?.status === 'COMPLETED' && <StatusCircle color="#d1fae5" text="✓" textColor="#065f46" />}
              {txStatus?.status === 'FAILED'    && <StatusCircle color="#fee2e2" text="✕" textColor="#991b1b" />}
              {!['COMPLETED', 'FAILED'].includes(txStatus?.status) && <SpinningCircle />}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: txStatus?.status === 'COMPLETED' ? '#065f46' : txStatus?.status === 'FAILED' ? '#991b1b' : '#111827' }}>
              {txStatus?.status === 'COMPLETED' ? 'Transfer Complete!' : txStatus?.status === 'FAILED' ? 'Transfer Failed' : 'Processing…'}
            </div>
            {txId && <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 16 }}>{txId}</div>}
            {txStatus && (
              <SummaryBox rows={[
                ['Status', txStatus.status ?? '—'],
                ...(txStatus.amount ? [['Amount', `${txStatus.amount} ${txStatus.asset ?? ''}`]] : []),
                ...(txStatus.blockChain ? [['Chain', txStatus.blockChain]] : []),
              ]} />
            )}
            {txError && <ErrorBox message={txError} />}
            {['COMPLETED', 'FAILED'].includes(txStatus?.status) && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <Btn secondary onClick={reset}>New Transfer</Btn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared components ────────────────────────────────────────────────────────

function SectionTitle({ children, style }) {
  return <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16, ...style }}>{children}</h2>
}

function FormTitle({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 24, marginTop: 0 }}>{children}</h2>
}

function Card({ children, title, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', ...style }}>
      {title && <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 13, fontWeight: 700, color: '#374151' }}>{title}</div>}
      {children}
    </div>
  )
}

function Row({ label, value, mono, isLast }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: isLast ? 'none' : '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', fontFamily: mono ? 'monospace' : 'inherit', maxWidth: '60%', wordBreak: 'break-all', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' }

function VaultSelect({ value, onChange, vaults, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      <option value="">{placeholder}</option>
      {vaults.map(v => <option key={v.id} value={v.id}>{v.vaultName ?? v.name} ({v.id.slice(0, 8)}…)</option>)}
    </select>
  )
}

function NativeSelect({ value, onChange, options }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
}

function NativeInput({ type, value, onChange, placeholder }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
}

function SummaryBox({ rows }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '4px 0', marginBottom: 16 }}>
      {rows.map(([label, value], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

function Btn({ children, onClick, disabled, secondary }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      border: secondary ? '1px solid #e5e7eb' : 'none',
      background: disabled ? '#e5e7eb' : secondary ? '#fff' : '#1a56db',
      color: disabled ? '#9ca3af' : secondary ? '#374151' : '#fff',
      transition: 'opacity 0.15s',
    }}>{children}</button>
  )
}

function TestnetBadge() {
  return <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>TESTNET</span>
}

function StatusBadge({ status }) {
  const colors = { COMPLETED: ['#d1fae5', '#065f46'], FAILED: ['#fee2e2', '#991b1b'], PENDING: ['#e0f2fe', '#0369a1'] }
  const [bg, color] = colors[status] ?? ['#f3f4f6', '#6b7280']
  return <span style={{ fontSize: 10, fontWeight: 700, background: bg, color, padding: '2px 6px', borderRadius: 4 }}>{status ?? '—'}</span>
}

function ErrorBox({ message }) {
  return <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>⚠ {message}</div>
}

function EmptyState({ label }) {
  return <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>{label}</div>
}

function Spinner({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#1a56db', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: '#9ca3af' }}>{label}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function StatusCircle({ color, text, textColor }) {
  return <div style={{ width: 64, height: 64, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 28, color: textColor }}>{text}</div>
}

function SpinningCircle() {
  return (
    <>
      <div style={{ width: 64, height: 64, border: '4px solid #e5e7eb', borderTopColor: '#1a56db', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
