// components/common/ExportButton.jsx
import PropTypes from "prop-types";

import { Button } from "../ui/Button.jsx";

export function ExportButton({ label = "Export CSV", filename = "export.csv", loading, onExport }) {
  return (
    <Button
      type="button"
      variant="secondary"
      loading={loading}
      onClick={async () => {
        const blob = await onExport();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      {label}
    </Button>
  );
}

ExportButton.propTypes = {
  label: PropTypes.string,
  filename: PropTypes.string,
  loading: PropTypes.bool,
  onExport: PropTypes.func.isRequired,
};
