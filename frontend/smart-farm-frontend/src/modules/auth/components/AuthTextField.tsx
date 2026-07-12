import { Box, Typography, InputBase, type InputBaseProps } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

interface AuthTextFieldProps extends InputBaseProps {
  label: string;
  endAdornment?: React.ReactNode;
  errorText?: string;
}

/**
 * Figma "Input Field" komponenti (node 2678:26853 / 26574 / error variant):
 *   Label (Satoshi Medium 14px) ustida, pastida Input box
 *   Normal:  bg base/neutral-100 (#f4f4f4), border base/neutral-200 (#eaeaea)
 *   Error:   border qizil, pastida qizil ogohlantirish matni + icon
 */
export function AuthTextField({
  label,
  endAdornment,
  errorText,
  ...inputProps
}: AuthTextFieldProps) {
  const hasError = Boolean(errorText);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: "-0.28px",
          color: "text.primary",
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: "100%",
          bgcolor: "action.selected",
          border: "1px solid",
          borderColor: hasError ? "error.main" : "action.hover",
          borderRadius: "8px",
          px: "12px",
          py: "12px",
          transition: "border-color 0.15s ease",
        }}
      >
        <InputBase
          fullWidth
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            letterSpacing: "-0.28px",
            color: "text.primary",
            "& input::placeholder": {
              color: "text.secondary",
              opacity: 1,
            },
          }}
          {...inputProps}
        />
        {endAdornment}
      </Box>

      {hasError && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 14, color: "error.main" }} />
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              letterSpacing: "-0.24px",
              color: "error.main",
            }}
          >
            {errorText}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
