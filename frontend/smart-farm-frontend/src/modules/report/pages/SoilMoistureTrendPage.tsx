import { useQuery } from "@apollo/client";
import { Box, Typography, Button } from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { Header } from "@/components/layout/Header";
import { SoilMoistureLineChart } from "../components/SoilMoistureLineChart";
import { SoilMoistureGauge } from "../components/SoilMoistureGauge";
import { SoilMoistureOverviewCard } from "../components/SoilMoistureOverviewCard";
import { GET_FULL_GREENHOUSE_REPORT } from "../graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { lastDaysLabel } from "@/lib/dateRange";
import { t } from "@/i18n/core";

function gradeFromValue(value: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (value < 35)
    return { label: t("ph.grade.low"), color: "#a06a0a", bg: "rgba(249,173,25,0.14)" };
  if (value > 70)
    return { label: t("ph.grade.high"), color: "#c62828", bg: "rgba(229,57,53,0.14)" };
  return { label: t("ph.grade.optimal"), color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" };
}

function soilDescription(value: number | undefined): string {
  if (value === undefined) return "—";
  if (value < 35) return t("soil.desc.low");
  if (value > 70) return t("soil.desc.high");
  return t("soil.desc.optimal");
}

export function SoilMoistureTrendPage() {
  const { greenHouseId } = useActiveGreenhouse();
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
        <Header title={t("txt.soil_moisture_trend")} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            {t("txt.no_greenhouse_selected_yet")}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title={t("txt.soil_moisture_trend")} />

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
            {t("txt.soil_moisture_trend_last_7_days")}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("txt.average_soil_moisture_levels_over_time_to_suppor")}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {lastDaysLabel(7)}
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
            {t("txt.soil_moisture_overview")}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            {t("txt.real_time_readings_and_weekly_insights_to_suppor")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {t("txt.sort_by")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneRoundedIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {t("txt.filter")}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <SoilMoistureOverviewCard
          label={t("txt.current_reading")}
          value={
            currentValue !== undefined ? `${Math.round(currentValue)}%` : "--"
          }
          badge={
            currentValue !== undefined
              ? gradeFromValue(currentValue)
              : undefined
          }
          description={soilDescription(currentValue)}
          lastUpdated={t("txt.today")}
        />
        <SoilMoistureOverviewCard
          label={t("txt.7_day_change")}
          value={
            soilMoisture
              ? `${soilMoisture.changePercent > 0 ? "+" : ""}${soilMoisture.changePercent.toFixed(0)}%`
              : "--"
          }
          description={t("soil.desc.change")}
          lastUpdated={t("txt.recorded")}
        />
        <SoilMoistureOverviewCard
          label={t("txt.7_day_average")}
          value={soilMoisture ? `${Math.round(soilMoisture.average)}%` : "--"}
          badge={
            soilMoisture ? gradeFromValue(soilMoisture.average) : undefined
          }
          description={soilDescription(soilMoisture?.average)}
          lastUpdated={t("txt.updated")}
        />
        <SoilMoistureOverviewCard
          label={t("txt.optimal_range")}
          value="35 - 70%"
          description={t("soil.desc.range")}
        />
      </Box>
    </>
  );
}
