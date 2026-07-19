import { Box, IconButton, Card, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useState } from "react";
import { NdviLegend } from "./NdviLegend";

interface Sector {
  _id: string;
  sectorName: string;
  sectorArea: number;
  centerPoint: { lat: number; lng: number };
  ndviValue?: number;
  ndviLevel?: "VERY_LOW" | "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
}

interface MapAreaViewProps {
  sectors: Sector[];
  selectedSector?: Sector;
  averageNdvi?: number;
  onSelectSector: (id: string) => void;
  onOpenInfoMenu: (e: React.MouseEvent<HTMLElement>) => void;
}

const MAP_IMAGE = "https://picsum.photos/seed/smartfarm-drone-field/1400/900";

export function MapAreaView({
  sectors,
  selectedSector,
  averageNdvi,
  onSelectSector,
  onOpenInfoMenu,
}: MapAreaViewProps) {
  const otherSectors = sectors.filter((s) => s._id !== selectedSector?._id);
  const [showNdvi, setShowNdvi] = useState(false);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        minHeight: 420,
        backgroundImage: `url(${MAP_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <IconButton
          size="small"
          sx={{
            bgcolor: "rgba(53,197,110,0.85)",
            color: "#fff",
            "&:hover": { bgcolor: "primary.main" },
          }}
        >
          <ViewSidebarRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.85)" }}>
          <AddRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.85)" }}>
          <RemoveRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          sx={{ bgcolor: "rgba(255,255,255,0.85)", mt: 1 }}
        >
          <MyLocationRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.85)" }}>
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {selectedSector && (
        <Box
          onClick={() => onSelectSector(selectedSector._id)}
          sx={{
            position: "absolute",
            top: "38%",
            left: "42%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontSize: 12,
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {selectedSector.sectorName}
          </Box>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "#fff",
              border: "2px solid #35C56E",
            }}
          />
        </Box>
      )}

      {otherSectors.slice(0, 6).map((s, i) => (
        <Box
          key={s._id}
          onClick={() => onSelectSector(s._id)}
          sx={{
            position: "absolute",
            top: `${50 + (i % 3) * 12}%`,
            left: `${62 + Math.floor(i / 3) * 14}%`,
            bgcolor: "rgba(0,0,0,0.65)",
            color: "#fff",
            borderRadius: 1.5,
            px: 1.25,
            py: 0.5,
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {s.sectorName}
        </Box>
      ))}

      {selectedSector && (
        <Card
          elevation={3}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 260,
            maxHeight: "calc(100% - 32px)",
            overflowY: "auto",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
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
              {selectedSector.sectorName}
            </Typography>
            <IconButton size="small" onClick={onOpenInfoMenu}>
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {selectedSector.sectorArea} m²
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {selectedSector.centerPoint.lat.toFixed(4)},{" "}
            {selectedSector.centerPoint.lng.toFixed(4)}
          </Typography>

          {selectedSector.ndviValue !== undefined && (
            <Box
              component="button"
              onClick={() => setShowNdvi((v) => !v)}
              sx={{
                mt: 1.5,
                width: "100%",
                border: "none",
                bgcolor: "action.selected",
                borderRadius: 1.5,
                py: 0.75,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                cursor: "pointer",
                color: "text.primary",
              }}
            >
              {showNdvi ? "Hide NDVI Index" : "Show NDVI Index"}
            </Box>
          )}

          {showNdvi && selectedSector.ndviValue !== undefined && (
            <NdviLegend
              sectorName={selectedSector.sectorName}
              ndviValue={selectedSector.ndviValue}
              ndviLevel={selectedSector.ndviLevel}
              averageNdvi={averageNdvi}
            />
          )}
        </Card>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "rgba(255,255,255,0.9)",
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
        }}
      >
        <CloudRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          Clouds
        </Typography>
      </Box>

      <IconButton
        size="small"
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          bgcolor: "rgba(0,0,0,0.6)",
          color: "#fff",
        }}
      >
        <FullscreenRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
