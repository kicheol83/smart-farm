import { Box, Typography } from "@mui/material";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeviceMapPlaceholderProps {
  deviceName: string;
  latitude?: number;
  longitude?: number;
}

function buildDeviceIcon(label: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;transform:translate(-50%,-100%);">
        <div style="background:#2a2a2a;color:#fff;border-radius:8px;padding:4px 10px;font-size:11px;font-family:Satoshi,sans-serif;font-weight:500;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3);">
          ${label}
        </div>
        <div style="width:12px;height:12px;border-radius:50%;background:#35C56E;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [0, 0],
  });
}

export function DeviceMapPlaceholder({
  deviceName,
  latitude,
  longitude,
}: DeviceMapPlaceholderProps) {
  console.log({
    latitude,
    longitude,
    latType: typeof latitude,
    lngType: typeof longitude,
  });
  const hasRealCoords = latitude !== undefined && longitude !== undefined;

  if (hasRealCoords) {
    return (
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          minHeight: 220,
          height: 220,
        }}
      >
        <MapContainer
          center={[latitude!, longitude!]}
          zoom={17}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[latitude!, longitude!]}
            icon={buildDeviceIcon(deviceName)}
          />
        </MapContainer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        bgcolor: "background.default",
        minHeight: 220,
        overflow: "hidden",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 500 260"
        sx={{ width: "100%", height: 220, display: "block" }}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        >
          <path d="M30 20 L200 10 L220 130 L50 145 Z" />
          <path d="M240 15 L400 25 L385 140 L245 130 Z" strokeDasharray="5 4" />
        </g>
        <g transform="rotate(-6 300 190)">
          <rect
            x="250"
            y="140"
            width="110"
            height="110"
            rx="12"
            fill="#2a2a2a"
          />
          <text
            x="305"
            y="170"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontFamily="Satoshi, sans-serif"
          >
            {deviceName}
          </text>
          <circle cx="305" cy="200" r="9" fill="#fff" />
          <circle cx="305" cy="200" r="4" fill="#2a2a2a" />
        </g>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8,
          bgcolor: "rgba(0,0,0,0.55)",
          borderRadius: 1,
          px: 1,
          py: 0.25,
        }}
      >
        <Typography
          sx={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#fff" }}
        >
          Koordinata kiritilmagan — GPS ulanmagan
        </Typography>
      </Box>
    </Box>
  );
}
