import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, useTheme } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { AuthOnboardingPanel } from "../components/AuthOnboardingPanel";
import { Logo } from "@/components/icons/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  GRADIENT_LOGIN_BUTTON,
  GRADIENT_LOGIN_BUTTON_DARK,
  GRADIENT_GREEN,
  LOGIN_BG_LIGHT,
  LOGIN_BG_DARK,
} from "@/theme/theme";
import { t } from "@/i18n/core";

export function PasswordChangeSuccessPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100%",
        position: "relative",
        bgcolor: isDark ? LOGIN_BG_DARK : LOGIN_BG_LIGHT,
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <ThemeToggle />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "54px",
          width: { xs: "100%", lg: "615px" },
          px: { xs: 3, sm: "84px" },
          py: { xs: 4, sm: "60px" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Logo size={46} />
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.4px",
              color: "text.primary",
            }}
          >
            Smart Farm
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: "8px",
            p: "24px",
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundImage: GRADIENT_GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockRoundedIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 24,
                letterSpacing: "-0.48px",
                color: "text.primary",
              }}
            >
              {t("txt.password_change")}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 400,
                fontSize: 16,
                letterSpacing: "-0.32px",
                lineHeight: 1.6,
                color: "text.secondary",
              }}
            >
              {t("txt.you_have_successfully_changed_your_password")}
            </Typography>
          </Box>

          <Button
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              py: "9px",
              borderRadius: "8px",
              backgroundImage: isDark
                ? GRADIENT_LOGIN_BUTTON_DARK
                : GRADIENT_LOGIN_BUTTON,
              color: "#fff",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "-0.28px",
              textTransform: "none",
              "&:hover": {
                backgroundImage: isDark
                  ? GRADIENT_LOGIN_BUTTON_DARK
                  : GRADIENT_LOGIN_BUTTON,
                opacity: 0.9,
              },
            }}
          >
            {t("txt.login")}
          </Button>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image="https://picsum.photos/seed/smartfarm-forgot/800/1200"
        heading={t("txt.real_time_insights_access")}
        subtitle={t("txt.analyze_field_metrics_quickly_with_intuitive_cha")}
        activeStep={2}
      />
    </Box>
  );
}
