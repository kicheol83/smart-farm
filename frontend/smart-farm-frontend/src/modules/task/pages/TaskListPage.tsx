import { Box, Typography } from "@mui/material";
import { Header } from "@/components/layout/Header";

export function TaskListPage() {
  return (
    <>
      <Header title="Task List" />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Typography variant="body2" color="text.secondary">
          Task List sahifasi — keyingi bosqichda backend bilan ulanadi
        </Typography>
      </Box>
    </>
  );
}
