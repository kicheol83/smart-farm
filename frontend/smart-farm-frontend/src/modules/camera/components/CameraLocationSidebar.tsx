import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

type CameraStatus = "ONLINE" | "OFFLINE" | "RECORDING";

interface CameraItem {
  _id: string;
  cameraStatus: CameraStatus;
}

interface CameraLocationSidebarProps {
  greenHouseName?: string;
  cameras: CameraItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const STATUS_COLOR: Record<CameraStatus, string> = {
  ONLINE: "#35C56E",
  RECORDING: "#e53935",
  OFFLINE: "#9c9c9c",
};

export function CameraLocationSidebar({
  greenHouseName = "—",
  cameras,
  selectedId,
  onSelect,
  search,
  onSearchChange,
}: CameraLocationSidebarProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2,
        height: "100%",
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
            fontSize: 18,
            color: "text.primary",
          }}
        >
          Location
        </Typography>
        <IconButton size="small">
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <TextField
        size="small"
        placeholder="Search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
            </InputAdornment>
          ),
        }}
        fullWidth
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          overflowY: "auto",
          flex: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "text.primary",
            px: 1,
            py: 1,
          }}
        >
          {greenHouseName}
        </Typography>

        {cameras.map((c, i) => (
          <Box
            key={c._id}
            onClick={() => onSelect(c._id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              cursor: "pointer",
              bgcolor: c._id === selectedId ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <VideocamRoundedIcon
              sx={{ fontSize: 16, color: "text.secondary" }}
            />
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontSize: 13,
                color: "text.primary",
                flex: 1,
              }}
            >
              Camera {i + 1}
            </Typography>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: STATUS_COLOR[c.cameraStatus],
              }}
            />
          </Box>
        ))}

        {cameras.length === 0 && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
              py: 3,
            }}
          >
            Kamera topilmadi
          </Typography>
        )}
      </Box>
    </Box>
  );
}
