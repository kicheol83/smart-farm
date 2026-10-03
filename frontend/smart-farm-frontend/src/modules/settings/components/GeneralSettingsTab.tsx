import { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Button, Typography } from "@mui/material";
import { t } from "@/i18n/core";

const TIMEZONES = [
  "Europe/Berlin",
  "Asia/Tashkent",
  "UTC",
  "America/New_York",
  "Asia/Dubai",
];

interface GeneralSettingsTabProps {
  timezone?: string;
  farmName?: string;
  farmLocation?: string;
  farmDescription?: string;
  onSave: (data: {
    timezone: string;
    farmName: string;
    farmLocation: string;
    farmDescription: string;
  }) => void;
  saving?: boolean;
}

export function GeneralSettingsTab({
  timezone,
  farmName,
  farmLocation,
  farmDescription,
  onSave,
  saving,
}: GeneralSettingsTabProps) {
  const [name, setName] = useState(farmName ?? "");
  const [location, setLocation] = useState(farmLocation ?? "");
  const [description, setDescription] = useState(farmDescription ?? "");
  const [tz, setTz] = useState(timezone ?? "Europe/Berlin");

  useEffect(() => {
    if (timezone) setTz(timezone);
  }, [timezone]);

  useEffect(() => {
    if (farmName !== undefined) setName(farmName);
    if (farmLocation !== undefined) setLocation(farmLocation);
    if (farmDescription !== undefined) setDescription(farmDescription);
  }, [farmName, farmLocation, farmDescription]);

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 900 }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            mb: 0.5,
          }}
        >
          {t("txt.farm_profile")}
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("txt.my_smart_farm")}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {t("txt.farm_location")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("txt.address")}
          />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {t("txt.time_zone")}
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
          >
            {TIMEZONES.map((z) => (
              <MenuItem key={z} value={z}>
                {z}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Box>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            mb: 0.5,
          }}
        >
          {t("txt.farm_description")}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
            onSave({
              timezone: tz,
              farmName: name,
              farmLocation: location,
              farmDescription: description,
            })
          }
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.save")}
        </Button>
      </Box>
    </Box>
  );
}
