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

interface Device {
  _id: string;
  deviceName: string;
}

interface CreateActuatorDialogProps {
  open: boolean;
  devices: Device[];
  onClose: () => void;
  onSubmit: (data: {
    actuatorName: string;
    actuatorType: string;
    deviceId: string;
  }) => void;
}

const ACTUATOR_TYPES = [
  { value: "RELAY", label: "Relay" },
  { value: "WATER_PUMP", label: "Water Pump" },
  { value: "SOLENOID_VALVE", label: "Solenoid Valve" },
  { value: "GROW_LIGHT", label: "Grow Light" },
  { value: "COOLING_FAN", label: "Cooling Fan" },
  { value: "SERVO", label: "Servo" },
];

export function CreateActuatorDialog({
  open,
  devices,
  onClose,
  onSubmit,
}: CreateActuatorDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("RELAY");
  const [deviceId, setDeviceId] = useState("");

  function handleSubmit() {
    if (!name || !deviceId) return;
    onSubmit({ actuatorName: name, actuatorType: type, deviceId });
    setName("");
    setType("RELAY");
    setDeviceId("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700 }}>
        Add Actuator
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label="Name"
          fullWidth
          size="small"
          placeholder="Irrigation Valve — Section 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          select
          label="Type"
          fullWidth
          size="small"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {ACTUATOR_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Connected Device (ESP32 hub)"
          fullWidth
          size="small"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
        >
          {devices.map((d) => (
            <MenuItem key={d._id} value={d._id}>
              {d.deviceName}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || !deviceId}
          sx={{ textTransform: "none" }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
