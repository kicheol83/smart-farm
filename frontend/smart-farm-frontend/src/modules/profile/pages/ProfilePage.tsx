import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function ProfilePage() {
  return (
    <>
      <Header title="Profile" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Profile sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
