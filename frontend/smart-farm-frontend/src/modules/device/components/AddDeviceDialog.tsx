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
        Add Device
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label="Device Name"
          fullWidth
          size="small"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <TextField
          select
          label="Device Type"
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
          label="Installed Date"
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
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!deviceName || !installedAt}
          sx={{ textTransform: "none" }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
