// components/ui/Modal.jsx
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef } from "react";

export function Modal({ open, title, description, children, footer, onClose }) {
  const panelRef = useRef(null);
  const lastActiveRef = useRef(null);

  const titleId = useMemo(() => `vpms-modal-title-${Math.random().toString(16).slice(2)}`, []);
  const descriptionId = useMemo(() => `vpms-modal-desc-${Math.random().toString(16).slice(2)}`, []);

  useEffect(() => {
    if (!open) return undefined;

    lastActiveRef.current = document.activeElement;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const list = Array.from(focusables);
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus?.();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      lastActiveRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close modal" onClick={() => onClose?.()} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative w-full max-w-lg rounded-2xl bg-vpms-surface p-5 shadow-xl ring-1 ring-vpms-border"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-vpms-text">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-vpms-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className="rounded-lg px-2 py-1 text-sm text-vpms-muted hover:bg-black/5 dark:hover:bg-white/10" onClick={() => onClose?.()}>
            Close
          </button>
        </div>

        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  onClose: PropTypes.func,
};
