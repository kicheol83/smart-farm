import { Box, type SxProps, type Theme } from "@mui/material";

interface LogoProps {
  size?: number;
  sx?: SxProps<Theme>;
}

/**
 * Figma "Logo" komponenti — yashil gradient doira + oq gul/asterisk belgisi.
 * Fayl sifatida emas, inline SVG sifatida — hech qanday tashqi rasm kerak emas.
 */
export function Logo({ size = 46, sx }: LogoProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 46 46"
      sx={{ width: size, height: size, display: "block", ...sx }}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="19.38%" stopColor="#35C56E" />
          <stop offset="91.38%" stopColor="#2E9055" />
        </linearGradient>
      </defs>
      <circle cx="23" cy="23" r="23" fill="url(#logo-gradient)" />
      {/* Gul/asterisk belgisi — 6 ta bargcha */}
      <g fill="#fff">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="23"
            cy="14"
            rx="3.2"
            ry="7.5"
            transform={`rotate(${angle} 23 23)`}
            opacity="0.95"
          />
        ))}
      </g>
      <circle cx="23" cy="23" r="4" fill="#fff" />
    </Box>
  );
}
