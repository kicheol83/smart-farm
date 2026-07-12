import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function MapAreaPage() {
  return (
    <>
      <Header title="Map Area" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Map Area sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
