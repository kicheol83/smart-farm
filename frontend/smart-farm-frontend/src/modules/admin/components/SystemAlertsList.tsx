import { Box, Typography, Chip } from "@mui/material";
import { format } from "date-fns";

interface SystemAlert {
  alertId: string;
  alertsType: string;
  alertsSeverity: string;
  alertsThreshold: number;
  ownerEmail: string;
  greenHouseName: string;
  createdAt: string;
}

interface SystemAlertsListProps {
  alerts: SystemAlert[];
}

const SEVERITY_STYLE: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: "#c62828", bg: "rgba(229,57,53,0.14)" },
  WARNING: { color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
  INFO: { color: "#1565c0", bg: "rgba(33,150,243,0.14)" },
};

function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");
}

export function SystemAlertsList({ alerts }: SystemAlertsListProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {alerts.map((a) => {
        const style = SEVERITY_STYLE[a.alertsSeverity] ?? SEVERITY_STYLE.INFO;
        return (
          <Box
            key={a.alertId}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 2,
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
                {typeLabel(a.alertsType)} — threshold {a.alertsThreshold}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {a.ownerEmail} &nbsp;•&nbsp; {a.greenHouseName} &nbsp;•&nbsp;{" "}
                {format(new Date(a.createdAt), "MMM dd, hh:mm a")}
              </Typography>
            </Box>
            <Chip
              label={a.alertsSeverity}
              size="small"
              sx={{
                bgcolor: style.bg,
                color: style.color,
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          </Box>
        );
      })}

      {alerts.length === 0 && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
            py: 4,
          }}
        >
          Faol alertlar yo'q
        </Typography>
      )}
    </Box>
  );
}
