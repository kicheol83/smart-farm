import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { Box, Typography, Button, Link, useTheme } from "@mui/material";
import { OtpInput } from "../components/OtpInput";
import { AuthOnboardingPanel } from "../components/AuthOnboardingPanel";
import { Logo } from "@/components/icons/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthStore } from "../auth.store";
import {
  GRADIENT_LOGIN_BUTTON,
  GRADIENT_LOGIN_BUTTON_DARK,
  LOGIN_BG_LIGHT,
  LOGIN_BG_DARK,
} from "@/theme/theme";
import { t } from "@/i18n/core";

const VERIFY_OTP_MUTATION = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input) {
      message
    }
  }
`;

const RESEND_OTP_MUTATION = gql`
  mutation SendEmailVerificationOtp($input: SendEmailVerificationInput!) {
    sendEmailVerificationOtp(input: $input) {
      message
    }
  }
`;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 60;
const ONBOARDING_IMAGE = "https://picsum.photos/seed/smartfarm-verify/800/1200";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}**@${domain}`;
}

export function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const setAuth = useAuthStore((s) => s.setAuth);

  const email: string = (location.state as { email?: string })?.email ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SEC);

  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_OTP_MUTATION);
  const [resendOtp, { loading: resending }] = useMutation(RESEND_OTP_MUTATION);

  const isFilled = otp.every((d) => d !== "");

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const timerLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await verifyOtp({
        variables: { input: { memberEmail: email, emailCode: otp.join("") } },
      });

      const state = location.state as { member?: Parameters<typeof setAuth>[0]; accessToken?: string } | null;
      if (data?.verifyEmail && state?.member && state.accessToken) {
        setAuth(state.member, state.accessToken);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      setError(t("txt.incorrect_otp_please_try_again"));
    }
  }

  async function handleResend() {
    try {
      await resendOtp({ variables: { input: { memberEmail: email } } });
      setSecondsLeft(RESEND_COOLDOWN_SEC);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError(null);
    } catch (err: any) {
      setError(err.message ?? t("txt.resend_failed"));
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
          onSubmit={handleVerify}
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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
              {t("txt.email_verification")}
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
              We've sent a verification code to {maskEmail(email)}. Enter it to
              complete your sign-up.
            </Typography>
          </Box>

          <OtpInput value={otp} onChange={setOtp} error={Boolean(error)} />

          {/* Xato matni yoki countdown/resend — Figma ikkala holati */}
          {error ? (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  letterSpacing: "-0.28px",
                  color: "error.main",
                }}
              >
                {error}
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
                {t("txt.resend")}
              </Link>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  letterSpacing: "-0.28px",
                  color: "text.secondary",
                }}
              >
                {t("txt.didn_t_receive_code")}
              </Typography>
              {secondsLeft > 0 ? (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: "-0.28px",
                    color: "#17b26a",
                  }}
                >
                  {timerLabel}
                </Typography>
              ) : (
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
                  {t("txt.resend")}
                </Link>
              )}
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={verifying || !isFilled}
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
            {verifying ? t("txt.verifying") : t("txt.verify")}
          </Button>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image={ONBOARDING_IMAGE}
        heading={t("txt.seamless_device_control")}
        subtitle={t("txt.manage_sensors_irrigation_and_equipment_anywhere")}
        activeStep={1}
      />
    </Box>
  );
}
