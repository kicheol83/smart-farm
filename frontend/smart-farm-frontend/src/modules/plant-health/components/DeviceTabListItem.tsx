import { Box, Typography, Chip } from "@mui/material";
import { format } from "date-fns";

type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR";

interface DeviceTabListItemProps {
  deviceName: string;
  deviceType: string;
  deviceStatus: DeviceStatus;
  updatedAt: string;
}

const STATUS_STYLE: Record<
  DeviceStatus,
  { label: string; color: string; bg: string; summary: string }
> = {
  ONLINE: {
    label: "Active",
    color: "#1a7a4c",
    bg: "rgba(53,197,110,0.16)",
    summary: "Device running normally.",
  },
  OFFLINE: {
    label: "Offline",
    color: "#6b6b6b",
    bg: "rgba(156,156,156,0.16)",
    summary: "Device is currently offline.",
  },
  MAINTENANCE: {
    label: "Maintenance",
    color: "#a06a0a",
    bg: "rgba(249,173,25,0.16)",
    summary: "Device under maintenance.",
  },
  ERROR: {
    label: "Error",
    color: "#c62828",
    bg: "rgba(229,57,53,0.16)",
    summary: "Sensor malfunction detected.",
  },
};

export function DeviceTabListItem({
  deviceName,
  deviceType,
  deviceStatus,
  updatedAt,
}: DeviceTabListItemProps) {
  const style = STATUS_STYLE[deviceStatus];

  return (
    <Box sx={{ p: 2, borderRadius: 2, "&:hover": { bgcolor: "action.hover" } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.75,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "text.primary",
          }}
        >
          {deviceName}
        </Typography>
        <Chip
          label={style.label}
          size="small"
          sx={{
            bgcolor: style.bg,
            color: style.color,
            fontWeight: 600,
            fontSize: 11,
            height: 22,
          }}
        />
      </Box>

      <FieldRow
        label="Last Updated"
        value={format(new Date(updatedAt), "MMM dd, hh:mm a")}
      />
      <FieldRow label="Device Type" value={deviceType} />
      <FieldRow label="Summary" value={style.summary} />
    </Box>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
          minWidth: 90,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
