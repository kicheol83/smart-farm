import { Box, Typography, Chip } from "@mui/material";
import { t } from "@/i18n/core";

interface PlantHealthOverviewCardProps {
  overallHealthIndex?: number;
}

function gradeFromValue(value: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (value >= 90)
    return { label: t("txt.good"), color: "#1a7a4c", bg: "rgba(53,197,110,0.16)" };
  if (value >= 75)
    return { label: t("txt.fair"), color: "#a06a0a", bg: "rgba(249,173,25,0.16)" };
  return { label: t("txt.at_risk"), color: "#c62828", bg: "rgba(229,57,53,0.16)" };
}

export function PlantHealthOverviewCard({
  overallHealthIndex,
}: PlantHealthOverviewCardProps) {
  const grade =
    overallHealthIndex !== undefined
      ? gradeFromValue(overallHealthIndex)
      : undefined;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {t("txt.overall_health")}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "-0.64px",
            color: "text.primary",
          }}
        >
          {overallHealthIndex !== undefined
            ? Math.round(overallHealthIndex)
            : "--"}
          %
        </Typography>
        {grade && (
          <Chip
            label={grade.label}
            size="small"
            sx={{
              bgcolor: grade.bg,
              color: grade.color,
              fontWeight: 700,
              fontSize: 11,
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        {t("txt.your_plants_are_thriving_and_showing_excellent_h")}
      </Typography>
    </Box>
  );
}
