import { Box, Typography } from "@mui/material";
import { GRADIENT_ONBOARDING_OVERLAY } from "@/theme/theme";

interface AuthOnboardingPanelProps {
  image: string;
  heading: string;
  subtitle: string;
  activeStep: 0 | 1 | 2;
}

export function AuthOnboardingPanel({
  image,
  heading,
  subtitle,
  activeStep,
}: AuthOnboardingPanelProps) {
  return (
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        p: "24px",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          bgcolor: "action.selected",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRADIENT_ONBOARDING_OVERLAY,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: 64,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: 475,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: "-0.72px",
                lineHeight: 1.4,
                color: "#fff",
                textAlign: "center",
              }}
            >
              {heading}
            </Typography>
            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                letterSpacing: "-0.32px",
                lineHeight: 1.6,
                color: "#ececec",
                textAlign: "center",
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: i === activeStep ? 40 : 6,
                  height: 6,
                  borderRadius: "99999px",
                  bgcolor: i === activeStep ? "#fff" : "#ececec",
                  transition: "width 0.2s ease",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
