import { Box, Card, Typography, IconButton, Stack } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router-dom";

type DeviceStatus = "ONLINE" | "OFFLINE" | "MAINTENANCE" | "ERROR";

interface DeviceItem {
  _id: string;
  deviceName: string;
  deviceType: string;
  deviceStatus: DeviceStatus;
}

interface TypeCount {
  deviceType: string;
  count: number;
}

interface DashboardDevicePanelProps {
  greenHouseName?: string;
  typeCounts?: TypeCount[];
  devices?: DeviceItem[];
}

const STATUS_COLORS: Record<DeviceStatus, string> = {
  ONLINE: "#35C56E",
  OFFLINE: "#9c9c9c",
  MAINTENANCE: "#f9ad19",
  ERROR: "#f9ad19",
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
      return "Weather";
    default:
      return deviceType;
  }
}

export function DashboardDevicePanel({
  greenHouseName = "—",
  typeCounts = [],
  devices = [],
}: DashboardDevicePanelProps) {
  const navigate = useNavigate();

  const sensorCount =
    typeCounts.find((t) => t.deviceType === "SENSOR_HUB")?.count ?? 0;
  const cameraCount =
    typeCounts.find((t) => t.deviceType === "CAMERA")?.count ?? 0;

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "-0.4px",
            color: "text.primary",
          }}
        >
          Device
        </Typography>

        <Box sx={{ display: "flex", gap: 4 }}>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Sensor
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "text.primary",
              }}
            >
              {sensorCount}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Camera
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "text.primary",
              }}
            >
              {cameraCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack spacing={1.5} sx={{ overflowY: "auto", flex: 1 }}>
        {devices.map((d) => {
          const hasIssue =
            d.deviceStatus === "ERROR" || d.deviceStatus === "MAINTENANCE";
          return (
            <Box
              key={d._id}
              sx={{
                bgcolor: "background.default",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: STATUS_COLORS[d.deviceStatus] ?? "#9c9c9c",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 500,
                  fontSize: 15,
                  letterSpacing: "-0.3px",
                  color: "text.primary",
                }}
              >
                {d.deviceName}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {greenHouseName} &nbsp;•&nbsp; {typeLabel(d.deviceType)}
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
                  <WarningAmberRoundedIcon
                    sx={{ fontSize: 14, color: "#f9ad19" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "#c98a0f",
                    }}
                  >
                    {d.deviceStatus === "ERROR"
                      ? "Signal issue detected"
                      : "Under maintenance"}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}

        {devices.length === 0 && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
              py: 3,
            }}
          >
            Hali qurilma qo'shilmagan
          </Typography>
        )}
      </Stack>

      <IconButton
        size="small"
        onClick={() => navigate("/devices")}
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
