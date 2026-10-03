import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { t } from "@/i18n/core";

interface AddDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    deviceName: string;
    deviceType: string;
    installedAt: string;
  }) => void;
}

const DEVICE_TYPES = [
  "SENSOR_HUB",
  "CONTROLLER",
  "CAMERA",
  "GATEWAY",
  "WEATHER_STATION",
];

export function AddDeviceDialog({
  open,
  onClose,
  onSubmit,
}: AddDeviceDialogProps) {
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("SENSOR_HUB");
  const [installedAt, setInstalledAt] = useState("");

  function handleSubmit() {
    if (!deviceName || !installedAt) return;
    onSubmit({ deviceName, deviceType, installedAt });
    setDeviceName("");
    setDeviceType("SENSOR_HUB");
    setInstalledAt("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700 }}>
        {t("txt.add_device")}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label={t("txt.device_name")}
          fullWidth
          size="small"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <TextField
          select
          label={t("txt.device_type")}
          fullWidth
          size="small"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
        >
          {DEVICE_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t("txt.installed_date")}
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          value={installedAt}
          onChange={(e) => setInstalledAt(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          {t("txt.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!deviceName || !installedAt}
          sx={{ textTransform: "none" }}
        >
          {t("txt.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
