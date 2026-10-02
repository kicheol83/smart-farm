import {
  Box,
  Typography,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ALERTS_COUNT } from "@/modules/dashboard/graphql/queries";
import { ThemeToggle } from "./ThemeToggle";
import { GRADIENT_DARK, GRADIENT_DARK_MODE } from "@/theme/theme";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { LiveBadge } from "@/lib/live/LiveBadge";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Greenhouse Monitoring" }: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const gradient =
    theme.palette.mode === "dark" ? GRADIENT_DARK_MODE : GRADIENT_DARK;
  const { greenHouseId } = useActiveGreenhouse();
  const { data } = useQuery(GET_ACTIVE_ALERTS_COUNT, {
    variables: {
      greenHouseId,
    },
    skip: !greenHouseId,
    pollInterval: 30000,
  });

  const alertCount = data?.activeAlertsSummary?.total ?? 0;

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 2,
        minHeight: 76,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Typography
        variant={isMobile ? "subtitle1" : "h5"}
        sx={{ flex: 1, color: "text.primary", minWidth: 0 }}
        noWrap
      >
        {title}
      </Typography>

      <LiveBadge />

      <ThemeToggle />

      <Button
        sx={{
          backgroundImage: gradient,
          color: "#fff",
          borderRadius: 2,
          pl: 1,
          pr: { xs: 1, sm: 2 },
          minWidth: "auto",
          gap: 1,
          "&:hover": { backgroundImage: gradient, opacity: 0.9 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "rgba(255,255,255,0.16)",
            borderRadius: 1.5,
            p: 1,
          }}
        >
          <NotificationsRoundedIcon sx={{ fontSize: 16 }} />
        </Box>
        <Typography
          variant="body2"
          sx={{ display: { xs: "none", sm: "inline" }, color: "#fff" }}
        >
          {alertCount} Alert
        </Typography>
        <ArrowOutwardRoundedIcon
          sx={{ fontSize: 16, display: { xs: "none", sm: "block" } }}
        />
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ display: { xs: "none", md: "inline" }, color: "text.primary" }}
        >
          Sector:
        </Typography>
        <Chip
          label="Spinach Garden 08"
          deleteIcon={<KeyboardArrowDownRoundedIcon />}
          onDelete={() => {}}
          sx={{
            bgcolor: "action.hover",
            borderRadius: 2,
            maxWidth: { xs: 120, sm: "none" },
            "& .MuiChip-label": { fontSize: 12 },
          }}
        />
      </Box>
    </Box>
  );
}
