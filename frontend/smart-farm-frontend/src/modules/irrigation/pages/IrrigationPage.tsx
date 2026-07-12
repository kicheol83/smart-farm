import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function IrrigationPage() {
  return (
    <>
      <Header title="Irrigation Control" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Irrigation Control sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
