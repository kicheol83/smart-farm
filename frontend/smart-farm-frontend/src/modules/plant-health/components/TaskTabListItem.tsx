import { Box, Typography, Chip } from "@mui/material";
import { format } from "date-fns";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface TaskTabListItemProps {
  taskTitle: string;
  taskDescription: string;
  taskStatus: TaskStatus;
  updatedAt: string;
}

const STATUS_STYLE: Record<
  TaskStatus,
  { label: string; color: string; bg: string; progress: number }
> = {
  DONE: {
    label: "Done",
    color: "#1a7a4c",
    bg: "rgba(53,197,110,0.16)",
    progress: 100,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#1565c0",
    bg: "rgba(33,150,243,0.16)",
    progress: 50,
  },
  TODO: {
    label: "Not Started",
    color: "#6b6b6b",
    bg: "rgba(156,156,156,0.16)",
    progress: 0,
  },
};

export function TaskTabListItem({
  taskTitle,
  taskDescription,
  taskStatus,
  updatedAt,
}: TaskTabListItemProps) {
  const style = STATUS_STYLE[taskStatus];

  return (
    <Box sx={{ p: 2, borderRadius: 2, "&:hover": { bgcolor: "action.hover" } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.75,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "text.primary",
          }}
        >
          {taskTitle}
        </Typography>
        <Chip
          label={style.label}
          size="small"
          sx={{
            bgcolor: style.bg,
            color: style.color,
            fontWeight: 600,
            fontSize: 11,
            height: 22,
          }}
        />
      </Box>

      <FieldRow
        label="Last Updated"
        value={format(new Date(updatedAt), "MMM dd, hh:mm a")}
      />
      <FieldRow label="Progress" value={`${style.progress}%`} />
      <FieldRow label="Summary" value={taskDescription} />
    </Box>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.secondary",
          minWidth: 80,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 12,
          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
