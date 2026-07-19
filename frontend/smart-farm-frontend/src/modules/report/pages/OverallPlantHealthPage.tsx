import { useQuery } from "@apollo/client";
import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { Header } from "@/components/layout/Header";
import { PlantHealthHeroCard } from "../components/PlantHealthHeroCard";
import { PlantsHealthTrendsChart } from "../components/PlantsHealthTrendsChart";
import { PlantHealthSectionCard } from "../components/PlantHealthSectionCard";
import { GET_FULL_GREENHOUSE_REPORT } from "../graphql/queries";

const SECTION_NAMES = [
  "Section 01",
  "Section 02",
  "Section 03",
  "Section 04",
  "Section 05",
  "Section 06",
  "Section 07",
  "Section 08",
];

export function OverallPlantHealthPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_FULL_GREENHOUSE_REPORT, {
    variables: { input: { greenHouseId, period: "LAST_7_DAYS" } },
    skip: !hasGreenhouse,
  });

  const plantHealth = data?.greenhouseFullReport?.plantHealth;

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Overall Plant Health" />
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
      <Header title="Overall Plant Health" />

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
          <Tab label="All Garden" value="all" />
        </Tabs>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Sort By
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            10 - 24 September 2024
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
        {SECTION_NAMES.map((name) => (
          <PlantHealthSectionCard key={name} sectionName={name} />
        ))}
      </Box>
    </>
  );
}
