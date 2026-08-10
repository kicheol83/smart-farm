import { useMemo, useState } from "react";
import { Box, IconButton, Card, Typography } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  locationName?: string;
  onSelectSector: (id: string) => void;
  onOpenInfoMenu: (e: React.MouseEvent<HTMLElement>) => void;
}

const NDVI_COLOR: Record<string, string> = {
  VERY_LOW: "#c62828",
  LOW: "#e58e26",
  MODERATE: "#f9ad19",
  HIGH: "#7cb342",
  VERY_HIGH: "#1a7a4c",
};

function buildMarkerIcon(
  label: string,
  selected: boolean,
  ndviColor?: string,
): L.DivIcon {
  const bg = ndviColor ?? (selected ? "#35C56E" : "rgba(0,0,0,0.75)");
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;transform:translate(-50%,-100%);">
        <div style="background:#fff;border-radius:8px;padding:3px 8px;font-size:11px;font-family:Inter,sans-serif;font-weight:${selected ? 700 : 500};white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.25);border:${selected ? "2px solid #35C56E" : "none"};">
          ${label}
        </div>
        <div style="width:${selected ? 14 : 10}px;height:${selected ? 14 : 10}px;border-radius:50%;background:${bg};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [0, 0],
  });
}

function FitBoundsToSectors({ sectors }: { sectors: Sector[] }) {
  const map = useMap();
  useMemo(() => {
    if (sectors.length === 0) return;
    if (sectors.length === 1) {
      map.setView([sectors[0].centerPoint.lat, sectors[0].centerPoint.lng], 17);
      return;
    }
    const bounds = L.latLngBounds(
      sectors.map(
        (s) => [s.centerPoint.lat, s.centerPoint.lng] as [number, number],
      ),
    );
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [sectors.map((s) => s._id).join(",")]);
  return null;
}

export function MapAreaView({
  sectors,
  selectedSector,
  averageNdvi,
  locationName,
  onSelectSector,
  onOpenInfoMenu,
}: MapAreaViewProps) {
  const [showNdvi, setShowNdvi] = useState(false);

  const initialCenter: [number, number] =
    sectors.length > 0
      ? [sectors[0].centerPoint.lat, sectors[0].centerPoint.lng]
      : [41.2995, 69.2401];

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        minHeight: 420,
      }}
    >
      <MapContainer
        center={initialCenter}
        zoom={17}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <FitBoundsToSectors sectors={sectors} />

        {sectors.map((s) => {
          const isSelected = s._id === selectedSector?._id;
          const ndviColor =
            showNdvi && s.ndviLevel ? NDVI_COLOR[s.ndviLevel] : undefined;
          return (
            <Marker
              key={s._id}
              position={[s.centerPoint.lat, s.centerPoint.lng]}
              icon={buildMarkerIcon(s.sectorName, isSelected, ndviColor)}
              eventHandlers={{ click: () => onSelectSector(s._id) }}
            />
          );
        })}
      </MapContainer>

      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 1000,
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
          <EditRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

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
            zIndex: 1000,
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
          {locationName && (
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              {locationName}
            </Typography>
          )}
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

      <IconButton
        size="small"
        onClick={() =>
          document.getElementById("map-area-container")?.requestFullscreen?.()
        }
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          bgcolor: "rgba(0,0,0,0.6)",
          color: "#fff",
          zIndex: 1000,
        }}
      >
        <FullscreenRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
