import { Box, Card, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface TaskSummaryCardProps {
  icon: SvgIconComponent;
  label: string;
  value: number;
  caption: string;
}

export function TaskSummaryCard({
  icon: Icon,
  label,
  value,
  caption,
}: TaskSummaryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        minWidth: 200,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "-0.28px",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "action.selected",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 22, color: "text.primary" }} />
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: "-0.56px",
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {caption}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
