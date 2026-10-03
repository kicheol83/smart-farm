import {
  Box,
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { useState } from "react";
import { format } from "date-fns";
import { DeviceMapPlaceholder } from "./DeviceMapPlaceholder";
import { t } from "@/i18n/core";

type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR";

interface Sensor {
  _id: string;
  sensorType: string;
  sensorsUnit: string;
}

interface DeviceDetail {
  _id: string;
  deviceName: string;
  deviceType: string;
  deviceStatus: DeviceStatus;
  installedAt: string;
  sensors: Sensor[];
  networkType?: string;
  powerSource?: string;
  rssi?: number;
  snr?: number;
  lastDataReceived?: string;
  latitude?: number;
  longitude?: number;
}

function formatRadioQuality(rssi?: number, snr?: number): string {
  if (rssi === undefined && snr === undefined) return "—";
  let grade = t("txt.fair");
  if (rssi !== undefined) {
    if (rssi >= -70) grade = t("txt.excellent");
    else if (rssi >= -85) grade = t("txt.good");
    else if (rssi >= -100) grade = t("txt.fair");
    else grade = t("txt.poor");
  }
  const parts = [];
  if (rssi !== undefined) parts.push(`RSSI ${rssi} dBm`);
  if (snr !== undefined) parts.push(`SNR ${snr} dB`);
  return `${grade} (${parts.join(" / ")})`;
}

interface RecentActivityItem {
  message: string;
  timestamp: string;
}

interface DeviceDetailPanelProps {
  device?: DeviceDetail;
  loading?: boolean;
  soilMoistureValue?: number;
  recentActivity?: RecentActivityItem[];
  onStatusChange: (status: DeviceStatus) => void;
  onDelete: () => void;
}

const STATUS_COLOR: Record<DeviceStatus, { color: string; label: string }> = {
  ONLINE: { color: "#35C56E", label: "Active" },
  OFFLINE: { color: "#9c9c9c", label: "Offline" },
  MAINTENANCE: { color: "#f9ad19", label: "Maintenance" },
  ERROR: { color: "#e53935", label: "Error" },
};

export function DeviceDetailPanel({
  device,
  loading,
  soilMoistureValue,
  recentActivity = [],
  onStatusChange,
  onDelete,
}: DeviceDetailPanelProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          bgcolor: "background.paper",
          p: 3,
          height: "100%",
        }}
      >
        <Typography color="text.secondary">Yuklanmoqda...</Typography>
      </Card>
    );
  }

  if (!device) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          bgcolor: "background.paper",
          p: 3,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">Chapdan qurilma tanlang</Typography>
      </Card>
    );
  }

  const statusMeta = STATUS_COLOR[device.deviceStatus];
  const isSoilSensor = device.sensors.some((s) => /soil/i.test(s.sensorType));

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.44px",
            color: "text.primary",
          }}
        >
          {device.deviceName}
        </Typography>

        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {(["ONLINE", "OFFLINE", "MAINTENANCE"] as DeviceStatus[])
            .filter((s) => s !== device.deviceStatus)
            .map((s) => (
              <MenuItem
                key={s}
                onClick={() => {
                  onStatusChange(s);
                  setAnchorEl(null);
                }}
              >
                Mark as {STATUS_COLOR[s].label}
              </MenuItem>
            ))}
          <MenuItem
            onClick={() => {
              onDelete();
              setAnchorEl(null);
            }}
            sx={{ color: "error.main" }}
          >
            {t("txt.delete_device")}
          </MenuItem>
        </Menu>
      </Box>

      {/* Xarita */}
      <DeviceMapPlaceholder
        deviceName={device.deviceName}
        latitude={device.latitude}
        longitude={device.longitude}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
        }}
      >
        <InfoField
          label={t("txt.sensor_status")}
          value={statusMeta.label}
          valueColor={statusMeta.color}
        />
        <InfoField
          label={t("txt.network_connectivity")}
          value={device.networkType ?? "—"}
        />
        <InfoField label={t("txt.device_type")} value={device.deviceType} />
        <InfoField
          label={t("txt.last_data_received")}
          value={
            device.lastDataReceived
              ? format(new Date(device.lastDataReceived), "hh:mm a, MMM dd")
              : "—"
          }
        />
        <InfoField label={t("txt.power_source")} value={device.powerSource ?? "—"} />
        <InfoField
          label={t("txt.radio_quality")}
          value={formatRadioQuality(device.rssi, device.snr)}
        />
      </Box>

      {isSoilSensor && (
        <Box
          sx={{
            bgcolor: "primary.main",
            backgroundImage:
              "linear-gradient(146.72deg, #35C56E 19.38%, #2E9055 91.38%)",
            borderRadius: 2,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            color: "#fff",
          }}
        >
          <SpaRoundedIcon sx={{ fontSize: 18 }} />
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {t("txt.soil_moisture_0a4c")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 32,
              }}
            >
              {soilMoistureValue !== undefined ? `${soilMoistureValue}%` : "—"}
            </Typography>
            {soilMoistureValue !== undefined && soilMoistureValue >= 35 && soilMoistureValue <= 70 && (
              <Box
                sx={{
                  bgcolor: "#fff",
                  color: "#1a7a4c",
                  borderRadius: 1,
                  px: 1,
                  py: 0.25,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {t("device.soil.badge")}
              </Box>
            )}
          </Box>
          <Typography
            sx={{ fontFamily: "Inter, sans-serif", fontSize: 12, opacity: 0.9 }}
          >
            {soilMoistureValue === undefined
              ? ""
              : soilMoistureValue < 35
                ? t("device.soil.dry")
                : soilMoistureValue > 70
                  ? t("device.soil.wet")
                  : t("device.soil.optimal")}
          </Typography>
        </Box>
      )}

      {/* Recent Activity */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "text.primary",
          }}
        >
          {t("txt.recent_activity")}
        </Typography>

        {recentActivity.length > 0 ? (
          recentActivity.map((a, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "background.default",
                borderRadius: 2,
                px: 1.5,
                py: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  color: "text.primary",
                }}
              >
                {a.message}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeRoundedIcon
                  sx={{ fontSize: 13, color: "text.secondary" }}
                />
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  {a.timestamp}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("device.activity.empty")}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

function InfoField({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          color: valueColor ?? "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
