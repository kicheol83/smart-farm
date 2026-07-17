import { Box, Typography } from "@mui/material";

interface DeviceMapPlaceholderProps {
  deviceName: string;
  latitude?: number;
  longitude?: number;
}

export function DeviceMapPlaceholder({
  deviceName,
  latitude,
  longitude,
}: DeviceMapPlaceholderProps) {
  const hasRealCoords = latitude !== undefined && longitude !== undefined;

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

      {!hasRealCoords && (
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
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              color: "#fff",
            }}
          >
            Taxminiy joylashuv — GPS ulanmagan
          </Typography>
        </Box>
      )}
    </Box>
  );
}
