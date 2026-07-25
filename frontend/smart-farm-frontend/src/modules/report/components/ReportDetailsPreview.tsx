import { useQuery } from "@apollo/client";
import { Box, Card, Typography, IconButton, Chip } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { GET_REPORT_ENTRIES } from "../graphql/queries";

type EntryStatus = "DONE" | "OPTIMAL" | "ATTENTION";

const STATUS_STYLE: Record<
  EntryStatus,
  { label: string; color: string; bg: string }
> = {
  DONE: { label: "Done", color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" },
  OPTIMAL: { label: "Optimal", color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
  ATTENTION: {
    label: "Attention",
    color: "#c62828",
    bg: "rgba(229,57,53,0.14)",
  },
};

export function ReportDetailsPreview() {
  const navigate = useNavigate();
  const greenHouseId = localStorage.getItem("currentGreenhouseId") || "";

  const { data } = useQuery(GET_REPORT_ENTRIES, {
    variables: { input: { greenHouseId, page: 1, limit: 3 } },
    skip: !greenHouseId,
  });

  const entries = data?.reportEntries?.items ?? [];

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
          mb: 1.5,
        }}
      >
        Report Details
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {entries.map((e: any) => {
          const style = STATUS_STYLE[e.status as EntryStatus];
          return (
            <Box
              key={e._id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "background.default",
                borderRadius: 2,
                p: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 500,
                    fontSize: 13,
                    color: "text.primary",
                  }}
                >
                  {e.sectionName} {e.plantName ? `• ${e.plantName}` : ""}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  {format(new Date(e.entryDate), "MMM dd, yyyy")} • Health{" "}
                  {Math.round(e.healthIndex)}%
                </Typography>
              </Box>
              <Chip
                label={style.label}
                size="small"
                sx={{
                  bgcolor: style.bg,
                  color: style.color,
                  fontWeight: 600,
                  fontSize: 11,
                }}
              />
            </Box>
          );
        })}

        {entries.length === 0 && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
              py: 3,
            }}
          >
            Hali report entry yo'q
          </Typography>
        )}
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
