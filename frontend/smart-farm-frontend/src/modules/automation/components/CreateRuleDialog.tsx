import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";

interface Actuator {
  _id: string;
  actuatorName: string;
}

interface CreateRuleDialogProps {
  open: boolean;
  actuators: Actuator[];
  onClose: () => void;
  onSubmit: (data: {
    ruleName: string;
    actuatorId: string;
    triggerSensorType: string;
    triggerCondition: string;
    triggerThreshold: number;
    actionDurationMinutes?: number;
  }) => void;
}

const SENSOR_TYPES = [
  "SOIL_MOISTURE",
  "TEMPERATURE",
  "HUMIDITY",
  "WATER_LEVEL",
  "WATER_EC",
  "RAIN",
  "PH",
  "CO2",
  "LIGHT",
];

export function CreateRuleDialog({
  open,
  actuators,
  onClose,
  onSubmit,
}: CreateRuleDialogProps) {
  const [ruleName, setRuleName] = useState("");
  const [actuatorId, setActuatorId] = useState("");
  const [sensorType, setSensorType] = useState("SOIL_MOISTURE");
  const [condition, setCondition] = useState("BELOW");
  const [threshold, setThreshold] = useState("30");
  const [duration, setDuration] = useState("5");

  function handleSubmit() {
    if (!ruleName || !actuatorId) return;
    onSubmit({
      ruleName,
      actuatorId,
      triggerSensorType: sensorType,
      triggerCondition: condition,
      triggerThreshold: Number(threshold),
      actionDurationMinutes: duration ? Number(duration) : undefined,
    });
    setRuleName("");
    setActuatorId("");
    setSensorType("SOIL_MOISTURE");
    setCondition("BELOW");
    setThreshold("30");
    setDuration("5");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700 }}>
        Add Automation Rule
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label="Rule Name"
          fullWidth
          size="small"
          placeholder="Auto-water when soil is dry"
          value={ruleName}
          onChange={(e) => setRuleName(e.target.value)}
        />

        <TextField
          select
          label="Actuator to trigger"
          fullWidth
          size="small"
          value={actuatorId}
          onChange={(e) => setActuatorId(e.target.value)}
        >
          {actuators.map((a) => (
            <MenuItem key={a._id} value={a._id}>
              {a.actuatorName}
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}
        >
          <TextField
            select
            label="Sensor"
            size="small"
            value={sensorType}
            onChange={(e) => setSensorType(e.target.value)}
          >
            {SENSOR_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Condition"
            size="small"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <MenuItem value="BELOW">Below</MenuItem>
            <MenuItem value="ABOVE">Above</MenuItem>
          </TextField>
          <TextField
            label="Threshold"
            type="number"
            size="small"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </Box>

        <TextField
          label="Auto-off after (minutes, optional)"
          type="number"
          size="small"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          helperText="Bo'sh qoldirsangiz, qoida ishga tushgach actuator qo'lda o'chirilmaguncha ON qoladi"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!ruleName || !actuatorId}
          sx={{ textTransform: "none" }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
