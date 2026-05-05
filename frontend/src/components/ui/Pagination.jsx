// components/ui/Pagination.jsx
import PropTypes from "prop-types";

import { Button } from "./Button.jsx";

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(prev)}>
        Previous
      </Button>
      <div className="text-sm text-vpms-muted">
        Page <span className="font-semibold text-vpms-text">{page}</span> of <span className="font-semibold text-vpms-text">{totalPages}</span>
      </div>
      <Button variant="secondary" disabled={page >= totalPages} onClick={() => onChange(next)}>
        Next
      </Button>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
