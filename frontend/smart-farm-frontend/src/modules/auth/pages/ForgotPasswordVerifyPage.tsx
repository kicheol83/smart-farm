import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { Box, Typography, Button, Link, useTheme } from "@mui/material";
import { OtpInput } from "../components/OtpInput";
import { BackButton } from "../components/BackButton";
import { AuthOnboardingPanel } from "../components/AuthOnboardingPanel";
import { Logo } from "@/components/icons/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  GRADIENT_LOGIN_BUTTON,
  GRADIENT_LOGIN_BUTTON_DARK,
  LOGIN_BG_LIGHT,
  LOGIN_BG_DARK,
} from "@/theme/theme";

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
    }
  }
`;

const OTP_LENGTH = 6;

export function ForgotPasswordVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const email: string = (location.state as { email?: string })?.email ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  const [resendOtp, { loading: resending }] = useMutation(
    FORGOT_PASSWORD_MUTATION,
  );

  const isFilled = otp.every((d) => d !== "");

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    navigate("/forgot-password/reset", { state: { email, otp: otp.join("") } });
  }

  async function handleResend() {
    try {
      await resendOtp({ variables: { input: { memberEmail: email } } });
      setOtp(Array(OTP_LENGTH).fill(""));
    } catch {}
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
          onSubmit={handleVerify}
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
          <BackButton onClick={() => navigate("/forgot-password")} />

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
              Forgot Your Password?
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
              If you've forgotten your password, please enter your email to
              reset it.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <OtpInput value={otp} onChange={setOtp} />
          </Box>

          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                letterSpacing: "-0.28px",
                color: "text.secondary",
              }}
            >
              Didn't receive code?
            </Typography>
            <Link
              component="button"
              type="button"
              onClick={handleResend}
              disabled={resending}
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: "-0.28px",
                color: "#17b26a",
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Resend
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={!isFilled}
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
            Verify
          </Button>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image="https://picsum.photos/seed/smartfarm-forgot/800/1200"
        heading="Real-Time Insights Access"
        subtitle="Analyze field metrics quickly with intuitive charts and visual reports."
        activeStep={2}
      />
    </Box>
  );
}
