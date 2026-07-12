import { Box, Card, Typography, IconButton, Chip, useTheme } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { GRADIENT_GREEN, GRADIENT_GREEN_DARK } from "@/theme/theme";

interface PlantReportCardProps {
  icon: SvgIconComponent;
  label: string;
  value: number | string;
  unit?: string;
  description: string;
  variant?: "highlight" | "default";
  badge?: string;
}

/**
 * Figma "Card Plant Report" komponenti.
 * Birinchi karta (Plant Health) — gradient-green highlight variant.
 */
export function PlantReportCard({
  icon: Icon,
  label,
  value,
  unit,
  description,
  variant = "default",
  badge,
}: PlantReportCardProps) {
  const theme = useTheme();
  const isHighlight = variant === "highlight";
  const gradient = theme.palette.mode === "dark" ? GRADIENT_GREEN_DARK : GRADIENT_GREEN;

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 1.5,
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        backgroundImage: isHighlight ? gradient : "none",
        bgcolor: isHighlight ? "transparent" : "background.paper",
        color: isHighlight ? "#fff" : "text.primary",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
        <Icon sx={{ fontSize: 18 }} />
        <Typography variant="body1" sx={{ color: isHighlight ? "#fff" : "text.primary" }}>
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <Typography
              variant="h2"
              sx={{ color: isHighlight ? "#fff" : "text.primary", fontSize: { xs: 28, sm: 40 } }}
            >
              {value}
            </Typography>
            {unit && (
              <Typography
                variant="h4"
                sx={{
                  color: isHighlight ? "rgba(255,255,255,0.6)" : "text.secondary",
                  fontSize: { xs: 20, sm: 32 },
                }}
              >
                {unit}
              </Typography>
            )}
          </Box>

          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                bgcolor: "#fff",
                color: "primary.dark",
                fontWeight: 700,
                fontSize: 10,
                height: 20,
              }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          sx={{ color: isHighlight ? "rgba(255,255,255,0.85)" : "text.primary" }}
        >
          {description}
        </Typography>
      </Box>

      <IconButton
        size="small"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          borderRadius: 2,
          bgcolor: isHighlight ? "rgba(255,255,255,0.16)" : "action.selected",
          color: isHighlight ? "#fff" : "text.primary",
        }}
      >
        <ArrowOutwardRoundedIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}
