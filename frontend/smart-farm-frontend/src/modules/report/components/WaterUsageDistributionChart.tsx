import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { BarChart } from "@mui/x-charts/BarChart";
import { format } from "date-fns";

type Period = "LAST_7_DAYS" | "LAST_30_DAYS" | "LAST_90_DAYS";

interface WaterUsagePoint {
  date: string;
  amount: number;
}

interface WaterUsageDistributionChartProps {
  points: WaterUsagePoint[];
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const PERIOD_LABEL: Record<Period, string> = {
  LAST_7_DAYS: "Last 7 Days",
  LAST_30_DAYS: "Last 30 Days",
  LAST_90_DAYS: "Last 90 Days",
};

export function WaterUsageDistributionChart({
  points,
  period,
  onPeriodChange,
}: WaterUsageDistributionChartProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const dates = points.map((p) => format(new Date(p.date), "d MMM"));
  const amounts = points.map((p) => p.amount);

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "text.primary",
          }}
        >
          Water Usage Distribution
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<TuneRoundedIcon fontSize="small" />}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          {PERIOD_LABEL[period]}
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
            <MenuItem
              key={p}
              onClick={() => {
                onPeriodChange(p);
                setMenuAnchor(null);
              }}
            >
              {period === p && (
                <ListItemIcon>
                  <CheckRoundedIcon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText inset={period !== p}>
                {PERIOD_LABEL[p]}
              </ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {points.length > 0 ? (
        <BarChart
          height={280}
          series={[
            { data: amounts, label: "Water Usage (L)", color: "#35C56E" },
          ]}
          xAxis={[{ data: dates, scaleType: "band" }]}
          margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
          grid={{ horizontal: true }}
        />
      ) : (
        <Box
          sx={{
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">Ma'lumot yo'q</Typography>
        </Box>
      )}
    </Card>
  );
}
