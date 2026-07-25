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

export function WaterUsageAnalyticsPage() {
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;
  const analyticsInput = { greenHouseId };

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
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
  const lastUpdated = waterUsage ? "Today" : undefined;

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Water Usage Analytics" />
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
      <Header title="Water Usage Analytics" />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <WaterUsageMetricCard
          label="Total Water Consumed"
          value={waterUsage ? waterUsage.totalUsage.toFixed(0) : "--"}
          unit="L/day"
          description="Shows the total volume of water used across all irrigation zones within the selected time."
          lastUpdated={lastUpdated}
        />
        <WaterUsageMetricCard
          label="Water Efficiency Score"
          value={efficiency ? String(efficiency.efficiencyScore) : "--"}
          unit="/100"
          description="Measures water usage efficiency based on liters delivered per minute of irrigation."
          lastUpdated={lastUpdated}
        />
        <WaterUsageMetricCard
          label="Average Water per Plant"
          value={efficiency ? efficiency.averageWaterPerPlant.toFixed(2) : "--"}
          unit="L/day"
          description="Shows the average volume of water received by each plant daily."
          lastUpdated={lastUpdated}
        />
        <WaterUsageMetricCard
          label="Irrigation Duration"
          value={
            efficiency
              ? String(Math.round(efficiency.irrigationDurationMinutes))
              : "--"
          }
          unit="min/day"
          description="Displays total irrigation duration over the last 24 hours for improved monitoring."
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
          <WaterUsageDistributionChart points={waterUsage?.dataPoints ?? []} />

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
                Anomaly Detection
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
                  anomaly
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
                      Alert Threshold
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
                      Last Scan
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.primary",
                      }}
                    >
                      {format(new Date(anomaly.lastScan), "MMM dd, HH:mm")}
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
                Detects irregular water usage patterns such as sudden spikes and
                potential leaks
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
                Cost Estimation
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
                      Trend
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
                      Status
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
                Helps track operational expenses accurately, providing insights
                for budgeting and planning.
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
              Water Usage Report
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
                Zona darajasidagi yozuv yo'q — WaterUsage yaratishda "sectionId"
                ko'rsatilmagan.
              </Typography>
            )}
          </Box>
        </Card>
      </Box>
    </>
  );
}
