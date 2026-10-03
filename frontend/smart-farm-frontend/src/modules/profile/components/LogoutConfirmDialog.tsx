import { useMutation } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { LOGOUT_MUTATION } from "../graphql/queries";
import { t } from "@/i18n/core";

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onLoggedOut: () => void;
}

export function LogoutConfirmDialog({
  open,
  onClose,
  onLoggedOut,
}: LogoutConfirmDialogProps) {
  const [logout, { loading }] = useMutation(LOGOUT_MUTATION);

  async function handleLogout() {
    await logout();
    onLoggedOut();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {t("txt.are_you_sure_you_want_to_log_out")}
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
          {t("txt.logging_out_won_t_affect_your_saved_data_you_can")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.cancel")}
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={handleLogout}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {t("txt.log_out")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
