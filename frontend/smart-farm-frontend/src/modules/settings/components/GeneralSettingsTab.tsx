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
          Farm Profile
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Smart Farm"
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Address"
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          Save
        </Button>
      </Box>
    </Box>
  );
}
