import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * Figma "Body" strukturasi: Sidebar (103px) + [Header (76px) + Main Content]
 *
 * Responsive:
 *   Mobil (< md):  Sidebar pastki BottomNavigation bo'lib chiqadi
 *   Desktop (md+): Sidebar chapda, flex-row
 */
export function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isDesktop ? "row" : "column",
        height: "100vh",
      }}
    >
      <Sidebar />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: "background.default",
            p: { xs: 2, sm: 3 },
            pb: isDesktop ? 3 : 10, // BottomNavigation bosib qolmasligi uchun
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
