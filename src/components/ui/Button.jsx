import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-full transition-colors focus:outline-none select-none'

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-[15px]',
    lg: 'px-8 py-4 text-base',
  }

  const variants = {
    primary:
      'bg-[#1a56db] text-white hover:bg-[#1648c0] disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'border border-[#1a56db] text-[#1a56db] hover:bg-[#eff6ff] disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'text-[#dc2626] hover:bg-[#fef2f2] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-[#f3f4f6] text-[#111827] hover:bg-[#e5e7eb] disabled:opacity-50 disabled:cursor-not-allowed',
  }

  return (
    <motion.button
      type={type}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Loader2 size={16} className="animate-spin mr-2" />}
      {children}
    </motion.button>
  )
}
