import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function SlideOver({ open, onClose, title, subtitle, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50"
          />
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] z-50 flex flex-col"
          >
            <div className="flex items-start justify-between px-6 py-5 border-b border-[#f3f4f6] flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
                {subtitle && <p className="text-sm text-[#6b7280] mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
