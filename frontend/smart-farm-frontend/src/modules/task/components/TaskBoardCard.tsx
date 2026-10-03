import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { format } from "date-fns";
import { t } from "@/i18n/core";
import { dateLocale } from "@/i18n/core";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface TaskBoardCardProps {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

const PROGRESS_BY_STATUS: Record<TaskStatus, number> = {
  TODO: 0,
  IN_PROGRESS: 50,
  DONE: 100,
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: t("txt.not_started"),
  IN_PROGRESS: t("txt.in_progress"),
  DONE: t("txt.done"),
};

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function TaskBoardCard({
  taskId,
  title,
  description,
  status,
  dueDate,
  startTime,
  endTime,
  onMove,
  onDelete,
}: TaskBoardCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const otherStatuses = (
    ["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]
  ).filter((s) => s !== status);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Satoshi, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.32px",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>

        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreHorizRoundedIcon fontSize="small" />
        </IconButton>

        <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
          {otherStatuses.map((s) => (
            <MenuItem
              key={s}
              onClick={() => {
                onMove(taskId, s);
                setAnchorEl(null);
              }}
            >
              Move to {STATUS_LABEL[s]}
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              onDelete(taskId);
              setAnchorEl(null);
            }}
            sx={{ color: "error.main" }}
          >
            Delete
          </MenuItem>
        </Menu>
      </Box>

      <Typography
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <CalendarTodayRoundedIcon
          sx={{ fontSize: 14, color: "text.secondary" }}
        />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
          }}
        >
          {startTime && endTime
            ? `${formatTime(startTime)} - ${formatTime(endTime)}`
            : t("task.due", { date: format(new Date(dueDate), "PP", { locale: dateLocale() }) })}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LinearProgress
          variant="determinate"
          value={PROGRESS_BY_STATUS[status]}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: "action.selected",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              bgcolor: "primary.main",
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            color: "text.secondary",
            minWidth: 32,
            textAlign: "right",
          }}
        >
          {PROGRESS_BY_STATUS[status]}%
        </Typography>
      </Box>
    </Card>
  );
}
