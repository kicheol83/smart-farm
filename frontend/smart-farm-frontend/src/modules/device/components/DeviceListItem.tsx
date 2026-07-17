import { Box, Typography, IconButton } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR";

interface DeviceListItemProps {
  deviceName: string;
  deviceType: string;
  deviceStatus: DeviceStatus;
  greenHouseName?: string;
  selected?: boolean;
  onClick: () => void;
}

const STATUS_COLOR: Record<DeviceStatus, string> = {
  ONLINE: "#35C56E",
  OFFLINE: "#9c9c9c",
  MAINTENANCE: "#f9ad19",
  ERROR: "#e53935",
};

function typeLabel(deviceType: string): string {
  switch (deviceType) {
    case "CAMERA":
      return "Camera";
    case "SENSOR_HUB":
      return "Sensor";
    case "CONTROLLER":
      return "Controller";
    case "GATEWAY":
      return "Gateway";
    case "WEATHER_STATION":
      return "Weather Station";
    default:
      return deviceType;
  }
}

export function DeviceListItem({
  deviceName,
  deviceType,
  deviceStatus,
  greenHouseName = "—",
  selected,
  onClick,
}: DeviceListItemProps) {
  const hasIssue = deviceStatus === "ERROR";

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        p: 2,
        borderRadius: 2,
        cursor: "pointer",
        borderLeft: "3px solid",
        borderLeftColor: selected ? "primary.main" : "transparent",
        bgcolor: selected ? "action.selected" : "transparent",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: STATUS_COLOR[deviceStatus],
            mt: 0.5,
          }}
        />
        <IconButton size="small" sx={{ bgcolor: "action.selected" }}>
          <ArrowOutwardRoundedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 15,
          color: "text.primary",
        }}
      >
        {deviceName}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        {greenHouseName} &nbsp;•&nbsp; {typeLabel(deviceType)}
      </Typography>

      {hasIssue && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: "rgba(249,173,25,0.12)",
            borderRadius: 1.5,
            px: 1,
            py: 0.5,
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 14, color: "#f9ad19" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: "#a06a0a",
            }}
          >
            Signal issue detected
          </Typography>
        </Box>
      )}
    </Box>
  );
}
