export function Input({ label, error, className = '', ...rest }) {
  return (
    <div className={`block ${className}`}>
      {label && (
        <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      )}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </div>
  )
}
