import { Box, Card, Typography, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { format } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

interface SectionDetail {
  sectionId: string;
  sectionName: string;
  healthIndex: number;
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  ph?: number;
  lastUpdated: string;
}

interface SectionDetailPopupProps {
  section: SectionDetail;
  plantName?: string;
  sectionArea?: number;
  variant?: "details" | "plant" | "task" | "device" | "activity";
  onClose: () => void;
}

export function SectionDetailPopup({
  section,
  plantName,
  sectionArea,
  variant = "details",
  onClose,
}: SectionDetailPopupProps) {
  return (
    <Card
      elevation={4}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 300,
        maxHeight: "calc(100% - 32px)",
        overflowY: "auto",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        zIndex: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "text.primary",
          }}
        >
          {section.sectionName}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Field label={t("txt.plant")} value={plantName ?? "—"} />

      {variant === "details" ? (
        <>
          <Field label={t("txt.next_harvest_estimate")} value="—" />
          <Field label={t("txt.last_watering")} value="—" />
          <Field label={t("txt.pest_status")} value="—" />

          <Box sx={{ borderTop: 1, borderColor: "divider", my: 1.5 }} />

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Field
              label={t("txt.health")}
              value={`${Math.round(section.healthIndex)}% • Good`}
              valueColor="#1a7a4c"
            />
            <Field label={t("txt.7_day_trend")} value="—" />
            <Field
              label={t("txt.soil_moisture_0a4c")}
              value={
                section.soilMoisture !== undefined
                  ? `${Math.round(section.soilMoisture)}%`
                  : "—"
              }
            />
            <Field
              label={t("txt.soil_ph")}
              value={section.ph !== undefined ? section.ph.toFixed(1) : "—"}
            />
            <Field label={t("txt.nutrition_index")} value="—" />
            <Field
              label={t("txt.temperature")}
              value={
                section.temperature !== undefined
                  ? `${section.temperature.toFixed(1)}°C`
                  : "—"
              }
            />
            <Field
              label={t("txt.humidity")}
              value={
                section.humidity !== undefined
                  ? `${Math.round(section.humidity)}%`
                  : "—"
              }
            />
            <Field label={t("txt.light_intensity")} value="—" />
          </Box>
        </>
      ) : variant === "plant" ? (
        <>
          <Field
            label={t("txt.health")}
            value={`${Math.round(section.healthIndex)}% • Good`}
            valueColor="#1a7a4c"
          />
          <Field
            label={t("txt.area")}
            value={sectionArea !== undefined ? `${sectionArea} m2` : "—"}
          />
          <Field label={t("txt.last_harvest")} value="—" />
          <Field label={t("txt.next_harvest_prediction")} value="—" />

          <Box sx={{ borderTop: 1, borderColor: "divider", my: 1.5 }} />

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Field
              label={t("txt.humidity")}
              value={
                section.humidity !== undefined
                  ? `${Math.round(section.humidity)}%`
                  : "—"
              }
            />
            <Field
              label={t("txt.ph_level")}
              value={section.ph !== undefined ? section.ph.toFixed(1) : "—"}
            />
          </Box>
          <Field
            label={t("txt.soil_moisture_0a4c")}
            value={
              section.soilMoisture !== undefined
                ? `${Math.round(section.soilMoisture)}%`
                : "—"
            }
          />
        </>
      ) : variant === "task" ? (
        <>
          <Field label={t("txt.scan_timestamp")} value="—" />
          <Field label={t("txt.pest_scan")} value="—" />
          <Field label={t("txt.leaf_check")} value="—" />
          <Field label={t("txt.status_update")} value="—" />

          <Box sx={{ borderTop: 1, borderColor: "divider", my: 1.5 }} />

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Field label={t("txt.status")} value="—" />
            <Field label={t("txt.date")} value="—" />
            <Field label={t("txt.pest_threat_level")} value="—" />
            <Field label={t("txt.detected_species")} value="—" />
          </Box>
        </>
      ) : variant === "device" ? (
        <Box sx={{ py: 2 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {t("txt.devices_are_listed_per_greenhouse_rather_than_pe")}
            <br />
            <br />
            {t("txt.see_every_device_in_the_device_tab_on_the_left")}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ py: 2 }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            {t("txt.the_activity_log_is_kept_per_account_see_the_ful")}
          </Typography>
        </Box>
      )}

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: "text.secondary",
          mt: 2,
        }}
      >
        Oxirgi yangilanish:{" "}
        {format(new Date(section.lastUpdated), "PPp", { locale: dateLocale() })}
      </Typography>
    </Card>
  );
}

function Field({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          color: valueColor ?? "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
