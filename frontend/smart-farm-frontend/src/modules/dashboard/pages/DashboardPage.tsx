import { useQuery } from "@apollo/client";
import { Box, Typography, Skeleton } from "@mui/material";
import ThermostatRoundedIcon from "@mui/icons-material/ThermostatRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import { Header } from "@/components/layout/Header";
import { PlantReportCard } from "../components/PlantReportCard";
import { DeviceListCard } from "../components/DeviceListCard";
import { GET_GREENHOUSE_SUMMARY, GET_DEVICE_LIST } from "../graphql/queries";

const CURRENT_GREENHOUSE_ID = localStorage.getItem("currentGreenhouseId") ?? "";

/**
 * Responsive layout — MUI Box + flexbox:
 *   Mobil:   1 ustun, hammasi stack
 *   Tablet:  Plant Report cards 2-3 ustunga bo'linadi
 *   Desktop: Figma dagi original 2-ustunli layout
 */
export function DashboardPage() {
  const { data: summaryData, loading: summaryLoading } = useQuery(GET_GREENHOUSE_SUMMARY, {
    variables: { greenHouseId: CURRENT_GREENHOUSE_ID },
    skip: !CURRENT_GREENHOUSE_ID,
  });

  const { data: deviceData } = useQuery(GET_DEVICE_LIST, {
    variables: { greenHouseId: CURRENT_GREENHOUSE_ID },
    skip: !CURRENT_GREENHOUSE_ID,
  });

  const summary = summaryData?.getGreenhouseSummary;
  const devices = deviceData?.devices ?? [];

  if (!CURRENT_GREENHOUSE_ID) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, height: "100%", textAlign: "center", px: 2 }}>
        <Typography variant="subtitle1" color="text.primary">
          Hali greenhouse tanlanmagan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sector selectordan greenhouse tanlang yoki avval bittasini yarating.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Greenhouse Monitoring" />

      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2, height: { lg: "100%" } }}>
        {/* Chap ustun */}
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              minHeight: { xs: 200, sm: 280, lg: 344 },
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              borderRadius: 2,
              bgcolor: "background.paper",
              p: { xs: 2, sm: 3 },
            }}
          >
            {summaryLoading ? (
              <Skeleton variant="text" width={160} height={60} />
            ) : (
              <>
                <Typography sx={{ fontSize: { xs: 32, sm: 40 }, fontWeight: 500 }} color="text.primary">
                  {summary?.temperature ?? "--"}
                  <Typography component="span" sx={{ fontSize: { xs: 20, sm: 28 } }} color="text.secondary">
                    °C
                  </Typography>
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {summary?.weatherCondition ?? "—"}
                </Typography>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
              <PlantReportCard
                icon={WaterDropRoundedIcon}
                label="Plant Health"
                value={summary?.plantHealthScore ?? "--"}
                unit="%"
                badge={summary?.plantHealthStatus ?? undefined}
                description="Your plants are thriving and showing excellent health"
                variant="highlight"
              />
              <PlantReportCard
                icon={AirRoundedIcon}
                label="Wind"
                value={summary?.windSpeed ?? "--"}
                unit="m/s"
                description="Make sure there is still adequate airflow"
              />
              <PlantReportCard
                icon={ThermostatRoundedIcon}
                label="Temperature"
                value={summary?.temperature ?? "--"}
                unit="°C"
                description="Maintain consistent between 15°C and 20°C"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
              <PlantReportCard
                icon={WaterDropRoundedIcon}
                label="pH Level"
                value={summary?.soilPh ?? "--"}
                description="Add acidic compost to balance the pH"
              />
              <PlantReportCard
                icon={WaterDropRoundedIcon}
                label="Humidity"
                value={summary?.humidity ?? "--"}
                unit="%"
                description="Sufficient to prevent mold growth"
              />
              <PlantReportCard
                icon={WaterDropRoundedIcon}
                label="Soil Moisture"
                value={summary?.soilMoisture ?? "--"}
                unit="%"
                description="Keep monitoring to ensure it remains consistent"
              />
            </Box>
          </Box>
        </Box>

        {/* O'ng ustun */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, lg: { flex: 1 } }}>
          <DeviceListCard
            devices={devices}
            sensorCount={devices.filter((d: any) => d.deviceType === "SENSOR").length}
            cameraCount={devices.filter((d: any) => d.deviceType === "CAMERA").length}
          />
        </Box>
      </Box>
    </>
  );
}
