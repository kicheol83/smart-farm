import { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Button, Typography } from "@mui/material";

interface Units {
  temperatureUnit: string;
  areaUnit: string;
  waterUnit: string;
  timeFormat: string;
}

interface UnitSettingsTabProps {
  units?: Units;
  onSave: (data: Units) => void;
  saving?: boolean;
}

export function UnitSettingsTab({
  units,
  onSave,
  saving,
}: UnitSettingsTabProps) {
  const [temperatureUnit, setTemperatureUnit] = useState(
    units?.temperatureUnit ?? "CELSIUS",
  );
  const [areaUnit, setAreaUnit] = useState(units?.areaUnit ?? "HECTARE");
  const [waterUnit, setWaterUnit] = useState(units?.waterUnit ?? "LITER");
  const [timeFormat, setTimeFormat] = useState(
    units?.timeFormat ?? "FORMAT_24H",
  );
  const [speedUnit, setSpeedUnit] = useState("m/s");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  useEffect(() => {
    if (units) {
      setTemperatureUnit(units.temperatureUnit);
      setAreaUnit(units.areaUnit);
      setWaterUnit(units.waterUnit);
      setTimeFormat(units.timeFormat);
    }
  }, [units]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 900 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Field label="Temperature Unit">
          <TextField
            select
            fullWidth
            size="small"
            value={temperatureUnit}
            onChange={(e) => setTemperatureUnit(e.target.value)}
          >
            <MenuItem value="CELSIUS">Celsius (°C)</MenuItem>
            <MenuItem value="FAHRENHEIT">Fahrenheit (°F)</MenuItem>
          </TextField>
        </Field>

        <Field label="Speed Unit" note="Backend'da hali mavjud emas">
          <TextField
            select
            fullWidth
            size="small"
            value={speedUnit}
            onChange={(e) => setSpeedUnit(e.target.value)}
          >
            <MenuItem value="m/s">m/s</MenuItem>
            <MenuItem value="km/h">km/h</MenuItem>
          </TextField>
        </Field>

        <Field label="Land Area Unit">
          <TextField
            select
            fullWidth
            size="small"
            value={areaUnit}
            onChange={(e) => setAreaUnit(e.target.value)}
          >
            <MenuItem value="SQUARE_METER">Square Meter (m²)</MenuItem>
            <MenuItem value="SQUARE_FEET">Square Feet (ft²)</MenuItem>
            <MenuItem value="HECTARE">Hectare (ha)</MenuItem>
            <MenuItem value="ACRE">Acre (ac)</MenuItem>
          </TextField>
        </Field>

        <Field label="Water Volume Unit">
          <TextField
            select
            fullWidth
            size="small"
            value={waterUnit}
            onChange={(e) => setWaterUnit(e.target.value)}
          >
            <MenuItem value="LITER">Liter (L)</MenuItem>
            <MenuItem value="GALLON">Gallon (gal)</MenuItem>
          </TextField>
        </Field>

        <Field label="Date Format" note="Backend'da hali mavjud emas">
          <TextField
            select
            fullWidth
            size="small"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
          >
            <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
            <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
          </TextField>
        </Field>

        <Field label="Time Format">
          <TextField
            select
            fullWidth
            size="small"
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
          >
            <MenuItem value="FORMAT_24H">24-hour</MenuItem>
            <MenuItem value="FORMAT_12H">12-hour (AM/PM)</MenuItem>
          </TextField>
        </Field>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() =>
            onSave({ temperatureUnit, areaUnit, waterUnit, timeFormat })
          }
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}

function Field({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {children}
      {note && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            color: "text.secondary",
            mt: 0.5,
          }}
        >
          {note}
        </Typography>
      )}
    </Box>
  );
}
