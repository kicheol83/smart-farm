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
import { t } from "@/i18n/core";

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
      setError(t("txt.entered_email_address_is_invalid"));
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError(t("txt.this_email_is_already_in_use"));
      return;
    }

    try {
      await requestUpdate({ variables: { input: { newEmail } } });
      setStep("otp");
      setSecondsLeft(60);
    } catch (err: any) {
      setError(err.message ?? t("txt.something_went_wrong_6609"));
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
      setError(err.message ?? t("txt.incorrect_otp_please_try_again"));
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
        {t("txt.change_email")}
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
                {t("txt.your_current_email")}
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
                {t("txt.new_email")}
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t("txt.enter_new_email")}
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
              {t("txt.cancel")}
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!newEmail || requesting}
              onClick={handleRequestChange}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {t("txt.change")}
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
                    {t("txt.didn_t_receive_code")}
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
                      {t("txt.resend")}
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
              {t("txt.verify")}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
