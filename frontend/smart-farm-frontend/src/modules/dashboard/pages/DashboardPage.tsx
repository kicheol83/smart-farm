import { useQuery } from "@apollo/client";
import { Box, Typography } from "@mui/material";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import DeviceThermostatRoundedIcon from "@mui/icons-material/DeviceThermostatRounded";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import GrassOutlinedIcon from "@mui/icons-material/GrassOutlined";
import { Header } from "@/components/layout/Header";
import { WeatherMapCard } from "../components/WeatherMapCard";
import { PlantReportCard } from "../components/PlantReportCard";
import { DashboardDevicePanel } from "../components/DashboardDevicePanel";
import { DashboardCameraPanel } from "../components/DashboardCameraPanel";
import { DashboardTaskPanel } from "../components/DashboardTaskPanel";
import {
  GET_GREENHOUSE_SUMMARY,
  GET_GREENHOUSE_DETAIL,
  GET_GREENHOUSE_DEVICE_OVERVIEW,
  GET_CAMERAS_BY_GREENHOUSE,
  GET_TASK_BOARD_OVERVIEW,
  GET_PLANT_HEALTH_OVERVIEW,
  GET_CURRENT_WEATHER,
} from "../graphql/queries";
import { GET_GREENHOUSE_FARM_ID } from "@/modules/map-area/graphql/queries";
import { GET_FARM } from "@/modules/settings/graphql/queries";
import { GET_TODAY_TEMPERATURE_RANGE } from "../graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { useLive } from "@/lib/live/LiveProvider";
import { FEATURES } from "@/lib/features";
import { t } from "@/i18n/core";

export function DashboardPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const { readings } = useLive();
  const hasGreenhouse = greenHouseId.length > 0;

  const { data: summaryData } = useQuery(GET_GREENHOUSE_SUMMARY, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
    fetchPolicy: "network-only",
  });

  const { data: detailData } = useQuery(GET_GREENHOUSE_DETAIL, {
    variables: { id: greenHouseId },
    skip: !hasGreenhouse,
    fetchPolicy: "network-only",
  });

  const { data: ghFarmData } = useQuery(GET_GREENHOUSE_FARM_ID, {
    variables: { id: greenHouseId },
    skip: !hasGreenhouse,
    fetchPolicy: "network-only",
  });

  const farmsId = ghFarmData?.greenhouse?.farmsId;
  const { data: farmData } = useQuery(GET_FARM, {
    variables: { farmId: farmsId },
    skip: !farmsId,
    fetchPolicy: "network-only",
  });

  const { data: tempRangeData } = useQuery(GET_TODAY_TEMPERATURE_RANGE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: deviceData } = useQuery(GET_GREENHOUSE_DEVICE_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: plantHealthData } = useQuery(GET_PLANT_HEALTH_OVERVIEW, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
    pollInterval: 300000,
  });

  const { data: weatherData } = useQuery(GET_CURRENT_WEATHER, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
    pollInterval: 600000,
  });

  const { data: cameraData } = useQuery(GET_CAMERAS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse || !FEATURES.camera,
  });

  const { data: taskData } = useQuery(GET_TASK_BOARD_OVERVIEW, {
    variables: { greenHousesId: greenHouseId },
    skip: !hasGreenhouse,
  });

  const plantHealth = plantHealthData?.greenhousePlantHealthOverview;
  const healthIndex =
    plantHealth && plantHealth.overallHealthIndex > 0
      ? Math.round(plantHealth.overallHealthIndex)
      : undefined;
  const healthDescription =
    healthIndex === undefined
      ? t("dash.health.calculated")
      : healthIndex >= 80
        ? t("dash.health.good")
        : healthIndex >= 50
          ? t("dash.health.warning")
          : t("dash.health.critical");
  const weather = weatherData?.currentWeather;
  const compass = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windFrom = weather ? compass[Math.round(weather.windDirection / 45) % 8] : undefined;
  const baseSummary = summaryData?.greenhouseSensorSummary;
  const summary = baseSummary
    ? {
        ...baseSummary,
        temperature: readings.TEMPERATURE?.value ?? baseSummary.temperature,
        humidity: readings.HUMIDITY?.value ?? baseSummary.humidity,
        ph: readings.PH?.value ?? baseSummary.ph,
        light: readings.LIGHT?.value ?? baseSummary.light,
        co2: readings.CO2?.value ?? baseSummary.co2,
        soilMoisture: readings.SOIL_MOISTURE?.value ?? baseSummary.soilMoisture,
      }
    : baseSummary;
  const detail = detailData?.greenhouse;
  const deviceOverview = deviceData?.greenhouseDeviceOverview;
  const cameras = cameraData?.camerasByGreenhouse ?? [];
  const taskOverview = taskData?.taskBoardOverview;

  const allTasks = taskOverview?.columns?.flatMap((c: any) => c.tasks) ?? [];

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("dash.title")} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: "60%",
            textAlign: "center",
            px: 2,
          }}
        >
          <Typography variant="subtitle1" color="text.primary">
            {t("dash.noGreenhouse")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("dash.noGreenhouseHint")}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title={t("dash.title")} />

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <WeatherMapCard
            temperature={summary?.temperature}
            location={farmData?.farm?.farmLocation}
            highTemp={tempRangeData?.todayTemperatureRange?.high}
            lowTemp={tempRangeData?.todayTemperatureRange?.low}
            greenhouseName={detail?.greenHouseName}
            greenhouseCode={
              detail?._id ? detail._id.slice(-6).toUpperCase() : "—"
            }
            areaM2={detail?.greenHouseSize}
            weatherCondition={weather?.condition}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            <PlantReportCard
              icon={SpaRoundedIcon}
              label={t("dash.card.plantHealth")}
              value={healthIndex ?? "--"}
              unit="%"
              badge={undefined}
              description={healthDescription}
              variant="highlight"
            />
            <PlantReportCard
              icon={AirRoundedIcon}
              label={t("dash.card.wind")}
              value={weather ? weather.windSpeed.toFixed(1) : "--"}
              unit="m/s"
              description={
                weather
                  ? t("dash.card.windFrom", { direction: windFrom ?? "", source: weather.source })
                  : t("dash.card.windDefault")
              }
            />
            <PlantReportCard
              icon={DeviceThermostatRoundedIcon}
              label={t("dash.card.temperature")}
              value={summary?.temperature ?? "--"}
              unit="°C"
              description={t("dash.card.temperatureHint")}
            />
            <PlantReportCard
              icon={ScienceOutlinedIcon}
              label={t("dash.card.ph")}
              value={summary?.ph ?? "--"}
              description={t("dash.card.phHint")}
            />
            <PlantReportCard
              icon={WaterDropOutlinedIcon}
              label={t("dash.card.humidity")}
              value={summary?.humidity ?? "--"}
              unit="%"
              description={t("dash.card.humidityHint")}
            />
            <PlantReportCard
              icon={GrassOutlinedIcon}
              label={t("dash.card.soil")}
              value={summary?.soilMoisture ?? "--"}
              unit="%"
              description={t("dash.card.soilHint")}
            />
          </Box>
        </Box>

        <DashboardDevicePanel
          greenHouseName={deviceOverview?.greenHouseName}
          typeCounts={deviceOverview?.typeCounts}
          devices={deviceOverview?.devices}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FEATURES.camera && <DashboardCameraPanel cameras={cameras} />}
          <DashboardTaskPanel
            totalTasks={taskOverview?.totalTasks}
            completedTasks={taskOverview?.completedTasks}
            tasks={allTasks}
          />
        </Box>
      </Box>
    </>
  );
}
