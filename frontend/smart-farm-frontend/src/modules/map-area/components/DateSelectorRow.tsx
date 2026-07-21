import { Box, IconButton, Typography } from "@mui/material";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SatelliteAltRoundedIcon from "@mui/icons-material/SatelliteAltRounded";
import { format } from "date-fns";

interface DateSelectorRowProps {
  dates: string[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function DateSelectorRow({
  dates,
  selectedDate,
  onSelect,
}: DateSelectorRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        overflowX: "auto",
        py: 1,
      }}
    >
      <IconButton size="small" sx={{ bgcolor: "background.paper" }}>
        <CalendarTodayRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton size="small">
        <ChevronLeftRoundedIcon fontSize="small" />
      </IconButton>

      {dates.map((d) => {
        const isSelected = d === selectedDate;
        return (
          <Box
            key={d}
            onClick={() => onSelect(d)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              cursor: "pointer",
              flexShrink: 0,
              border: isSelected ? "2px solid" : "1px solid",
              borderColor: isSelected ? "primary.main" : "divider",
              bgcolor: "background.paper",
            }}
          >
            <SatelliteAltRoundedIcon
              sx={{ fontSize: 16, color: "text.secondary" }}
            />
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: "text.primary",
              }}
            >
              {format(new Date(d), "d MMM yyyy")}
            </Typography>
          </Box>
        );
      })}

      <IconButton size="small">
        <ChevronRightRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
