import { Box, Typography, Switch } from "@mui/material";

interface NotificationToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/** Figma "Notifications and sounds" — bitta toggle qatori. */
export function NotificationToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: NotificationToggleRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ maxWidth: "80%" }}>
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: disabled ? "text.disabled" : "text.primary",
          }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
              mt: 0.25,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <Switch
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled || !onChange}
      />
    </Box>
  );
}
