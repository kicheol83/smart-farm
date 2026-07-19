import { Box, Card, Typography, Chip } from "@mui/material";

interface SoilMoistureOverviewCardProps {
  label: string;
  value: string;
  badge?: { label: string; color: string; bg: string };
  description: string;
  lastUpdated?: string;
}

export function SoilMoistureOverviewCard({
  label,
  value,
  badge,
  description,
  lastUpdated,
}: SoilMoistureOverviewCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        flex: 1,
        minWidth: 220,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 15,
          color: "text.primary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
          mb: 2,
        }}
      >
        Last Updated &nbsp;•&nbsp; {lastUpdated ?? "—"}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.56px",
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
        {badge && (
          <Chip
            label={badge.label}
            size="small"
            sx={{
              bgcolor: badge.bg,
              color: badge.color,
              fontWeight: 600,
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
        {description}
      </Typography>
    </Card>
  );
}
