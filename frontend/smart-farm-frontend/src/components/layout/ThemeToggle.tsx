import { IconButton, Tooltip } from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { useThemeMode } from "@/theme/ThemeModeContext";

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <Tooltip title={mode === "dark" ? "Yorug' rejim" : "Qorong'i rejim"}>
      <IconButton
        onClick={toggleMode}
        sx={{
          bgcolor: "action.selected",
          borderRadius: 2,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {mode === "dark" ? (
          <LightModeRoundedIcon fontSize="small" />
        ) : (
          <DarkModeRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
