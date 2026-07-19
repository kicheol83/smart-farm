import { Box, Card, Typography, IconButton } from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { LineChart } from "@mui/x-charts/LineChart";
import { format } from "date-fns";

interface TrendPoint {
  date: string;
  healthIndex: number;
  plantValue: number;
}

interface PlantsHealthTrendsChartProps {
  trend: TrendPoint[];
}

export function PlantsHealthTrendsChart({
  trend,
}: PlantsHealthTrendsChartProps) {
  const dates = trend.map((t) => format(new Date(t.date), "d MMM"));
  const healthValues = trend.map((t) => t.healthIndex);
  const plantValues = trend.map((t) => t.plantValue);

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
          Plants Health Trends
        </Typography>
        <IconButton size="small">
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {trend.length > 0 ? (
        <LineChart
          height={280}
          series={[
            {
              data: healthValues,
              label: "Health Index",
              color: "#35C56E",
              area: true,
              showMark: false,
            },
            {
              data: plantValues,
              label: "Plant Value",
              color: "#f9ad19",
              area: true,
              showMark: false,
            },
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
