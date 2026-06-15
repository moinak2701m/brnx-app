const STYLES = {
  credited:   { label: 'CREDITED',      color: '#16a34a', bg: '#d1fae5' },
  pending:    { label: 'PENDING',        color: '#f97316', bg: '#fff7ed' },
  processing: { label: 'PROCESSING',     color: '#7c3aed', bg: '#ede9fe' },
  failed:     { label: 'FAILED',         color: '#dc2626', bg: '#fef2f2' },
  verified:   { label: 'VERIFIED',       color: '#16a34a', bg: '#d1fae5' },
  review:     { label: 'UNDER REVIEW',   color: '#f97316', bg: '#fff7ed' },
}

export default function Badge({ status, label, size = 'sm' }) {
  const s = STYLES[status] || STYLES.pending
  const text = label || s.label
  const padding = size === 'lg' ? '4px 12px' : '3px 10px'
  const fontSize = size === 'lg' ? '12px' : '11px'

  return (
    <span
      style={{
        color: s.color,
        background: s.bg,
        padding,
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.05em',
        borderRadius: 9999,
        display: 'inline-block',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}
