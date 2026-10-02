import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

const STAGES = [
  { title: "ESP32", detail: "sensors" },
  { title: "MQTT", detail: "QoS 1" },
  { title: "Redis buffer", detail: "queue + DLQ" },
  { title: "Calibration", detail: "offset / scale" },
  { title: "MongoDB", detail: "raw + time-series" },
  { title: "Z-score", detail: "anomaly detection" },
  { title: "WebSocket", detail: "live push" },
];

const travel = keyframes`
  0% { left: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 100%; opacity: 0; }
`;

type PipelineFlowProps = {
  pulseKey: string | null;
  active: boolean;
};

export function PipelineFlow({ pulseKey, active }: PipelineFlowProps) {
  return (
    <Box sx={{ position: "relative", py: 2, overflowX: "auto" }}>
      <Box sx={{ position: "relative", minWidth: 760 }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 40,
            right: 40,
            height: 2,
            bgcolor: "divider",
          }}
        />
        {active && pulseKey && (
          <Box key={pulseKey} sx={{ position: "absolute", top: "50%", left: 40, right: 40, height: 0 }}>
            <Box
              sx={{
                position: "absolute",
                top: -6,
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#35C56E",
                boxShadow: "0 0 12px #35C56E",
                animation: `${travel} 1.4s ease-in-out forwards`,
              }}
            />
          </Box>
        )}
        <Box sx={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 1 }}>
          {STAGES.map((stage) => (
            <Box
              key={stage.title}
              sx={{
                width: 96,
                textAlign: "center",
                bgcolor: "background.paper",
                border: 1,
                borderColor: active ? "success.main" : "divider",
                borderRadius: 2,
                px: 1,
                py: 1.25,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {stage.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stage.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
