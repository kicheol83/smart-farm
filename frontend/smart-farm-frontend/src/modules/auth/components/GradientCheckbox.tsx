import { Checkbox, type CheckboxProps } from "@mui/material";
import { Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { GRADIENT_GREEN } from "@/theme/theme";

/**
 * Figma "Checkbox" komponenti (node 2453:3385):
 *   checked → 8px check belgisi, yashil gradient doira fon, backdrop-blur
 *   unchecked → oddiy bo'sh doira, border bilan
 */
export function GradientCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      icon={
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "1.5px solid",
            borderColor: "divider",
          }}
        />
      }
      checkedIcon={
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundImage: GRADIENT_GREEN,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon sx={{ fontSize: 12, color: "#fff" }} />
        </Box>
      }
      disableRipple
      sx={{ p: 0 }}
      {...props}
    />
  );
}
