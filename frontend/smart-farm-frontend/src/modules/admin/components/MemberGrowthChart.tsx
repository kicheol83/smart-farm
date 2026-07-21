import { Box, Card, Typography, Chip } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { format } from "date-fns";

interface DataPoint {
  date: string;
  count: number;
}

interface MemberGrowthChartProps {
  newRegistrations: number;
  growthPercent: number;
  dataPoints: DataPoint[];
}

export function MemberGrowthChart({
  newRegistrations,
  growthPercent,
  dataPoints,
}: MemberGrowthChartProps) {
  const dates = dataPoints.map((p) => format(new Date(p.date), "d MMM"));
  const counts = dataPoints.map((p) => p.count);
  const isPositive = growthPercent >= 0;

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
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "text.primary",
            }}
          >
            Member Growth
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {newRegistrations} new registrations
          </Typography>
        </Box>
        <Chip
          label={`${isPositive ? "+" : ""}${growthPercent.toFixed(1)}%`}
          size="small"
          sx={{
            bgcolor: isPositive
              ? "rgba(53,197,110,0.14)"
              : "rgba(229,57,53,0.14)",
            color: isPositive ? "#1a7a4c" : "#c62828",
            fontWeight: 700,
          }}
        />
      </Box>

      {dataPoints.length > 0 ? (
        <LineChart
          height={220}
          series={[
            {
              data: counts,
              label: "New Members",
              color: "#35C56E",
              area: true,
              showMark: false,
            },
          ]}
          xAxis={[{ data: dates, scaleType: "point" }]}
          margin={{ left: 30, right: 20, top: 10, bottom: 30 }}
          grid={{ horizontal: true }}
        />
      ) : (
        <Box
          sx={{
            height: 220,
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
