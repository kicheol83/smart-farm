import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";

interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    taskTitle: string;
    taskDescription: string;
    taskPriority: string;
    dueDate: string;
    startTime?: string;
    endTime?: string;
  }) => void;
}

export function NewTaskDialog({ open, onClose, onSubmit }: NewTaskDialogProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  function handleSubmit() {
    if (!taskTitle || !dueDate) return;
    onSubmit({
      taskTitle,
      taskDescription,
      taskPriority,
      dueDate,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    });
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setDueDate("");
    setStartTime("");
    setEndTime("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "Satoshi, sans-serif", fontWeight: 700 }}>
        New Task
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
      >
        <TextField
          label="Task Name"
          fullWidth
          size="small"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          size="small"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <TextField
          select
          label="Priority"
          fullWidth
          size="small"
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
        >
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
        </TextField>
        <TextField
          label="Due Date"
          type="date"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField
            label="End Time"
            type="time"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!taskTitle || !dueDate}
          sx={{ textTransform: "none" }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
