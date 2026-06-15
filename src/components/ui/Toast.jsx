import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="absolute top-16 left-0 right-0 flex flex-col items-center gap-2 z-50 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg pointer-events-auto text-sm font-medium
                ${t.type === 'success' ? 'bg-[#111827] text-white' : 'bg-[#dc2626] text-white'}`}
            >
              {t.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {t.message}
              <button onClick={() => dismiss(t.id)} className="ml-1 opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
