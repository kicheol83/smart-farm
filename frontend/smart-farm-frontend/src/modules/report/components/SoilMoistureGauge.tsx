import { Box, Card, Typography } from "@mui/material";

interface SoilMoistureGaugeProps {
  current?: number;
}

export function SoilMoistureGauge({ current }: SoilMoistureGaugeProps) {
  const value = current ?? 0;
  const clamped = Math.max(0, Math.min(100, value));
  const angle = 180 - (clamped / 100) * 180;
  const needleRad = (angle * Math.PI) / 180;
  const cx = 150;
  const cy = 150;
  const r = 110;
  const needleX = cx + r * Math.cos(needleRad);
  const needleY = cy - r * Math.sin(needleRad);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "text.primary",
          mb: 2,
        }}
      >
        Soil Moisture Performance
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Box
          component="svg"
          viewBox="0 0 300 180"
          sx={{ width: "100%", maxWidth: 280 }}
        >
          <path
            d="M 40 150 A 110 110 0 0 1 115 46"
            fill="none"
            stroke="#a8c5e8"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 118 44 A 110 110 0 0 1 182 44"
            fill="none"
            stroke="#5b93d1"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 185 46 A 110 110 0 0 1 260 150"
            fill="none"
            stroke="#f2c572"
            strokeWidth="24"
            strokeLinecap="round"
          />

          <circle cx={needleX} cy={needleY} r="7" fill="#333" />
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="#333"
            strokeWidth="2"
          />

          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fontSize="13"
            fill="#a4a4a4"
            fontFamily="Inter, sans-serif"
          >
            Current Moisture
          </text>
          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fontSize="34"
            fontWeight="700"
            fill="#333"
            fontFamily="Satoshi, sans-serif"
          >
            {current !== undefined ? `${Math.round(current)}%` : "--"}
          </text>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
        <LegendItem color="#a8c5e8" label="Low Moist" range="< 40%" />
        <LegendItem color="#5b93d1" label="Optimal Moist" range="40 - 70%" />
        <LegendItem color="#f2c572" label="High Moist" range="> 70%" />
      </Box>
    </Card>
  );
}

function LegendItem({
  color,
  label,
  range,
}: {
  color: string;
  label: string;
  range: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Box
          sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }}
        />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: "text.primary",
        }}
      >
        {range}
      </Typography>
    </Box>
  );
}
