import {
  Box,
  Card,
  Typography,
  LinearProgress,
  IconButton,
  Stack,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { dateLocale, t as tr } from "@/i18n/core";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface TaskItem {
  _id: string;
  taskTitle: string;
  taskDescription: string;
  taskStatus: TaskStatus;
  dueDate: string;
}

interface DashboardTaskPanelProps {
  totalTasks?: number;
  completedTasks?: number;
  tasks?: TaskItem[];
}

export function DashboardTaskPanel({
  totalTasks = 0,
  completedTasks = 0,
  tasks = [],
}: DashboardTaskPanelProps) {
  const navigate = useNavigate();
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: "Satoshi, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "-0.4px",
          color: "text.primary",
        }}
      >
        {tr("dash.tasks.title")}
      </Typography>

      {/* Progress bar */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "action.selected",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              bgcolor: "primary.main",
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              color: "text.primary",
            }}
          >
            {progress}%
          </Typography>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            {completedTasks}/{totalTasks} Task Completed
          </Typography>
        </Box>
      </Box>

      {/* Vazifalar ro'yxati */}
      <Stack spacing={1.5}>
        {tasks.map((t) => {
          const done = t.taskStatus === "DONE";
          return (
            <Box key={t._id} sx={{ display: "flex", gap: 1.5 }}>
              {done ? (
                <CheckCircleRoundedIcon
                  sx={{
                    fontSize: 20,
                    color: "primary.main",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                />
              ) : (
                <RadioButtonUncheckedRoundedIcon
                  sx={{
                    fontSize: 20,
                    color: "text.secondary",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                />
              )}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                <Typography
                  sx={{
                    fontFamily: "Satoshi, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    letterSpacing: "-0.28px",
                    color: "text.primary",
                    textDecoration: done ? "line-through" : "none",
                    opacity: done ? 0.6 : 1,
                  }}
                >
                  {t.taskTitle}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  {t.taskDescription}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {tr("dash.tasks.due", { date: format(new Date(t.dueDate), "PP", { locale: dateLocale() }) })}
                </Typography>
              </Box>
            </Box>
          );
        })}

        {tasks.length === 0 && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              color: "text.secondary",
              textAlign: "center",
              py: 2,
            }}
          >
            {tr("dash.tasks.empty")}
          </Typography>
        )}
      </Stack>

      <IconButton
        size="small"
        onClick={() => navigate("/tasks")}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          borderRadius: 2,
          bgcolor: "action.selected",
        }}
      >
        <ArrowOutwardRoundedIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}
