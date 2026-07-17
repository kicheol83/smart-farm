import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    taskTitle: string;
    taskDescription: string;
    taskPriority: string;
    dueDate: string;
  }) => void;
}

export function NewTaskDialog({ open, onClose, onSubmit }: NewTaskDialogProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit() {
    if (!taskTitle || !dueDate) return;
    onSubmit({ taskTitle, taskDescription, taskPriority, dueDate });
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setDueDate("");
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
          type="datetime-local"
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
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
