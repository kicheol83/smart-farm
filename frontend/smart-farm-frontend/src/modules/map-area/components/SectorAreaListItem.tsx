import { Box, Typography, IconButton } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";

interface CenterPoint {
  lat: number;
  lng: number;
}

interface SectorAreaListItemProps {
  sectorName: string;
  sectorArea: number;
  centerPoint: CenterPoint;
  selected?: boolean;
  onClick: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
}

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${latDir} ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

export function SectorAreaListItem({
  sectorName,
  sectorArea,
  centerPoint,
  selected,
  onClick,
  onMenuOpen,
}: SectorAreaListItemProps) {
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
          {sectorName}
        </Typography>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e);
          }}
        >
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <FieldRow label="Land Area" value={`${sectorArea} m²`} />
      <FieldRow
        label="Coordinates"
        value={formatCoord(centerPoint.lat, centerPoint.lng)}
      />
    </Box>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
          minWidth: 90,
          flexShrink: 0,
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
