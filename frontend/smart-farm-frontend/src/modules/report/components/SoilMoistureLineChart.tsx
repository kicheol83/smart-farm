import { Box, Card, Typography, Switch } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { format } from "date-fns";
import { useState } from "react";

interface SoilMoisturePoint {
  recordedAt: string;
  value: number;
}

interface SoilMoistureLineChartProps {
  points: SoilMoisturePoint[];
}

export function SoilMoistureLineChart({ points }: SoilMoistureLineChartProps) {
  const [showThreshold, setShowThreshold] = useState(true);

  const dates = points.map((p) => format(new Date(p.recordedAt), "d MMM"));
  const values = points.map((p) => p.value);
  const lowThreshold = points.map(() => 35);
  const highThreshold = points.map(() => 65);

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "text.primary",
          }}
        >
          Soil Moisture
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Show Threshold Line
          </Typography>
          <Switch
            checked={showThreshold}
            onChange={(e) => setShowThreshold(e.target.checked)}
            size="small"
          />
        </Box>
      </Box>

      {points.length > 0 ? (
        <LineChart
          height={280}
          series={[
            {
              data: values,
              label: "Soil Moisture %",
              color: "#35C56E",
              area: true,
              showMark: false,
            },
            ...(showThreshold
              ? [
                  {
                    data: lowThreshold,
                    label: "Low Threshold (35%)",
                    color: "#9c9c9c",
                    showMark: false,
                    curve: "linear" as const,
                  },
                  {
                    data: highThreshold,
                    label: "High Threshold (65%)",
                    color: "#f9ad19",
                    showMark: false,
                    curve: "linear" as const,
                  },
                ]
              : []),
          ]}
          xAxis={[{ data: dates, scaleType: "point" }]}
          margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
          grid={{ horizontal: true }}
        />
      ) : (
        <Box
          sx={{
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">Ma'lumot yo'q</Typography>
        </Box>
      )}
    </Card>
  );
}
