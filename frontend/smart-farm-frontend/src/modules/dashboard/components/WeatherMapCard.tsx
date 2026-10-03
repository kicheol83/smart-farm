import { Box, Card, Typography } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import CloudRoundedIcon from "@mui/icons-material/CloudRounded";
import { format } from "date-fns";
import { dateLocale, t } from "@/i18n/core";

interface WeatherMapCardProps {
  location?: string;
  temperature?: number;
  weatherCondition?: string;
  highTemp?: number;
  lowTemp?: number;
  greenhouseName?: string;
  greenhouseCode?: string;
  areaM2?: number;
}

export function WeatherMapCard({
  location = "—",
  temperature,
  weatherCondition = "—",
  highTemp,
  lowTemp,
  greenhouseName = "—",
  greenhouseCode = "—",
  areaM2,
}: WeatherMapCardProps) {
  const now = new Date();
  const isSunny = /sun|clear/i.test(weatherCondition);

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
        minHeight: { xs: 280, lg: 344 },
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 400 300"
        sx={{
          position: "absolute",
          right: -20,
          top: 0,
          height: "100%",
          width: "60%",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        >
          <path d="M40 20 L180 10 L200 120 L60 140 Z" />
          <path d="M210 15 L340 25 L330 130 L215 125 Z" strokeDasharray="5 4" />
          <path d="M65 155 L195 135 L215 250 L85 270 Z" strokeDasharray="5 4" />
        </g>
        <g transform="rotate(-8 265 195)">
          <rect x="220" y="150" width="90" height="95" rx="10" fill="#2a2a2a" />
          <text
            x="265"
            y="180"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontFamily="Satoshi, sans-serif"
          >
            {greenhouseCode}
          </text>
          <circle cx="265" cy="205" r="8" fill="#fff" />
          <circle cx="265" cy="205" r="3.5" fill="#2a2a2a" />
        </g>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocationOnOutlinedIcon
            sx={{ fontSize: 18, color: "text.primary" }}
          />
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: "-0.32px",
              color: "text.primary",
            }}
          >
            {location}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontSize: 14,
            letterSpacing: "-0.28px",
            color: "text.secondary",
          }}
        >
          {format(now, "PPPP", { locale: dateLocale() })}&nbsp;&nbsp;{format(now, "p", { locale: dateLocale() })}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: { xs: 44, sm: 56 },
            letterSpacing: "-1.12px",
            lineHeight: 1.1,
            color: "text.primary",
          }}
        >
          {temperature ?? "--"}°C
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isSunny ? (
            <WbSunnyRoundedIcon sx={{ fontSize: 22, color: "#f9ad19" }} />
          ) : (
            <CloudRoundedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
          )}
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "-0.28px",
              color: "text.primary",
            }}
          >
            {weatherCondition}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontSize: 13,
            letterSpacing: "-0.26px",
            color: "text.secondary",
          }}
        >
          H:{highTemp ?? "--"}°C&nbsp;&nbsp;L:{lowTemp ?? "--"}°C
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          alignSelf: "flex-start",
          bgcolor: "background.default",
          borderRadius: 2,
          p: 1.5,
          minWidth: 200,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "-0.28px",
            color: "text.primary",
          }}
        >
          {greenhouseName}
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: "text.secondary",
              }}
            >
              ID
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: "text.primary",
              }}
            >
              {greenhouseCode}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: "text.secondary",
              }}
            >
              {t("dash.weather.area")}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: "text.primary",
              }}
            >
              {areaM2 ? `${areaM2} m2` : "—"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
