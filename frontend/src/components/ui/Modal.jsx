import { useEffect } from 'react'

// popup modal component
// parent controls whether it shows by conditionally rendering it
export function Modal({ title, children, onClose }) {
  // close when they press escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* close when clicking outside */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose && onClose()} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
