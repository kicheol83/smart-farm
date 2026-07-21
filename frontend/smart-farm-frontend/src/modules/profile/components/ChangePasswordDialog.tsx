import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Link,
  IconButton,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { OtpInput } from "@/modules/auth/components/OtpInput";
import { PasswordRequirementsList } from "@/modules/auth/components/PasswordRequirementsList";
import {
  REQUEST_SENSITIVE_UPDATE,
  CONFIRM_SENSITIVE_UPDATE,
} from "../graphql/queries";

interface ChangePasswordDialogProps {
  open: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OTP_LENGTH = 6;
const PASSWORD_VALID_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?]).{8,}$/;

export function ChangePasswordDialog({
  open,
  currentEmail,
  onClose,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(60);

  const [requestUpdate, { loading: requesting }] = useMutation(
    REQUEST_SENSITIVE_UPDATE,
  );
  const [confirmUpdate, { loading: confirming }] = useMutation(
    CONFIRM_SENSITIVE_UPDATE,
  );

  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, secondsLeft]);

  function resetAndClose() {
    setStep("form");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(60);
    onClose();
  }

  async function handleRequestChange() {
    setError(null);
    if (!PASSWORD_VALID_REGEX.test(password)) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await requestUpdate({ variables: { input: { newPassword: password } } });
      setStep("otp");
      setSecondsLeft(60);
    } catch (err: any) {
      setError(err.message ?? "Xatolik yuz berdi");
    }
  }

  async function handleVerify() {
    setError(null);
    try {
      await confirmUpdate({
        variables: { input: { emailCode: otp.join("") } },
      });
      onSuccess();
      resetAndClose();
    } catch (err: any) {
      setError(err.message ?? "Incorrect OTP. Please try again");
    }
  }

  const maskedEmail = currentEmail.replace(/^(.).*(@.*)$/, "$1***$2");
  const canSubmitForm = password.length > 0 && confirmPassword.length > 0;

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Change Password
      </DialogTitle>

      {step === "form" ? (
        <>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                Enter new password
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  ),
                }}
              />
              <Box sx={{ mt: 1 }}>
                <PasswordRequirementsList password={password} />
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  color: "text.secondary",
                  mb: 0.5,
                }}
              >
                Confirm new password
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                error={Boolean(error)}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? (
                        <VisibilityOffRoundedIcon fontSize="small" />
                      ) : (
                        <VisibilityRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  ),
                }}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 1, fontSize: 12 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={resetAndClose}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!canSubmitForm || requesting}
              onClick={handleRequestChange}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Change
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              We sent a verification code to {maskedEmail}. Enter it to confirm
              your changes.
            </Typography>

            <OtpInput value={otp} onChange={setOtp} error={Boolean(error)} />

            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              {error ? (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "error.main",
                  }}
                >
                  {error}
                </Typography>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.secondary",
                    }}
                  >
                    Didn't receive code?
                  </Typography>
                  {secondsLeft > 0 ? (
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 13,
                        color: "#17b26a",
                      }}
                    >
                      {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:
                      {String(secondsLeft % 60).padStart(2, "0")}
                    </Typography>
                  ) : (
                    <Link
                      component="button"
                      type="button"
                      onClick={handleRequestChange}
                      sx={{ fontSize: 13, color: "#17b26a" }}
                    >
                      Resend
                    </Link>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              disabled={otp.some((d) => !d) || confirming}
              onClick={handleVerify}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Verify
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
