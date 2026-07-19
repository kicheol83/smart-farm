import { Box, Card, Typography, IconButton } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import type { SvgIconComponent } from "@mui/icons-material";

interface ReportSummaryCardProps {
  icon?: SvgIconComponent;
  label: string;
  value: string;
  badge?: string;
  description: string;
  variant?: "highlight" | "default";
  onExpand?: () => void;
}

export function ReportSummaryCard({
  icon: Icon,
  label,
  value,
  badge,
  description,
  variant = "default",
  onExpand,
}: ReportSummaryCardProps) {
  const isHighlight = variant === "highlight";

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 2,
        p: 2.5,
        flex: 1,
        minWidth: 220,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        backgroundImage: isHighlight
          ? "linear-gradient(146.72deg, #35C56E 19.38%, #2E9055 91.38%)"
          : "none",
        bgcolor: isHighlight ? "transparent" : "background.paper",
        color: isHighlight ? "#fff" : "text.primary",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {Icon && <Icon sx={{ fontSize: 18 }} />}
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: isHighlight ? "#fff" : "text.primary",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "-0.64px",
          }}
        >
          {value}
        </Typography>
        {badge && (
          <Box
            sx={{
              bgcolor: "#fff",
              color: "primary.dark",
              borderRadius: 1.5,
              px: 1,
              py: 0.25,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {badge}
          </Box>
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: isHighlight ? "rgba(255,255,255,0.85)" : "text.secondary",
        }}
      >
        {description}
      </Typography>

      {onExpand && (
        <IconButton
          size="small"
          onClick={onExpand}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: isHighlight ? "rgba(255,255,255,0.16)" : "action.selected",
            color: isHighlight ? "#fff" : "text.primary",
          }}
        >
          <ArrowOutwardRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Card>
  );
}
