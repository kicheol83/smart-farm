import { Box, Card, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { t } from "@/i18n/core";

interface SubMetric {
  icon: SvgIconComponent;
  label: string;
}

interface DeviceSummaryCardProps {
  dotColor: string;
  label: string;
  value: number;

  subMetrics?: SubMetric[];
}

export function DeviceSummaryCard({
  dotColor,
  label,
  value,
  subMetrics,
}: DeviceSummaryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        flex: 1,
        minWidth: 200,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dotColor }}
        />
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "text.primary",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: "-0.56px",
          color: "text.primary",
        }}
      >
        {value}{" "}
        <Typography
          component="span"
          sx={{ fontSize: 16, fontWeight: 400, color: "text.secondary" }}
        >
          {t("txt.device")}
        </Typography>
      </Typography>

      {subMetrics && subMetrics.length > 0 && (
        <Box sx={{ display: "flex", gap: 2 }}>
          {subMetrics.map((m, i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <m.icon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {m.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
