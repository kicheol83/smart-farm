import { Box, Typography, Chip } from "@mui/material";
import { format } from "date-fns";
import { dateLocale } from "@/i18n/core";

type ActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "IMPORT";

interface ActivityTabListItemProps {
  actionType: ActionType;
  actionResource: string;
  description: string;
  memberFullName: string;
  createdAt: string;
}

const TYPE_COLOR: Record<ActionType, { color: string; bg: string }> = {
  CREATE: { color: "#1a7a4c", bg: "rgba(53,197,110,0.14)" },
  UPDATE: { color: "#1565c0", bg: "rgba(33,150,243,0.14)" },
  DELETE: { color: "#c62828", bg: "rgba(229,57,53,0.14)" },
  LOGIN: { color: "#6b6b6b", bg: "rgba(156,156,156,0.14)" },
  LOGOUT: { color: "#6b6b6b", bg: "rgba(156,156,156,0.14)" },
  EXPORT: { color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
  IMPORT: { color: "#a06a0a", bg: "rgba(249,173,25,0.14)" },
};

export function ActivityTabListItem({
  actionType,
  actionResource,
  description,
  memberFullName,
  createdAt,
}: ActivityTabListItemProps) {
  const style = TYPE_COLOR[actionType];

  return (
    <Box sx={{ p: 2, borderRadius: 2, "&:hover": { bgcolor: "action.hover" } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: "text.primary",
            flex: 1,
          }}
        >
          {description}
        </Typography>
        <Chip
          label={actionType}
          size="small"
          sx={{
            bgcolor: style.bg,
            color: style.color,
            fontWeight: 600,
            fontSize: 10,
            height: 20,
          }}
        />
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          color: "text.secondary",
        }}
      >
        {memberFullName} &nbsp;•&nbsp; {actionResource} &nbsp;•&nbsp;{" "}
        {format(new Date(createdAt), "PPp", { locale: dateLocale() })}
      </Typography>
    </Box>
  );
}
