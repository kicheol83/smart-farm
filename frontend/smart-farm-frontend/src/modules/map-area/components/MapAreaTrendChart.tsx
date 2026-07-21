import { Box, Card, IconButton } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { LineChart } from "@mui/x-charts/LineChart";
import { format } from "date-fns";

interface AnalyticsPoint {
  date: string;
  ndviValue?: number;
  healthIndex?: number;
  soilMoisture?: number;
}

interface MapAreaTrendChartProps {
  points: AnalyticsPoint[];
}

export function MapAreaTrendChart({ points }: MapAreaTrendChartProps) {
  const dates = points.map((p) => format(new Date(p.date), "d MMM"));
  const soilMoisture = points.map((p) => p.soilMoisture ?? 0);
  const ndvi = points.map((p) => (p.ndviValue ?? 0) * 100); // 0-1 → 0-100 shkalaga moslash
  const health = points.map((p) => p.healthIndex ?? 0);

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <IconButton size="small">
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {points.length > 0 ? (
        <LineChart
          height={260}
          series={[
            {
              data: soilMoisture,
              label: "Soil Moisture %",
              color: "#5b93d1",
              area: true,
              showMark: false,
            },
            {
              data: ndvi,
              label: "NDVI (×100)",
              color: "#f9ad19",
              showMark: false,
            },
            {
              data: health,
              label: "Growth / Health Index",
              color: "#35C56E",
              area: true,
              showMark: false,
            },
          ]}
          xAxis={[{ data: dates, scaleType: "point" }]}
          margin={{ left: 40, right: 20, top: 10, bottom: 30 }}
          grid={{ horizontal: true }}
        />
      ) : (
        <Box
          sx={{
            height: 260,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          Ma'lumot yo'q
        </Box>
      )}
    </Card>
  );
}
