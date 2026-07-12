import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function ReportPage() {
  return (
    <>
      <Header title="Greenhouse Report" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Greenhouse Report sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
