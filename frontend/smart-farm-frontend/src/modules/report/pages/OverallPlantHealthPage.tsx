import { useQuery } from "@apollo/client";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { Header } from "@/components/layout/Header";
import { PlantHealthHeroCard } from "../components/PlantHealthHeroCard";
import { PlantsHealthTrendsChart } from "../components/PlantsHealthTrendsChart";
import { PlantHealthSectionCard } from "../components/PlantHealthSectionCard";
import { GET_FULL_GREENHOUSE_REPORT, GET_SECTION_HEALTH_TRENDS } from "../graphql/queries";
import { lastDaysLabel } from "@/lib/dateRange";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { t } from "@/i18n/core";


export function OverallPlantHealthPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
    skip: !hasGreenhouse,
  });

  const plantHealth = data?.greenhouseFullReport?.plantHealth;

  const { data: sectionData } = useQuery(GET_SECTION_HEALTH_TRENDS, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });
  const sections: {
    sectionId: string;
    sectionName: string;
    currentIndex: number;
    changePercent: number;
    status: string;
    trend: { healthIndex: number }[];
  }[] = sectionData?.greenhousePlantHealthOverview?.sectionTrends ?? [];

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("txt.overall_plant_health")} />
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
      <Header title={t("txt.overall_plant_health")} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 2.3fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <PlantHealthHeroCard
          score={plantHealth?.currentHealthIndex}
          status={plantHealth?.status}
        />
        <PlantsHealthTrendsChart trend={plantHealth?.trend ?? []} />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Tabs
          value="all"
          sx={{
            minHeight: "auto",
            "& .MuiTab-root": {
              textTransform: "none",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              minHeight: "auto",
            },
          }}
        >
          <Tab label={t("txt.all_sections")} value="all" />
        </Tabs>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {t("txt.sort_by")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {lastDaysLabel(7)}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {sections.map((section) => (
          <PlantHealthSectionCard
            key={section.sectionId}
            sectionName={section.sectionName}
            healthIndex={section.currentIndex}
            status={section.status}
            changePercent={section.changePercent}
            trend={section.trend.map((point) => point.healthIndex)}
          />
        ))}
      </Box>
    </>
  );
}
