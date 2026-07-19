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

export function ReportPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
    skip: !hasGreenhouse,
  });

  const { data: cameraData } = useQuery(GET_CAMERAS_BY_GREENHOUSE, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const report = data?.greenhouseFullReport;
  const cameras = cameraData?.camerasByGreenhouse ?? [];

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Greenhouse Report" />
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
      <Header title="Greenhouse Report" />

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
          Import
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Last 7 Days
        </Button>
      </Box>

      {/* Yuqori qator: 3 summary karta + kamera */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr) 1.2fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <ReportSummaryCard
          icon={SpaRoundedIcon}
          label="Overall Plant Health"
          value={
            report
              ? `${Math.round(report.plantHealth.currentHealthIndex)}%`
              : "--"
          }
          badge={
            report?.plantHealth.status === "good"
              ? "Good"
              : report?.plantHealth.status
          }
          description={
            report
              ? "Plants showing vigorous growth and balanced nutrition."
              : "—"
          }
          variant="highlight"
          onExpand={() => (window.location.href = "/report/plant-health")}
        />
        <ReportSummaryCard
          icon={WaterDropOutlinedIcon}
          label="Average Soil Moisture"
          value={report ? `${Math.round(report.soilMoisture.average)}%` : "--"}
          description="Maintaining steady hydration ensures sustained plant health."
          onExpand={() => (window.location.href = "/report/soil-moisture")}
        />
        <ReportSummaryCard
          icon={OpacityRoundedIcon}
          label="Average Water Usage"
          value={report ? report.waterUsage.dailyAverage.toFixed(1) : "--"}
          description="Shows the average volume of water received by each plant daily."
          onExpand={() => (window.location.href = "/report/water-usage")}
        />
        <ReportCameraCard cameras={cameras} />
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
