import { useState, useEffect } from "react";
import { Box, TextField, MenuItem, Button, Typography } from "@mui/material";

const TIMEZONES = [
  "Europe/Berlin",
  "Asia/Tashkent",
  "UTC",
  "America/New_York",
  "Asia/Dubai",
];

interface GeneralSettingsTabProps {
  timezone?: string;
  onSave: (data: { timezone: string }) => void;
  saving?: boolean;
}

export function GeneralSettingsTab({
  timezone,
  onSave,
  saving,
}: GeneralSettingsTabProps) {
  const [farmProfile, setFarmProfile] = useState("My Smart Farm");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [tz, setTz] = useState(timezone ?? "Europe/Berlin");

  useEffect(() => {
    if (timezone) setTz(timezone);
  }, [timezone]);

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
          Farm Profile
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={farmProfile}
          onChange={(e) => setFarmProfile(e.target.value)}
          helperText="Backend'da hali saqlanmaydi"
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
            Farm Location
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={farmLocation}
            onChange={(e) => setFarmLocation(e.target.value)}
            placeholder="Address"
            helperText="Backend'da hali saqlanmaydi"
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
            Time Zone
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
          Farm Description
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          size="small"
          value={farmDescription}
          onChange={(e) => setFarmDescription(e.target.value)}
          helperText="Backend'da hali saqlanmaydi"
        />
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
          onClick={() => onSave({ timezone: tz })}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}
