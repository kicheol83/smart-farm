import { useQuery } from "@apollo/client";
import { Box, Typography, Button } from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { Header } from "@/components/layout/Header";
import { SoilMoistureLineChart } from "../components/SoilMoistureLineChart";
import { SoilMoistureGauge } from "../components/SoilMoistureGauge";
import { SoilMoistureOverviewCard } from "../components/SoilMoistureOverviewCard";
import { GET_FULL_GREENHOUSE_REPORT } from "../graphql/queries";

function gradeFromValue(value: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (value < 40)
    return { label: "Low", color: "#a06a0a", bg: "rgba(249,173,25,0.14)" };
  if (value > 70)
    return { label: "High", color: "#c62828", bg: "rgba(229,57,53,0.14)" };
  return { label: "Optimal", color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" };
}

export function SoilMoistureTrendPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
    skip: !hasGreenhouse,
  });

  const soilMoisture = data?.greenhouseFullReport?.soilMoisture;
  const points = soilMoisture?.dataPoints ?? [];
  const currentValue =
    points.length > 0 ? points[points.length - 1].value : undefined;

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Soil Moisture Trend" />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            Hali greenhouse tanlanmagan
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title="Soil Moisture Trend" />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "text.primary",
            }}
          >
            Soil Moisture Trend (Last 7 Days)
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Average soil moisture levels over time to support precise watering
            decisions.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          08 - 14 September 2024
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <SoilMoistureLineChart points={points} />
        <SoilMoistureGauge current={currentValue} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "text.primary",
            }}
          >
            Soil Moisture Overview
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Real-time readings and weekly insights to support precise watering
            decisions.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Sort By
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneRoundedIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <SoilMoistureOverviewCard
          label="Current Reading"
          value={
            currentValue !== undefined ? `${Math.round(currentValue)}%` : "--"
          }
          badge={
            currentValue !== undefined
              ? gradeFromValue(currentValue)
              : undefined
          }
          description="Current moisture level is within the safe range for plant growth and supports root."
          lastUpdated="Today"
        />
        <SoilMoistureOverviewCard
          label="Today Comparison"
          value={
            soilMoisture
              ? `${soilMoisture.changePercent > 0 ? "+" : ""}${soilMoisture.changePercent.toFixed(0)}%`
              : "--"
          }
          description="Watering adjustment may be reduced to maintain optimal balance."
          lastUpdated="Recorded"
        />
        <SoilMoistureOverviewCard
          label="7-Day Average"
          value={soilMoisture ? `${Math.round(soilMoisture.average)}%` : "--"}
          badge={
            soilMoisture ? gradeFromValue(soilMoisture.average) : undefined
          }
          description="Soil moisture is within the optimal range, supporting growth and reducing stress."
          lastUpdated="Updated"
        />
        <SoilMoistureOverviewCard
          label="Optimal Range"
          value="35 - 65%"
          badge={{
            label: "Fair",
            color: "#a06a0a",
            bg: "rgba(249,173,25,0.14)",
          }}
          description="System will notify if soil moisture is below or above, ensuring adjustments for growth."
        />
      </Box>
    </>
  );
}
