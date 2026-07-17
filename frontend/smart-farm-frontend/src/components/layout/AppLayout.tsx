import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "./Sidebar";

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
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            bgcolor: "background.default",
            p: { xs: 2, sm: 3 },
            pb: isDesktop ? 3 : 10,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
