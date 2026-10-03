import { Box, Typography, Chip } from "@mui/material";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import ThermostatRoundedIcon from "@mui/icons-material/ThermostatRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import GrassRoundedIcon from "@mui/icons-material/GrassRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { format } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

type Severity = "INFO" | "WARNING" | "CRITICAL";
type ActualValue = "LOW" | "NORMAL" | "HIGH";

interface AlertCardProps {
  alertsType: string;
  alertsThreshold: number;
  alertsActualValues: ActualValue;
  alertsSeverity: Severity;
  createdAt: string;
}

const VALUE_STYLE: Record<
  ActualValue,
  { label: string; color: string; bg: string }
> = {
  NORMAL: { label: t("txt.normal"), color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" },
  LOW: { label: t("txt.low"), color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
  HIGH: { label: t("txt.high"), color: "#c62828", bg: "rgba(229,57,53,0.14)" },
};

const ACTION_HINT: Record<string, string> = {
  TEMPERATURE: t("txt.check_ventilation_and_cooling_system"),
  HUMIDITY: t("txt.check_humidity_control_system"),
  PH: t("txt.adjust_soil_ph_with_compost_or_amendments"),
  CO2: t("txt.check_ventilation_system"),
  SOIL_MOISTURE: t("txt.check_irrigation_schedule"),
  LIGHT: t("txt.check_lighting_system"),
  PLANT_HEALTH: t("txt.inspect_section_and_check_for_pest_disease_signs"),
  SYSTEM_SENSOR: t("txt.check_device_power_and_connectivity"),
};

const TYPE_ICON: Record<string, SvgIconComponent> = {
  TEMPERATURE: ThermostatRoundedIcon,
  HUMIDITY: WaterDropRoundedIcon,
  PH: ScienceRoundedIcon,
  CO2: AirRoundedIcon,
  SOIL_MOISTURE: GrassRoundedIcon,
  LIGHT: WbSunnyRoundedIcon,
  PLANT_HEALTH: SpaRoundedIcon,
  SYSTEM_SENSOR: MemoryRoundedIcon,
};

function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");
}

export function AlertCard({
  alertsType,
  alertsThreshold,
  alertsActualValues,
  createdAt,
}: AlertCardProps) {
  const valueStyle = VALUE_STYLE[alertsActualValues];
  const TypeIcon = TYPE_ICON[alertsType];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        borderRadius: 2,
        p: 1.75,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: "text.primary",
          }}
        >
          {typeLabel(alertsType)} {valueStyle.label}
        </Typography>
        <Chip
          icon={TypeIcon ? <TypeIcon sx={{ fontSize: 14 }} /> : undefined}
          label={valueStyle.label}
          size="small"
          sx={{
            bgcolor: valueStyle.bg,
            color: valueStyle.color,
            fontWeight: 600,
            fontSize: 11,
            height: 22,
            "& .MuiChip-icon": { color: valueStyle.color },
          }}
        />
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        Threshold: {alertsThreshold} &nbsp;•&nbsp;{" "}
        {format(new Date(createdAt), "PPp", { locale: dateLocale() })}
      </Typography>

      {ACTION_HINT[alertsType] && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          Actions &nbsp;•&nbsp; {ACTION_HINT[alertsType]}
        </Typography>
      )}
    </Box>
  );
}
