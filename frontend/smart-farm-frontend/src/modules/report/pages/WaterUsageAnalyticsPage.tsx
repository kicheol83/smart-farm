import { useQuery } from "@apollo/client";
import { Box, Typography, Card, IconButton } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { Header } from "@/components/layout/Header";
import { WaterUsageMetricCard } from "../components/WaterUsageMetricCard";
import { WaterUsageDistributionChart } from "../components/WaterUsageDistributionChart";
import { GET_FULL_GREENHOUSE_REPORT } from "../graphql/queries";

export function WaterUsageAnalyticsPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
    skip: !hasGreenhouse,
  });

  const waterUsage = data?.greenhouseFullReport?.waterUsage;
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
          value="—"
          unit="/100"
          description="Backend'da samaradorlik hisob-kitobi hali mavjud emas."
        />
        <WaterUsageMetricCard
          label="Average Water per Plant"
          value="—"
          unit="L/day"
          description="Backend'da o'simlik boshiga hisob-kitob hali mavjud emas."
        />
        <WaterUsageMetricCard
          label="Irrigation Duration"
          value="—"
          unit="min/day"
          description="Backend'da irrigatsiya davomiyligi hali mavjud emas."
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
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "text.secondary",
                  mb: 1.5,
                }}
              >
                —
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Backend'da anomaliya aniqlash algoritmi hali mavjud emas — bu
                funksiya kelajakda qo'shiladi.
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
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "text.secondary",
                  mb: 1.5,
                }}
              >
                —
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Backend'da suv narxi/xarajat hisob-kitobi hali mavjud emas.
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

          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
              py: 4,
            }}
          >
            Zona darajasidagi hisobot (Zone 01, Zone 02...) uchun backend
            `WaterUsage` modeliga "zone" maydoni qo'shilishi kerak.
          </Typography>
        </Card>
      </Box>
    </>
  );
}
