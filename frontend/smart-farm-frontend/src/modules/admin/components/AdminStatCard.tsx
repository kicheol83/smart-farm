import { Box, Card, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface AdminStatCardProps {
  icon: SvgIconComponent;
  label: string;
  value: number;
  color?: string;
  subLabel?: string;
}

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  color = "primary.main",
  subLabel,
}: AdminStatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        flex: 1,
        minWidth: 180,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "action.selected",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            {value.toLocaleString()}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>
      {subLabel && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            color: "text.secondary",
            mt: 1,
          }}
        >
          {subLabel}
        </Typography>
      )}
    </Card>
  );
}
