import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ── Context ────────────────────────────────────────────────
const ToastContext = createContext(null)

let _nextId = 1

// ── Provider ───────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = _nextId++
      setToasts((prev) => [...prev, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  // Cleanup on unmount
  useEffect(() => {
    const ids = timers.current
    return () => Object.values(ids).forEach(clearTimeout)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-icon">{t.type === 'success' ? '✅' : '❌'}</span>
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
