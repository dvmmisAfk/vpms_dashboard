// qr code scanner component using html5-qrcode library
import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onScan, onError }) {
  const scannerRef = useRef(null)
  const startedRef = useRef(false)
  // use a stable id so react doesn't mess with it on re-renders
  const divId = useRef('qr-reader-' + Math.random().toString(36).slice(2)).current

  useEffect(() => {
    const scanner = new Html5Qrcode(divId)
    scannerRef.current = scanner

    // start scanner when component loads
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        onScan(decodedText)
      },
      () => {
        // this fires constantly while scanning, not a real error
      }
    ).then(() => {
      startedRef.current = true
    }).catch(err => {
      // usually happens if camera permission denied
      console.warn('couldnt start camera:', err)
      if (onError) onError(err)
    })

    // stop scanner when leaving the page (important!)
    return () => {
      if (startedRef.current) {
        scanner.stop().catch(() => {})
      }
    }
  }, []) // only run once, the key prop handles restarts

  return (
    <div>
      <div id={divId} style={{ width: '100%' }} />
      <p style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' }}>
        Point camera at QR code
      </p>
    </div>
  )
}
