import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Box, Tabs, Tab, Button, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import { Header } from "@/components/layout/Header";
import { TaskSummaryCard } from "../components/TaskSummaryCard";
import { TaskBoardView } from "../components/TaskBoardView";
import { TaskListView } from "../components/TaskListView";
import { NewTaskDialog } from "../components/NewTaskDialog";
import {
  GET_TASK_BOARD_OVERVIEW,
  GET_TASK_LIST,
  CREATE_TASK_MUTATION,
  MOVE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
} from "../graphql/queries";
import { useActiveGreenhouse } from "@/lib/useActiveGreenhouse";
import { t } from "@/i18n/core";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export function TaskListPage() {
  const { greenHouseId } = useActiveGreenhouse();
  const hasGreenhouse = greenHouseId.length > 0;

  const [tab, setTab] = useState<"board" | "list">("board");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: boardData, refetch: refetchBoard } = useQuery(
    GET_TASK_BOARD_OVERVIEW,
    {
      variables: { greenHousesId: greenHouseId },
      skip: !hasGreenhouse,
    },
  );

  const { data: listData, refetch: refetchList } = useQuery(GET_TASK_LIST, {
    variables: { input: { greenHousesId: greenHouseId, page: 1, limit: 50 } },
    skip: !hasGreenhouse || tab !== "list",
  });

  const [createTask] = useMutation(CREATE_TASK_MUTATION);
  const [moveTask] = useMutation(MOVE_TASK_MUTATION);
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION);

  const overview = boardData?.taskBoardOverview;
  const notStartedCount =
    overview?.columns?.find((c: any) => c.status === "TODO")?.count ?? 0;

  function refetchAll() {
    refetchBoard();
    if (tab === "list") refetchList();
  }

  async function handleMove(taskId: string, newStatus: TaskStatus) {
    await moveTask({ variables: { input: { taskId, newStatus } } });
    refetchAll();
  }

  async function handleDelete(taskId: string) {
    await deleteTask({ variables: { id: taskId } });
    refetchAll();
  }

  async function handleToggleDone(taskId: string, done: boolean) {
    await moveTask({
      variables: { input: { taskId, newStatus: done ? "DONE" : "TODO" } },
    });
    refetchAll();
  }

  function handleAddTask(_status: TaskStatus) {
    setDialogOpen(true);
  }

  async function handleCreateTask(data: {
    taskTitle: string;
    taskDescription: string;
    taskPriority: string;
    dueDate: string;
    startTime?: string;
    endTime?: string;
  }) {
    await createTask({
      variables: {
        input: { ...data, greenHousesId: greenHouseId },
      },
    });
    setDialogOpen(false);
    refetchAll();
  }

  if (!hasGreenhouse) {
    return (
      <>
        <Header title={t("txt.task_overview")} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60%",
          }}
        >
          <Typography color="text.secondary">
            {t("txt.no_greenhouse_selected_yet")}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header title={t("txt.task_overview")} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <TaskSummaryCard
          icon={FormatListBulletedRoundedIcon}
          label={t("txt.total_tasks")}
          value={overview?.totalTasks ?? 0}
          caption={t("txt.created_in_this_greenhouse")}
        />
        <TaskSummaryCard
          icon={CheckCircleOutlineRoundedIcon}
          label={t("txt.completed_tasks")}
          value={overview?.completedTasks ?? 0}
          caption={t("txt.marked_as_done")}
        />
        <TaskSummaryCard
          icon={PendingActionsRoundedIcon}
          label={t("txt.in_progress_tasks")}
          value={overview?.inProgressTasks ?? 0}
          caption={t("txt.currently_being_worked_on")}
        />
        <TaskSummaryCard
          icon={HourglassEmptyRoundedIcon}
          label={t("txt.not_started_tasks")}
          value={notStartedCount}
          caption={t("txt.currently_being_worked_on")}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: "auto",
            "& .MuiTab-root": {
              textTransform: "none",
              fontFamily: "Satoshi, sans-serif",
              fontWeight: 500,
              minHeight: "auto",
            },
          }}
        >
          <Tab label={t("txt.board")} value="board" />
          <Tab label={t("txt.list")} value="list" />
        </Tabs>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {t("txt.sort_by")}
          </Button>
          <Button
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {t("txt.filter")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => handleAddTask("TODO")}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {t("txt.new_task")}
          </Button>
        </Box>
      </Box>

      {tab === "board" ? (
        <TaskBoardView
          columns={overview?.columns ?? []}
          onMove={handleMove}
          onDelete={handleDelete}
          onAddTask={handleAddTask}
        />
      ) : (
        <TaskListView
          tasks={listData?.taskList?.items ?? []}
          onToggleDone={handleToggleDone}
        />
      )}

      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateTask}
      />
    </>
  );
}
