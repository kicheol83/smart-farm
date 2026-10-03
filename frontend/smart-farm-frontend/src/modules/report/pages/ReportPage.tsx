import { useQuery } from "@apollo/client";
import { Box, Typography, Button } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import { Header } from "@/components/layout/Header";
import { ReportSummaryCard } from "../components/ReportSummaryCard";
import { PlantsHealthTrendsChart } from "../components/PlantsHealthTrendsChart";
import { ReportDetailsPreview } from "../components/ReportDetailsPreview";
import { AlertsSummaryPreview } from "../components/AlertsSummaryPreview";
import { ReportCameraCard } from "../components/ReportCameraCard";
import { GET_FULL_GREENHOUSE_REPORT } from "../graphql/queries";
import { GET_CAMERAS_BY_GREENHOUSE } from "@/modules/camera/graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { FEATURES } from "@/lib/features";
import { t } from "@/i18n/core";

export function ReportPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
    skip: !hasGreenhouse,
  });

  const { data: cameraData } = useQuery(GET_CAMERAS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse || !FEATURES.camera,
  });

  const report = data?.greenhouseFullReport;
  const cameras = cameraData?.camerasByGreenhouse ?? [];

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("txt.greenhouse_report")} />
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
      <Header title={t("txt.greenhouse_report")} />

      {/* Import + sana oralig'i */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: 1,
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FileUploadOutlinedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.export")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.last_7_days")}
        </Button>
      </Box>

      {/* Yuqori qator: 3 summary karta + kamera */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: FEATURES.camera ? "repeat(3, 1fr) 1.2fr" : "repeat(3, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <ReportSummaryCard
          icon={SpaRoundedIcon}
          label={t("txt.overall_plant_health")}
          value={
            report
              ? `${Math.round(report.plantHealth.currentHealthIndex)}%`
              : "--"
          }
          badge={report ? t(`ph.status.${report.plantHealth.status}`) : undefined}
          description={report ? t(`report.health.${report.plantHealth.status}`) : "—"}
          variant="highlight"
          onExpand={() => (window.location.href = "/report/plant-health")}
        />
        <ReportSummaryCard
          icon={WaterDropOutlinedIcon}
          label={t("txt.average_soil_moisture")}
          value={report ? `${Math.round(report.soilMoisture.average)}%` : "--"}
          description={t("txt.maintaining_steady_hydration_ensures_sustained_p")}
          onExpand={() => (window.location.href = "/report/soil-moisture")}
        />
        <ReportSummaryCard
          icon={OpacityRoundedIcon}
          label={t("txt.average_water_usage")}
          value={report ? report.waterUsage.dailyAverage.toFixed(1) : "--"}
          description={t("txt.shows_the_average_volume_of_water_used_per_day")}
          onExpand={() => (window.location.href = "/report/water-usage")}
        />
        {FEATURES.camera && <ReportCameraCard cameras={cameras} />}
      </Box>

      {/* Plants Health Trends grafigi */}
      <Box sx={{ mb: 2 }}>
        <PlantsHealthTrendsChart trend={report?.plantHealth.trend ?? []} />
      </Box>

      {/* Pastki qator: Report Details + Alerts Summary */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 2,
        }}
      >
        <ReportDetailsPreview />
        <AlertsSummaryPreview items={report?.alertsSummary.items ?? []} />
      </Box>
    </>
  );
}
