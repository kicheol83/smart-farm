import { useQuery } from "@apollo/client";
import { Box, Typography, Button, IconButton } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { Header } from "@/components/layout/Header";
import { AlertCategoryCard } from "../components/AlertCategoryCard";
import { AlertCard } from "../components/AlertCard";
import { GET_ACTIVE_ALERTS_SUMMARY } from "../graphql/queries";

type Severity = "INFO" | "WARNING" | "CRITICAL";

interface Alert {
  _id: string;
  alertsType: string;
  alertsThreshold: number;
  alertsActualValues: "LOW" | "NORMAL" | "HIGH";
  alertsSeverity: Severity;
  createdAt: string;
}

const ENVIRONMENTAL_TYPES = ["TEMPERATURE", "HUMIDITY", "CO2", "LIGHT"];
const SOIL_TYPES = ["PH", "SOIL_MOISTURE"];

const COLUMN_MAP: { key: Severity; label: string; dotColor: string }[] = [
  { key: "INFO", label: "Optimal", dotColor: "#35C56E" },
  { key: "WARNING", label: "Fair", dotColor: "#f9ad19" },
  { key: "CRITICAL", label: "Error", dotColor: "#e53935" },
];

export function AlertsSummaryPage() {
  localStorage.setItem("greenHouseId", "6a2daf715e4567e07ca5d328");
  const greenHouseId = localStorage.getItem("greenHouseId") || "";
  const hasGreenhouse = greenHouseId.length > 0;

  const { data } = useQuery(GET_ACTIVE_ALERTS_SUMMARY, {
    variables: { greenHouseId },
    skip: !hasGreenhouse,
  });

  const summary = data?.activeAlertsSummary;
  const alerts: Alert[] = summary?.recentAlerts ?? [];

  const environmentalAlerts = alerts.filter((a) =>
    ENVIRONMENTAL_TYPES.includes(a.alertsType),
  );
  const soilAlerts = alerts.filter((a) => SOIL_TYPES.includes(a.alertsType));

  if (!hasGreenhouse) {
    return (
      <>
        <Header title="Alerts Summary" />
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
      <Header title="Alerts Summary" />

      {/* 4 kategoriya karta */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <AlertCategoryCard
          dotColor="#f9ad19"
          label="Plant Health Alerts"
          value="—"
          description="Backend'da plant-health turidagi alertlar hali mavjud emas."
        />
        <AlertCategoryCard
          dotColor="#f9ad19"
          label="Environmental Alerts"
          value={`${environmentalAlerts.length} Alert${environmentalAlerts.length !== 1 ? "s" : ""}`}
          description="Temperature, Humidity, CO2, Light bo'yicha aniqlangan holatlar."
        />
        <AlertCategoryCard
          dotColor="#f9ad19"
          label="Soil Quality Alerts"
          value={`${soilAlerts.length} Alert${soilAlerts.length !== 1 ? "s" : ""}`}
          description="pH va tuproq namligi bo'yicha aniqlangan holatlar."
        />
        <AlertCategoryCard
          dotColor="#e53935"
          label="System & Sensor Alerts"
          value="—"
          description="Backend'da sensor-fault turidagi alertlar hali mavjud emas."
        />
      </Box>

      {/* Tab + amallar */}
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
          Alerts
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Sort By
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneRoundedIcon fontSize="small" />}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Filter
          </Button>
        </Box>
      </Box>

      {/* 3-ustunli kanban */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {COLUMN_MAP.map((col) => {
          const columnAlerts = alerts.filter(
            (a) => a.alertsSeverity === col.key,
          );
          return (
            <Box
              key={col.key}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "background.paper",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: col.dotColor,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Satoshi, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "text.primary",
                    }}
                  >
                    {col.label}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: "action.selected",
                      borderRadius: 1,
                      px: 1,
                      py: 0.25,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      {columnAlerts.length}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small">
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Box>

              {columnAlerts.map((a) => (
                <AlertCard
                  key={a._id}
                  alertsType={a.alertsType}
                  alertsThreshold={a.alertsThreshold}
                  alertsActualValues={a.alertsActualValues}
                  alertsSeverity={a.alertsSeverity}
                  createdAt={a.createdAt}
                />
              ))}

              {columnAlerts.length === 0 && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  Alert yo'q
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </>
  );
}
