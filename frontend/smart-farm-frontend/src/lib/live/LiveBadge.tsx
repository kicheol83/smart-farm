import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useLive } from "./LiveProvider";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(46, 204, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
`;

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export function LiveBadge() {
  const { connected, lastUpdate } = useLive();
  const updated = lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Tooltip title={connected ? (updated ? `Last reading ${updated}` : "Waiting for readings") : "Realtime connection offline"}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: connected ? "#2ecc71" : "grey.500",
              animation: connected ? `${pulse} 1.6s infinite` : "none",
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: "text.secondary" }}>
            {connected ? "LIVE" : "OFFLINE"}
          </Typography>
        </Box>
      </Tooltip>
      {DEMO_MODE && (
        <Tooltip title="Sensor readings in this demo come from a simulated device that publishes through the same MQTT pipeline as the real ESP32 hardware.">
          <Chip size="small" label="DEMO · simulated sensors" color="warning" variant="outlined" />
        </Tooltip>
      )}
    </Box>
  );
}
