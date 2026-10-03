import { Box, Card, Typography, IconButton, Stack } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { t } from "@/i18n/core";

interface Device {
  _id: string;
  deviceName: string;
  deviceStatus: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR";
  deviceType: string;
}

interface DeviceListCardProps {
  devices: Device[];
  sensorCount: number;
  cameraCount: number;
}

/**
 * Figma "Device Card" komponenti — sensor/camera soni + Card List ro'yxati.
 * Backend: module5/device.resolver.ts → devices(greenHouseId)
 */
export function DeviceListCard({ devices, sensorCount, cameraCount }: DeviceListCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: "background.paper",
        maxHeight: { xs: 400, sm: "none" },
        overflow: "hidden",
      }}
    >
      <Typography variant="subtitle1" sx={{ color: "text.primary" }}>
        {t("dash.devices.title")}
      </Typography>

      <Box sx={{ display: "flex", gap: 3 }}>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("device.type.sensor")}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            {sensorCount}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("device.type.camera")}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.primary" }}>
            {cameraCount}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1} sx={{ overflowY: "auto" }}>
        {devices.map((d) => (
          <Box
            key={d._id}
            sx={{
              bgcolor: "action.selected",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <StatusIndicator status={d.deviceStatus} />
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {d.deviceName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {d.deviceType}
            </Typography>
          </Box>
        ))}

        {devices.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center", py: 3 }}
          >
            {t("dash.devices.empty")}
          </Typography>
        )}
      </Stack>

      <IconButton
        size="small"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          borderRadius: 2,
          bgcolor: "action.selected",
        }}
      >
        <ArrowOutwardRoundedIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}

function StatusIndicator({ status }: { status: Device["deviceStatus"] }) {
  const isWarning = status === "ERROR" || status === "OFFLINE";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        bgcolor: isWarning ? "rgba(249,173,25,0.16)" : "rgba(53,197,110,0.16)",
      }}
    >
      {isWarning ? (
        <WarningRoundedIcon sx={{ fontSize: 14, color: "warning.main" }} />
      ) : (
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
      )}
    </Box>
  );
}
