import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function PlantHealthPage() {
  return (
    <>
      <Header title="Plant Health & Section Monitoring" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Plant Health & Section Monitoring sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
