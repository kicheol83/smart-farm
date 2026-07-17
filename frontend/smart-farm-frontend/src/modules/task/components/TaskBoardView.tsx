import { Box, Typography, IconButton } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { TaskBoardCard } from "./TaskBoardCard";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  taskStatus: TaskStatus;
  dueDate: string;
}

interface Column {
  status: TaskStatus;
  count: number;
  tasks: Task[];
}

interface TaskBoardViewProps {
  columns: Column[];
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMN_META: Record<TaskStatus, { label: string; dotColor: string }> = {
  TODO: { label: "Not Started", dotColor: "#9c9c9c" },
  IN_PROGRESS: { label: "In Progress", dotColor: "#2196f3" },
  DONE: { label: "Done", dotColor: "#35C56E" },
};

// Figma dagi ustun tartibi
const COLUMN_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export function TaskBoardView({
  columns,
  onMove,
  onDelete,
  onAddTask,
}: TaskBoardViewProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 2,
        alignItems: "start",
      }}
    >
      {COLUMN_ORDER.map((status) => {
        const column = columns.find((c) => c.status === status);
        const meta = COLUMN_META[status];

        return (
          <Box
            key={status}
            sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            {/* Ustun sarlavhasi */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: meta.dotColor,
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "text.primary",
                  }}
                >
                  {meta.label}
                </Typography>
                <Box
                  sx={{
                    bgcolor: "action.selected",
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    {column?.count ?? 0}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton size="small" onClick={() => onAddTask(status)}>
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <MoreHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Kartalar */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {column?.tasks.map((t) => (
                <TaskBoardCard
                  key={t._id}
                  taskId={t._id}
                  title={t.taskTitle}
                  description={t.taskDescription}
                  status={t.taskStatus}
                  dueDate={t.dueDate}
                  onMove={onMove}
                  onDelete={onDelete}
                />
              ))}

              {(!column || column.tasks.length === 0) && (
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    py: 3,
                  }}
                >
                  Vazifa yo'q
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
