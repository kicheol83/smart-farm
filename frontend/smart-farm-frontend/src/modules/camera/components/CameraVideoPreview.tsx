import { Box, Typography, IconButton, Chip, Tooltip } from "@mui/material";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
import { format } from "date-fns";

type CameraStatus = "ONLINE" | "OFFLINE" | "RECORDING";

interface CameraVideoPreviewProps {
  cameraLabel: string;
  cameraStatus?: CameraStatus;
  cameraStreamUrl?: string;
  onSnapshot: () => void;
}

export function CameraVideoPreview({
  cameraLabel,
  cameraStatus,
  cameraStreamUrl,
  onSnapshot,
}: CameraVideoPreviewProps) {
  const isLive = cameraStatus === "ONLINE" || cameraStatus === "RECORDING";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "text.primary",
          }}
        >
          {cameraLabel}
        </Typography>
        {isLive && (
          <Chip
            label="LIVE"
            size="small"
            sx={{
              bgcolor: "rgba(229,57,53,0.12)",
              color: "#e53935",
              fontWeight: 700,
              fontSize: 11,
              height: 22,
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#141414",
          aspectRatio: "16 / 9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
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
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "#fff",
            }}
          >
            {cameraLabel}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <VideocamOffRoundedIcon
            sx={{ fontSize: 40, color: "rgba(255,255,255,0.35)" }}
          />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            {cameraStreamUrl
              ? "Video player hali ulanmagan (hls.js kerak) — stream URL backend'da mavjud"
              : "Bu kameraga stream URL biriktirilmagan"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {cameraStatus === "RECORDING" ? (
            <Chip
              label="● REC"
              size="small"
              sx={{
                bgcolor: "rgba(229,57,53,0.85)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          ) : (
            <Box />
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)" }}>
              <FullscreenRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
            </IconButton>
            <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)" }}>
              <VolumeUpRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
            </IconButton>
            <Tooltip title="Snapshot olish hali ulanmagan — backend video-freym olish endpoint kerak">
              <span>
                <IconButton
                  size="small"
                  onClick={onSnapshot}
                  disabled
                  sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
                >
                  <CameraAltRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)" }}>
              <NotificationsNoneRoundedIcon
                sx={{ fontSize: 18, color: "#fff" }}
              />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
