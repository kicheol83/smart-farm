import { Box, Typography } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { t } from "@/i18n/core";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        border: "none",
        bgcolor: "transparent",
        cursor: "pointer",
        p: 0,
        alignSelf: "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "8px",
          bgcolor: "action.selected",
        }}
      >
        <ChevronLeftRoundedIcon sx={{ fontSize: 18, color: "text.primary" }} />
      </Box>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "-0.28px",
          color: "text.primary",
        }}
      >
        {t("txt.back")}
      </Typography>
    </Box>
  );
}
