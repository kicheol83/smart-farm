import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { AuthTextField } from "../components/AuthTextField";
import { AuthOnboardingPanel } from "../components/AuthOnboardingPanel";
import { Logo } from "@/components/icons/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  GRADIENT_LOGIN_BUTTON,
  GRADIENT_LOGIN_BUTTON_DARK,
  LOGIN_BG_LIGHT,
  LOGIN_BG_DARK,
} from "@/theme/theme";
import { t } from "@/i18n/core";

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
    }
  }
`;

const ONBOARDING_IMAGE = "https://picsum.photos/seed/smartfarm-forgot/800/1200";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const isFilled = email.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email)) {
      setError(t("txt.wrong_email_address_please_check_again"));
      return;
    }

    try {
      await forgotPassword({ variables: { input: { memberEmail: email } } });
      navigate("/forgot-password/verify", { state: { email } });
    } catch (err: any) {
      setError(err.message ?? t("txt.something_went_wrong"));
    }
  }

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
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: "8px",
            p: "24px",
          }}
        >
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
              {t("txt.forgot_your_password")}
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
              {t("txt.if_you_ve_forgotten_your_password_please_enter_y")}
            </Typography>
          </Box>

          <AuthTextField
            label={t("txt.email")}
            type="email"
            required
            autoComplete="email"
            placeholder="e.g. name@example.com"
            value={email}
            errorText={error ?? undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading || !isFilled}
            sx={{
              py: "9px",
              borderRadius: "8px",
              backgroundImage: isFilled
                ? isDark
                  ? GRADIENT_LOGIN_BUTTON_DARK
                  : GRADIENT_LOGIN_BUTTON
                : "none",
              bgcolor: isFilled ? "transparent" : "#cecece",
              color: isFilled ? "#fff" : "#a4a4a4",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "-0.28px",
              textTransform: "none",
              "&.Mui-disabled": { bgcolor: "#cecece", color: "#a4a4a4" },
            }}
          >
            {loading ? t("txt.sending") : t("txt.send")}
          </Button>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image={ONBOARDING_IMAGE}
        heading={t("txt.real_time_insights_access")}
        subtitle={t("txt.analyze_field_metrics_quickly_with_intuitive_cha")}
        activeStep={2}
      />
    </Box>
  );
}
