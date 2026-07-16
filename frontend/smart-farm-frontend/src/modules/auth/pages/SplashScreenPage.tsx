import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, useTheme } from "@mui/material";
import { Logo } from "@/components/icons/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthStore } from "../auth.store";
import { LOGIN_BG_LIGHT, LOGIN_BG_DARK } from "@/theme/theme";

export function SplashScreenPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? "/dashboard" : "/login", { replace: true });
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        position: "relative",
        bgcolor: isDark ? LOGIN_BG_DARK : LOGIN_BG_LIGHT,
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Logo size={88} />
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 48,
            letterSpacing: "-0.96px",
            color: "text.primary",
          }}
        >
          Smart Farm
        </Typography>
      </Box>
    </Box>
  );
}
