import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function DeviceListPage() {
  return (
    <>
      <Header title="Device Status" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Device Status sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
