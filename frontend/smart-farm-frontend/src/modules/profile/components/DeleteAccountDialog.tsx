import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Radio,
} from "@mui/material";
import {
  GET_DELETE_ACCOUNT_REASONS,
  DELETE_ACCOUNT_MUTATION,
} from "../graphql/queries";
import { t } from "@/i18n/core";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteAccountDialog({
  open,
  onClose,
  onDeleted,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<"reason" | "confirm">("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const { data } = useQuery(GET_DELETE_ACCOUNT_REASONS, { skip: !open });
  const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT_MUTATION);

  const reasons = data?.deleteAccountReasons ?? [];

  function resetAndClose() {
    setStep("reason");
    setSelectedReason(null);
    onClose();
  }

  async function handleFinalDelete() {
    if (!selectedReason) return;
    await deleteAccount({ variables: { input: { reason: selectedReason } } });
    onDeleted();
  }

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="xs" fullWidth>
      {step === "reason" ? (
        <>
          <DialogTitle
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {t("txt.delete_account")}
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
                mb: 2,
              }}
            >
              {t("txt.please_tell_us_why_you_want_to_delete_your_accou")}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {reasons.map((r: any) => (
                <Box
                  key={r.value}
                  onClick={() => setSelectedReason(r.value)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor:
                      selectedReason === r.value
                        ? "rgba(53,197,110,0.08)"
                        : "action.selected",
                    border:
                      selectedReason === r.value
                        ? "1px solid"
                        : "1px solid transparent",
                    borderColor:
                      selectedReason === r.value
                        ? "primary.main"
                        : "transparent",
                  }}
                >
                  <Radio checked={selectedReason === r.value} size="small" />
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13,
                      color: "text.primary",
                    }}
                  >
                    {r.label}
                  </Typography>
                </Box>
              ))}
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
              disabled={!selectedReason}
              onClick={() => setStep("confirm")}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {t("txt.continue")}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {t("txt.delete_account")}
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                textAlign: "center",
              }}
            >
              {t("txt.your_account_and_all_of_its_data_will_be_deleted")}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              disabled={loading}
              onClick={handleFinalDelete}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                color: "error.main",
                borderColor: "error.main",
              }}
            >
              {t("txt.delete")}
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={resetAndClose}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              {t("txt.keep_account")}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
