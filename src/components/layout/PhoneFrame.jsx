import { setViewOverride } from '../../hooks/useIsDesktop'

export default function PhoneFrame({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        width: 390,
        height: 844,
        borderRadius: 44,
        background: 'white',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Notch */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 34,
          background: '#000',
          borderRadius: '0 0 18px 18px',
          zIndex: 50,
        }} />
        {/* Status bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 60,
          paddingRight: 60,
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>9:41</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>●●●</span>
        </div>
        {/* Content area */}
        <div style={{
          position: 'absolute',
          top: 44,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}>
          {children}
        </div>
      </div>

      <button
        onClick={() => setViewOverride('desktop')}
        style={{
          marginTop: 16,
          padding: '6px 18px',
          borderRadius: 20,
          border: '1px solid #d1d5db',
          background: 'white',
          fontSize: 12,
          fontWeight: 500,
          color: '#6b7280',
          cursor: 'pointer',
        }}
      >
        Desktop view
      </button>
    </div>
  )
}
