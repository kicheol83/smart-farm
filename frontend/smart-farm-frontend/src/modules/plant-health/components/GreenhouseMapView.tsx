import { Box, IconButton } from "@mui/material";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";

type SectionStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "INACTIVE";

interface MapSection {
  sectionId: string;
  sectionName: string;
  sectionStatus: SectionStatus;
}

interface GreenhouseMapViewProps {
  sections: MapSection[];
  selectedId: string | null;
  onSelectSection: (id: string) => void;
}

const GREENHOUSE_IMAGE =
  "https://picsum.photos/seed/smartfarm-greenhouse-map/1400/900";

export function GreenhouseMapView({
  sections,
  selectedId,
  onSelectSection,
}: GreenhouseMapViewProps) {
  const visiblePins = sections.slice(0, 4);
  const sidebarChips = sections.slice(4);

  const PIN_POSITIONS = [
    { top: "44%", left: "58%" },
    { top: "47%", left: "70%" },
    { top: "62%", left: "45%" },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        minHeight: 560,
        backgroundImage: `url(${GREENHOUSE_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {visiblePins.map((s, i) => (
        <Box
          key={s.sectionId}
          onClick={() => onSelectSection(s.sectionId)}
          sx={{
            position: "absolute",
            ...PIN_POSITIONS[i % PIN_POSITIONS.length],
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(0,0,0,0.65)",
              color: "#fff",
              borderRadius: 1.5,
              px: 1,
              py: 0.25,
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {s.sectionName}
          </Box>
          <RadioButtonCheckedRoundedIcon
            sx={{
              fontSize: 16,
              color: s.sectionId === selectedId ? "#35C56E" : "#fff",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            }}
          />
        </Box>
      ))}

      <Box
        sx={{
          position: "absolute",
          top: "45%",
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "flex-end",
        }}
      >
        {sidebarChips.map((s) => (
          <Box
            key={s.sectionId}
            onClick={() => onSelectSection(s.sectionId)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(0,0,0,0.65)",
              color: "#fff",
              borderRadius: 1.5,
              px: 1.25,
              py: 0.5,
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            {s.sectionStatus === "WARNING" && (
              <span style={{ color: "#f9ad19" }}>⚠</span>
            )}
            {s.sectionName}
          </Box>
        ))}
      </Box>

      {/* Chap pastki: fullscreen/layers */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          display: "flex",
          gap: 1,
        }}
      >
        <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.85)" }}>
          <FullscreenRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.85)" }}>
          <LayersRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
        <Box sx={{ position: "relative", width: 96, height: 96 }}>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "rgba(255,255,255,0.7)",
            }}
          >
            <KeyboardArrowUpRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: "rgba(255,255,255,0.7)",
            }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.7)",
            }}
          >
            <KeyboardArrowLeftRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.7)",
            }}
          >
            <KeyboardArrowRightRoundedIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "#fff",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
