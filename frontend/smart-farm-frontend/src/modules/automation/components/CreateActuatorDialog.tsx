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
  { value: "RELAY", label: t("txt.relay") },
  { value: "WATER_PUMP", label: t("txt.water_pump") },
  { value: "SOLENOID_VALVE", label: t("txt.solenoid_valve") },
  { value: "GROW_LIGHT", label: t("txt.grow_light") },
  { value: "COOLING_FAN", label: t("txt.cooling_fan") },
  { value: "SERVO", label: t("txt.servo") },
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
        {t("txt.add_actuator")}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label={t("txt.name")}
          fullWidth
          size="small"
          placeholder={t("txt.irrigation_valve_section_1")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          select
          label={t("txt.type")}
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
          label={t("txt.connected_device_esp32_hub")}
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
          {t("txt.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || !deviceId}
          sx={{ textTransform: "none" }}
        >
          {t("txt.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
