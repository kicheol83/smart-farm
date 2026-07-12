import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { GRADIENT_DARK, GRADIENT_DARK_MODE } from "@/theme/theme";
import { Logo } from "@/components/icons/Logo";

/**
 * Figma "Sidebar" komponenti — 103px kenglik, dark gradient active state.
 * Node: 2478:5848
 *
 * Responsive:
 *   < md (900px): pastki BottomNavigation
 *   >= md:         chap tomonda vertikal panel
 */

const NAV_ITEMS = [
  { to: "/dashboard", icon: HomeRoundedIcon, label: "Home" },
  { to: "/devices", icon: DesktopWindowsRoundedIcon, label: "Device" },
  { to: "/report", icon: PieChartRoundedIcon, label: "Report" },
  { to: "/map-area", icon: MapRoundedIcon, label: "Map" },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: SettingsRoundedIcon, label: "Settings" },
  { to: "/profile", icon: PersonRoundedIcon, label: "Profile" },
];

export function Sidebar() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const gradient = theme.palette.mode === "dark" ? GRADIENT_DARK_MODE : GRADIENT_DARK;

  const isActive = (to: string) => location.pathname.startsWith(to);

  if (!isDesktop) {
    const allItems = [...NAV_ITEMS, ...BOTTOM_ITEMS];
    const activeIndex = allItems.findIndex((item) => isActive(item.to));

    return (
      <BottomNavigation
        value={activeIndex}
        onChange={(_, newValue) => navigate(allItems[newValue].to)}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderTop: 1,
          borderColor: "divider",
          height: 64,
        }}
      >
        {allItems.map(({ to, icon: Icon, label }) => (
          <BottomNavigationAction key={to} label={label} icon={<Icon fontSize="small" />} />
        ))}
      </BottomNavigation>
    );
  }

  return (
    <Box
      component="aside"
      sx={{
        width: 103,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* Brand */}
      <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <Logo size={46} />
      </Box>

      {/* Asosiy nav */}
      <Stack spacing={1} sx={{ flex: 1, justifyContent: "center" }}>
        {NAV_ITEMS.map(({ to, icon: Icon }) => {
          const active = isActive(to);
          return (
            <IconButton
              key={to}
              onClick={() => navigate(to)}
              sx={{
                borderRadius: 2,
                p: 2.5,
                backgroundImage: active ? gradient : "none",
                bgcolor: active ? "transparent" : "action.selected",
                color: active ? "#fff" : "text.primary",
                "&:hover": {
                  bgcolor: active ? "transparent" : "action.hover",
                },
              }}
            >
              <Icon fontSize="small" />
            </IconButton>
          );
        })}
      </Stack>

      {/* Pastki nav */}
      <Stack spacing={1} sx={{ py: 4 }}>
        {BOTTOM_ITEMS.map(({ to, icon: Icon }) => {
          const active = isActive(to);
          return (
            <IconButton
              key={to}
              onClick={() => navigate(to)}
              sx={{
                borderRadius: 2,
                p: 2.5,
                backgroundImage: active ? gradient : "none",
                bgcolor: active ? "transparent" : "action.selected",
                color: active ? "#fff" : "text.primary",
                "&:hover": {
                  bgcolor: active ? "transparent" : "action.hover",
                },
              }}
            >
              <Icon fontSize="small" />
            </IconButton>
          );
        })}
      </Stack>
    </Box>
  );
}
