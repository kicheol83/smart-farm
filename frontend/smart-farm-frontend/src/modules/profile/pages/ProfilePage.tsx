import { useState, useRef } from "react";
import { useMutation } from "@apollo/client";
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Avatar,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/modules/auth/auth.store";
import { ChangeEmailDialog } from "../components/ChangeEmailDialog";
import { ChangePasswordDialog } from "../components/ChangePasswordDialog";
import { DeleteAccountDialog } from "../components/DeleteAccountDialog";
import { LogoutConfirmDialog } from "../components/LogoutConfirmDialog";
import { UPLOAD_AVATAR_MUTATION } from "../graphql/queries";

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logoutStore = useAuthStore((s) => s.logout);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.memberAvatar ?? "");
  const [firstName, setFirstName] = useState(
    user?.memberFullName?.split(" ")[0] ?? "",
  );
  const [lastName, setLastName] = useState(
    user?.memberFullName?.split(" ").slice(1).join(" ") ?? "",
  );
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [twoStep, setTwoStep] = useState(true);
  const [loginAlert, setLoginAlert] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [uploadAvatar, { loading: uploading }] = useMutation(
    UPLOAD_AVATAR_MUTATION,
  );

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data } = await uploadAvatar({ variables: { file } });
      setAvatarUrl(data.uploadAvatar.url);
      setToast("Avatar updated!");
    } catch (err: any) {
      setToast(err.message ?? "Avatar yuklashda xatolik");
    }
  }

  function handleEmailChanged(newEmail: string) {
    if (user && accessToken) {
      setAuth({ ...user, memberEmail: newEmail }, accessToken);
    }
    setToast("Email updated!");
  }

  function handlePasswordChanged() {
    setToast("Password changed!");
  }

  function handleAccountDeleted() {
    logoutStore();
    window.location.href = "/login";
  }

  function handleLoggedOut() {
    logoutStore();
    window.location.href = "/login";
  }

  return (
    <>
      <Header title="Account Settings" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 2,
        }}
      >
        {/* Chap: Profil */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={avatarUrl} sx={{ width: 64, height: 64 }} />
            <Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleAvatarChange}
                />
                <Button
                  variant="contained"
                  size="small"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  {uploading ? "Uploading..." : "Change Image +"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setAvatarUrl("")}
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Remove Image
                </Button>
              </Box>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                We support PNGs, JPEGs and GIFs under 2MB
              </Typography>
            </Box>
          </Box>

          <Field label="First Name" note="Backend'da hali saqlanmaydi">
            <TextField
              fullWidth
              size="small"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Last Name" note="Backend'da hali saqlanmaydi">
            <TextField
              fullWidth
              size="small"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
          <Field label="Phone Number" note="Backend'da hali saqlanmaydi">
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998901234567"
            />
          </Field>
          <Field label="Location" note="Backend'da hali saqlanmaydi">
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Save
            </Button>
          </Box>
        </Card>

        {/* O'ng: Account Security + Support Access */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "text.primary",
              }}
            >
              Account Security
            </Typography>

            <SecurityRow
              label="Email"
              value={user?.memberEmail}
              actionLabel="Change Email"
              onAction={() => setEmailDialogOpen(true)}
            />
            <SecurityRow
              label="Password"
              description="Set a unique password to protect your account."
              actionLabel="Change Password"
              onAction={() => setPasswordDialogOpen(true)}
            />

            <ToggleRow
              label="2-Step Verifications"
              description="Add an additional layer of security to your account during login for enhanced protection."
              checked={twoStep}
              onChange={() => setTwoStep((v) => !v)}
              note="Backend'da hali mavjud emas"
            />
            <ToggleRow
              label="Login Alert Notification"
              description="Get notified when a new device or browser is used to log in to your account."
              checked={loginAlert}
              onChange={() => setLoginAlert((v) => !v)}
              note="Backend'da hali mavjud emas"
            />
            <ToggleRow
              label="Email Notification"
              description="Stay informed via email whenever your account is accessed from a new device or browser."
              checked={emailNotif}
              onChange={() => setEmailNotif((v) => !v)}
              note="Settings > Notifications'dagi bilan bir xil maydon emas — bu joyi placeholder"
            />
          </Card>

          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "text.primary",
              }}
            >
              Support Access
            </Typography>

            <SecurityRow
              label="Log out account"
              description="Sign out from your account."
              actionLabel="Log out"
              onAction={() => setLogoutDialogOpen(true)}
            />
            <SecurityRow
              label="Delete my account"
              labelColor="error.main"
              description="Permanently delete your account and all data."
              actionLabel="Delete"
              onAction={() => setDeleteDialogOpen(true)}
            />
          </Card>
        </Box>
      </Box>

      <ChangeEmailDialog
        open={emailDialogOpen}
        currentEmail={user?.memberEmail ?? ""}
        onClose={() => setEmailDialogOpen(false)}
        onSuccess={handleEmailChanged}
      />
      <ChangePasswordDialog
        open={passwordDialogOpen}
        currentEmail={user?.memberEmail ?? ""}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={handlePasswordChanged}
      />
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleAccountDeleted}
      />
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onLoggedOut={handleLoggedOut}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 2 }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}

function Field({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "text.secondary",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {children}
      {note && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            color: "text.secondary",
            mt: 0.25,
          }}
        >
          {note}
        </Typography>
      )}
    </Box>
  );
}

function SecurityRow({
  label,
  labelColor,
  value,
  description,
  actionLabel,
  onAction,
}: {
  label: string;
  labelColor?: string;
  value?: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: labelColor ?? "text.primary",
          }}
        >
          {label}
        </Typography>
        {value && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {value}
          </Typography>
        )}
        {description && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
              mt: 0.25,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={onAction}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          flexShrink: 0,
          color: labelColor,
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  note,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  note?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        gap: 2,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "text.primary",
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
            mt: 0.25,
          }}
        >
          {description}
        </Typography>
        {note && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: "text.secondary",
              mt: 0.25,
              fontStyle: "italic",
            }}
          >
            {note}
          </Typography>
        )}
      </Box>
      <Switch checked={checked} onChange={onChange} />
    </Box>
  );
}
