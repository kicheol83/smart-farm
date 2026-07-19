import { Box, Card, Typography, IconButton } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";

export function ReportDetailsPreview() {
  const navigate = useNavigate();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        position: "relative",
      }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: "text.primary",
          mb: 1,
        }}
      >
        Report Details
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          Granular section-by-section jadval hali backend'da mavjud emas.
          <br />
          Backend "Report" modeli boyitilgach shu yerda ko'rinadi.
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={() => navigate("/report/details")}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          bgcolor: "action.selected",
        }}
      >
        <ArrowOutwardRoundedIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}
