// reusable button with loading state

// button styles for each type
const styles = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 disabled:opacity-50',
}

export function Button({ children, type = 'button', variant = 'primary', className = '', loading = false, disabled, ...rest }) {
  const cls = styles[variant] || styles.primary
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${cls} ${className}`}
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
