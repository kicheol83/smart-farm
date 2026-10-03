import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { Box, Typography, Button, useTheme } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { AuthTextField } from "../components/AuthTextField";
import { PasswordRequirementsList } from "../components/PasswordRequirementsList";
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
import { t } from "@/i18n/core";

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
    }
  }
`;

const PASSWORD_VALID_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?]).{8,}$/;

export function CreateNewPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const state = location.state as { email?: string; otp?: string } | null;
  const email = state?.email ?? "";
  const otp = state?.otp ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  const isValid = PASSWORD_VALID_REGEX.test(password);
  const isFilled = password.length > 0 && confirmPassword.length > 0;

  useEffect(() => {
    if (!email || !otp) navigate("/forgot-password", { replace: true });
  }, [email, otp, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError(t("txt.password_does_not_meet_the_requirements"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("txt.passwords_do_not_match"));
      return;
    }

    try {
      await resetPassword({
        variables: {
          input: {
            memberEmail: email,
            passwordToken: otp,
            newPassword: password,
          },
        },
      });
      navigate("/forgot-password/success");
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
          <BackButton
            onClick={() =>
              navigate("/forgot-password/verify", { state: { email } })
            }
          />

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
              {t("txt.create_new_password")}
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
              {t("txt.enter_a_new_password_and_confirm_it_to_continue")}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <AuthTextField
                label={t("txt.password")}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder={t("txt.must_contain_at_least_8_characters")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    sx={{
                      display: "flex",
                      border: "none",
                      bgcolor: "transparent",
                      cursor: "pointer",
                      p: 0,
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOffRoundedIcon
                        sx={{ fontSize: 20, color: "text.secondary" }}
                      />
                    ) : (
                      <VisibilityRoundedIcon
                        sx={{ fontSize: 20, color: "text.secondary" }}
                      />
                    )}
                  </Box>
                }
              />
              <PasswordRequirementsList password={password} />
            </Box>

            <AuthTextField
              label={t("txt.confirm_password")}
              type={showConfirmPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder={t("txt.must_contain_at_least_8_characters")}
              value={confirmPassword}
              errorText={error ?? undefined}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              endAdornment={
                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  sx={{
                    display: "flex",
                    border: "none",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    p: 0,
                  }}
                >
                  {showConfirmPassword ? (
                    <VisibilityOffRoundedIcon
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    />
                  ) : (
                    <VisibilityRoundedIcon
                      sx={{ fontSize: 20, color: "text.secondary" }}
                    />
                  )}
                </Box>
              }
            />
          </Box>

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
            {loading ? t("txt.saving") : t("txt.reset")}
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
