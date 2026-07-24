import { Box, Card, Typography } from "@mui/material";

interface CameraInfoPanelProps {
  cameraLabel: string;
  cameraName?: string;
  model?: string;
  networkStatus?: string;
  resolution?: string;
  encoding?: string;
}

export function CameraInfoPanel({
  cameraLabel,
  cameraName,
  model,
  networkStatus,
  resolution,
  encoding,
}: CameraInfoPanelProps) {
  const rows: [string, string][] = [
    ["Name", cameraName ?? cameraLabel],
    ["Model", model ?? "—"],
    ["Network Status", networkStatus ?? "—"],
    ["Resolution", resolution ?? "—"],
    ["Encoding", encoding ?? "—"],
  ];

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: "text.primary",
          mb: 2,
        }}
      >
        Camera Information
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {rows.map(([label, value]) => (
          <Box
            key={label}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: "text.primary",
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
