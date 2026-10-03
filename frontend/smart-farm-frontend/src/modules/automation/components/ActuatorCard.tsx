import {
  Box,
  Card,
  Typography,
  Switch,
  Chip,
  IconButton,
  Slider,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import WbIncandescentRoundedIcon from "@mui/icons-material/WbIncandescentRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import SettingsInputComponentRoundedIcon from "@mui/icons-material/SettingsInputComponentRounded";
import type { SvgIconComponent } from "@mui/icons-material";
import { format, formatDistanceToNow } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

type ActuatorType =
  | "RELAY"
  | "WATER_PUMP"
  | "SOLENOID_VALVE"
  | "GROW_LIGHT"
  | "COOLING_FAN"
  | "SERVO";
type ActuatorStatus = "ON" | "OFF";

interface ActuatorCardProps {
  actuatorName: string;
  actuatorType: ActuatorType;
  actuatorStatus: ActuatorStatus;
  speedPercent?: number;
  autoOffAt?: string;
  lastToggledAt?: string;
  onToggle: (status: ActuatorStatus) => void;
  onSetSpeed?: (speedPercent: number) => void;
  onDelete: () => void;
  toggling?: boolean;
}

const TYPE_ICON: Record<ActuatorType, SvgIconComponent> = {
  RELAY: ElectricBoltRoundedIcon,
  WATER_PUMP: WaterDropRoundedIcon,
  SOLENOID_VALVE: WaterDropRoundedIcon,
  GROW_LIGHT: WbIncandescentRoundedIcon,
  COOLING_FAN: AirRoundedIcon,
  SERVO: SettingsInputComponentRoundedIcon,
};

const TYPE_LABEL: Record<ActuatorType, string> = {
  RELAY: t("txt.relay"),
  WATER_PUMP: t("txt.water_pump"),
  SOLENOID_VALVE: t("txt.solenoid_valve"),
  GROW_LIGHT: t("txt.grow_light"),
  COOLING_FAN: t("txt.cooling_fan"),
  SERVO: t("txt.servo"),
};

const PWM_CAPABLE_TYPES: ActuatorType[] = ["COOLING_FAN"];

export function ActuatorCard({
  actuatorName,
  actuatorType,
  actuatorStatus,
  speedPercent,
  autoOffAt,
  lastToggledAt,
  onToggle,
  onSetSpeed,
  onDelete,
  toggling,
}: ActuatorCardProps) {
  const Icon = TYPE_ICON[actuatorType];
  const isOn = actuatorStatus === "ON";
  const isPwmCapable =
    PWM_CAPABLE_TYPES.includes(actuatorType) && Boolean(onSetSpeed);

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: isOn ? "rgba(53,197,110,0.14)" : "action.selected",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              sx={{ fontSize: 20, color: isOn ? "#1a7a4c" : "text.secondary" }}
            />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "text.primary",
              }}
            >
              {actuatorName}
            </Typography>
            <Chip
              label={TYPE_LABEL[actuatorType]}
              size="small"
              sx={{ height: 18, fontSize: 10, bgcolor: "action.selected" }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {!isPwmCapable && (
            <Switch
              checked={isOn}
              disabled={toggling}
              onChange={(e) => onToggle(e.target.checked ? "ON" : "OFF")}
            />
          )}
          <IconButton size="small" onClick={onDelete}>
            <DeleteOutlineRoundedIcon
              fontSize="small"
              sx={{ color: "text.secondary" }}
            />
          </IconButton>
        </Box>
      </Box>

      {isPwmCapable && (
        <Box sx={{ mt: 1.5, px: 0.5 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: -0.5 }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: "text.secondary",
              }}
            >
              {t("txt.speed_pwm")}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                color: isOn ? "#1a7a4c" : "text.secondary",
              }}
            >
              {speedPercent ?? 0}%
            </Typography>
          </Box>
          <Slider
            size="small"
            value={speedPercent ?? 0}
            onChangeCommitted={(_, value) => onSetSpeed?.(value as number)}
            min={0}
            max={100}
            step={5}
            disabled={toggling}
            sx={{ color: isOn ? "primary.main" : "text.disabled" }}
          />
        </Box>
      )}

      <Box
        sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.25 }}
      >
        {lastToggledAt && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: "text.secondary",
            }}
          >
            {t("auto.lastToggled", { time: format(new Date(lastToggledAt), "PPp", { locale: dateLocale() }) })}
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
    </Card>
  );
}
