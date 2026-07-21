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
        Are you sure want to log out?
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
          Logging out won't affect your saved data. You can sign in anytime
          securely.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={loading}
          onClick={handleLogout}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Log out
        </Button>
      </DialogActions>
    </Dialog>
  );
}
