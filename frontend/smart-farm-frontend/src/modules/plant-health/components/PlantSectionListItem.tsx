import { Box, Typography, Chip } from "@mui/material";

interface PlantSectionListItemProps {
  sectionName: string;
  healthIndex?: number;
  plantName?: string;
  selected?: boolean;
  onClick: () => void;
}

export function PlantSectionListItem({
  sectionName,
  healthIndex,
  plantName,
  selected,
  onClick,
}: PlantSectionListItemProps) {
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
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        {plantName ?? "—"}
      </Typography>
    </Box>
  );
}
