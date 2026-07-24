import { useState } from "react";
import { Box, Card, Typography, IconButton } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";

interface CameraItem {
  _id: string;
  cameraStatus: string;
  cameraName?: string;
}

interface ReportCameraCardProps {
  cameras: CameraItem[];
}

export function ReportCameraCard({ cameras }: ReportCameraCardProps) {
  const [index, setIndex] = useState(0);
  const total = cameras.length;

  function goPrev() {
    setIndex((i) => (i - 1 + total) % total);
  }
  function goNext() {
    setIndex((i) => (i + 1) % total);
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#1a1a1a",
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <SignalCellularAltRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "#fff",
          }}
        >
          {cameras[index]?.cameraName ??
            (total > 0 ? `Camera ${index + 1}` : "Camera")}
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
          sx={{ fontSize: 28, color: "rgba(255,255,255,0.4)" }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#fff" }}
        >
          {total > 0 ? `${index + 1}/${total}` : "0/0"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={goPrev}
            disabled={total < 2}
            sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
          </IconButton>
          <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)" }}>
            <CameraAltRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
          </IconButton>
          <IconButton size="small" sx={{ bgcolor: "rgba(255,255,255,0.12)" }}>
            <NotificationsNoneRoundedIcon
              sx={{ fontSize: 16, color: "#fff" }}
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={goNext}
            disabled={total < 2}
            sx={{ bgcolor: "rgba(255,255,255,0.12)" }}
          >
            <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: "#fff" }} />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
