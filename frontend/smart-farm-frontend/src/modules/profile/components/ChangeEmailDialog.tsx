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
} from "@mui/material";
import { OtpInput } from "@/modules/auth/components/OtpInput";
import {
  REQUEST_SENSITIVE_UPDATE,
  CONFIRM_SENSITIVE_UPDATE,
} from "../graphql/queries";

interface ChangeEmailDialogProps {
  open: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LENGTH = 6;

export function ChangeEmailDialog({
  open,
  currentEmail,
  onClose,
  onSuccess,
}: ChangeEmailDialogProps) {
  const [step, setStep] = useState<"form" | "otp">("form");
  const [newEmail, setNewEmail] = useState("");
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
    setNewEmail("");
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(60);
    onClose();
  }

  async function handleRequestChange() {
    setError(null);
    if (!EMAIL_REGEX.test(newEmail)) {
      setError("Entered email address is invalid");
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("Entered email is exists in this workspace");
      return;
    }

    try {
      await requestUpdate({ variables: { input: { newEmail } } });
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
      onSuccess(newEmail);
      resetAndClose();
    } catch (err: any) {
      setError(err.message ?? "Incorrect OTP. Please try again");
    }
  }

  const maskedEmail = currentEmail.replace(/^(.).*(@.*)$/, "$1***$2");

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        Change Email
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
                Your current email
              </Typography>
              <TextField fullWidth size="small" value={currentEmail} disabled />
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
                New email
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter new email"
                value={newEmail}
                error={Boolean(error)}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setError(null);
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
              disabled={!newEmail || requesting}
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
              We've just sent a verification code to {maskedEmail}. Enter it to
              confirm your changes.
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
