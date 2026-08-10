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
      setEmailError("Wrong email address. Please check again.");
      hasError = true;
    }
    if (password.length < 8) {
      setPasswordError("Incorrect password. Please try again.");
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
      setPasswordError("Incorrect password. Please try again.");
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
                Hi, Welcome Back
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
                Access your farm data, devices, and insights securely.
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
                  label="Email"
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
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Must contain at least 8 characters"
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
                      Remember me
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
                    Forgot Password?
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
                {loading ? "Kirilmoqda..." : "Log in"}
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
              or
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
              Log in with Google
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
              Log in with Apple
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
                Don't have an account?
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
                Sign up
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image={ONBOARDING_IMAGE}
        heading="Grow Smarter, Farm Better"
        subtitle="Track soil health, moisture, and vegetation to make data-driven decisions."
        activeStep={0}
      />
    </Box>
  );
}
