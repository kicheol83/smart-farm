import {
  Box,
  Card,
  Typography,
  Checkbox,
  Chip,
  IconButton,
} from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { format, isToday, isYesterday } from "date-fns";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  taskStatus: TaskStatus;
  dueDate: string;
}

interface TaskListViewProps {
  tasks: Task[];
  onToggleDone: (taskId: string, done: boolean) => void;
}

const STATUS_STYLE: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  DONE: { label: "Done", color: "#1a7a4c", bg: "rgba(53,197,110,0.16)" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#1565c0",
    bg: "rgba(33,150,243,0.16)",
  },
  TODO: {
    label: "Not Started",
    color: "#6b6b6b",
    bg: "rgba(156,156,156,0.16)",
  },
};

export function TaskListView({ tasks, onToggleDone }: TaskListViewProps) {
  const todayTasks = tasks.filter((t) => isToday(new Date(t.dueDate)));
  const yesterdayTasks = tasks.filter((t) => isYesterday(new Date(t.dueDate)));
  const otherTasks = tasks.filter(
    (t) => !isToday(new Date(t.dueDate)) && !isYesterday(new Date(t.dueDate)),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {todayTasks.length > 0 && (
        <TaskListGroup
          title="Today Task List"
          tasks={todayTasks}
          onToggleDone={onToggleDone}
        />
      )}
      {yesterdayTasks.length > 0 && (
        <TaskListGroup
          title="Yesterday Task List"
          tasks={yesterdayTasks}
          onToggleDone={onToggleDone}
        />
      )}
      {otherTasks.length > 0 && (
        <TaskListGroup
          title="Other Tasks"
          tasks={otherTasks}
          onToggleDone={onToggleDone}
        />
      )}
      {tasks.length === 0 && (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "text.secondary",
            textAlign: "center",
            py: 4,
          }}
        >
          Hali vazifa yo'q
        </Typography>
      )}
    </Box>
  );
}

function TaskListGroup({
  title,
  tasks,
  onToggleDone,
}: {
  title: string;
  tasks: Task[];
  onToggleDone: (taskId: string, done: boolean) => void;
}) {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 2, bgcolor: "background.paper", p: 2.5 }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: "text.primary",
          mb: 2,
        }}
      >
        {title}
      </Typography>

      {/* Jadval sarlavhasi — faqat desktop */}
      <Box
        sx={{
          display: { xs: "none", md: "grid" },
          gridTemplateColumns: "auto 1.5fr 100px 100px 2fr 120px 32px",
          gap: 2,
          px: 1,
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {["", "Task Name", "Due Date", "Status", "Description", "Time"].map(
          (h) => (
            <Typography
              key={h}
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              {h}
            </Typography>
          ),
        )}
        <Box />
      </Box>

      {tasks.map((t) => {
        const done = t.taskStatus === "DONE";
        const style = STATUS_STYLE[t.taskStatus];

        return (
          <Box
            key={t._id}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "auto 1fr 32px",
                md: "auto 1.5fr 100px 100px 2fr 120px 32px",
              },
              gap: 2,
              alignItems: "center",
              px: 1,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              "&:last-of-type": { borderBottom: "none" },
            }}
          >
            <Checkbox
              checked={done}
              onChange={(e) => onToggleDone(t._id, e.target.checked)}
              size="small"
              sx={{ p: 0 }}
            />

            <Typography
              sx={{
                fontFamily: "Satoshi, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: "text.primary",
                textDecoration: done ? "line-through" : "none",
                opacity: done ? 0.6 : 1,
              }}
            >
              {t.taskTitle}
            </Typography>

            <Typography
              sx={{
                display: { xs: "none", md: "block" },
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              {format(new Date(t.dueDate), "MM/dd/yy")}
            </Typography>

            <Chip
              label={style.label}
              size="small"
              sx={{
                display: { xs: "none", md: "flex" },
                bgcolor: style.bg,
                color: style.color,
                fontSize: 11,
                fontWeight: 600,
                height: 24,
              }}
            />

            <Typography
              sx={{
                display: { xs: "none", md: "-webkit-box" },
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
                overflow: "hidden",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {t.taskDescription}
            </Typography>

            <Typography
              sx={{
                display: { xs: "none", md: "block" },
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              {format(new Date(t.dueDate), "hh:mm a")}
            </Typography>

            <IconButton size="small">
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </Card>
  );
}
