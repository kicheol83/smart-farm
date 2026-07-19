import { Card, Typography } from "@mui/material";

interface PlantHealthSectionCardProps {
  sectionName: string;
}

export function PlantHealthSectionCard({
  sectionName,
}: PlantHealthSectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
        opacity: 0.6,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          color: "text.primary",
          mb: 1.5,
        }}
      >
        {sectionName}
      </Typography>

      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "text.secondary",
          mb: 2,
        }}
      >
        --%
      </Typography>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
        }}
      >
        Backend'da section darajasidagi hisobot hali mavjud emas.
      </Typography>
    </Card>
  );
}
