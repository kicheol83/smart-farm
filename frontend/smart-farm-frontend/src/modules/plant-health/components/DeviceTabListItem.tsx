import { Box, Typography, Chip } from "@mui/material";
import { format } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

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
    label: t("txt.active"),
    color: "#1a7a4c",
    bg: "rgba(53,197,110,0.16)",
    summary: t("txt.device_running_normally"),
  },
  OFFLINE: {
    label: t("txt.offline"),
    color: "#6b6b6b",
    bg: "rgba(156,156,156,0.16)",
    summary: t("txt.device_is_currently_offline"),
  },
  MAINTENANCE: {
    label: t("txt.maintenance"),
    color: "#a06a0a",
    bg: "rgba(249,173,25,0.16)",
    summary: t("txt.device_under_maintenance"),
  },
  ERROR: {
    label: t("txt.error"),
    color: "#c62828",
    bg: "rgba(229,57,53,0.16)",
    summary: t("txt.sensor_malfunction_detected"),
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
        label={t("txt.last_updated")}
        value={format(new Date(updatedAt), "PPp", { locale: dateLocale() })}
      />
      <FieldRow label={t("txt.device_type")} value={deviceType} />
      <FieldRow label={t("txt.summary")} value={style.summary} />
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
