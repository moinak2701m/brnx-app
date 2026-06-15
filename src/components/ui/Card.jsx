export default function Card({ children, className = '', padding = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#e5e7eb] rounded-2xl ${padding ? 'p-5' : ''} ${onClick ? 'cursor-pointer active:bg-[#f9fafb]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
