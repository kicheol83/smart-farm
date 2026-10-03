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
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import InvertColorsRoundedIcon from "@mui/icons-material/InvertColorsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { GRADIENT_DARK, GRADIENT_DARK_MODE } from "@/theme/theme";
import { Logo } from "@/components/icons/Logo";
import { useAuthStore } from "@/modules/auth/auth.store";
import { FEATURES } from "@/lib/features";
import { t } from "@/i18n/core";

const NAV_ITEMS = [
  { to: "/dashboard", icon: HomeRoundedIcon, label: "nav.home" },
  { to: "/devices", icon: DesktopWindowsRoundedIcon, label: "nav.device" },
  { to: "/pipeline", icon: AccountTreeRoundedIcon, label: "nav.pipeline" },
  { to: "/automation", icon: BoltRoundedIcon, label: "nav.automation" },
  { to: "/irrigation", icon: InvertColorsRoundedIcon, label: "nav.irrigation" },
  { to: "/report", icon: PieChartRoundedIcon, label: "nav.report" },
  ...(FEATURES.ndviMap ? [{ to: "/map-area", icon: MapRoundedIcon, label: "nav.map" }] : []),
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: SettingsRoundedIcon, label: "nav.settings" },
  { to: "/profile", icon: PersonRoundedIcon, label: "nav.profile" },
];

export function Sidebar() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const gradient =
    theme.palette.mode === "dark" ? GRADIENT_DARK_MODE : GRADIENT_DARK;
  const isAdmin = useAuthStore((s) => s.user?.memberRole === "ADMIN");

  const bottomItems = isAdmin
    ? [
        ...BOTTOM_ITEMS,
        { to: "/admin", icon: AdminPanelSettingsRoundedIcon, label: "nav.admin" },
      ]
    : BOTTOM_ITEMS;

  const isActive = (to: string) => location.pathname.startsWith(to);

  if (!isDesktop) {
    const allItems = [...NAV_ITEMS, ...bottomItems];
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
          <BottomNavigationAction
            key={to}
            label={t(label)}
            icon={<Icon fontSize="small" />}
          />
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
      <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <Logo size={46} />
      </Box>

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

      <Stack spacing={1} sx={{ py: 4 }}>
        {bottomItems.map(({ to, icon: Icon }) => {
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
