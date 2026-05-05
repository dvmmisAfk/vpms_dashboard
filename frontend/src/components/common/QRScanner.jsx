// components/common/QRScanner.jsx
import { Html5Qrcode } from "html5-qrcode";
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef } from "react";

export function QRScanner({ onDecoded, className = "" }) {
  const regionId = useMemo(() => `qr-${Math.random().toString(16).slice(2)}`, []);
  const scannerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const qr = new Html5Qrcode(regionId);
      scannerRef.current = qr;

      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          if (cancelled) return;
          onDecoded?.(decodedText);
        },
        () => {
          /* frames without match */
        },
      );
    }

    start().catch(() => {
      /* camera permissions / device issues */
    });

    return () => {
      cancelled = true;
      const qr = scannerRef.current;
      scannerRef.current = null;
      if (!qr) return;
      qr
        .stop()
        .then(() => qr.clear())
        .catch(() => {
          /* ignore */
        });
    };
  }, [onDecoded, regionId]);

  return <div id={regionId} className={`w-full overflow-hidden rounded-xl bg-black ${className}`} />;
}

QRScanner.propTypes = {
  onDecoded: PropTypes.func,
  className: PropTypes.string,
};
