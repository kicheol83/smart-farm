import { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Button, Typography } from "@mui/material";
import { t } from "@/i18n/core";

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
        <Field label={t("txt.temperature_unit")}>
          <TextField
            select
            fullWidth
            size="small"
            value={temperatureUnit}
            onChange={(e) => setTemperatureUnit(e.target.value)}
          >
            <MenuItem value="CELSIUS">{t("txt.celsius_c")}</MenuItem>
            <MenuItem value="FAHRENHEIT">{t("txt.fahrenheit_f")}</MenuItem>
          </TextField>
        </Field>

        <Field label={t("txt.speed_unit")} note={t("txt.coming_soon")}>
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

        <Field label={t("txt.land_area_unit")}>
          <TextField
            select
            fullWidth
            size="small"
            value={areaUnit}
            onChange={(e) => setAreaUnit(e.target.value)}
          >
            <MenuItem value="SQUARE_METER">{t("txt.square_meter_m")}</MenuItem>
            <MenuItem value="SQUARE_FEET">{t("txt.square_feet_ft")}</MenuItem>
            <MenuItem value="HECTARE">{t("txt.hectare_ha")}</MenuItem>
            <MenuItem value="ACRE">{t("txt.acre_ac")}</MenuItem>
          </TextField>
        </Field>

        <Field label={t("txt.water_volume_unit")}>
          <TextField
            select
            fullWidth
            size="small"
            value={waterUnit}
            onChange={(e) => setWaterUnit(e.target.value)}
          >
            <MenuItem value="LITER">{t("txt.liter_l")}</MenuItem>
            <MenuItem value="GALLON">{t("txt.gallon_gal")}</MenuItem>
          </TextField>
        </Field>

        <Field label={t("txt.date_format")} note={t("txt.coming_soon")}>
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

        <Field label={t("txt.time_format")}>
          <TextField
            select
            fullWidth
            size="small"
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value)}
          >
            <MenuItem value="FORMAT_24H">{t("txt.24_hour")}</MenuItem>
            <MenuItem value="FORMAT_12H">{t("txt.12_hour_am_pm")}</MenuItem>
          </TextField>
        </Field>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.cancel")}
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() =>
            onSave({ temperatureUnit, areaUnit, waterUnit, timeFormat })
          }
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.save")}
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
