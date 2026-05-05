// components/common/QRCode.jsx
import PropTypes from "prop-types";
import { QRCodeSVG } from "qrcode.react";

export function QRCode({ value, size = 220 }) {
  if (!value) return null;
  return <QRCodeSVG value={value} size={size} includeMargin className="rounded-xl bg-white p-2 shadow-sm ring-1 ring-vpms-border" />;
}

QRCode.propTypes = {
  value: PropTypes.string,
  size: PropTypes.number,
};
