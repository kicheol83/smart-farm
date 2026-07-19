import { Box, Card, Typography, IconButton, Chip } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface AlertItem {
  alertsType: string;
  alertsSeverity: string;
  count: number;
  lastOccurred: string;
}

interface AlertsSummaryPreviewProps {
  items: AlertItem[];
}

const SEVERITY_STYLE: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: "#c62828", bg: "rgba(229,57,53,0.12)" },
  WARNING: { color: "#a06a0a", bg: "rgba(249,173,25,0.12)" },
  INFO: { color: "#1565c0", bg: "rgba(33,150,243,0.12)" },
};

export function AlertsSummaryPreview({ items }: AlertsSummaryPreviewProps) {
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
          mb: 1.5,
        }}
      >
        Alerts Summary
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {items.slice(0, 4).map((a, i) => {
          const style = SEVERITY_STYLE[a.alertsSeverity] ?? SEVERITY_STYLE.INFO;
          return (
            <Box
              key={i}
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
                    fontWeight: 700,
                    fontSize: 14,
                    color: "text.primary",
                  }}
                >
                  {a.count} {a.alertsType}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  {format(new Date(a.lastOccurred), "MMM dd, HH:mm")}
                </Typography>
              </Box>
              <Chip
                label={a.alertsSeverity}
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

        {items.length === 0 && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
              py: 2,
            }}
          >
            Faol alertlar yo'q
          </Typography>
        )}
      </Box>

      <IconButton
        size="small"
        onClick={() => navigate("/report/alerts")}
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
