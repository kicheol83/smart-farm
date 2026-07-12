import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Settings sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
