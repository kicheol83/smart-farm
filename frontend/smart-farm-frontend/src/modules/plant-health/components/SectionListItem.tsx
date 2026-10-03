import { Box, Typography, Chip } from "@mui/material";
import { t } from "@/i18n/core";

type SectionStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "INACTIVE";

interface SectionListItemProps {
  sectionName: string;
  sectionStatus: SectionStatus;
  healthIndex?: number;
  plantName?: string;
  sectionArea: number;
  selected?: boolean;
  onClick: () => void;
}

const STATUS_BADGE: Record<
  SectionStatus,
  { label: string; color: string; bg: string } | null
> = {
  HEALTHY: null,
  WARNING: { label: t("txt.low"), color: "#a06a0a", bg: "rgba(249,173,25,0.16)" },
  CRITICAL: { label: t("txt.critical"), color: "#c62828", bg: "rgba(229,57,53,0.16)" },
  INACTIVE: {
    label: t("txt.inactive"),
    color: "#6b6b6b",
    bg: "rgba(156,156,156,0.16)",
  },
};

export function SectionListItem({
  sectionName,
  sectionStatus,
  healthIndex,
  plantName,
  sectionArea,
  selected,
  onClick,
}: SectionListItemProps) {
  const badge = STATUS_BADGE[sectionStatus];
  const statusNote = STATUS_NOTE[sectionStatus];

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: "pointer",
        borderLeft: "3px solid",
        borderLeftColor: selected ? "primary.main" : "transparent",
        bgcolor: selected ? "action.selected" : "transparent",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "text.primary",
          }}
        >
          {sectionName}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {badge && (
            <Chip
              label={badge.label}
              size="small"
              sx={{
                bgcolor: badge.bg,
                color: badge.color,
                fontWeight: 600,
                fontSize: 11,
                height: 22,
              }}
            />
          )}
          {healthIndex !== undefined && (
            <Chip
              icon={<span style={{ fontSize: 12 }}>♥</span>}
              label={`${Math.round(healthIndex)}%`}
              size="small"
              sx={{
                bgcolor: "rgba(53,197,110,0.16)",
                color: "#1a7a4c",
                fontWeight: 700,
                fontSize: 11,
                height: 22,
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        <FieldRow label={t("txt.plant")} value={plantName ?? "—"} />
        <FieldRow label={t("txt.area")} value={`${sectionArea} m²`} />
        <FieldRow label={t("txt.status_notes")} value={statusNote} />
      </Box>
    </Box>
  );
}

const STATUS_NOTE: Record<SectionStatus, string> = {
  HEALTHY: t("txt.healthy_and_stable_growth"),
  WARNING: t("txt.minor_issues_detected_needs_light_attention"),
  CRITICAL: t("txt.critical_condition_immediate_action_required"),
  INACTIVE: t("txt.section_is_currently_inactive"),
};

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
          minWidth: 80,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
