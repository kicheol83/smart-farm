import { Box, Card, Typography, Button } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { BarChart } from "@mui/x-charts/BarChart";
import { format } from "date-fns";

interface WaterUsagePoint {
  date: string;
  amount: number;
}

interface WaterUsageDistributionChartProps {
  points: WaterUsagePoint[];
}

export function WaterUsageDistributionChart({
  points,
}: WaterUsageDistributionChartProps) {
  const dates = points.map((p) => format(new Date(p.date), "d MMM"));
  const amounts = points.map((p) => p.amount);

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
          Water Usage Distribution
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TuneRoundedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Filter
        </Button>
      </Box>

      {points.length > 0 ? (
        <BarChart
          height={280}
          series={[
            { data: amounts, label: "Water Usage (L)", color: "#35C56E" },
          ]}
          xAxis={[{ data: dates, scaleType: "band" }]}
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
