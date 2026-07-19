import { Box, Card, Typography } from "@mui/material";

interface WaterUsageMetricCardProps {
  label: string;
  value: string;
  unit?: string;
  description: string;
  lastUpdated?: string;
}

export function WaterUsageMetricCard({
  label,
  value,
  unit,
  description,
  lastUpdated,
}: WaterUsageMetricCardProps) {
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

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: "-0.6px",
            color: "text.primary",
          }}
        >
          {value}
        </Typography>
        {unit && (
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontSize: 16,
              color: "text.secondary",
            }}
          >
            {unit}
          </Typography>
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
