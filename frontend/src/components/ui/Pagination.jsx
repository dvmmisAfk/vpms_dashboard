import { Button } from './Button.jsx'

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-slate-500">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </div>
  )
}
