import { Box, Card, Typography } from "@mui/material";

interface AlertCategoryCardProps {
  dotColor: string;
  label: string;
  value: string;
  description: string;
}

export function AlertCategoryCard({
  dotColor,
  label,
  value,
  description,
}: AlertCategoryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        flex: 1,
        minWidth: 220,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box
          sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dotColor }}
        />
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "text.primary",
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: "-0.52px",
          color: "text.primary",
          mb: 1,
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
        {description}
      </Typography>
    </Card>
  );
}
