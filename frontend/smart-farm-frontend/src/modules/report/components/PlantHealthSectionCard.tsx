import { Box, Card, Chip, Typography } from "@mui/material";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { t } from "@/i18n/core";

interface PlantHealthSectionCardProps {
  sectionName: string;
  healthIndex: number;
  status: string;
  changePercent: number;
  trend: number[];
}

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "default"> = {
  good: "success",
  warning: "warning",
  critical: "error",
};

export function PlantHealthSectionCard({
  sectionName,
  healthIndex,
  status,
  changePercent,
  trend,
}: PlantHealthSectionCardProps) {
  const positive = changePercent >= 0;

  return (
    <Card elevation={0} sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 500, fontSize: 16, color: "text.primary" }}>
          {sectionName}
        </Typography>
        <Chip size="small" label={t(`ph.status.${status}`)} color={STATUS_COLOR[status] ?? "default"} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
        <Typography sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700, fontSize: 26, color: "text.primary" }}>
          {Math.round(healthIndex)}%
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: positive ? "success.main" : "error.main" }}>
          {positive ? "▲" : "▼"} {Math.abs(changePercent)}%
        </Typography>
      </Box>
      {trend.length > 1 ? (
        <SparkLineChart data={trend} height={48} curve="natural" colors={[positive ? "#35C56E" : "#E5484D"]} />
      ) : (
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{t("ph.noTrend")}</Typography>
      )}
    </Card>
  );
}
