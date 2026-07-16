import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { Box, Typography, Button, Link, useTheme } from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
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


const SIGNUP_MUTATION = gql`
  mutation Signup($input: CreateMemberInput!) {
    signup(input: $input) {
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

const ONBOARDING_IMAGE = "https://picsum.photos/seed/smartfarm-signup/800/1200";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION);

  const isFilled =
    fullName.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    let hasError = false;
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Wrong email address. Please check again.");
      hasError = true;
    }
    if (password.length < 8) {
      setPasswordError("Must contain at least 8 characters.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      hasError = true;
    }
    if (hasError) return;

    try {
      await signup({
        variables: {
          input: {
            memberFullName: fullName,
            memberEmail: email,
            memberPassword: password,
          },
        },
      });

      navigate("/signup/verify", { state: { email } });
    } catch (err: any) {
      setEmailError(
        err.message?.includes("already")
          ? "This email address has already used."
          : err.message,
      );
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

      {/* ── Chap: Signup form ──────────────────────────────────────────────── */}
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
              Start Your Smart Farm Journey
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
              Create an account and bring precision to your operations.
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
                label="Full Name"
                required
                autoComplete="name"
                placeholder="e.g. Jhon Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

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
                autoComplete="new-password"
                placeholder="Must contain at least 8 characters"
                value={password}
                errorText={passwordError ?? undefined}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
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

              <AuthTextField
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Must contain at least 8 characters"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Yuborilmoqda..." : "Sign up"}
            </Button>
          </Box>

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
              Already have an account?
            </Typography>
            <Link
              component={RouterLink}
              to="/login"
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
              Log in
            </Link>
          </Box>
        </Box>
      </Box>

      <AuthOnboardingPanel
        image={ONBOARDING_IMAGE}
        heading="Seamless Device Control"
        subtitle="Manage sensors, irrigation, and equipment anywhere with one dashboard."
        activeStep={1}
      />
    </Box>
  );
}
