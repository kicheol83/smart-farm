import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Button,
  Link,
  Divider,
  IconButton,
  useTheme,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { useAuthStore } from "../auth.store";
import { AuthTextField } from "../components/AuthTextField";
import { GradientCheckbox } from "../components/GradientCheckbox";
import { AuthOnboardingPanel } from "../components/AuthOnboardingPanel";
import { Logo } from "@/components/icons/Logo";
import { GoogleIcon, AppleIcon } from "@/components/icons/BrandIcons";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  GRADIENT_LOGIN_BUTTON,
  GRADIENT_LOGIN_BUTTON_DARK,
  LOGIN_BG_LIGHT,
  LOGIN_BG_DARK,
} from "@/theme/theme";
import { t } from "@/i18n/core";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginMemberInput!) {
    login(input: $input) {
      _id
      memberFullName
      memberEmail
      memberRole
      memberAvatar
      memberStatus
      createdAt
      updatedAt
      accessToken
    }
  }
`;

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3010"}/auth/google`;
const APPLE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3010"}/auth/apple`;

const ONBOARDING_IMAGE =
  "https://picsum.photos/seed/smartfarm-greenhouse/800/1200";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const isFilled = email.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setServerError(null);

    let hasError = false;
    if (!EMAIL_REGEX.test(email)) {
      setEmailError(t("txt.wrong_email_address_please_check_again"));
      hasError = true;
    }
    if (password.length < 8) {
      setPasswordError(t("txt.incorrect_password_please_try_again"));
      hasError = true;
    }
    if (hasError) return;

    try {
      const { data } = await login({
        variables: { input: { memberEmail: email, memberPassword: password } },
      });

      setAuth(
        {
          _id: data.login._id,
          memberFullName: data.login.memberFullName,
          memberEmail: data.login.memberEmail,
          memberRole: data.login.memberRole,
          memberAvatar: data.login.memberAvatar,
        },
        data.login.accessToken,
      );

      navigate("/dashboard");
    } catch (err: any) {
      setPasswordError(t("txt.incorrect_password_please_try_again"));
      setServerError(err.message ?? null);
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
        {/* Logo */}
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
            gap: "40px",
            width: "100%",
          }}
        >
          {/* Form Input card */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "100%",
              bgcolor: "background.paper",
              borderRadius: "8px",
              p: "16px",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "Satoshi, sans-serif",
                  fontWeight: 700,
                  fontSize: 24,
                  letterSpacing: "-0.48px",
                  color: "text.primary",
                }}
              >
                {t("txt.hi_welcome_back")}
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
                {t("txt.access_your_farm_data_devices_and_insights_secur")}
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
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  width: "100%",
                }}
              >
                <AuthTextField
                  label={t("txt.email")}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. name@example.com"
                  value={email}
                  errorText={emailError ?? undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                />

                <AuthTextField
                  label={t("txt.password")}
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder={t("txt.must_contain_at_least_8_characters")}
                  value={password}
                  errorText={passwordError ?? undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  endAdornment={
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                      sx={{ p: 0.25 }}
                      tabIndex={-1}
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
                    </IconButton>
                  }
                />

                {serverError && (
                  <Typography role="alert" sx={{ fontSize: 13, color: "error.main" }}>
                    {serverError}
                  </Typography>
                )}

                {/* Remember Me row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      flex: 1,
                    }}
                  >
                    <GradientCheckbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        letterSpacing: "-0.24px",
                        color: "text.secondary",
                      }}
                    >
                      {t("txt.remember_me")}
                    </Typography>
                  </Box>

                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 12,
                      letterSpacing: "-0.24px",
                      color: "#17b26a",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {t("txt.forgot_password")}
                  </Link>
                </Box>
              </Box>

              <Button
                type="submit"
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
                  "&:hover": {
                    backgroundImage: isFilled
                      ? isDark
                        ? GRADIENT_LOGIN_BUTTON_DARK
                        : GRADIENT_LOGIN_BUTTON
                      : "none",
                    opacity: isFilled ? 0.9 : 1,
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#cecece",
                    color: "#a4a4a4",
                  },
                }}
              >
                {loading ? t("txt.logging_in") : t("txt.log_in")}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ width: "100%" }}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                letterSpacing: "-0.28px",
                color: "text.secondary",
              }}
            >
              {t("txt.or")}
            </Typography>
          </Divider>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <Button
              fullWidth
              component="a"
              href={GOOGLE_AUTH_URL}
              startIcon={<GoogleIcon sx={{ fontSize: 24 }} />}
              sx={{
                py: "12px",
                px: "16px",
                borderRadius: "8px",
                bgcolor: "rgba(255,255,255,0.4)",
                border: "1px solid #e0e0e0",
                color: "#000",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                letterSpacing: "-0.28px",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255,255,255,0.6)" },
              }}
            >
              {t("txt.log_in_with_google")}
            </Button>

            <Button
              fullWidth
              component="a"
              href={APPLE_AUTH_URL}
              startIcon={<AppleIcon sx={{ fontSize: 24, color: "#000" }} />}
              sx={{
                py: "12px",
                px: "16px",
                borderRadius: "8px",
                bgcolor: "rgba(255,255,255,0.4)",
                border: "1px solid #e0e0e0",
                color: "#000",
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                letterSpacing: "-0.28px",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255,255,255,0.6)" },
              }}
            >
              {t("txt.log_in_with_apple")}
            </Button>

            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  letterSpacing: "-0.24px",
                  color: "text.secondary",
                }}
              >
                {t("txt.don_t_have_an_account")}
              </Typography>
              <Link
                component={RouterLink}
                to="/signup"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  letterSpacing: "-0.24px",
                  color: "#17b26a",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {t("txt.sign_up")}
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image={ONBOARDING_IMAGE}
        heading={t("txt.grow_smarter_farm_better")}
        subtitle={t("txt.track_soil_health_moisture_and_vegetation_to_mak")}
        activeStep={0}
      />
    </Box>
  );
}
