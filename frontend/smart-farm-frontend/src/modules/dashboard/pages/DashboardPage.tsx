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
} from "../graphql/queries";
import { GET_GREENHOUSE_FARM_ID } from "@/modules/map-area/graphql/queries";
import { GET_FARM } from "@/modules/settings/graphql/queries";
import { GET_TODAY_TEMPERATURE_RANGE } from "../graphql/queries";

export function DashboardPage() {
  const greenHouseId = localStorage.getItem("currentGreenhouseId") || "";
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

  const { data: cameraData } = useQuery(GET_CAMERAS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const { data: taskData } = useQuery(GET_TASK_BOARD_OVERVIEW, {
    variables: { greenHousesId: greenHouseId },
    skip: !hasGreenhouse,
  });

  const summary = summaryData?.greenhouseSensorSummary;
  const detail = detailData?.greenhouse;
  const deviceOverview = deviceData?.greenhouseDeviceOverview;
  const cameras = cameraData?.camerasByGreenhouse ?? [];
  const taskOverview = taskData?.taskBoardOverview;

  const allTasks = taskOverview?.columns?.flatMap((c: any) => c.tasks) ?? [];

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Greenhouse Monitoring" />
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
            Hali greenhouse tanlanmagan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sector selectordan greenhouse tanlang yoki avval bittasini yarating.
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title="Greenhouse Monitoring" />

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
              label="Plant Health"
              value={"--"}
              unit="%"
              badge={undefined}
              description="Your plants are thriving and showing excellent health"
              variant="highlight"
            />
            <PlantReportCard
              icon={AirRoundedIcon}
              label="Wind"
              value={"--"}
              unit="m/s"
              description="Make sure there is still adequate airflow"
            />
            <PlantReportCard
              icon={DeviceThermostatRoundedIcon}
              label="Temperature"
              value={summary?.temperature ?? "--"}
              unit="°C"
              description="Maintain consistent between 15°C and 20°C"
            />
            <PlantReportCard
              icon={ScienceOutlinedIcon}
              label="pH Level"
              value={summary?.ph ?? "--"}
              description="Add acidic compost to balance the pH"
            />
            <PlantReportCard
              icon={WaterDropOutlinedIcon}
              label="Humidity"
              value={summary?.humidity ?? "--"}
              unit="%"
              description="Sufficient to prevent mold growth"
            />
            <PlantReportCard
              icon={GrassOutlinedIcon}
              label="Soil Moisture"
              value={summary?.soilMoisture ?? "--"}
              unit="%"
              description="Keep monitoring to ensure it remains consistent"
            />
          </Box>
        </Box>

        <DashboardDevicePanel
          greenHouseName={deviceOverview?.greenHouseName}
          typeCounts={deviceOverview?.typeCounts}
          devices={deviceOverview?.devices}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DashboardCameraPanel cameras={cameras} />
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
