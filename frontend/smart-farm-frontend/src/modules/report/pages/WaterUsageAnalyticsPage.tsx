import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Box, Typography, Card, IconButton } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { WaterUsageMetricCard } from "../components/WaterUsageMetricCard";
import { WaterUsageDistributionChart } from "../components/WaterUsageDistributionChart";
import {
  GET_FULL_GREENHOUSE_REPORT,
  GET_WATER_EFFICIENCY_REPORT,
  GET_WATER_ANOMALY_DETECTION,
  GET_WATER_COST_ESTIMATION,
  GET_WATER_ZONE_USAGE_REPORT,
} from "../graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

export function WaterUsageAnalyticsPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;
  const analyticsInput = { greenHouseId };

  const [period, setPeriod] = useState<
    "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS"
  >("LAST_7_DAYS");

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period } },
    skip: !hasGreenhouse,
  });

  const { data: efficiencyData } = useQuery(GET_WATER_EFFICIENCY_REPORT, {
    variables: { input: analyticsInput },
    skip: !hasGreenhouse,
  });

  const { data: anomalyData } = useQuery(GET_WATER_ANOMALY_DETECTION, {
    variables: { input: analyticsInput },
    skip: !hasGreenhouse,
  });

  const { data: costData } = useQuery(GET_WATER_COST_ESTIMATION, {
    variables: { input: analyticsInput },
    skip: !hasGreenhouse,
  });

  const { data: zoneData } = useQuery(GET_WATER_ZONE_USAGE_REPORT, {
    variables: { input: analyticsInput },
    skip: !hasGreenhouse,
  });

  const waterUsage = data?.greenhouseFullReport?.waterUsage;
  const efficiency = efficiencyData?.waterEfficiencyReport;
  const anomaly = anomalyData?.waterAnomalyDetection;
  const cost = costData?.waterCostEstimation;
  const zones = zoneData?.waterZoneUsageReport?.zones ?? [];
  const lastUpdated = waterUsage ? t("txt.today") : undefined;

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("txt.water_usage_analytics")} />
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
      <Header title={t("txt.water_usage_analytics")} />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <WaterUsageMetricCard
          label={t("txt.total_water_consumed")}
          value={waterUsage ? waterUsage.totalUsage.toFixed(0) : "--"}
          unit={t("txt.l_day")}
          description={t("txt.total_volume_of_water_used_across_all_irrigation")}
          lastUpdated={lastUpdated}
        />
        <WaterUsageMetricCard
          label={t("txt.water_efficiency_score")}
          value={efficiency ? String(efficiency.efficiencyScore) : "--"}
          unit="/100"
          description={t("txt.efficiency_based_on_liters_delivered_per_minute_")}
          lastUpdated={lastUpdated}
        />
        <WaterUsageMetricCard
          label={t("txt.average_water_per_day")}
          value={efficiency ? efficiency.averageWaterPerPlant.toFixed(2) : "--"}
          unit={t("txt.l_day")}
          description={t("txt.shows_the_average_volume_of_water_used_per_day")}
          lastUpdated={lastUpdated}
        />
        <WaterUsageMetricCard
          label={t("txt.irrigation_duration")}
          value={
            efficiency
              ? String(Math.round(efficiency.irrigationDurationMinutes))
              : "--"
          }
          unit={t("txt.min_day")}
          description={t("txt.total_irrigation_time_per_day")}
          lastUpdated={lastUpdated}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <WaterUsageDistributionChart
            points={waterUsage?.dataPoints ?? []}
            period={period}
            onPeriodChange={setPeriod}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Card
              elevation={0}
              sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
            >
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                {t("txt.anomaly_detection")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 0.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 700,
                    fontSize: 28,
                    color: "text.primary",
                  }}
                >
                  {anomaly ? anomaly.anomalyCount : "--"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: 16,
                    color: "text.secondary",
                  }}
                >
                  {t("txt.anomaly")}
                </Typography>
              </Box>

              {anomaly && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      {t("txt.alert_threshold")}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.primary",
                      }}
                    >
                      +{anomaly.alertThresholdPercent}% deviation
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      {t("txt.last_scan")}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.primary",
                      }}
                    >
                      {format(new Date(anomaly.lastScan), "PPp", { locale: dateLocale() })}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {t("txt.detects_irregular_water_usage_such_as_sudden_spi")}
              </Typography>
            </Card>

            <Card
              elevation={0}
              sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
            >
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                {t("txt.cost_estimation")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 0.5,
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 700,
                    fontSize: 28,
                    color: "text.primary",
                  }}
                >
                  {cost ? `$${cost.costPerDay.toFixed(2)}` : "--"}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontSize: 16,
                    color: "text.secondary",
                  }}
                >
                  /day
                </Typography>
              </Box>

              {cost && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      {t("txt.trend")}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.primary",
                      }}
                    >
                      {cost.trendPercent > 0 ? "+" : ""}
                      {cost.trendPercent}% vs last period
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      {t("txt.status")}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.primary",
                      }}
                    >
                      {cost.status}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {t("txt.tracks_operating_costs_to_help_with_budgeting_an")}
              </Typography>
            </Card>
          </Box>
        </Box>

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
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "text.primary",
              }}
            >
              {t("txt.water_usage_report")}
            </Typography>
            <IconButton size="small">
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {zones.map((z: any) => (
              <Box
                key={z.sectionId}
                sx={{ bgcolor: "background.default", borderRadius: 2, p: 1.5 }}
              >
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "text.primary",
                  }}
                >
                  {z.sectionName} — {z.totalUsage} L
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                    mt: 0.5,
                  }}
                >
                  {z.note}
                </Typography>
              </Box>
            ))}

            {zones.length === 0 && (
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  color: "text.secondary",
                  textAlign: "center",
                  py: 3,
                }}
              >
                {t("txt.no_per_zone_water_records_yet")}
              </Typography>
            )}
          </Box>
        </Card>
      </Box>
    </>
  );
}
