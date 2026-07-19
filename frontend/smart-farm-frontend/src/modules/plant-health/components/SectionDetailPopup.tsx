import { Box, Card, Typography, IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { format } from "date-fns";

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

      <Field label="Plant" value={plantName ?? "—"} />

      {variant === "details" ? (
        <>
          <Field label="Next Harvest Estimate" value="—" />
          <Field label="Last Watering" value="—" />
          <Field label="Pest Status" value="—" />

          <Box sx={{ borderTop: 1, borderColor: "divider", my: 1.5 }} />

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Field
              label="Health"
              value={`${Math.round(section.healthIndex)}% • Good`}
              valueColor="#1a7a4c"
            />
            <Field label="7-day trend" value="—" />
            <Field
              label="Soil Moisture"
              value={
                section.soilMoisture !== undefined
                  ? `${Math.round(section.soilMoisture)}%`
                  : "—"
              }
            />
            <Field
              label="Soil pH"
              value={section.ph !== undefined ? section.ph.toFixed(1) : "—"}
            />
            <Field label="Nutrition Index" value="—" />
            <Field
              label="Temperature"
              value={
                section.temperature !== undefined
                  ? `${section.temperature.toFixed(1)}°C`
                  : "—"
              }
            />
            <Field
              label="Humidity"
              value={
                section.humidity !== undefined
                  ? `${Math.round(section.humidity)}%`
                  : "—"
              }
            />
            <Field label="Light Intensity" value="—" />
          </Box>
        </>
      ) : variant === "plant" ? (
        <>
          <Field
            label="Health"
            value={`${Math.round(section.healthIndex)}% • Good`}
            valueColor="#1a7a4c"
          />
          <Field
            label="Area"
            value={sectionArea !== undefined ? `${sectionArea} m2` : "—"}
          />
          <Field label="Last Harvest" value="—" />
          <Field label="Next Harvest Prediction" value="—" />

          <Box sx={{ borderTop: 1, borderColor: "divider", my: 1.5 }} />

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Field
              label="Humidity"
              value={
                section.humidity !== undefined
                  ? `${Math.round(section.humidity)}%`
                  : "—"
              }
            />
            <Field
              label="pH Level"
              value={section.ph !== undefined ? section.ph.toFixed(1) : "—"}
            />
          </Box>
          <Field
            label="Soil Moisture"
            value={
              section.soilMoisture !== undefined
                ? `${Math.round(section.soilMoisture)}%`
                : "—"
            }
          />
        </>
      ) : variant === "task" ? (
        <>
          <Field label="Scan Timestamp" value="—" />
          <Field label="Pest Scan" value="—" />
          <Field label="Leaf Check" value="—" />
          <Field label="Status Update" value="—" />

          <Box sx={{ borderTop: 1, borderColor: "divider", my: 1.5 }} />

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
          >
            <Field label="Status" value="—" />
            <Field label="Date" value="—" />
            <Field label="Pest Threat Level" value="—" />
            <Field label="Detected Species" value="—" />
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
            Backend Device modelida section bilan bog'lanish (sectionId) hali
            mavjud emas — shuning uchun aynan shu section'ga tegishli
            qurilmalarni bu yerda ko'rsata olmaymiz.
            <br />
            <br />
            Barcha qurilmalar ro'yxatini chap paneldagi "Device" tab'da
            ko'rishingiz mumkin.
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
            Audit-log (ActionLog) foydalanuvchi darajasida — section bilan
            bog'lanmagan. To'liq faoliyat tarixini chap paneldagi "Activity"
            tab'da ko'rishingiz mumkin.
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
        {format(new Date(section.lastUpdated), "MMM dd, HH:mm")}
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
