import { createContext, useCallback, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Heart, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  wishlist: Heart,
  info: Info,
  error: AlertTriangle,
}

const ACCENTS = {
  success: 'text-gold-300',
  wishlist: 'text-blush-400',
  info: 'text-blush-300',
  error: 'text-red-400',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    ({ type = 'success', title, message, duration = 2800 }) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t.slice(-2), { id, type, title, message }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 md:items-end md:right-6 md:left-auto">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="glass-strong pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 shadow-soft"
                role="status"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ACCENTS[t.type]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.message && <p className="mt-0.5 text-xs text-muted">{t.message}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
