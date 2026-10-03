import { Box, Card, Typography, Switch, Chip, Button } from "@mui/material";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import { formatDistanceToNow } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

interface ZoneIrrigationCardProps {
  sectionName: string;
  soilMoisture?: number;
  actuatorName?: string;
  actuatorStatus?: "ON" | "OFF";
  lastToggledAt?: string;
  autoOffAt?: string;
  todayUsageLiters?: number;
  onToggle: (status: "ON" | "OFF") => void;
  onQuickWater: () => void;
  toggling?: boolean;
}

function moistureColor(value?: number): {
  color: string;
  bg: string;
  label: string;
} {
  if (value === undefined)
    return { color: "#6b6b6b", bg: "rgba(156,156,156,0.14)", label: "—" };
  if (value < 30)
    return { color: "#c62828", bg: "rgba(229,57,53,0.14)", label: t("txt.dry") };
  if (value < 60)
    return { color: "#a06a0a", bg: "rgba(249,173,25,0.14)", label: t("txt.moderate") };
  return { color: "#1a7a4c", bg: "rgba(53,197,110,0.14)", label: t("txt.moist") };
}

export function ZoneIrrigationCard({
  sectionName,
  soilMoisture,
  actuatorName,
  actuatorStatus,
  lastToggledAt,
  autoOffAt,
  todayUsageLiters,
  onToggle,
  onQuickWater,
  toggling,
}: ZoneIrrigationCardProps) {
  const moisture = moistureColor(soilMoisture);
  const isOn = actuatorStatus === "ON";

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "text.primary",
          }}
        >
          {sectionName}
        </Typography>
        <Chip
          icon={<WaterDropRoundedIcon sx={{ fontSize: 14 }} />}
          label={
            soilMoisture !== undefined
              ? `${Math.round(soilMoisture)}% ${moisture.label}`
              : "—"
          }
          size="small"
          sx={{
            bgcolor: moisture.bg,
            color: moisture.color,
            fontWeight: 700,
            fontSize: 11,
          }}
        />
      </Box>

      {actuatorName ? (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "background.default",
              borderRadius: 2,
              p: 1.5,
              mb: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 500,
                  fontSize: 13,
                  color: "text.primary",
                }}
              >
                {actuatorName}
              </Typography>
              {lastToggledAt && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {t("irr.last", { time: formatDistanceToNow(new Date(lastToggledAt), { addSuffix: true, locale: dateLocale() }) })}
                </Typography>
              )}
              {isOn && autoOffAt && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "#a06a0a",
                  }}
                >
                  {t("auto.autoOff", { time: formatDistanceToNow(new Date(autoOffAt), { addSuffix: true, locale: dateLocale() }) })}
                </Typography>
              )}
            </Box>
            <Switch
              checked={isOn}
              disabled={toggling}
              onChange={(e) => onToggle(e.target.checked ? "ON" : "OFF")}
            />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<WaterDropRoundedIcon fontSize="small" />}
            onClick={onQuickWater}
            disabled={toggling || isOn}
            sx={{ textTransform: "none", borderRadius: 2, mb: 1.5 }}
          >
            {t("txt.water_now_5_min")}
          </Button>
        </>
      ) : (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
            textAlign: "center",
            py: 2,
            mb: 1.5,
          }}
        >
          {t("txt.no_irrigation_actuator_is_linked_to_this_zone")}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: 1,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {t("txt.used_today")}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: "text.primary",
          }}
        >
          {todayUsageLiters !== undefined ? `${todayUsageLiters} L` : "—"}
        </Typography>
      </Box>
    </Card>
  );
}
