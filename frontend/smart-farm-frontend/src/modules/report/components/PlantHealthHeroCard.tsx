import { Box, Card, Typography } from "@mui/material";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import { t } from "@/i18n/core";

interface PlantHealthHeroCardProps {
  score?: number;
  status?: string;
}

const STATUS_LABEL: Record<string, string> = {
  good: t("txt.good"),
  warning: t("txt.warning"),
  critical: t("txt.critical"),
};

export function PlantHealthHeroCard({
  score,
  status,
}: PlantHealthHeroCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        justifyContent: "center",
        minHeight: 260,
        backgroundImage:
          "linear-gradient(146.72deg, #35C56E 19.38%, #2E9055 91.38%)",
        color: "#fff",
      }}
    >
      <SpaRoundedIcon sx={{ fontSize: 24 }} />
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          color: "#fff",
        }}
      >
        {t("txt.overall_plant_health")}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: "-0.88px",
          }}
        >
          {score !== undefined ? Math.round(score) : "--"}%
        </Typography>
        {status && (
          <Box
            sx={{
              bgcolor: "#fff",
              color: "primary.dark",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {STATUS_LABEL[status] ?? status}
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {t("txt.plants_showing_vigorous_growth_and_balanced_nutr")}
      </Typography>
    </Card>
  );
}
