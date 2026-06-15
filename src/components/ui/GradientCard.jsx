export default function GradientCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-6 text-white ${className}`}
      style={{ background: 'linear-gradient(135deg, #0061D3 0%, #00326D 100%)' }}
    >
      {children}
    </div>
  )
}
