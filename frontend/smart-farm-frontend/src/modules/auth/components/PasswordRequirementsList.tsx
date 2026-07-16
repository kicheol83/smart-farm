import { Box, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

interface PasswordRequirementsListProps {
  password: string;
}

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "One special character (!@#$*)",
    test: (p: string) => /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?]/.test(p),
  },
];

export function PasswordRequirementsList({
  password,
}: PasswordRequirementsListProps) {
  if (!password) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <Box
            key={rule.label}
            sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
          >
            {met ? (
              <CheckCircleRoundedIcon
                sx={{ fontSize: 16, color: "primary.main" }}
              />
            ) : (
              <RadioButtonUncheckedRoundedIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
            )}
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                letterSpacing: "-0.26px",
                color: met ? "text.primary" : "text.secondary",
              }}
            >
              {rule.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
