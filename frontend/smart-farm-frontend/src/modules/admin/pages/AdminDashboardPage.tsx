import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function AdminDashboardPage() {
  return (
    <>
      <Header title="Admin Dashboard" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Admin Dashboard sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
