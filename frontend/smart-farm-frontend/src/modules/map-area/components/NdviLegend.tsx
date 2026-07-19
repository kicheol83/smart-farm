import { Box, Typography } from "@mui/material";

type NdviLevel = "VERY_LOW" | "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

interface NdviLegendProps {
  sectorName: string;
  ndviValue?: number;
  ndviLevel?: NdviLevel;
  averageNdvi?: number;
}

const NDVI_LEVELS: {
  level: NdviLevel;
  label: string;
  range: string;
  color: string;
}[] = [
  {
    level: "VERY_HIGH",
    label: "Very Healthy",
    range: "0.80 - 1.00",
    color: "#1a7a4c",
  },
  { level: "HIGH", label: "Healthy", range: "0.60 - 0.80", color: "#35C56E" },
  {
    level: "MODERATE",
    label: "Moderate",
    range: "0.40 - 0.60",
    color: "#f9ad19",
  },
  { level: "LOW", label: "Stressed", range: "0.20 - 0.40", color: "#e58a19" },
  {
    level: "VERY_LOW",
    label: "Very Stressed",
    range: "0.00 - 0.20",
    color: "#e53935",
  },
];

const LEVEL_LABEL: Record<NdviLevel, string> = {
  VERY_HIGH: "Very Healthy",
  HIGH: "Healthy",
  MODERATE: "Moderate",
  LOW: "Stressed",
  VERY_LOW: "Very Stressed",
};

export function NdviLegend({
  sectorName,
  ndviValue,
  ndviLevel,
  averageNdvi,
}: NdviLegendProps) {
  return (
    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "text.primary",
          mb: 1,
        }}
      >
        NDVI Index — {sectorName}
      </Typography>

      {ndviValue !== undefined && ndviLevel && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
            mb: 1,
          }}
        >
          Joriy qiymat: <b>{ndviValue.toFixed(2)}</b> — {LEVEL_LABEL[ndviLevel]}
        </Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {NDVI_LEVELS.map((l) => (
          <Box
            key={l.level}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: l.color,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: "text.secondary",
              }}
            >
              {l.range} {l.label}
              {l.level === ndviLevel && (
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {" "}
                  ← joriy
                </Typography>
              )}
            </Typography>
          </Box>
        ))}
      </Box>

      {averageNdvi !== undefined && (
        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: "text.secondary",
            }}
          >
            NDVI Overview
          </Typography>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "text.primary",
            }}
          >
            Avg NDVI: {averageNdvi.toFixed(2)} •{" "}
            {LEVEL_LABEL[levelFromValue(averageNdvi)]}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function levelFromValue(v: number): NdviLevel {
  if (v >= 0.8) return "VERY_HIGH";
  if (v >= 0.6) return "HIGH";
  if (v >= 0.4) return "MODERATE";
  if (v >= 0.2) return "LOW";
  return "VERY_LOW";
}
